"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { avisoSchema, pixSchema, parseValor, ajusteSchema, cancelamentoSchema, contratoEdicaoSchema, vencimentoSchema, contratoSchema, despesaSchema, firstErrors, imovelSchema, inquilinoSchema, onboardingSchema, pagamentoSchema } from "@/lib/validation";
import { toCentavos } from "@/lib/money";
import { hojeBR } from "@/lib/dates";
import { features } from "@/lib/features";
import { normalizarChave, type TipoChave } from "@/lib/pix";
import { calcularEncargos } from "@/lib/encargos";
import { enviarFoto, salvarArquivo, validarArquivo } from "@/lib/documents";
import { DOC_TIPOS } from "@/lib/constants";
import type { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FormState } from "@/components/ui/ActionForm";

const GENERIC = "Não conseguimos salvar agora. Tente novamente em instantes.";
const dig = (s?: string) => (s ?? "").replace(/\D/g, "") || null;
const txt = (s?: string) => (s ?? "").trim() || null;
const raw = (fd: FormData) => Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
const fail = (fieldErrors: Record<string, string>, values: Record<string, string>, error?: string): FormState => ({ error, fieldErrors, values });

async function ctx() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/entrar");
  return { sb, user };
}

export async function criarImovel(_: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await ctx(); const v = raw(fd);
  const errs = firstErrors(imovelSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const { data, error } = await sb.from("properties").insert({
    nome: v.nome.trim(), tipo: v.tipo, cep: dig(v.cep), endereco: txt(v.endereco), cidade: txt(v.cidade), estado: txt(v.estado), valor_aluguel_centavos: toCentavos(v.valor),
  }).select("id").single();
  if (error || !data) return fail({}, v, error?.message.includes("LIMITE_PLANO") ? "Seu plano chegou ao limite de imóveis. Para adicionar mais, será preciso mudar de plano." : GENERIC);
  revalidatePath("/imoveis"); redirect(`/imoveis/${data.id}`);
}

export async function criarInquilino(_: FormState, fd: FormData): Promise<FormState> {
  const { sb, user } = await ctx(); const v = raw(fd);
  const errs = firstErrors(inquilinoSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const foto = fd.get("arquivo"); const temFoto = foto instanceof File && foto.size > 0;
  if (temFoto) { const e = await validarArquivo(foto, true); if (e) return fail({ arquivo: e }, v); }
  const { data, error } = await sb.from("tenants").insert({ nome: v.nome.trim(), cpf: dig(v.cpf), whatsapp: dig(v.whatsapp), telefone: dig(v.telefone), email: txt(v.email) }).select("id").single();
  if (error || !data) return fail({}, v, GENERIC);
  if (temFoto) { const r = await enviarFoto(sb, user.id, foto); if (r.caminho) await sb.from("tenants").update({ foto_caminho: r.caminho }).eq("id", data.id); }
  revalidatePath("/inquilinos"); redirect("/inquilinos");
}

export async function criarContrato(_: FormState, fd: FormData): Promise<FormState> {
  const { sb, user } = await ctx(); const v = raw(fd);
  const errs = firstErrors(contratoSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const arq = fd.get("arquivo"); const temArq = arq instanceof File && arq.size > 0;
  if (temArq) { const e = await validarArquivo(arq); if (e) return fail({ arquivo: e }, v); }
  const { data, error } = await sb.from("leases").insert({
    property_id: v.property_id, tenant_id: v.tenant_id, valor_centavos: toCentavos(v.valor), dia_vencimento: Number(v.dia), data_inicio: v.inicio, data_fim: v.fim || null, multa_percentual: parseValor(v.multa || "0"), juros_mensal_percentual: parseValor(v.juros || "0"),
  }).select("id").single();
  if (error || !data) return fail({}, v, error?.code === "23505" ? "Este imóvel já tem um contrato ativo." : GENERIC);
  await sb.rpc("generate_rent_charges", { p_lease: data.id });
  if (temArq) await salvarArquivo(sb, user.id, arq, { lease_id: data.id, tipo: "contrato" });
  revalidatePath("/contratos"); revalidatePath("/alugueis"); redirect("/contratos");
}

export async function registrarPagamento(_: FormState, fd: FormData): Promise<FormState> {
  const { sb, user } = await ctx(); const v = raw(fd);
  const errs = firstErrors(pagamentoSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const quitar = v.quitar === "on"; const motivo = (v.motivo ?? "").trim();
  if (quitar && motivo.length < 3) return fail({ motivo: "Escreva o motivo para considerar quitado." }, v);
  const arq = fd.get("arquivo"); const temArq = arq instanceof File && arq.size > 0;
  if (temArq) { const e = await validarArquivo(arq); if (e) return fail({ arquivo: e }, v); }
  const { data: c } = await sb.from("rent_charges").select("valor_original_centavos,ajuste_centavos,encargos_centavos,ajuste_motivo,status,payments(valor_centavos)").eq("id", v.charge_id).single();
  if (!c) return fail({}, v, GENERIC);
  if (c.status === "cancelado") return fail({}, v, "Este aluguel está cancelado. Reabra-o em “Mais opções” para registrar pagamento.");
  const ja = (c.payments as { valor_centavos: number }[]).reduce((t, p) => t + p.valor_centavos, 0);
  const saldoAtual = c.valor_original_centavos - c.ajuste_centavos + c.encargos_centavos - ja; const cents = toCentavos(v.valor);
  if (cents > saldoAtual) return fail({ valor: "O valor é maior que o saldo pendente. Se combinaram outro valor, use “Mais opções”." }, v);
  const { error } = await sb.from("payments").insert({ charge_id: v.charge_id, valor_centavos: cents, pago_em: v.pago_em, forma: v.forma, observacao: txt((v.observacao ?? "").slice(0, 300)) });
  if (error) return fail({}, v, GENERIC);
  if (quitar && cents < saldoAtual) {
    const nota = `Pagou ${(cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}: ${motivo}`;
    await sb.from("rent_charges").update({ ajuste_centavos: c.ajuste_centavos + (saldoAtual - cents), ajuste_motivo: c.ajuste_motivo ? `${c.ajuste_motivo} | ${nota}` : nota }).eq("id", v.charge_id);
  }
  revalidatePath("/alugueis"); revalidatePath("/painel"); revalidatePath("/financeiro");
  if (temArq) {
    const r = await salvarArquivo(sb, user.id, arq, { charge_id: v.charge_id, tipo: "comprovante", visivel_inquilino: true });
    if (r.error) return { ok: "Pagamento registrado, mas o comprovante não foi salvo. Tente anexá-lo de novo.", values: {} };
  }
  return { ok: temArq ? "Pagamento e comprovante registrados." : "Pagamento registrado.", values: {} };
}

export async function concluirOnboarding(input: unknown): Promise<{ error?: string }> {
  const { sb, user } = await ctx();
  const p = onboardingSchema.safeParse(input);
  if (!p.success) return { error: "Confira os dados informados." };
  const d = p.data;
  await sb.from("profiles").update({ nome: d.nome.trim() }).eq("id", user.id);
  const im = await sb.from("properties").insert({ nome: d.imovel.trim(), tipo: d.tipo, valor_aluguel_centavos: toCentavos(d.valor) }).select("id").single();
  if (im.error || !im.data) return { error: im.error?.message.includes("LIMITE_PLANO") ? "Seu plano chegou ao limite de imóveis." : GENERIC };
  const te = await sb.from("tenants").insert({ nome: d.inquilino.trim(), whatsapp: dig(d.zap) }).select("id").single();
  if (te.error || !te.data) return { error: GENERIC };
  const le = await sb.from("leases").insert({ property_id: im.data.id, tenant_id: te.data.id, valor_centavos: toCentavos(d.valor), dia_vencimento: d.dia, data_inicio: d.inicio, data_fim: d.fim || null }).select("id").single();
  if (le.error || !le.data) return { error: GENERIC };
  await sb.rpc("generate_rent_charges", { p_lease: le.data.id });
  revalidatePath("/painel");
  return {};
}

export async function sair() {
  const sb = await createClient(); await sb.auth.signOut(); redirect("/");
}

export async function criarDespesa(_: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await ctx(); const v = raw(fd);
  const errs = firstErrors(despesaSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const { error } = await sb.from("expenses").insert({ property_id: v.property_id, categoria: v.categoria, descricao: v.descricao.trim(), valor_centavos: toCentavos(v.valor), data: v.data, forma: txt(v.forma) });
  if (error) return fail({}, v, GENERIC);
  revalidatePath("/despesas"); revalidatePath("/financeiro"); redirect("/despesas");
}

export async function excluirDespesa(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  if (id) await sb.from("expenses").delete().eq("id", id);
  revalidatePath("/despesas"); revalidatePath("/financeiro");
}

export async function editarImovel(_: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await ctx(); const v = raw(fd);
  const errs = firstErrors(imovelSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const { error } = await sb.from("properties").update({
    nome: v.nome.trim(), tipo: v.tipo, cep: dig(v.cep), endereco: txt(v.endereco), cidade: txt(v.cidade), estado: txt(v.estado), valor_aluguel_centavos: toCentavos(v.valor),
  }).eq("id", v.id);
  if (error) return fail({}, v, GENERIC);
  revalidatePath("/imoveis"); redirect(`/imoveis/${v.id}`);
}

export async function excluirImovel(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  const { count } = await sb.from("leases").select("id", { count: "exact", head: true }).eq("property_id", id);
  if (count) redirect(`/imoveis/${id}?erro=contratos`);
  await sb.from("properties").delete().eq("id", id);
  revalidatePath("/imoveis"); redirect("/imoveis");
}

type SB = Awaited<ReturnType<typeof createClient>>;
// Remove o acesso do inquilino: apaga a conta dele (somente se for conta de inquilino) e desfaz o vínculo.
async function revogarAcesso(sb: SB, tenantId: string, userId: string) {
  const admin = createAdminClient();
  const { data: p } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (p?.role === "tenant") await admin.auth.admin.deleteUser(userId);
  await sb.from("tenants").update({ user_id: null }).eq("id", tenantId);
}

export async function editarInquilino(_: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await ctx(); const v = raw(fd);
  const errs = firstErrors(inquilinoSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const { data: atual } = await sb.from("tenants").select("email,user_id").eq("id", v.id).maybeSingle();
  const mudouEmail = !!atual?.user_id && (atual.email ?? "").trim().toLowerCase() !== (v.email ?? "").trim().toLowerCase();
  if (mudouEmail) {
    if (!features.tenant_portal_enabled) return fail({}, v, "Este inquilino tem acesso liberado. Para trocar o e-mail, configure a chave de servidor do sistema.");
    await revogarAcesso(sb, v.id, atual.user_id as string);
  }
  const { error } = await sb.from("tenants").update({ nome: v.nome.trim(), cpf: dig(v.cpf), whatsapp: dig(v.whatsapp), telefone: dig(v.telefone), email: txt(v.email) }).eq("id", v.id);
  if (error) return fail({}, v, GENERIC);
  revalidatePath("/inquilinos"); redirect(mudouEmail ? `/inquilinos/${v.id}/editar?aviso=acesso-removido` : "/inquilinos");
}

export async function excluirInquilino(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  const { count } = await sb.from("leases").select("id", { count: "exact", head: true }).eq("tenant_id", id);
  if (count) redirect(`/inquilinos/${id}/editar?erro=contratos`);
  await sb.from("tenants").delete().eq("id", id);
  revalidatePath("/inquilinos"); redirect("/inquilinos");
}

// Encerra o contrato e cancela os aluguéis futuros que ainda não tiveram nenhum pagamento. O histórico é mantido.
export async function encerrarContrato(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  const { data: l } = await sb.from("leases").select("property_id").eq("id", id).maybeSingle();
  if (!l) redirect("/contratos");
  await sb.from("leases").update({ status: "encerrado" }).eq("id", id);
  await sb.from("rent_charges").update({ status: "cancelado" }).eq("lease_id", id).eq("status", "aguardando").gt("vencimento", hojeBR());
  revalidatePath("/contratos"); revalidatePath("/alugueis"); revalidatePath("/painel"); redirect(`/imoveis/${l.property_id}`);
}

// Libera o acesso do inquilino ao portal. Usa a chave de servidor: roda SÓ aqui, nunca no navegador.
export async function liberarAcessoInquilino(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  const { data: t } = await sb.from("tenants").select("id,nome,email,user_id").eq("id", id).maybeSingle();
  if (!t) redirect("/inquilinos");
  const volta = `/inquilinos/${id}/editar`;
  if (!features.tenant_portal_enabled) redirect(`${volta}?aviso=indisponivel`);
  if (t.user_id) redirect(volta);
  if (!t.email) redirect(`${volta}?aviso=sem-email`);
  const admin = createAdminClient();
  const { data: u, error } = await admin.auth.admin.createUser({ email: t.email, email_confirm: true, user_metadata: { nome: t.nome } });
  if (error || !u.user) { const m = (error?.message ?? "").toLowerCase(); redirect(`${volta}?aviso=${m.includes("already") || m.includes("registered") ? "email-existe" : "falha"}`); }
  await admin.from("profiles").update({ role: "tenant", nome: t.nome }).eq("id", u.user.id);
  await sb.from("tenants").update({ user_id: u.user.id }).eq("id", id);
  revalidatePath(volta); redirect(`${volta}?aviso=liberado`);
}

export async function enviarDocumento(_: FormState, fd: FormData): Promise<FormState> {
  const { sb, user } = await ctx(); const v = raw(fd); const UUID = /^[0-9a-f-]{36}$/;
  const prop = UUID.test(v.property_id ?? "") ? v.property_id : undefined, lease = UUID.test(v.lease_id ?? "") ? v.lease_id : undefined;
  if (!prop && !lease) return fail({}, v, GENERIC);
  const tipo = lease ? "contrato" : (DOC_TIPOS.map((t) => t[0]) as string[]).includes(v.tipo) ? v.tipo : "outro";
  const arq = fd.get("arquivo");
  if (!(arq instanceof File) || arq.size === 0) return fail({ arquivo: "Escolha um arquivo." }, v);
  const e = await validarArquivo(arq); if (e) return fail({ arquivo: e }, v);
  const r = await salvarArquivo(sb, user.id, arq, { property_id: prop, lease_id: lease, tipo });
  if (r.error) return fail({}, v, r.error);
  revalidatePath("/contratos"); if (prop) revalidatePath(`/imoveis/${prop}`);
  return { ok: "Documento guardado.", values: {} };
}

export async function excluirDocumento(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  const { data: d } = await sb.from("documents").select("caminho,property_id").eq("id", id).maybeSingle();
  if (d) { await sb.storage.from("documentos").remove([d.caminho]); await sb.from("documents").delete().eq("id", id); if (d.property_id) revalidatePath(`/imoveis/${d.property_id}`); }
  revalidatePath("/contratos"); revalidatePath("/alugueis");
}

export async function enviarFotos(_: FormState, fd: FormData): Promise<FormState> {
  const { sb, user } = await ctx(); const v = raw(fd);
  if (!/^[0-9a-f-]{36}$/.test(v.property_id ?? "")) return fail({}, v, GENERIC);
  const fotos = fd.getAll("arquivo").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 10);
  if (!fotos.length) return fail({ arquivo: "Escolha pelo menos uma foto." }, v);
  for (const f of fotos) { const e = await validarArquivo(f, true); if (e) return fail({ arquivo: `${f.name}: ${e}` }, v); }
  let falhas = 0;
  for (const f of fotos) { const r = await salvarArquivo(sb, user.id, f, { property_id: v.property_id, tipo: "foto" }); if (r.error) falhas++; }
  revalidatePath(`/imoveis/${v.property_id}`); revalidatePath("/imoveis");
  return falhas ? { error: `${falhas} foto(s) não foram enviadas. Tente novamente.`, values: {} } : { ok: fotos.length > 1 ? "Fotos guardadas." : "Foto guardada.", values: {} };
}

export async function enviarFotoInquilino(_: FormState, fd: FormData): Promise<FormState> {
  const { sb, user } = await ctx(); const v = raw(fd); const f = fd.get("arquivo");
  if (!(f instanceof File) || f.size === 0) return fail({ arquivo: "Escolha uma foto." }, v);
  const e = await validarArquivo(f, true); if (e) return fail({ arquivo: e }, v);
  const { data: t } = await sb.from("tenants").select("foto_caminho").eq("id", v.id).maybeSingle();
  if (!t) return fail({}, v, GENERIC);
  const r = await enviarFoto(sb, user.id, f); if (!r.caminho) return fail({}, v, r.error);
  await sb.from("tenants").update({ foto_caminho: r.caminho }).eq("id", v.id);
  if (t.foto_caminho) await sb.storage.from("documentos").remove([t.foto_caminho]);
  revalidatePath("/inquilinos"); revalidatePath(`/inquilinos/${v.id}/editar`);
  return { ok: "Foto guardada.", values: {} };
}

export async function removerFotoInquilino(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  const { data: t } = await sb.from("tenants").select("foto_caminho").eq("id", id).maybeSingle();
  if (t?.foto_caminho) { await sb.storage.from("documentos").remove([t.foto_caminho]); await sb.from("tenants").update({ foto_caminho: null }).eq("id", id); }
  revalidatePath("/inquilinos"); redirect(`/inquilinos/${id}/editar`);
}

export async function revogarAcessoInquilino(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  const { data: t } = await sb.from("tenants").select("user_id").eq("id", id).maybeSingle();
  if (t?.user_id && features.tenant_portal_enabled) await revogarAcesso(sb, id, t.user_id);
  revalidatePath(`/inquilinos/${id}/editar`); redirect(`/inquilinos/${id}/editar?aviso=revogado`);
}

export async function editarContrato(_: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await ctx(); const v = raw(fd);
  const errs = firstErrors(contratoEdicaoSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const { data: l } = await sb.from("leases").select("data_inicio").eq("id", v.id).maybeSingle();
  if (!l) return fail({}, v, GENERIC);
  if (v.fim && v.fim < l.data_inicio) return fail({ fim: "O término precisa ser depois do início." }, v);
  const { error } = await sb.from("leases").update({ valor_centavos: toCentavos(v.valor), dia_vencimento: Number(v.dia), data_fim: v.fim || null, multa_percentual: parseValor(v.multa || "0"), juros_mensal_percentual: parseValor(v.juros || "0") }).eq("id", v.id);
  if (error) return fail({}, v, GENERIC);
  await sb.rpc("update_lease_charges", { p_lease: v.id });
  revalidatePath("/contratos"); revalidatePath("/alugueis"); revalidatePath("/painel"); redirect("/contratos");
}

// ----- Situações do dia a dia: cada uma registra o MOTIVO -----
async function carregarAluguel(sb: SB, id: string) {
  const { data } = await sb.from("rent_charges").select("valor_original_centavos,ajuste_centavos,status,payments(valor_centavos)").eq("id", id).maybeSingle();
  if (!data) return null;
  return { ...data, pago: (data.payments as { valor_centavos: number }[]).reduce((t, p) => t + p.valor_centavos, 0), temPagamento: (data.payments as unknown[]).length > 0 };
}
const atualizarTelas = () => { ["/alugueis", "/painel", "/financeiro"].forEach((p) => revalidatePath(p)); };

export async function ajustarValorAluguel(_: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await ctx(); const v = raw(fd);
  const errs = firstErrors(ajusteSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const c = await carregarAluguel(sb, v.charge_id); if (!c) return fail({}, v, GENERIC);
  const novo = toCentavos(v.valor);
  if (novo < c.pago) return fail({ valor: `O valor não pode ser menor que o já recebido (${(c.pago / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}). Exclua o pagamento errado, se for o caso.` }, v);
  const { error } = await sb.from("rent_charges").update({ ajuste_centavos: c.valor_original_centavos - novo, ajuste_motivo: v.motivo.trim() }).eq("id", v.charge_id);
  if (error) return fail({}, v, GENERIC);
  atualizarTelas(); return { ok: "Valor combinado salvo.", values: v };
}

export async function mudarVencimento(_: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await ctx(); const v = raw(fd);
  const errs = firstErrors(vencimentoSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const { error } = await sb.from("rent_charges").update({ vencimento: v.vencimento, vencimento_manual: true }).eq("id", v.charge_id);
  if (error) return fail({}, v, GENERIC);
  atualizarTelas(); return { ok: "Vencimento alterado.", values: v };
}

export async function cancelarAluguel(_: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await ctx(); const v = raw(fd);
  const errs = firstErrors(cancelamentoSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const c = await carregarAluguel(sb, v.charge_id); if (!c) return fail({}, v, GENERIC);
  if (c.temPagamento) return fail({}, v, "Este aluguel já tem pagamento registrado. Exclua o pagamento antes de cancelar.");
  const { error } = await sb.from("rent_charges").update({ status: "cancelado", motivo_cancelamento: v.motivo.trim() }).eq("id", v.charge_id);
  if (error) return fail({}, v, GENERIC);
  atualizarTelas(); return { ok: "Aluguel cancelado.", values: {} };
}

export async function reabrirAluguel(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? ""); const c = await carregarAluguel(sb, id);
  if (c) await sb.from("rent_charges").update({ status: "aguardando", motivo_cancelamento: null, ajuste_centavos: c.ajuste_centavos }).eq("id", id);
  atualizarTelas(); redirect(`/alugueis/${id}`);
}

export async function excluirPagamento(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  const { data: p } = await sb.from("payments").select("charge_id").eq("id", id).maybeSingle();
  if (p) { await sb.from("payments").delete().eq("id", id); atualizarTelas(); redirect(`/alugueis/${p.charge_id}`); }
}

// Multa e juros: nunca entram sozinhos. O dono confere o cálculo e confirma; pode atualizar ou remover depois.
export async function aplicarEncargos(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  const { data } = await sb.from("rent_charges").select("valor_original_centavos,ajuste_centavos,vencimento,status,payments(valor_centavos),leases(multa_percentual,juros_mensal_percentual)").eq("id", id).maybeSingle();
  if (!data || data.status === "cancelado") redirect(`/alugueis/${id}`);
  const pago = (data.payments as { valor_centavos: number }[]).reduce((t, p) => t + p.valor_centavos, 0);
  const l = data.leases as unknown as { multa_percentual: number; juros_mensal_percentual: number } | null;
  const hoje = hojeBR();
  const r = calcularEncargos({ base: Math.max(data.valor_original_centavos - data.ajuste_centavos - pago, 0), vencimento: data.vencimento, hoje, multa: Number(l?.multa_percentual ?? 0), juros: Number(l?.juros_mensal_percentual ?? 0) });
  await sb.from("rent_charges").update({ encargos_centavos: r.total, encargos_em: hoje }).eq("id", id);
  atualizarTelas(); redirect(`/alugueis/${id}`);
}

export async function removerEncargos(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  await sb.from("rent_charges").update({ encargos_centavos: 0, encargos_em: null }).eq("id", id);
  atualizarTelas(); redirect(`/alugueis/${id}`);
}

// ----- Pix direto para o dono -----
export async function salvarPix(_: FormState, fd: FormData): Promise<FormState> {
  const { sb, user } = await ctx(); const v = raw(fd);
  const errs = firstErrors(pixSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const { error } = await sb.from("profiles").update({ chave_pix: normalizarChave(v.tipo as TipoChave, v.chave), chave_pix_tipo: v.tipo, pix_nome: v.nome.trim(), pix_cidade: v.cidade.trim() }).eq("id", user.id);
  if (error) return fail({}, v, GENERIC);
  revalidatePath("/configuracoes"); revalidatePath("/painel");
  return { ok: "Chave Pix salva. Faça o teste de R$ 0,01 para conferir.", values: v };
}

// O INQUILINO avisa que pagou. Isso NÃO dá baixa: só cria um aviso para o dono conferir no extrato e confirmar.
export async function informarPagamento(_: FormState, fd: FormData): Promise<FormState> {
  const { sb } = await ctx(); const v = raw(fd);
  if (!features.tenant_portal_enabled) return fail({}, v, "Este recurso ainda não está disponível.");
  const errs = firstErrors(avisoSchema, v); if (Object.keys(errs).length) return fail(errs, v);
  const arq = fd.get("arquivo"); const temArq = arq instanceof File && arq.size > 0;
  if (temArq) { const e = await validarArquivo(arq); if (e) return fail({ arquivo: e }, v); }
  // só enxerga a cobrança quem é o inquilino dela (RLS)
  const { data: c } = await sb.from("rent_charges").select("id,owner_id,valor_original_centavos,ajuste_centavos,encargos_centavos,status,payments(valor_centavos)").eq("id", v.charge_id).maybeSingle();
  if (!c) return fail({}, v, GENERIC);
  const ja = (c.payments as { valor_centavos: number }[]).reduce((t, p) => t + p.valor_centavos, 0);
  const saldoAtual = c.valor_original_centavos - c.ajuste_centavos + c.encargos_centavos - ja;
  if (c.status === "cancelado" || saldoAtual <= 0) return fail({}, v, "Este aluguel não tem valor em aberto.");
  const cents = toCentavos(v.valor);
  if (cents > saldoAtual) return fail({ valor: "O valor é maior do que falta pagar." }, v);
  const admin = createAdminClient();
  const { error } = await admin.from("payment_claims").insert({ owner_id: c.owner_id, charge_id: c.id, valor_centavos: cents, pago_em: v.pago_em, mensagem: txt((v.mensagem ?? "").slice(0, 300)) });
  if (error) return fail({}, v, error.code === "23505" ? "Você já avisou este pagamento. Aguarde o proprietário confirmar." : GENERIC);
  if (temArq) {
    const nome = arq.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const caminho = `${c.owner_id}/${crypto.randomUUID()}-${nome}`;
    const up = await admin.storage.from("documentos").upload(caminho, arq, { contentType: arq.type, upsert: false });
    if (!up.error) await admin.from("documents").insert({ owner_id: c.owner_id, charge_id: c.id, tipo: "comprovante", nome_arquivo: arq.name.slice(0, 120), caminho, tamanho: arq.size, tipo_mime: arq.type, visivel_inquilino: true });
  }
  revalidatePath("/inquilino"); revalidatePath("/alugueis"); revalidatePath("/painel");
  return { ok: "Aviso enviado! Seu proprietário vai conferir e confirmar o pagamento.", values: {} };
}

// O DONO confirma: só agora o pagamento é registrado (como Pix) e o aluguel é baixado.
export async function confirmarAviso(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  const { data: cl } = await sb.from("payment_claims").select("id,charge_id,valor_centavos,pago_em,status").eq("id", id).maybeSingle();
  if (!cl || cl.status !== "pendente") return;
  const { data: c } = await sb.from("rent_charges").select("valor_original_centavos,ajuste_centavos,encargos_centavos,status,payments(valor_centavos)").eq("id", cl.charge_id).maybeSingle();
  if (c && c.status !== "cancelado") {
    const ja = (c.payments as { valor_centavos: number }[]).reduce((t, p) => t + p.valor_centavos, 0);
    const valor = Math.min(cl.valor_centavos, c.valor_original_centavos - c.ajuste_centavos + c.encargos_centavos - ja);
    if (valor > 0) { const { error } = await sb.from("payments").insert({ charge_id: cl.charge_id, valor_centavos: valor, pago_em: cl.pago_em, forma: "pix", observacao: "Confirmado a partir do aviso do inquilino" }); if (error) return; }
  }
  await sb.from("payment_claims").update({ status: "confirmado", resolvido_em: new Date().toISOString() }).eq("id", id);
  atualizarTelas();
}

export async function recusarAviso(fd: FormData): Promise<void> {
  const { sb } = await ctx(); const id = String(fd.get("id") ?? "");
  await sb.from("payment_claims").update({ status: "recusado", resolvido_em: new Date().toISOString() }).eq("id", id).eq("status", "pendente");
  atualizarTelas();
}

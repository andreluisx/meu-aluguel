import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { editarInquilino, enviarFotoInquilino, excluirInquilino, liberarAcessoInquilino, removerFotoInquilino, revogarAcessoInquilino } from "@/app/actions";
import { Avatar } from "@/components/app/Avatar";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { Card, PageHeader } from "@/components/app/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { Field, FileField } from "@/components/ui/Field";
import { features } from "@/lib/features";
import { urlsAssinadas } from "@/lib/fotos";
import { masks } from "@/lib/masks";
import { createClient } from "@/lib/supabase/server";
import { waNumero } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Editar inquilino" };
type T = { id: string; nome: string; cpf: string | null; whatsapp: string | null; telefone: string | null; email: string | null; user_id: string | null; foto_caminho: string | null };
const AVISOS: Record<string, [boolean, string]> = {
  liberado: [true, "Acesso liberado! Envie o aviso pelo WhatsApp abaixo."], revogado: [true, "Acesso removido. Esse e-mail não consegue mais entrar."],
  "acesso-removido": [true, "E-mail alterado. O acesso do e-mail antigo foi removido. Para o novo e-mail, clique em “Liberar acesso”."],
  "sem-email": [false, "Cadastre o e-mail do inquilino antes de liberar o acesso."], "email-existe": [false, "Este e-mail já tem cadastro no sistema. Use outro e-mail para o inquilino."],
  indisponivel: [false, "O acesso do inquilino ainda não está configurado neste sistema."], falha: [false, "Não conseguimos liberar agora. Tente novamente em instantes."],
  contratos: [false, "Este inquilino tem contratos no histórico e não pode ser excluído."],
};
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aviso?: string; erro?: string }> }) {
  const { id } = await params; const sp = await searchParams; const sb = await createClient();
  const { data } = await sb.from("tenants").select("id,nome,cpf,whatsapp,telefone,email,user_id,foto_caminho").eq("id", id).maybeSingle();
  if (!data) notFound();
  const t = data as T; const av = AVISOS[sp.aviso ?? sp.erro ?? ""]; const foto = (await urlsAssinadas(sb, [t.foto_caminho])).get(t.foto_caminho ?? "");
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"; const n = waNumero(t.whatsapp ?? t.telefone);
  const texto = `Olá, ${t.nome.split(" ")[0]}! Liberei seu acesso ao Meu Aluguel para você acompanhar seus aluguéis. Entre em ${site}/entrar-inquilino e digite seu e-mail (${t.email}). Você receberá um link para entrar, sem precisar de senha.`;
  return (<><PageHeader titulo="Editar inquilino" />
    {av && <p role={av[0] ? "status" : "alert"} className={`mb-4 max-w-xl rounded-xl p-3 font-bold ${av[0] ? "bg-verde-suave text-[#27623F]" : "bg-[#F8E3E0] text-erro-texto"}`}>{av[0] ? "✓" : "!"} {av[1]}</p>}
    <div className="max-w-xl">
    <Card className="mb-6"><div className="flex items-center gap-4"><Avatar url={foto} nome={t.nome} size={72} /><div><b className="text-lg">Foto</b><p className="text-texto-2">Aparece em miniatura na lista de inquilinos.</p></div></div>
      <details className="mt-3"><summary className="inline-flex min-h-12 cursor-pointer items-center rounded-xl border-2 border-verde-2 px-4 font-bold">{foto ? "Trocar foto" : "Adicionar foto"}</summary>
        <div className="mt-3 rounded-xl bg-fundo p-4"><ActionForm action={enviarFotoInquilino} submit="Guardar foto"><input type="hidden" name="id" value={t.id} /><FileField label="Foto" fotos /></ActionForm></div></details>
      {foto && <div className="mt-3"><ConfirmAction action={removerFotoInquilino} id={t.id} rotulo="Remover foto" aviso="Remover a foto deste inquilino?" confirmar="Sim, remover" /></div>}</Card>
    <ActionForm action={editarInquilino} submit="Salvar alterações">
      <input type="hidden" name="id" value={t.id} />
      <Field label="Nome completo" name="nome" defaultValue={t.nome} />
      <Field label="WhatsApp" name="whatsapp" type="tel" mask="telefone" defaultValue={t.whatsapp ? masks.telefone(t.whatsapp) : ""} />
      <Field label="Outro telefone (opcional)" name="telefone" type="tel" mask="telefone" defaultValue={t.telefone ? masks.telefone(t.telefone) : ""} />
      <Field label="E-mail (opcional)" name="email" type="email" defaultValue={t.email ?? ""} hint={t.user_id ? "Atenção: se trocar o e-mail, o acesso do e-mail antigo é removido e você precisa liberar o novo." : undefined} />
      <Field label="CPF (opcional)" name="cpf" mask="cpf" defaultValue={t.cpf ? masks.cpf(t.cpf) : ""} />
    </ActionForm>
    <Card className="mt-8"><h2 className="mb-1 text-xl font-extrabold">Acesso do inquilino ao sistema</h2>
      <p className="mb-3 text-texto-2">Com o acesso, o inquilino vê só os próprios aluguéis, pagamentos e comprovantes. Entra por um link no e-mail, sem senha.</p>
      {t.user_id ? <><p className="mb-3 font-bold text-[#27623F]">✓ Acesso liberado para {t.email}</p>
        <p className="mb-3 text-[.95rem] text-texto-2">Se o inquilino disser que o e-mail não chegou, peça para olhar o spam e esperar 1 minuto antes de pedir outro.</p>
        <div className="mb-3 flex flex-wrap gap-2">{n && <a href={`https://wa.me/${n}?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-xl bg-verde px-4 font-bold text-white">Enviar aviso de novo pelo WhatsApp</a>}</div>
        <ConfirmAction action={revogarAcessoInquilino} id={t.id} rotulo="Remover acesso" aviso="O inquilino não conseguirá mais entrar. Você pode liberar de novo quando quiser." confirmar="Sim, remover acesso" /></>
        : features.tenant_portal_enabled ? <form action={liberarAcessoInquilino}><input type="hidden" name="id" value={t.id} /><Button type="submit">Liberar acesso</Button><p className="mt-2 text-[.95rem] text-texto-2">Precisa do e-mail do inquilino cadastrado acima.</p></form>
        : <p className="rounded-xl bg-[#ECE9DC] p-3 font-bold">Ainda não está disponível. Falta configurar a chave de servidor do sistema.</p>}</Card>
    <div className="mt-8"><ConfirmAction action={excluirInquilino} id={t.id} rotulo="Excluir inquilino" aviso="Tem certeza? Isso não pode ser desfeito." confirmar="Sim, excluir inquilino" /></div></div></>);
}

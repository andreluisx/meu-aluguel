import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, FileText, Home } from "lucide-react";
import { sair } from "@/app/actions";
import { BotaoEmBreve } from "@/components/app/BotaoEmBreve";
import { Card, StatusBadge } from "@/components/app/ui";
import { Logo } from "@/components/brand/Logo";
import { type ChargeRow, devido, pago, saldo, situacao } from "@/lib/charges";
import { diasEntre, fmtData, hojeBR, mesRef, proximoVencimento, quandoVence } from "@/lib/dates";
import { fmtCentavos } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Meus aluguéis" };
export const dynamic = "force-dynamic";
type Lease = { lease_id: string; imovel_nome: string; endereco: string | null; cidade: string | null; estado: string | null; proprietario_nome: string | null; valor_centavos: number; dia_vencimento: number; data_inicio: string; data_fim: string | null };
type C = ChargeRow & { lease_id: string };
const ultimo = (c: C) => c.payments.reduce((m, p) => (p.pago_em > m ? p.pago_em : m), "");

function Linha({ t, v, forte, tom }: { t: string; v: string; forte?: boolean; tom?: string }) {
  return <div className={`flex justify-between gap-3 border-t border-black/10 py-2 first:border-0 ${forte ? "text-[1.15rem] font-extrabold" : ""}`}><span>{t}</span><span className={`tabular-nums ${tom ?? ""}`}>{v}</span></div>;
}

// Área do inquilino (somente leitura). O RLS do banco garante que ele só vê os próprios dados.
export default async function Page() {
  const sb = await createClient(); const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/entrar");
  const hoje = hojeBR();
  const [{ data: ls }, { data: cs }, { data: pf }] = await Promise.all([
    sb.rpc("portal_inquilino"),
    sb.from("rent_charges").select("id,lease_id,competencia,vencimento,valor_original_centavos,ajuste_centavos,ajuste_motivo,encargos_centavos,motivo_cancelamento,status,payments(id,valor_centavos,pago_em,forma),documents(id,tipo,nome_arquivo)").neq("status", "cancelado").order("vencimento"),
    sb.from("profiles").select("nome").eq("id", user.id).maybeSingle(),
  ]);
  const leases = (ls ?? []) as Lease[]; const nome = ((pf as { nome?: string } | null)?.nome ?? "").split(" ")[0];
  const todos = ((cs ?? []) as unknown as C[]).map((c) => ({ ...c, leases: null, payments: c.payments.map((p) => ({ ...p, observacao: null })) })) as C[];
  const abertos = todos.filter((c) => saldo(c) > 0), atrasados = abertos.filter((c) => c.vencimento < hoje);
  const principal = atrasados[0] ?? abertos[0] ?? null; const outrosAtrasados = atrasados.slice(1);
  const proximos = abertos.filter((c) => c.id !== principal?.id && c.vencimento >= hoje);
  const pagos = todos.filter((c) => saldo(c) === 0).sort((a, b) => ultimo(b).localeCompare(ultimo(a))).slice(0, 12);
  const lease = (id?: string) => leases.find((l) => l.lease_id === id) ?? leases[0];
  const pl = principal ? lease(principal.lease_id) : leases[0];
  const dias = principal ? diasEntre(hoje, principal.vencimento) : 0;
  const tom = !principal ? "ok" : dias < 0 ? "erro" : dias <= 3 ? "aviso" : "ok";
  const CAIXA = { erro: "border-erro bg-[#FBECEA]", aviso: "border-dourado bg-[#FDF5E1]", ok: "border-verde-claro bg-[#EEF5EF]" }[tom];
  // próximo vencimento DEPOIS do aluguel em destaque
  const seguinte = proximos[0];
  const calc = pl ? proximoVencimento(pl.dia_vencimento, hoje) : null;
  const proxData = seguinte?.vencimento ?? (calc && (!principal || calc > principal.vencimento) && (!pl?.data_fim || calc <= pl.data_fim) ? calc : null);
  const proxValor = seguinte ? saldo(seguinte) : pl?.valor_centavos ?? 0;
  const aviso = `Pagamento pelo aplicativo ainda não está disponível. Por enquanto, combine o pagamento diretamente com ${pl?.proprietario_nome ?? "seu proprietário"}.`;

  return (<main className="mx-auto max-w-xl px-5 pb-16 pt-[calc(env(safe-area-inset-top)+16px)]">
    <div className="mb-5 flex items-center justify-between gap-3"><Logo variant="compact" className="!text-xl" />
      <form action={sair}><button className="min-h-12 rounded-xl border-2 border-verde-2 px-4 font-bold">Sair</button></form></div>
    <h1 className="mb-1 text-[2rem] font-extrabold leading-tight">Olá{nome ? `, ${nome}` : ""}!</h1>
    {pl && <p className="mb-5 flex items-start gap-2 text-texto-2"><Home size={20} className="mt-0.5 flex-none" aria-hidden /><span><b className="text-texto">{pl.imovel_nome}</b>{[pl.endereco, pl.cidade, pl.estado].filter(Boolean).length ? <><br />{[pl.endereco, pl.cidade, pl.estado].filter(Boolean).join(", ")}</> : null}</span></p>}

    {principal ? (
      <section aria-labelledby="agora" className={`mb-5 rounded-[20px] border-2 p-5 ${CAIXA}`}>
        <p id="agora" className="mb-1 flex items-center gap-2 text-[1.05rem] font-extrabold">
          {tom === "erro" ? <AlertTriangle size={24} className="text-erro-texto" aria-hidden /> : <Clock size={24} aria-hidden />}
          {tom === "erro" ? "Aluguel atrasado" : dias === 0 ? "Seu aluguel vence hoje" : "Próximo aluguel a pagar"}</p>
        <p className="text-texto-2">Você precisa pagar:</p>
        <p className={`mb-1 text-[2.8rem] font-extrabold leading-none tabular-nums ${tom === "erro" ? "text-erro-texto" : ""}`}>{fmtCentavos(saldo(principal))}</p>
        <p className="mb-4 text-[1.05rem]">Referente a <b>{mesRef(principal.competencia)}</b></p>
        <div className="mb-4 rounded-xl bg-white/80 p-4"><p className="text-texto-2">Vencimento</p>
          <p className="text-[1.5rem] font-extrabold">{fmtData(principal.vencimento)}</p>
          <p className={`font-bold ${tom === "erro" ? "text-erro-texto" : ""}`}>{quandoVence(hoje, principal.vencimento)}</p></div>
        <div className="mb-4 rounded-xl bg-white/80 px-4 py-2">
          <Linha t="Valor do aluguel" v={fmtCentavos(principal.valor_original_centavos)} />
          {principal.ajuste_centavos !== 0 && <Linha t={principal.ajuste_centavos > 0 ? "Desconto" : "Acréscimo"} v={`${principal.ajuste_centavos > 0 ? "−" : "+"} ${fmtCentavos(Math.abs(principal.ajuste_centavos))}`} />}
          {principal.encargos_centavos > 0 && <Linha t="Multa e juros" v={`+ ${fmtCentavos(principal.encargos_centavos)}`} />}
          {pago(principal) > 0 && <Linha t="Já pago" v={`− ${fmtCentavos(pago(principal))}`} tom="text-[#27623F]" />}
          <Linha t="Falta pagar" v={fmtCentavos(saldo(principal))} forte />
          {principal.ajuste_motivo && <p className="pb-1 text-[.95rem] text-texto-2">Motivo do ajuste: {principal.ajuste_motivo}</p>}
        </div>
        {tom === "erro" && <p className="mb-4 rounded-xl bg-white/80 p-3 text-[.95rem]">Se o contrato prevê multa e juros por atraso, o valor será informado por {pl?.proprietario_nome ?? "seu proprietário"} e aparecerá aqui.</p>}
        <div className="grid gap-3">
          <BotaoEmBreve destaque rotulo="Pagar agora" icone="pix" aviso={aviso} />
          <BotaoEmBreve rotulo="Copiar código Pix" icone="copiar" aviso={aviso} />
          <BotaoEmBreve rotulo="Já paguei — enviar comprovante" icone="comprovante" aviso="Em breve você poderá enviar o comprovante por aqui. Por enquanto, envie para o seu proprietário." />
        </div>
      </section>
    ) : (
      <section className="mb-5 flex items-center gap-4 rounded-[20px] border-2 border-verde-claro bg-[#EEF5EF] p-5" role="status">
        <span className="grid size-14 flex-none place-items-center rounded-full bg-verde-claro text-[#14210A]" aria-hidden><CheckCircle2 size={30} /></span>
        <div><p className="text-xl font-extrabold text-[#27623F]">Tudo pago!</p><p>{leases.length || todos.length ? "Você não tem nenhum aluguel em aberto." : "Ainda não há aluguéis para você. Fale com seu proprietário."}</p></div>
      </section>
    )}

    {proxData && (<Card className="mb-5"><p className="mb-2 flex items-center gap-2 text-lg font-extrabold"><CalendarClock size={22} className="text-verde" aria-hidden />{principal ? "Depois deste, o próximo vence em" : "Seu próximo aluguel vence em"}</p>
      <p className="text-[1.5rem] font-extrabold">{fmtData(proxData)}</p><p className="text-texto-2">{quandoVence(hoje, proxData)} · {fmtCentavos(proxValor)}</p></Card>)}

    {outrosAtrasados.length > 0 && (<><h2 className="mb-2 mt-6 flex items-center gap-2 text-xl font-extrabold text-erro-texto"><AlertTriangle size={22} aria-hidden />Outros aluguéis atrasados</h2>
      <Card className="mb-5">{outrosAtrasados.map((c) => (<div key={c.id} className="flex items-center justify-between gap-3 border-b border-l-[6px] border-borda border-l-erro py-3 pl-3 last:border-b-0"><span><b>{mesRef(c.competencia)}</b><br /><span className="text-texto-2">{quandoVence(hoje, c.vencimento)} · {fmtData(c.vencimento)}</span></span><b className="tabular-nums">{fmtCentavos(saldo(c))}</b></div>))}</Card></>)}

    {proximos.length > 0 && (<><h2 className="mb-2 mt-6 text-xl font-extrabold">Próximos aluguéis</h2>
      <Card className="mb-5">{proximos.slice(0, 4).map((c) => (<div key={c.id} className="flex items-center justify-between gap-3 border-b border-borda py-3 last:border-b-0"><span><b>{mesRef(c.competencia)}</b><br /><span className="text-texto-2">vence em {fmtData(c.vencimento)}</span></span><b className="tabular-nums">{fmtCentavos(devido(c))}</b></div>))}</Card></>)}

    {pagos.length > 0 && (<><h2 className="mb-2 mt-6 text-xl font-extrabold">Pagamentos feitos</h2>
      <Card className="mb-5">{pagos.map((c) => (
        <div key={c.id} className="border-b border-l-[6px] border-borda border-l-verde-claro py-3 pl-3 last:border-b-0">
          <div className="flex items-start justify-between gap-3"><span><b>{mesRef(c.competencia)}</b><br /><span className="text-texto-2">Pago em {fmtData(ultimo(c))}</span></span><span className="text-right"><b className="block tabular-nums">{fmtCentavos(pago(c))}</b><StatusBadge s={situacao(c, hoje)} /></span></div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {(c.documents ?? []).map((d) => <a key={d.id} href={`/documentos/${d.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-bold underline"><FileText size={18} aria-hidden />Ver comprovante</a>)}
            <BotaoEmBreve rotulo="Baixar recibo" icone="recibo" aviso="O recibo em PDF estará disponível em breve." /></div></div>))}</Card></>)}

    {pl && (<Card><h2 className="mb-2 text-xl font-extrabold">Seu contrato</h2>
      <Linha t="Aluguel mensal" v={fmtCentavos(pl.valor_centavos)} /><Linha t="Vence todo dia" v={String(pl.dia_vencimento)} />
      <Linha t="Início" v={fmtData(pl.data_inicio)} />{pl.data_fim && <Linha t="Término" v={fmtData(pl.data_fim)} />}
      {pl.proprietario_nome && <Linha t="Proprietário" v={pl.proprietario_nome} />}</Card>)}
  </main>);
}

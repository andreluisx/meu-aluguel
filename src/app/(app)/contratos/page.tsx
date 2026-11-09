import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { encerrarContrato, enviarDocumento, excluirDocumento } from "@/app/actions";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { Card, EmptyState, PageHeader } from "@/components/app/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { FileField } from "@/components/ui/Field";
import { fmtData } from "@/lib/dates";
import { fmtCentavos } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Contratos" };
type Row = { id: string; valor_centavos: number; dia_vencimento: number; data_inicio: string; data_fim: string | null; status: string; multa_percentual: number; juros_mensal_percentual: number; properties: { nome: string } | null; tenants: { nome: string } | null; documents: { id: string; nome_arquivo: string }[] };
const chip = (on: boolean) => `inline-flex min-h-12 items-center rounded-xl border-2 px-4 font-bold ${on ? "border-verde bg-verde text-white" : "border-verde-2"}`;
export default async function Page({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const f = (await searchParams).f === "todos" ? "todos" : "ativos";
  const sb = await createClient();
  const { data } = await sb.from("leases").select("id,valor_centavos,dia_vencimento,data_inicio,data_fim,status,multa_percentual,juros_mensal_percentual,properties(nome),tenants(nome),documents(id,nome_arquivo)").order("created_at", { ascending: false });
  const todos = (data ?? []) as unknown as Row[]; const ativos = todos.filter((r) => r.status === "ativo");
  const rows = f === "todos" ? todos : ativos;
  return (<>
    <PageHeader titulo="Contratos" href="/contratos/novo" cta="Novo contrato" />
    <div className="mb-5 flex flex-wrap gap-2"><Link href="/contratos" className={chip(f === "ativos")} aria-current={f === "ativos" ? "page" : undefined}>Ativos ({ativos.length})</Link><Link href="/contratos?f=todos" className={chip(f === "todos")} aria-current={f === "todos" ? "page" : undefined}>Todos ({todos.length})</Link></div>
    {!todos.length ? <EmptyState titulo="Nenhum contrato ainda" texto="O contrato liga o imóvel ao inquilino e gera os aluguéis de cada mês." href="/contratos/novo" cta="Criar contrato" /> : !rows.length ? <p className="rounded-xl bg-white p-5 text-texto-2">Nenhum contrato ativo. Veja a aba “Todos” para os encerrados.</p> :
      <div className="grid gap-3 md:grid-cols-2">{rows.map((r) => (
        <Card key={r.id}><div className="flex items-start justify-between gap-3"><div><b className="text-lg">{r.properties?.nome}</b><p className="text-texto-2">{r.tenants?.nome}</p></div>
          <span className={`rounded-full px-3 py-0.5 text-[.9rem] font-bold ${r.status === "ativo" ? "bg-verde-suave text-[#27623F]" : "bg-[#ECE9DC] text-texto-2"}`}>{r.status === "ativo" ? "✓ Ativo" : "Encerrado"}</span></div>
          <p className="mt-2 text-xl font-extrabold tabular-nums">{fmtCentavos(r.valor_centavos)}</p>
          <p className="mb-3 text-texto-2">Vence dia {r.dia_vencimento} · {fmtData(r.data_inicio)}{r.data_fim ? ` a ${fmtData(r.data_fim)}` : " (sem data de término)"}</p>
          {(Number(r.multa_percentual) > 0 || Number(r.juros_mensal_percentual) > 0) && <p className="mb-3 text-[.95rem] text-texto-2">Multa {r.multa_percentual}% · Juros {r.juros_mensal_percentual}% ao mês</p>}
          <div className="mb-3 rounded-xl bg-fundo p-3"><p className="mb-1 font-bold">Contrato assinado</p>
            {r.documents.length ? r.documents.map((d) => (<div key={d.id} className="mb-2"><div className="flex items-center gap-2"><FileText size={20} className="flex-none text-verde" aria-hidden /><span className="min-w-0 flex-1 truncate">{d.nome_arquivo}</span>
              <a href={`/documentos/${d.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl border-2 border-verde-2 px-3 font-bold">Abrir</a></div>
              <div className="mt-1"><ConfirmAction action={excluirDocumento} id={d.id} rotulo="Excluir" aviso="Excluir este arquivo do contrato?" confirmar="Sim, excluir" /></div></div>)) : <p className="text-[.95rem] text-texto-2">Nenhum arquivo anexado.</p>}
            <details className="mt-2"><summary className="inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-verde px-4 font-bold text-white">Anexar contrato</summary>
              <div className="mt-3"><ActionForm action={enviarDocumento} submit="Guardar contrato"><input type="hidden" name="lease_id" value={r.id} /><FileField label="Arquivo do contrato" hint="PDF ou foto, até 10 MB." /></ActionForm></div></details></div>
          <div className="flex flex-wrap items-start gap-2"><Link href={`/contratos/${r.id}/editar`} className="inline-flex min-h-12 items-center rounded-xl border-2 border-verde-2 px-4 font-bold">Editar</Link>
            {r.status === "ativo" && <ConfirmAction action={encerrarContrato} id={r.id} rotulo="Encerrar contrato" aviso="Os aluguéis futuros sem pagamento serão cancelados. O histórico continua guardado." confirmar="Sim, encerrar contrato" />}</div></Card>))}</div>}
  </>);
}

import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, CalendarDays, CalendarRange, CheckCircle2, FileText, Pencil, Plus, UserRound } from "lucide-react";
import { encerrarContrato, enviarDocumento, excluirDocumento } from "@/app/actions";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { Card, EmptyState, PageHeader, Segmentado } from "@/components/app/ui";
import { Icone } from "@/components/ui/Icone";
import { ActionForm } from "@/components/ui/ActionForm";
import { FileField } from "@/components/ui/Field";
import { fmtData } from "@/lib/dates";
import { fmtCentavos } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Contratos" };
type Row = { id: string; valor_centavos: number; dia_vencimento: number; data_inicio: string; data_fim: string | null; status: string; multa_percentual: number; juros_mensal_percentual: number; properties: { nome: string } | null; tenants: { nome: string } | null; documents: { id: string; nome_arquivo: string }[] };
export default async function Page({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const f = (await searchParams).f === "todos" ? "todos" : "ativos";
  const sb = await createClient();
  const { data } = await sb.from("leases").select("id,valor_centavos,dia_vencimento,data_inicio,data_fim,status,multa_percentual,juros_mensal_percentual,properties(nome),tenants(nome),documents(id,nome_arquivo)").order("created_at", { ascending: false });
  const todos = (data ?? []) as unknown as Row[]; const ativos = todos.filter((r) => r.status === "ativo");
  const rows = f === "todos" ? todos : ativos;
  return (<>
    <PageHeader icone="contratos" titulo="Contratos" href="/contratos/novo" cta="Novo contrato" />
    <Segmentado itens={[{ href: "/contratos", rotulo: `Ativos (${ativos.length})`, ativo: f === "ativos" }, { href: "/contratos?f=todos", rotulo: `Todos (${todos.length})`, ativo: f === "todos" }]} />
    {!todos.length ? <EmptyState titulo="Nenhum contrato ainda" texto="O contrato liga o imóvel ao inquilino e gera os aluguéis de cada mês." href="/contratos/novo" cta="Criar contrato" /> : !rows.length ? <p className="rounded-xl bg-white p-5 text-texto-2">Nenhum contrato ativo. Veja a aba “Todos” para os encerrados.</p> :
      <div className="grid gap-4 lg:grid-cols-2">{rows.map((r) => (
        <Card key={r.id} className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><h2 className="break-words text-lg font-extrabold leading-tight">{r.properties?.nome}</h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-texto-2"><UserRound size={16} className="flex-none" aria-hidden /><span className="min-w-0 break-words">{r.tenants?.nome}</span></p></div>
            <span className={`inline-flex flex-none items-center gap-1.5 rounded-full px-3 py-1 text-[.9rem] font-bold ${r.status === "ativo" ? "bg-[#DCEBDD] text-[#1F5A38]" : "bg-[#ECE9DC] text-texto-2"}`}>{r.status === "ativo" && <CheckCircle2 size={16} aria-hidden />}{r.status === "ativo" ? "Ativo" : "Encerrado"}</span>
          </div>
          <dl className="my-3 grid grid-cols-2 gap-3 rounded-xl bg-fundo p-3">
            <div className="min-w-0"><dt className="flex items-center gap-1.5 text-[.85rem] font-semibold text-texto-2"><Banknote size={16} aria-hidden />Aluguel</dt><dd className="text-xl font-extrabold tabular-nums">{fmtCentavos(r.valor_centavos)}</dd></div>
            <div className="min-w-0"><dt className="flex items-center gap-1.5 text-[.85rem] font-semibold text-texto-2"><CalendarDays size={16} aria-hidden />Vence</dt><dd className="text-lg font-bold">todo dia {r.dia_vencimento}</dd></div>
            <div className="col-span-2 min-w-0"><dt className="flex items-center gap-1.5 text-[.85rem] font-semibold text-texto-2"><CalendarRange size={16} aria-hidden />Período</dt><dd className="font-bold">{fmtData(r.data_inicio)} até {r.data_fim ? fmtData(r.data_fim) : "sem data de término"}</dd></div>
          </dl>
          {(Number(r.multa_percentual) > 0 || Number(r.juros_mensal_percentual) > 0) && <p className="mb-3 text-[.95rem] text-texto-2">Multa {r.multa_percentual}% · Juros {r.juros_mensal_percentual}% ao mês</p>}
          <div className="mb-4 rounded-xl border border-borda p-3"><p className="mb-2 flex items-center gap-2 font-bold"><FileText size={18} className="text-verde" aria-hidden />Contrato assinado</p>
            {r.documents.length ? r.documents.map((d) => (<div key={d.id} className="mb-3"><p className="mb-1.5 break-words text-[.95rem]">{d.nome_arquivo}</p>
              <div className="flex flex-wrap items-start gap-2"><a href={`/documentos/${d.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-verde-2 px-4 font-bold"><Icone texto="Abrir" />Abrir</a>
                <ConfirmAction action={excluirDocumento} id={d.id} rotulo="Excluir" aviso="Excluir este arquivo do contrato?" confirmar="Sim, excluir" /></div></div>)) : <p className="mb-2 text-[.95rem] text-texto-2">Nenhum arquivo anexado.</p>}
            <details><summary className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-verde px-4 font-bold text-white"><Plus size={20} aria-hidden />Anexar contrato</summary>
              <div className="mt-3"><ActionForm action={enviarDocumento} submit="Guardar contrato"><input type="hidden" name="lease_id" value={r.id} /><FileField label="Arquivo do contrato" hint="PDF ou foto, até 10 MB." /></ActionForm></div></details></div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href={`/contratos/${r.id}/editar`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-verde-2 px-4 font-bold"><Pencil size={18} aria-hidden />Editar</Link>
            {r.status === "ativo" && <ConfirmAction action={encerrarContrato} id={r.id} rotulo="Encerrar contrato" aviso="Os aluguéis futuros sem pagamento serão cancelados. O histórico continua guardado." confirmar="Sim, encerrar contrato" />}</div>
        </Card>))}</div>}
  </>);
}

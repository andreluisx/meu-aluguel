import type { Metadata } from "next";
<<<<<<< HEAD
import { ArrowDownCircle, ArrowUpCircle, BarChart3, Download, FileText, Scale } from "lucide-react";
=======
import { ArrowDownCircle, ArrowUpCircle, BarChart3, Scale } from "lucide-react";
>>>>>>> a3e90305993a061480649c980e79da21c6f91e2b
import Link from "next/link";
import { MesNav } from "@/components/app/MesNav";
import { Card, PageHeader, Stat } from "@/components/app/ui";
import { mesRef } from "@/lib/dates";
import { addMes, carregarMes, mesValido } from "@/lib/financeiro";
import { fmtCentavos } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Financeiro" };
export default async function Page({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const ym = mesValido((await searchParams).mes); const sb = await createClient();
  const r = await carregarMes(sb, ym); const max = Math.max(r.rec, r.desp, 1);
  const nav = "inline-flex min-h-12 items-center rounded-xl border-2 border-verde-2 px-4 font-bold";
  return (<>
<<<<<<< HEAD
    <PageHeader icone={"financeiro"} titulo="Financeiro" sub="O que entrou e o que saiu em cada mês." />
    <MesNav ym={ym} href={(m) => `/financeiro?mes=${m}`} />
    <div className="mb-5 grid grid-cols-2 gap-2">
      <Link href={`/financeiro/relatorio?mes=${ym}`} className={`${nav} justify-center gap-2 text-center`}><FileText size={18} className="flex-none" aria-hidden />Relatório</Link>
      <a href={`/financeiro/exportar?mes=${ym}`} className={`${nav} justify-center gap-2 text-center`}><Download size={18} className="flex-none" aria-hidden />Planilha (CSV)</a>
    </div>
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Stat label="Aluguéis recebidos" value={fmtCentavos(r.rec)} tone="ok" icone={"entrada"} /><Stat label="Despesas" value={fmtCentavos(r.desp)} tone="warn" icone={"financeiro"} />
      <Stat label="Resultado do mês" value={fmtCentavos(r.liquido)} tone={r.liquido < 0 ? "err" : "ok"} icone={"escala"} />
=======
    <PageHeader icone={BarChart3} titulo="Financeiro" sub="O que entrou e o que saiu em cada mês." />
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <Link href={`/financeiro?mes=${addMes(ym, -1)}`} className={nav} aria-label="Mês anterior">← Anterior</Link>
      <b className="min-w-[10rem] text-center text-lg">{mesRef(`${ym}-01`)}</b>
      <Link href={`/financeiro?mes=${addMes(ym, 1)}`} className={nav} aria-label="Próximo mês">Próximo →</Link>
      <Link href={`/financeiro/relatorio?mes=${ym}`} className={`${nav} ml-auto`}>Relatório para imprimir</Link>
      <a href={`/financeiro/exportar?mes=${ym}`} className={nav}>Baixar planilha (CSV)</a>
    </div>
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Stat label="Aluguéis recebidos" value={fmtCentavos(r.rec)} tone="ok" icone={ArrowUpCircle} /><Stat label="Despesas" value={fmtCentavos(r.desp)} tone="aviso" icone={ArrowDownCircle} />
      <Stat label="Resultado do mês" value={fmtCentavos(r.liquido)} tone={r.liquido < 0 ? "erro" : "ok"} icone={Scale} />
>>>>>>> a3e90305993a061480649c980e79da21c6f91e2b
    </div>
    <Card className="mb-6"><div className="grid gap-3">
      {[["Recebido", r.rec, "bg-verde-claro"], ["Despesas", r.desp, "bg-dourado"]].map(([t, v, c]) => (
        <div key={t as string}><div className="mb-1 flex justify-between font-bold"><span>{t}</span><span className="tabular-nums">{fmtCentavos(v as number)}</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-verde-suave"><div className={`h-full ${c}`} style={{ width: `${((v as number) / max) * 100}%` }} /></div></div>))}</div></Card>
    <h2 className="mb-3 text-xl font-extrabold">Resultado por imóvel</h2>
    <Card>{r.porImovel.length ? r.porImovel.map((i) => (
      <div key={i.nome} className="flex items-center justify-between gap-3 border-t border-borda py-3 first:border-0"><div><b>{i.nome}</b><p className="text-[.95rem] text-texto-2">Recebido {fmtCentavos(i.rec)} · Despesas {fmtCentavos(i.desp)}</p></div>
        <b className={`text-lg tabular-nums ${i.rec - i.desp < 0 ? "text-erro-texto" : "text-[#27623F]"}`}>{fmtCentavos(i.rec - i.desp)}</b></div>)) : <p className="text-texto-2">Nenhuma movimentação neste mês.</p>}</Card>
    <p className="mt-4 text-[.95rem] text-texto-2">Resultado = aluguéis recebidos no mês menos despesas registradas. É uma estimativa para seu controle, não um cálculo de lucro contábil nem de imposto.</p>
  </>);
}

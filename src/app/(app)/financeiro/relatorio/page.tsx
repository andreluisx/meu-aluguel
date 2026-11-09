import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/app/PrintButton";
import { CHARGE_SELECT, asCharges, saldo } from "@/lib/charges";
import { FORMAS, nomeCategoria } from "@/lib/constants";
import { fmtData, hojeBR, mesRef } from "@/lib/dates";
import { addMes, carregarMes, mesValido } from "@/lib/financeiro";
import { fmtCentavos } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Relatório financeiro" };
const th = "border-b-2 border-texto py-1.5 pr-3 text-left font-bold", td = "border-b border-borda py-1.5 pr-3 align-top", num = "text-right tabular-nums";
export default async function Page({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const ym = mesValido((await searchParams).mes); const sb = await createClient(); const hoje = hojeBR();
  const r = await carregarMes(sb, ym);
  const { data } = await sb.from("rent_charges").select(CHARGE_SELECT).in("status", ["aguardando", "parcial"]).lt("vencimento", hoje).order("vencimento");
  const atrasados = asCharges(data); const totalAtraso = atrasados.reduce((s, c) => s + saldo(c), 0);
  return (<div className="text-[1rem]">
    <div className="mb-5 flex flex-wrap items-center gap-2 print:hidden"><Link href={`/financeiro?mes=${ym}`} className="inline-flex min-h-12 items-center rounded-xl border-2 border-verde-2 px-4 font-bold">← Voltar</Link>
      <Link href={`/financeiro/relatorio?mes=${addMes(ym, -1)}`} className="inline-flex min-h-12 items-center rounded-xl border-2 border-verde-2 px-4 font-bold">Mês anterior</Link>
      <Link href={`/financeiro/relatorio?mes=${addMes(ym, 1)}`} className="inline-flex min-h-12 items-center rounded-xl border-2 border-verde-2 px-4 font-bold">Próximo mês</Link><PrintButton /></div>
    <h1 className="text-[1.9rem] font-extrabold">Relatório financeiro</h1>
    <p className="mb-6 text-texto-2">{mesRef(`${ym}-01`)} · gerado em {fmtData(hoje)}</p>
    <h2 className="mb-2 text-xl font-extrabold">Resumo</h2>
    <table className="mb-6 w-full max-w-md border-collapse"><tbody>
      <tr><td className={td}>Aluguéis recebidos</td><td className={`${td} ${num}`}>{fmtCentavos(r.rec)}</td></tr>
      <tr><td className={td}>Despesas</td><td className={`${td} ${num}`}>{fmtCentavos(r.desp)}</td></tr>
      <tr><td className={`${td} font-bold`}>Resultado do mês</td><td className={`${td} ${num} font-bold`}>{fmtCentavos(r.liquido)}</td></tr></tbody></table>
    <h2 className="mb-2 text-xl font-extrabold">Resultado por imóvel</h2>
    <table className="mb-6 w-full border-collapse"><thead><tr><th className={th}>Imóvel</th><th className={`${th} ${num}`}>Recebido</th><th className={`${th} ${num}`}>Despesas</th><th className={`${th} ${num}`}>Resultado</th></tr></thead>
      <tbody>{r.porImovel.length ? r.porImovel.map((i) => <tr key={i.nome}><td className={td}>{i.nome}</td><td className={`${td} ${num}`}>{fmtCentavos(i.rec)}</td><td className={`${td} ${num}`}>{fmtCentavos(i.desp)}</td><td className={`${td} ${num} font-bold`}>{fmtCentavos(i.rec - i.desp)}</td></tr>) : <tr><td className={td} colSpan={4}>Sem movimentação.</td></tr>}</tbody></table>
    <h2 className="mb-2 text-xl font-extrabold">Pagamentos recebidos</h2>
    <table className="mb-6 w-full border-collapse"><thead><tr><th className={th}>Data</th><th className={th}>Inquilino</th><th className={th}>Imóvel</th><th className={th}>Forma</th><th className={`${th} ${num}`}>Valor</th></tr></thead>
      <tbody>{r.pagamentos.length ? r.pagamentos.map((p, i) => <tr key={i}><td className={td}>{fmtData(p.pago_em)}</td><td className={td}>{p.rent_charges?.leases?.tenants?.nome}</td><td className={td}>{p.rent_charges?.leases?.properties?.nome}</td><td className={td}>{FORMAS.find((f) => f[0] === p.forma)?.[1] ?? p.forma}</td><td className={`${td} ${num}`}>{fmtCentavos(p.valor_centavos)}</td></tr>) : <tr><td className={td} colSpan={5}>Nenhum pagamento neste mês.</td></tr>}</tbody></table>
    <h2 className="mb-2 text-xl font-extrabold">Despesas</h2>
    <table className="mb-6 w-full border-collapse"><thead><tr><th className={th}>Data</th><th className={th}>Imóvel</th><th className={th}>Descrição</th><th className={`${th} ${num}`}>Valor</th></tr></thead>
      <tbody>{r.despesas.length ? r.despesas.map((d) => <tr key={d.id}><td className={td}>{fmtData(d.data)}</td><td className={td}>{d.properties?.nome}</td><td className={td}>{nomeCategoria(d.categoria)}: {d.descricao}</td><td className={`${td} ${num}`}>{fmtCentavos(d.valor_centavos)}</td></tr>) : <tr><td className={td} colSpan={4}>Nenhuma despesa neste mês.</td></tr>}</tbody></table>
    <h2 className="mb-2 text-xl font-extrabold">Aluguéis atrasados (hoje) · {fmtCentavos(totalAtraso)}</h2>
    <table className="mb-6 w-full border-collapse"><thead><tr><th className={th}>Inquilino</th><th className={th}>Imóvel</th><th className={th}>Vencimento</th><th className={`${th} ${num}`}>Falta pagar</th></tr></thead>
      <tbody>{atrasados.length ? atrasados.map((c) => <tr key={c.id}><td className={td}>{c.leases?.tenants?.nome}</td><td className={td}>{c.leases?.properties?.nome}</td><td className={td}>{fmtData(c.vencimento)}</td><td className={`${td} ${num}`}>{fmtCentavos(saldo(c))}</td></tr>) : <tr><td className={td} colSpan={4}>Nenhum aluguel atrasado.</td></tr>}</tbody></table>
    <p className="text-[.9rem] text-texto-2">Resultado = aluguéis recebidos no mês menos despesas registradas. É uma estimativa para controle, não um cálculo de lucro contábil nem de imposto.</p>
  </div>);
}

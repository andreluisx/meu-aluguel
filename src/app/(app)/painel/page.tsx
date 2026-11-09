import type { Metadata } from "next";
import { ChargeItem } from "@/components/app/ChargeItem";
import { Card, EmptyState, PageHeader, Stat } from "@/components/app/ui";
import { CHARGE_SELECT, asCharges, devido, pago, saldo } from "@/lib/charges";
import { fimMes, hojeBR, inicioMes } from "@/lib/dates";
import { fmtCentavos } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Início" };
export default async function Painel() {
  const sb = await createClient();
  const { count: nImoveis } = await sb.from("properties").select("id", { count: "exact", head: true });
  if (!nImoveis) return (<><PageHeader titulo="Bem-vindo ao Meu Aluguel" /><EmptyState titulo="Vamos organizar seu primeiro imóvel?" texto="Leva poucos minutos. Depois é só cadastrar o inquilino e o contrato." href="/imoveis/novo" cta="Adicionar meu primeiro imóvel" /></>);
  await sb.rpc("generate_my_charges");
  const hoje = hojeBR();
  const { count: nContratos } = await sb.from("leases").select("id", { count: "exact", head: true }).eq("status", "ativo");
  const { data: m } = await sb.from("rent_charges").select(CHARGE_SELECT).gte("vencimento", inicioMes(hoje)).lte("vencimento", fimMes(hoje)).neq("status", "cancelado");
  const { data: p } = await sb.from("rent_charges").select(CHARGE_SELECT).in("status", ["aguardando", "parcial"]).order("vencimento").limit(6);
  const mes = asCharges(m), prox = asCharges(p);
  const previsto = mes.reduce((s, c) => s + devido(c), 0), recebido = mes.reduce((s, c) => s + pago(c), 0);
  const atraso = mes.filter((c) => c.vencimento < hoje).reduce((s, c) => s + saldo(c), 0);
  const aVencer = mes.filter((c) => c.vencimento >= hoje).reduce((s, c) => s + saldo(c), 0);
  return (<>
    <PageHeader titulo="Início" sub="Veja como estão seus aluguéis neste mês." />
    <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
      <Stat label="Previsto no mês" value={fmtCentavos(previsto)} /><Stat label="Aluguéis recebidos" value={fmtCentavos(recebido)} tone="ok" />
      <Stat label="Ainda a receber" value={fmtCentavos(aVencer)} /><Stat label="Aluguéis atrasados" value={fmtCentavos(atraso)} tone={atraso ? "err" : undefined} />
      <Stat label="Imóveis" value={String(nImoveis)} /><Stat label="Contratos ativos" value={String(nContratos ?? 0)} />
    </div>
    <h2 className="mb-3 text-xl font-extrabold">Próximos vencimentos</h2>
    <Card>{prox.length ? prox.map((c) => <ChargeItem key={c.id} c={c} hoje={hoje} />) : <p className="text-texto-2">Nenhum aluguel pendente. Tudo em dia!</p>}</Card>
  </>);
}

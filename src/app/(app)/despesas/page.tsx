import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { excluirDespesa } from "@/app/actions";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { Card, EmptyState, PageHeader } from "@/components/app/ui";
import { nomeCategoria } from "@/lib/constants";
import { fmtData } from "@/lib/dates";
import type { Dp } from "@/lib/financeiro";
import { fmtCentavos } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Despesas" };
export default async function Page() {
  const sb = await createClient();
  const { data } = await sb.from("expenses").select("id,categoria,descricao,valor_centavos,data,property_id,properties(nome)").order("data", { ascending: false }).limit(60);
  const rows = (data ?? []) as unknown as Dp[];
  return (<>
    <PageHeader icone="despesas" titulo="Despesas" sub="Manutenção, impostos e contas dos seus imóveis." href="/despesas/nova" cta="Adicionar despesa" />
    {!rows.length ? <EmptyState titulo="Nenhuma despesa registrada" texto="Registre o que você gasta com cada imóvel para saber quanto sobra no fim do mês." href="/despesas/nova" cta="Adicionar despesa" /> :
      <Card>{rows.map((d) => (
        <div key={d.id} className="border-t border-borda py-4 first:border-0">
          <div className="flex items-start justify-between gap-3"><div><b>{d.descricao}</b><br /><span className="text-texto-2">{d.properties?.nome} · {nomeCategoria(d.categoria)} · {fmtData(d.data)}</span></div><b className="text-lg tabular-nums">{fmtCentavos(d.valor_centavos)}</b></div>
          <div className="mt-2"><ConfirmAction action={excluirDespesa} id={d.id} rotulo="Excluir" aviso="Tem certeza? Isso não pode ser desfeito." confirmar="Sim, excluir" /></div>
        </div>))}</Card>}
  </>);
}

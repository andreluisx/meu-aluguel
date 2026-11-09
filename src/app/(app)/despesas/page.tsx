import type { Metadata } from "next";
import { excluirDespesa } from "@/app/actions";
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
    <PageHeader titulo="Despesas" sub="Manutenção, impostos e contas dos seus imóveis." href="/despesas/nova" cta="Adicionar despesa" />
    {!rows.length ? <EmptyState titulo="Nenhuma despesa registrada" texto="Registre o que você gasta com cada imóvel para saber quanto sobra no fim do mês." href="/despesas/nova" cta="Adicionar despesa" /> :
      <Card>{rows.map((d) => (
        <div key={d.id} className="border-t border-borda py-4 first:border-0">
          <div className="flex items-start justify-between gap-3"><div><b>{d.descricao}</b><br /><span className="text-texto-2">{d.properties?.nome} · {nomeCategoria(d.categoria)} · {fmtData(d.data)}</span></div><b className="text-lg tabular-nums">{fmtCentavos(d.valor_centavos)}</b></div>
          <details className="mt-2"><summary className="inline-flex min-h-11 cursor-pointer items-center rounded-xl px-3 font-bold underline">Excluir</summary>
            <form action={excluirDespesa} className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-[#F8E3E0] p-3"><span className="font-bold">Tem certeza? Isso não pode ser desfeito.</span><input type="hidden" name="id" value={d.id} />
              <button className="min-h-11 rounded-xl bg-erro-texto px-4 font-bold text-white">Sim, excluir</button></form></details>
        </div>))}</Card>}
  </>);
}

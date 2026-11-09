import { nomeCategoria } from "@/lib/constants";
import { fmtData } from "@/lib/dates";
import { carregarMes, mesValido } from "@/lib/financeiro";
import { createClient } from "@/lib/supabase/server";

const cel = (v: string) => `"${v.replace(/"/g, '""')}"`;
const reais = (c: number) => (c / 100).toFixed(2).replace(".", ",");

export async function GET(req: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new Response("Não autorizado", { status: 401 });
  const ym = mesValido(new URL(req.url).searchParams.get("mes") ?? undefined);
  const r = await carregarMes(sb, ym);
  const linhas = [["Tipo", "Data", "Imóvel", "Descrição", "Valor (R$)"]];
  for (const p of r.pagamentos) linhas.push(["Recebido", fmtData(p.pago_em), p.rent_charges?.leases?.properties?.nome ?? "", p.rent_charges?.leases?.tenants?.nome ?? "", reais(p.valor_centavos)]);
  for (const d of r.despesas) linhas.push(["Despesa", fmtData(d.data), d.properties?.nome ?? "", `${nomeCategoria(d.categoria)}: ${d.descricao}`, `-${reais(d.valor_centavos)}`]);
  linhas.push(["Resultado", "", "", "", reais(r.liquido)]);
  const csv = "\uFEFF" + linhas.map((l) => l.map(cel).join(";")).join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="meu-aluguel-${ym}.csv"` } });
}

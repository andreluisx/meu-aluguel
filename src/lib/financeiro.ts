import type { createClient } from "@/lib/supabase/server";
import { fimMes, hojeBR } from "./dates";

type SB = Awaited<ReturnType<typeof createClient>>;
export type Pg = { valor_centavos: number; pago_em: string; forma: string; rent_charges: { competencia: string; leases: { property_id: string; properties: { nome: string } | null; tenants: { nome: string } | null } | null } | null };
export type Dp = { id: string; categoria: string; descricao: string; valor_centavos: number; data: string; property_id: string; properties: { nome: string } | null };

export const mesValido = (m?: string) => (/^\d{4}-(0[1-9]|1[0-2])$/.test(m ?? "") ? (m as string) : hojeBR().slice(0, 7));
export const addMes = (ym: string, d: number) => { const [y, m] = ym.split("-").map(Number); return new Date(Date.UTC(y, m - 1 + d, 1)).toISOString().slice(0, 7); };

export async function carregarMes(sb: SB, ym: string) {
  const ini = `${ym}-01`, fim = fimMes(ini);
  const [a, b] = await Promise.all([
    sb.from("payments").select("valor_centavos,pago_em,forma,rent_charges(competencia,leases(property_id,properties(nome),tenants(nome)))").gte("pago_em", ini).lte("pago_em", fim).order("pago_em"),
    sb.from("expenses").select("id,categoria,descricao,valor_centavos,data,property_id,properties(nome)").gte("data", ini).lte("data", fim).order("data"),
  ]);
  const pagamentos = (a.data ?? []) as unknown as Pg[], despesas = (b.data ?? []) as unknown as Dp[];
  const mapa = new Map<string, { nome: string; rec: number; desp: number }>();
  const item = (id: string, nome?: string) => { if (!mapa.has(id)) mapa.set(id, { nome: nome ?? "Imóvel", rec: 0, desp: 0 }); return mapa.get(id)!; };
  for (const p of pagamentos) { const l = p.rent_charges?.leases; if (l) item(l.property_id, l.properties?.nome).rec += p.valor_centavos; }
  for (const d of despesas) item(d.property_id, d.properties?.nome).desp += d.valor_centavos;
  const rec = pagamentos.reduce((s, p) => s + p.valor_centavos, 0), desp = despesas.reduce((s, d) => s + d.valor_centavos, 0);
  return { pagamentos, despesas, rec, desp, liquido: rec - desp, porImovel: [...mapa.values()].sort((x, y) => x.nome.localeCompare(y.nome)) };
}

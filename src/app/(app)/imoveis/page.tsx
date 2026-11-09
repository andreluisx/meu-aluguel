import type { Metadata } from "next";
import { Miniatura } from "@/components/app/Avatar";
import { EmptyState, LinkRow, PageHeader } from "@/components/app/ui";
import { urlsAssinadas } from "@/lib/fotos";
import { fmtCentavos } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Imóveis" };
type Row = { id: string; nome: string; tipo: string; cidade: string | null; valor_aluguel_centavos: number; leases: { status: string; tenants: { nome: string } | null }[] };
export default async function Page() {
  const sb = await createClient();
  const { data } = await sb.from("properties").select("id,nome,tipo,cidade,valor_aluguel_centavos,leases(status,tenants(nome))").order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as Row[];
  const { data: fs } = rows.length ? await sb.from("documents").select("property_id,caminho").eq("tipo", "foto").in("property_id", rows.map((r) => r.id)).order("created_at") : { data: [] };
  const primeira = new Map<string, string>();
  for (const f of (fs ?? []) as { property_id: string; caminho: string }[]) if (!primeira.has(f.property_id)) primeira.set(f.property_id, f.caminho);
  const urls = await urlsAssinadas(sb, [...primeira.values()]);
  return (<>
    <PageHeader titulo="Meus imóveis" href="/imoveis/novo" cta="Adicionar imóvel" />
    {!rows.length ? <EmptyState titulo="Nenhum imóvel ainda" texto="Adicione o primeiro para começar a organizar seus aluguéis." href="/imoveis/novo" cta="Adicionar meu primeiro imóvel" /> :
      <div className="grid gap-3 md:grid-cols-2">{rows.map((r) => { const l = r.leases.find((x) => x.status === "ativo"); return (
        <LinkRow key={r.id} href={`/imoveis/${r.id}`}><div className="flex gap-4">
          <Miniatura url={urls.get(primeira.get(r.id) ?? "")} nome={r.nome} />
          <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><b className="block truncate text-lg">{r.nome}</b><p className="text-texto-2">{r.tipo}{r.cidade ? ` · ${r.cidade}` : ""}</p></div>
            <span className={`flex-none rounded-full px-3 py-0.5 text-[.9rem] font-bold ${l ? "bg-verde-suave text-[#27623F]" : "bg-[#ECE9DC]"}`}>{l ? "Alugado" : "Disponível"}</span></div>
            <p className="mt-1 text-xl font-extrabold tabular-nums">{fmtCentavos(r.valor_aluguel_centavos)}</p>{l?.tenants && <p className="truncate text-texto-2">Inquilino: {l.tenants.nome}</p>}</div></div></LinkRow>); })}</div>}
  </>);
}

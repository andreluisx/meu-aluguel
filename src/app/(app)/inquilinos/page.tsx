import type { Metadata } from "next";
import { Avatar } from "@/components/app/Avatar";
import { EmptyState, LinkRow, PageHeader } from "@/components/app/ui";
import { urlsAssinadas } from "@/lib/fotos";
import { masks } from "@/lib/masks";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Inquilinos" };
type R = { id: string; nome: string; whatsapp: string | null; telefone: string | null; email: string | null; foto_caminho: string | null };
export default async function Page() {
  const sb = await createClient();
  const { data } = await sb.from("tenants").select("id,nome,whatsapp,telefone,email,foto_caminho").order("nome");
  const rows = (data ?? []) as R[]; const urls = await urlsAssinadas(sb, rows.map((r) => r.foto_caminho));
  return (<>
    <PageHeader titulo="Inquilinos" href="/inquilinos/novo" cta="Adicionar inquilino" />
    {!rows.length ? <EmptyState titulo="Nenhum inquilino ainda" texto="Cadastre quem mora nos seus imóveis para criar os contratos." href="/inquilinos/novo" cta="Adicionar inquilino" /> :
      <div className="grid gap-3 md:grid-cols-2">{rows.map((r) => { const f = r.whatsapp ?? r.telefone; return (
        <LinkRow key={r.id} href={`/inquilinos/${r.id}/editar`}><div className="flex items-center gap-4"><Avatar url={urls.get(r.foto_caminho ?? "")} nome={r.nome} />
          <div className="min-w-0"><b className="block truncate text-lg">{r.nome}</b><p className="truncate text-texto-2">{f ? masks.telefone(f) : r.email ?? "Sem contato cadastrado"}</p></div></div></LinkRow>); })}</div>}
  </>);
}

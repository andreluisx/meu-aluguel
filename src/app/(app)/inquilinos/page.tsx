import type { Metadata } from "next";
import { Pencil } from "lucide-react";
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
    <PageHeader icone="inquilinos" titulo="Inquilinos" href="/inquilinos/novo" cta="Adicionar inquilino" />
    {!rows.length ? <EmptyState titulo="Nenhum inquilino ainda" texto="Cadastre quem mora nos seus imóveis para criar os contratos." href="/inquilinos/novo" cta="Adicionar inquilino" /> :
      <div className="grid gap-3 md:grid-cols-2">{rows.map((r) => { const f = r.whatsapp ?? r.telefone; return (
        <LinkRow key={r.id} href={`/inquilinos/${r.id}/editar`}>
          <div className="flex min-w-0 items-center gap-3 sm:gap-4"><Avatar url={urls.get(r.foto_caminho ?? "")} nome={r.nome} />
            <div className="min-w-0 flex-1"><b className="block break-words text-lg leading-tight">{r.nome}</b><p className="break-words text-texto-2">{f ? masks.telefone(f) : r.email ?? "Sem contato cadastrado"}</p></div>
            <span className="inline-flex flex-none items-center gap-1.5 rounded-xl border-2 border-verde-2 px-3 py-2 text-[.95rem] font-bold"><Pencil size={16} aria-hidden />Editar</span></div>
        </LinkRow>); })}</div>}
  </>);
}

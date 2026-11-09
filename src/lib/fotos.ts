import type { createClient } from "@/lib/supabase/server";

type SB = Awaited<ReturnType<typeof createClient>>;
// Links temporários (1 h) para exibir miniaturas. O espaço de arquivos continua privado.
export async function urlsAssinadas(sb: SB, paths: (string | null | undefined)[]) {
  const mapa = new Map<string, string>(); const ps = [...new Set(paths.filter((p): p is string => !!p))];
  if (!ps.length) return mapa;
  const { data } = await sb.storage.from("documentos").createSignedUrls(ps, 3600);
  (data ?? []).forEach((d) => { if (d.path && d.signedUrl) mapa.set(d.path, d.signedUrl); });
  return mapa;
}

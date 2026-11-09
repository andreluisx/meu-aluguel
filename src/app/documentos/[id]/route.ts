import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Abre um documento por link temporário (60 s). O banco (RLS) decide quem pode ver; nada é público.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/entrar", req.url));
  const { data: d } = await sb.from("documents").select("caminho").eq("id", id).maybeSingle();
  if (!d) return new Response("Documento não encontrado.", { status: 404 });
  const { data, error } = await sb.storage.from("documentos").createSignedUrl(d.caminho, 60);
  if (error || !data) return new Response("Não foi possível abrir o documento agora.", { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Recebe o link do e-mail (confirmação de cadastro ou recuperação de senha) e troca o código por uma sessão.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/primeiros-passos";
  const destino = next.startsWith("/") && !next.startsWith("//") ? next : "/primeiros-passos";
  if (code) {
    const sb = await createClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  }
  return NextResponse.redirect(`${origin}/entrar`);
}

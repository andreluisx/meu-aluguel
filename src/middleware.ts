import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";

const PRIVADAS = /^\/(painel|imoveis|inquilinos|contratos|alugueis|documentos|financeiro|despesas|mais|primeiros-passos|nova-senha|inquilino)(\/|$)/;

export async function middleware(req: NextRequest) {
  if (!supabaseConfigured) return NextResponse.next();
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await sb.auth.getUser();
  const path = req.nextUrl.pathname;
  if (!user && PRIVADAS.test(path)) { const u = req.nextUrl.clone(); u.pathname = "/entrar"; return NextResponse.redirect(u); }
  if (user && (path === "/entrar" || path === "/cadastro")) { const u = req.nextUrl.clone(); u.pathname = "/painel"; return NextResponse.redirect(u); }
  return res;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|ico|webp)$).*)"] };

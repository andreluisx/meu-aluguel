import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { AuthShell } from "@/components/auth/AuthShell";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!supabaseConfigured) return <AuthShell><h1 className="mb-3 text-3xl font-extrabold">Conecte o Supabase</h1><p className="text-texto-2">Preencha as variáveis do arquivo .env.example para usar o painel.</p></AuthShell>;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: perfil } = await sb.from("profiles").select("nome,role").eq("id", user.id).single();
  if (perfil?.role === "tenant") redirect("/inquilino");
  return <AppShell nome={perfil?.nome ?? ""}>{children}</AppShell>;
}

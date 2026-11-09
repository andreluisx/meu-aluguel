import { createBrowserClient } from "@supabase/ssr";
import type { AuthProvider } from "./types";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";

export { supabaseConfigured };
const client = () => createBrowserClient(SUPABASE_URL!, SUPABASE_KEY!);
const falha = { ok: false as const, message: "Não conseguimos concluir agora. Tente novamente em instantes." };

export const supabaseAuth: AuthProvider = {
  mode: "supabase",
  async signUp({ nome, email, senha }) {
    try {
      const { data, error } = await client().auth.signUp({ email, password: senha, options: { data: { nome }, emailRedirectTo: `${location.origin}/auth/callback?next=/primeiros-passos` } });
      if (error) return { ok: false, message: error.message.toLowerCase().includes("registered") ? "Este e-mail já tem cadastro. Tente entrar." : falha.message };
      return { ok: true, confirmarEmail: !data.session };
    } catch { return falha; }
  },
  async signIn({ email, senha }) {
    try {
      const { error } = await client().auth.signInWithPassword({ email, password: senha });
      return error ? { ok: false, message: "E-mail ou senha incorretos." } : { ok: true };
    } catch { return falha; }
  },
  async resetPassword(email) {
    try { await client().auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=/nova-senha` }); return { ok: true }; } catch { return falha; }
  },
  async sendMagicLink(email) {
    try {
      // shouldCreateUser:false => só entra quem já teve o acesso liberado pelo proprietário.
      const { error } = await client().auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${location.origin}/auth/callback?next=/inquilino` } });
      if (!error) return { ok: true };
      console.warn("[link-de-acesso]", error.status, error.code, error.message); // ajuda a descobrir o motivo real
      const t = `${error.code ?? ""} ${error.message}`.toLowerCase();
      if (error.status === 429 || t.includes("rate limit") || t.includes("rate_limit") || t.includes("seconds")) return { ok: false, message: "Muitos pedidos de link em pouco tempo. Aguarde alguns minutos e tente de novo." };
      if (t.includes("not authorized") || t.includes("smtp") || t.includes("sending") || (error.status ?? 0) >= 500) return { ok: false, message: "Não conseguimos enviar o e-mail agora. Avise o seu proprietário." };
      return { ok: true }; // e-mail sem acesso liberado: não revela se existe
    } catch { return falha; }
  },
};

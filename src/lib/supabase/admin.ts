import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

// Cliente com poderes totais (ignora RLS). Usar SOMENTE em código de servidor (server actions / rotas).
export function createAdminClient() {
  return createClient(SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
}

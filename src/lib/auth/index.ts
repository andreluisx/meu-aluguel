import { demoAuth } from "./demo";
import { supabaseAuth, supabaseConfigured } from "./supabase";
import type { AuthProvider } from "./types";
export type { AuthResult } from "./types";
// Único ponto que decide qual provedor usar. Componentes nunca checam credenciais.
export const getAuth = (): AuthProvider => (supabaseConfigured ? supabaseAuth : demoAuth);
export const isDemo = !supabaseConfigured;

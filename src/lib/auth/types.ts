export type AuthResult = { ok: true; confirmarEmail?: boolean } | { ok: false; message: string };
export interface AuthProvider {
  mode: "demo" | "supabase";
  signUp(i: { nome: string; email: string; senha: string }): Promise<AuthResult>;
  signIn(i: { email: string; senha: string }): Promise<AuthResult>;
  resetPassword(email: string): Promise<AuthResult>;
  sendMagicLink(email: string): Promise<AuthResult>;
}

import type { AuthProvider } from "./types";
// MODO DEMONSTRAÇÃO: não cria conta real e não guarda senha. Só permite navegar pelo fluxo.
export const demoAuth: AuthProvider = {
  mode: "demo",
  async signUp() { return { ok: true }; },
  async signIn() { return { ok: true }; },
  async resetPassword() { return { ok: true }; },
  async sendMagicLink() { return { ok: true }; },
};

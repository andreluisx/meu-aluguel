"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import { senhaAceita } from "@/lib/password";
import { PasswordField } from "@/components/ui/Field";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { Button } from "@/components/ui/Button";

export function NewPasswordForm() {
  const router = useRouter();
  const [senha, setSenha] = useState(""); const [erro, setErro] = useState(""); const [busy, setBusy] = useState(false);
  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setErro("");
    if (!senhaAceita(senha)) return setErro("Use pelo menos 8 caracteres, com letras e números.");
    setBusy(true);
    const { error } = await createBrowserClient(SUPABASE_URL!, SUPABASE_KEY!).auth.updateUser({ password: senha });
    setBusy(false);
    if (error) return setErro("Não conseguimos trocar a senha. Peça um novo link de recuperação.");
    router.push("/painel");
  }
  return (<>
    <h1 className="mb-2 text-3xl font-extrabold">Crie sua nova senha</h1>
    <p className="mb-6 text-texto-2">Escolha uma senha que você consiga lembrar.</p>
    <form onSubmit={onSubmit} noValidate>
      <PasswordField label="Nova senha" name="senha" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} error={erro} />
      <PasswordStrength senha={senha} />
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Salvando…" : "Salvar nova senha"}</Button>
    </form>
  </>);
}

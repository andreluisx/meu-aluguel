"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { cadastroSchema, firstErrors } from "@/lib/validation";
import { Field, PasswordField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PasswordStrength } from "@/components/ui/PasswordStrength";

export function SignupForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [senha, setSenha] = useState(""); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [confirmar, setConfirmar] = useState(false);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg("");
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const d = { nome: f.nome, email: f.email, senha: f.senha, aceite: f.aceite === "on" };
    const errs = firstErrors(cadastroSchema, d); setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const r = await getAuth().signUp({ nome: d.nome.trim(), email: d.email.trim(), senha: d.senha });
    setBusy(false);
    if (!r.ok) return setMsg(r.message);
    if (r.confirmarEmail) setConfirmar(true); else router.push("/primeiros-passos");
  }
  if (confirmar) return (<><h1 className="mb-3 text-3xl font-extrabold">Confira seu e-mail</h1><p className="rounded-xl bg-verde-suave p-4 font-bold">Enviamos um link para confirmar seu cadastro. Depois de confirmar, é só entrar.</p></>);
  return (<>
    <h1 className="mb-2 text-3xl font-extrabold">Vamos começar?</h1>
    <p className="mb-6 text-texto-2">Crie sua conta em menos de um minuto.</p>
    <form onSubmit={onSubmit} noValidate>
      <Field label="Seu nome" name="nome" autoComplete="name" error={errors.nome} />
      <Field label="E-mail" name="email" type="email" autoComplete="email" error={errors.email} />
      <PasswordField label="Crie uma senha" name="senha" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} error={errors.senha} />
      <PasswordStrength senha={senha} />
      <div className="mb-5">
        <label className="flex items-start gap-3"><input type="checkbox" name="aceite" className="mt-0.5 size-7 flex-none accent-verde-2" /><span>Li e aceito os <Link href="/termos" className="font-bold underline">Termos de uso</Link> e a <Link href="/privacidade" className="font-bold underline">Política de privacidade</Link>.</span></label>
        {errors.aceite && <p role="alert" className="mt-1.5 font-bold text-erro-texto">{errors.aceite}</p>}
      </div>
      {msg && <p role="alert" className="mb-4 rounded-xl bg-[#F8E3E0] p-3 font-bold text-erro-texto">{msg}</p>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Criando…" : "Criar minha conta"}</Button>
    </form>
    <p className="mt-5">Já tem conta? <Link href="/entrar" className="font-bold underline">Entrar</Link></p>
  </>);
}

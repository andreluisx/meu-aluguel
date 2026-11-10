"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { firstErrors, loginSchema } from "@/lib/validation";
import { Field, PasswordField } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg("");
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const errs = firstErrors(loginSchema, d); setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const r = await getAuth().signIn({ email: d.email.trim(), senha: d.senha });
    setBusy(false);
    if (r.ok) router.push("/painel"); else setMsg(r.message);
  }
  return (<>
    <h1 className="mb-2 text-3xl font-extrabold">Que bom ver você de novo</h1>
    <p className="mb-6 text-texto-2">Entre para ver seus aluguéis.</p>
    <form onSubmit={onSubmit} noValidate>
      <Field label="E-mail" name="email" type="email" autoComplete="email" error={errors.email} />
      <PasswordField label="Senha" name="senha" autoComplete="current-password" error={errors.senha} />
      <p className="mb-4"><Link href="/recuperar-senha" className="font-bold underline">Esqueci minha senha</Link></p>
      {msg && <p role="alert" className="mb-4 rounded-xl bg-[#F8E3E0] p-3 font-bold text-erro-texto">{msg}</p>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Entrando…" : "Entrar"}</Button>
    </form>
    <ButtonLink href="/cadastro" variant="outline" className="mt-3 w-full">Criar minha conta</ButtonLink>
  <p className="mt-6">É inquilino? <Link href="/entrar-inquilino" className="font-bold underline">Entre por aqui</Link></p>
  </>);
}

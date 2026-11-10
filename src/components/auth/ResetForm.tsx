"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { getAuth } from "@/lib/auth";
import { firstErrors, recuperarSchema } from "@/lib/validation";
import { Field } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";

export function ResetForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false); const [msg, setMsg] = useState("");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const errs = firstErrors(recuperarSchema, d); setErrors(errs);
    if (Object.keys(errs).length) return;
    const r = await getAuth().resetPassword(d.email.trim());
    if (r.ok) setDone(true); else setMsg(r.message);
  }
  if (done) return (<><h1 className="mb-3 text-3xl font-extrabold">Confira seu e-mail</h1><p className="mb-5 rounded-xl bg-verde-suave p-4 font-bold">Se esse e-mail tiver cadastro, você receberá um link em instantes.</p><ButtonLink href="/entrar" className="w-full">Voltar para o início</ButtonLink></>);
  return (<>
    <h1 className="mb-2 text-3xl font-extrabold">Vamos recuperar sua senha</h1>
    <p className="mb-6 text-texto-2">Digite seu e-mail e enviaremos um link para criar uma nova senha.</p>
    <form onSubmit={onSubmit} noValidate>
      <Field label="E-mail" name="email" type="email" autoComplete="email" error={errors.email} />
      {msg && <p role="alert" className="mb-4 font-bold text-erro-texto">{msg}</p>}
      <Button type="submit" className="w-full">Enviar link</Button>
    </form>
    <ButtonLink href="/entrar" variant="ghost" className="mt-2 w-full">Voltar</ButtonLink>
  </>);
}

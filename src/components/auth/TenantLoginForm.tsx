"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { firstErrors, recuperarSchema } from "@/lib/validation";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function TenantLoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState(""); const [done, setDone] = useState(false);
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [espera, setEspera] = useState(0);
  useEffect(() => { if (espera <= 0) return; const t = setTimeout(() => setEspera(espera - 1), 1000); return () => clearTimeout(t); }, [espera]);
  async function enviar(e: string) {
    setBusy(true); setMsg(""); const r = await getAuth().sendMagicLink(e); setBusy(false);
    if (r.ok) { setDone(true); setEspera(60); } else setMsg(r.message);
  }
  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(ev.currentTarget)) as Record<string, string>;
    const errs = firstErrors(recuperarSchema, d); setErrors(errs);
    if (Object.keys(errs).length) return;
    setEmail(d.email.trim()); void enviar(d.email.trim());
  }
  if (done) return (<><h1 className="mb-3 text-3xl font-extrabold">Confira seu e-mail</h1>
    <p className="mb-4 rounded-xl bg-verde-suave p-4 font-bold">Se esse e-mail tiver acesso liberado, você receberá um link para entrar. Não precisa de senha. Olhe também a caixa de spam.</p>
    {msg && <p role="alert" className="mb-3 font-bold text-erro-texto">! {msg}</p>}
    <Button type="button" variant="outline" disabled={busy || espera > 0} onClick={() => enviar(email)} className="w-full">{espera > 0 ? `Pedir de novo em ${espera}s` : busy ? "Enviando…" : "Não chegou? Pedir de novo"}</Button></>);
  return (<>
    <h1 className="mb-2 text-3xl font-extrabold">Acesso do inquilino</h1>
    <p className="mb-6 text-texto-2">Digite o e-mail que seu proprietário cadastrou. Enviaremos um link para você entrar, sem senha.</p>
    <form onSubmit={onSubmit} noValidate>
      <Field label="Seu e-mail" name="email" type="email" autoComplete="email" error={errors.email} />
      {msg && <p role="alert" className="mb-4 font-bold text-erro-texto">! {msg}</p>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Enviando…" : "Enviar link de acesso"}</Button>
    </form>
    <p className="mt-6">É proprietário? <Link href="/entrar" className="font-bold underline">Entre por aqui</Link></p>
  </>);
}

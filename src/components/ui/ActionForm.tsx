"use client";
import { useActionState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./Button";
import { FormCtx } from "./Field";

export type FormState = { error?: string; ok?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> } | undefined;

function Submit({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} className="w-full sm:w-auto">{pending ? "Salvando…" : children}</Button>;
}
export function ActionForm({ action, submit, children }: { action: (s: FormState, f: FormData) => Promise<FormState>; submit: string; children: ReactNode }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} noValidate>
      {state?.error && <p role="alert" className="mb-4 rounded-xl bg-[#F8E3E0] p-3 font-bold text-erro-texto">{state.error}</p>}
      {state?.ok && <p role="status" className="mb-4 rounded-xl bg-verde-suave p-3 font-bold text-[#27623F]">✓ {state.ok}</p>}
      <FormCtx.Provider value={{ errors: state?.fieldErrors ?? {}, values: state?.values ?? {} }}>{children}</FormCtx.Provider>
      <Submit>{submit}</Submit>
    </form>
  );
}

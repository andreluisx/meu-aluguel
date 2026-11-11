"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Icone } from "@/components/ui/Icone";

function Confirmar({ children }: { children: string }) {
  const { pending } = useFormStatus(); const t = pending ? "Aguarde…" : children;
  return <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-erro-texto px-5 font-bold text-white disabled:opacity-60"><Icone texto={t} />{t}</button>;
}

// Ação perigosa sempre em dois passos: o botão abre um aviso e só depois confirma. Tem "Cancelar" para desistir.
export function ConfirmAction({ action, id, rotulo, aviso, confirmar }: { action: (fd: FormData) => Promise<void>; id: string; rotulo: string; aviso: string; confirmar: string }) {
  const [aberto, setAberto] = useState(false);
  if (!aberto) return <button type="button" onClick={() => setAberto(true)} aria-expanded={false} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-erro-texto px-4 font-bold text-erro-texto"><Icone texto={rotulo} />{rotulo}</button>;
  return (
    <form action={action} role="alertdialog" aria-label={rotulo} className="w-full rounded-xl bg-[#F8E3E0] p-4">
      <p className="mb-3 font-bold">{aviso}</p><input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap gap-2">
        <Confirmar>{confirmar}</Confirmar>
        <button type="button" onClick={() => setAberto(false)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-texto px-5 font-bold"><X size={18} aria-hidden />Cancelar</button>
      </div>
    </form>
  );
}

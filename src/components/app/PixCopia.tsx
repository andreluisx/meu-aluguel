"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// Botão grande "Copiar código Pix" + QR Code opcional. Funciona também em endereço sem https (cópia alternativa).
export function PixCopia({ codigo }: { codigo: string }) {
  const [ok, setOk] = useState(false);
  async function copiar() {
    try { await navigator.clipboard.writeText(codigo); }
    catch { const t = document.createElement("textarea"); t.value = codigo; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
    setOk(true); setTimeout(() => setOk(false), 3500);
  }
  return (
    <div>
      <button type="button" onClick={copiar} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[14px] border-2 border-verde bg-verde px-5 text-[1.05rem] font-bold text-white">
        {ok ? <Check size={22} aria-hidden /> : <Copy size={22} aria-hidden />}{ok ? "Código copiado!" : "Copiar código Pix"}
      </button>
      <p role="status" className="sr-only">{ok ? "Código copiado" : ""}</p>
      <p className="mt-2 select-all break-all rounded-xl bg-fundo p-3 text-[.8rem] text-texto-2">{codigo}</p>
      <details className="mt-2"><summary className="inline-flex min-h-11 cursor-pointer items-center font-bold underline">Prefere o QR Code?</summary>
        <div className="mt-2 grid place-items-center rounded-xl bg-white p-4"><QRCodeSVG value={codigo} size={208} /></div></details>
    </div>
  );
}

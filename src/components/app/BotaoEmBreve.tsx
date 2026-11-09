"use client";
import { useState } from "react";
import { Copy, Download, MessageCircle, QrCode, Upload } from "lucide-react";

const ICONES = { pix: QrCode, copiar: Copy, comprovante: Upload, recibo: Download, falar: MessageCircle } as const;

// Botão "reservado" para recursos futuros (pagamento online). NÃO executa nada: só explica que ainda não existe.
// Quando o pagamento automático existir, a página troca este botão pelo real.
export function BotaoEmBreve({ rotulo, icone, destaque, aviso }: { rotulo: string; icone: keyof typeof ICONES; destaque?: boolean; aviso: string }) {
  const [aberto, setAberto] = useState(false); const I = ICONES[icone];
  return (
    <div className="w-full sm:w-auto">
      <button type="button" onClick={() => setAberto(!aberto)} aria-expanded={aberto}
        className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-[14px] border-2 px-5 text-[1.05rem] font-bold ${destaque ? "border-verde bg-verde text-white" : "border-verde-2 bg-white text-texto"}`}>
        <I size={22} aria-hidden />{rotulo}<span className="ml-1 rounded-full bg-dourado px-2 py-0.5 text-xs font-extrabold text-[#2B2308]">Em breve</span>
      </button>
      {aberto && <p role="status" className="mt-2 rounded-xl bg-fundo p-3 text-[.95rem]">{aviso}</p>}
    </div>
  );
}

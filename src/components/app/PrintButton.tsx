"use client";
import { Printer } from "lucide-react";
export function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-verde px-5 font-bold text-white print:hidden"><Printer size={20} aria-hidden />Imprimir ou salvar em PDF</button>;
}

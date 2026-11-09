"use client";
export function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="min-h-12 rounded-xl bg-verde px-5 font-bold text-white print:hidden">Imprimir ou salvar em PDF</button>;
}

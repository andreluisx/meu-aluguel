import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mesRef } from "@/lib/dates";
import { addMes } from "@/lib/financeiro";

// Escolha de mês numa linha só: setas grandes nas pontas e o mês no meio (ocupa pouco espaço).
export function MesNav({ ym, href, className = "" }: { ym: string; href: (m: string) => string; className?: string }) {
  const b = "grid size-12 flex-none place-items-center rounded-xl text-verde hover:bg-verde-suave";
  return (
    <nav aria-label="Escolher mês" className={`mb-4 flex items-center justify-between gap-1 rounded-2xl border border-borda bg-white p-1.5 ${className}`}>
      <Link href={href(addMes(ym, -1))} aria-label="Mês anterior" className={b}><ChevronLeft size={26} aria-hidden /></Link>
      <b className="min-w-0 flex-1 truncate text-center text-lg">{mesRef(`${ym}-01`)}</b>
      <Link href={href(addMes(ym, 1))} aria-label="Próximo mês" className={b}><ChevronRight size={26} aria-hidden /></Link>
    </nav>
  );
}

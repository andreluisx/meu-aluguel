import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import type { Situacao } from "@/lib/charges";

export function PageHeader({ titulo, sub, href, cta }: { titulo: string; sub?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-[1.9rem] font-extrabold leading-tight">{titulo}</h1>{sub && <p className="text-texto-2">{sub}</p>}</div>
      {href && cta && <ButtonLink href={href}>{cta}</ButtonLink>}
    </div>
  );
}
export function EmptyState({ titulo, texto, href, cta }: { titulo: string; texto: string; href: string; cta: string }) {
  return (
    <div className="rounded-[18px] border border-borda bg-white p-8 text-center">
      <h2 className="mb-2 text-2xl font-extrabold">{titulo}</h2><p className="mx-auto mb-5 max-w-[44ch] text-texto-2">{texto}</p>
      <ButtonLink href={href}>{cta}</ButtonLink>
    </div>
  );
}
export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => <div className={`rounded-[18px] border border-borda bg-white p-5 shadow-sm ${className}`}>{children}</div>;
export function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "err" }) {
  return <Card><p className="text-[.95rem] font-semibold leading-tight text-texto-2">{label}</p><p className={`mt-1 text-[1.6rem] font-extrabold leading-tight tabular-nums ${tone === "ok" ? "text-[#27623F]" : tone === "err" ? "text-erro-texto" : ""}`}>{value}</p></Card>;
}
const badges: Record<Situacao, [string, string]> = {
  pago: ["✓ Pago", "bg-verde-suave text-[#27623F]"], aguardando: ["◔ Aguardando", "bg-[#ECE9DC] text-texto"], atrasado: ["! Atrasado", "bg-[#F8E3E0] text-[#9C3A31]"],
  parcial: ["◐ Parcial", "bg-[#FCEFD0] text-[#7A5410]"], cancelado: ["✕ Cancelado", "bg-[#ECE9DC] text-texto-2"],
};
export function StatusBadge({ s }: { s: Situacao }) { const [t, c] = badges[s]; return <span className={`whitespace-nowrap rounded-full px-3 py-0.5 text-[.9rem] font-bold ${c}`}>{t}</span>; }
export const LinkRow = ({ href, children }: { href: string; children: ReactNode }) => <Link href={href} className="block rounded-[18px] border border-borda bg-white p-5 shadow-sm hover:border-verde-2">{children}</Link>;

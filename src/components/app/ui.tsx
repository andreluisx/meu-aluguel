import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Clock, PieChart, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import type { Situacao } from "@/lib/charges";

export function PageHeader({ titulo, sub, href, cta, icone: I }: { titulo: string; sub?: string; href?: string; cta?: string; icone?: LucideIcon }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {I && <span className="grid size-12 flex-none place-items-center rounded-2xl bg-verde text-white" aria-hidden><I size={26} /></span>}
        <div><h1 className="text-[1.9rem] font-extrabold leading-tight">{titulo}</h1>{sub && <p className="text-texto-2">{sub}</p>}</div>
      </div>
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

const TONS = {
  neutro: { box: "bg-white", ico: "bg-verde-suave text-verde", val: "" },
  ok: { box: "bg-[#EEF5EF]", ico: "bg-verde-claro/25 text-[#27623F]", val: "text-[#27623F]" },
  aviso: { box: "bg-[#FDF5E1]", ico: "bg-dourado/35 text-[#7A5410]", val: "text-[#7A5410]" },
  erro: { box: "bg-[#FBECEA]", ico: "bg-erro/20 text-erro-texto", val: "text-erro-texto" },
} as const;
export function Stat({ label, value, tone = "neutro", icone: I, sub }: { label: string; value: string; tone?: keyof typeof TONS | "err"; icone?: LucideIcon; sub?: string }) {
  const t = TONS[tone === "err" ? "erro" : tone];
  return (
    <div className={`rounded-[18px] border border-borda p-4 shadow-sm ${t.box}`}>
      {I && <span className={`mb-2 grid size-11 place-items-center rounded-xl ${t.ico}`} aria-hidden><I size={24} /></span>}
      <p className="text-[.95rem] font-semibold leading-tight text-texto-2">{label}</p>
      <p className={`mt-1 text-[1.6rem] font-extrabold leading-tight tabular-nums ${t.val}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[.9rem] font-semibold text-texto-2">{sub}</p>}
    </div>
  );
}
const badges: Record<Situacao, [string, string, LucideIcon]> = {
  pago: ["Pago", "bg-[#DCEBDD] text-[#1F5A38]", CheckCircle2], aguardando: ["Aguardando", "bg-[#ECE9DC] text-texto", Clock], atrasado: ["Atrasado", "bg-[#F8D9D5] text-[#8E2F27]", AlertTriangle],
  parcial: ["Parcial", "bg-[#FCEBC4] text-[#6B4A0C]", PieChart], cancelado: ["Cancelado", "bg-[#ECE9DC] text-texto-2", XCircle],
};
export function StatusBadge({ s }: { s: Situacao }) { const [t, c, I] = badges[s]; return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[.9rem] font-bold ${c}`}><I size={16} aria-hidden />{t}</span>; }
export const LinkRow = ({ href, children }: { href: string; children: ReactNode }) => <Link href={href} className="block rounded-[18px] border border-borda bg-white p-5 shadow-sm hover:border-verde-2">{children}</Link>;

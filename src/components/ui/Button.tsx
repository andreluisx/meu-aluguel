import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "gold" | "ghost";
const base = "inline-flex min-h-14 items-center justify-center rounded-[14px] border-2 px-7 text-[1.05rem] font-bold transition-colors disabled:opacity-60";
const styles: Record<Variant, string> = {
  primary: "border-transparent bg-verde text-white hover:bg-verde-2",
  outline: "border-verde-2 text-texto hover:bg-verde-suave",
  gold: "border-transparent bg-dourado text-[#2B2308] hover:brightness-95",
  ghost: "border-transparent text-texto underline",
};
export function ButtonLink({ href, variant = "primary", className = "", children }: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  return <Link href={href} className={`${base} ${styles[variant]} ${className}`}>{children}</Link>;
}
export function Button({ variant = "primary", className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...p} className={`${base} ${styles[variant]} ${className}`} />;
}

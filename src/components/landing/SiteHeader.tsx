import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

const links = [["Como funciona", "#como"], ["Funcionalidades", "#funcionalidades"], ["Planos", "#planos"], ["Perguntas frequentes", "#faq"]];
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-borda bg-fundo pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex min-h-[72px] max-w-[1100px] items-center justify-between gap-3 px-5">
        <Link href="/" aria-label="Meu Aluguel, início"><Logo variant="compact" /></Link>
        <nav aria-label="Principal" className="hidden gap-6 text-[.95rem] font-bold md:flex">{links.map(([t, h]) => <a key={h} href={h} className="hover:underline">{t}</a>)}</nav>
        <div className="hidden gap-2.5 md:flex"><ButtonLink href="/entrar" variant="outline" className="!min-h-11 !px-4 !text-[.95rem]">Entrar</ButtonLink><ButtonLink href="/cadastro" className="!min-h-11 !px-4 !text-[.95rem]">Começar agora</ButtonLink></div>
        <details className="relative md:hidden">
          <summary className="grid min-h-12 min-w-12 cursor-pointer list-none place-items-center rounded-xl border-2 border-verde-2 px-3.5 font-extrabold [&::-webkit-details-marker]:hidden">Menu</summary>
          <div className="absolute right-0 top-14 grid w-[min(300px,calc(100vw-40px))] gap-0.5 rounded-2xl border border-borda bg-white p-2.5 shadow-xl">
            {links.map(([t, h]) => <a key={h} href={h} className="rounded-[10px] p-3.5 font-bold">{t}</a>)}
            <ButtonLink href="/entrar" variant="outline" className="mt-1.5">Entrar</ButtonLink><ButtonLink href="/cadastro" className="mt-1.5">Começar agora</ButtonLink>
          </div>
        </details>
      </div>
    </header>
  );
}

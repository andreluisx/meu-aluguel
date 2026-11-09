import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { isDemo } from "@/lib/auth";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {isDemo && <p className="bg-dourado px-3 py-1.5 text-center text-sm font-bold text-[#2B2308]">Modo demonstração: nada é salvo nem enviado.</p>}
      <div className="grid min-h-screen lg:grid-cols-[5fr_6fr]">
        <aside className="hidden flex-col justify-center gap-7 bg-verde p-14 text-white lg:flex">
          <Logo variant="compact" tone="dark" />
          <h2 className="text-4xl font-extrabold leading-tight">Seus aluguéis organizados. Sua tranquilidade em dia.</h2>
          <ul className="list-disc space-y-3 pl-5 text-[#DCE8DF]"><li>Veja quem já pagou e quem está atrasado.</li><li>Cobranças prontas para o WhatsApp.</li><li>Imóveis, contratos e valores em um só lugar.</li></ul>
        </aside>
        <main className="flex justify-center px-5 pb-14 pt-6">
          <div className="w-full max-w-[460px]">
            <Link href="/" className="mb-7 inline-block lg:hidden" aria-label="Meu Aluguel, página inicial"><Logo variant="compact" /></Link>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

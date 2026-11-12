"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, FileText, Home, LogOut, MoreHorizontal, Receipt, Settings, Users, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { sair } from "@/app/actions";

const side = [["/painel", "Visão geral", Home], ["/imoveis", "Imóveis", Building2], ["/inquilinos", "Inquilinos", Users], ["/alugueis", "Aluguéis", Receipt], ["/contratos", "Contratos", FileText], ["/financeiro", "Financeiro", BarChart3], ["/despesas", "Despesas", Wallet], ["/configuracoes", "Configurações", Settings]] as const;
const tabs = [["/painel", "Início", Home], ["/imoveis", "Imóveis", Building2], ["/alugueis", "Aluguéis", Receipt], ["/financeiro", "Financeiro", BarChart3], ["/mais", "Mais", MoreHorizontal]] as const;

export function AppShell({ nome, children }: { nome: string; children: ReactNode }) {
  const path = usePathname(); const on = (h: string) => path === h || path.startsWith(h + "/");
  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr] print:block!">
      <aside className="hidden flex-col border-r border-borda bg-white p-5 md:flex md:sticky md:top-0 md:h-screen print:hidden!">
        <Link href="/painel" className="mb-8" aria-label="Meu Aluguel"><Logo variant="compact" /></Link>
        <nav aria-label="Principal" className="grid gap-1">{side.map(([h, t, I]) => (
          <Link key={h} href={h} aria-current={on(h) ? "page" : undefined} className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 font-bold ${on(h) ? "bg-verde text-white" : "hover:bg-verde-suave"}`}><I size={22} aria-hidden />{t}</Link>))}</nav>
        <div className="mt-auto border-t border-borda pt-4"><p className="mb-2 truncate font-semibold text-texto-2">{nome || "Minha conta"}</p>
          <form action={sair}><button className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 font-bold hover:bg-verde-suave"><LogOut size={22} aria-hidden />Sair</button></form></div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between print:hidden border-b border-borda bg-fundo px-5 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] md:hidden"><Logo variant="compact" className="!text-xl" /><span className="font-bold text-texto-2">{nome.split(" ")[0]}</span></header>
        <main className="mx-auto max-w-[980px] px-5 pb-32 pt-6 md:px-8 md:pb-12 md:pt-8">{children}</main>
      </div>
      <nav aria-label="Menu" className="print:hidden fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-borda bg-white px-2 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2 md:hidden">
        {tabs.map(([h, t, I]) => (
          <Link key={h} href={h} aria-current={on(h) ? "page" : undefined} className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[.8rem] font-bold ${on(h) ? "bg-verde-suave text-[#27623F]" : "text-texto-2"}`}><I size={24} aria-hidden />{t}</Link>))}
      </nav>
    </div>
  );
}

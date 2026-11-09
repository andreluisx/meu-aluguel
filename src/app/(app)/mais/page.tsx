import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { sair } from "@/app/actions";
import { LinkRow, PageHeader } from "@/components/app/ui";

export const metadata: Metadata = { title: "Mais" };
export default function Page() {
  return (<><PageHeader titulo="Mais opções" />
    <div className="grid gap-3"><LinkRow href="/inquilinos"><b className="text-lg">Inquilinos</b><p className="text-texto-2">Quem mora nos seus imóveis.</p></LinkRow>
      <LinkRow href="/contratos"><b className="text-lg">Contratos</b><p className="text-texto-2">Vencimentos e valores.</p></LinkRow>
      <LinkRow href="/despesas"><b className="text-lg">Despesas</b><p className="text-texto-2">Manutenção, impostos e contas dos imóveis.</p></LinkRow>
      <form action={sair}><button className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[14px] border-2 border-verde-2 font-bold"><LogOut size={22} aria-hidden />Sair da conta</button></form></div></>);
}

import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Clock, Receipt } from "lucide-react";
import { Icone } from "@/components/ui/Icone";
import { ChargeGroups } from "@/components/app/ChargeGroups";
import { MesNav } from "@/components/app/MesNav";
import { Card, EmptyState, PageHeader, Segmentado } from "@/components/app/ui";
import { CHARGE_SELECT, type ChargeRow, asCharges, situacao } from "@/lib/charges";
import { fimMes, hojeBR, inicioMes, mesRef } from "@/lib/dates";
import { mesValido } from "@/lib/financeiro";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Aluguéis" };
type SP = { aba?: string; mes?: string; f?: string };
const FILTROS = [["todos", "Todos"], ["pendentes", "Pendentes"], ["atrasados", "Atrasados"], ["pagos", "Pagos"]] as const;
const chip = (on: boolean) => `inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 px-4 font-bold ${on ? "border-verde bg-verde text-white" : "border-verde-2 bg-white"}`;
const ultimoPagamento = (c: ChargeRow) => c.payments.reduce((m, p) => (p.pago_em > m ? p.pago_em : m), "");
const TONS = { erro: "bg-[#F8E3E0] text-erro-texto", aviso: "bg-[#FCEFD0] text-[#7A5410]", ok: "bg-verde-suave text-[#27623F]" } as const;

function Secao({ titulo, lista, hoje, vazio, tom, icone: I }: { titulo: string; lista: ChargeRow[]; hoje: string; vazio?: string; tom: keyof typeof TONS; icone: LucideIcon }) {
  if (!lista.length && !vazio) return null;
  return (
<<<<<<< HEAD
    <section className="mb-10">
      <h2 className="mb-4 flex items-center gap-2.5 text-xl font-extrabold"><span className={`grid size-10 place-items-center rounded-xl ${TONS[tom]}`} aria-hidden><I size={22} /></span>{titulo} <span className="text-texto-2">({lista.length})</span></h2>
      {lista.length ? <ChargeGroups lista={lista} hoje={hoje} /> : <Card><p className="text-texto-2">{vazio}</p></Card>}
    </section>
=======
    <section className="mb-8"><h2 className={`mb-3 text-xl font-extrabold ${erro ? "text-erro-texto" : ""}`}>{erro ? "" : ""}{titulo} ({lista.length})</h2>
      <Card>{lista.length ? lista.map((c) => <ChargeItem key={c.id} c={c} hoje={hoje} acoes />) : <p className="text-texto-2">{vazio}</p>}</Card></section>
>>>>>>> a3e90305993a061480649c980e79da21c6f91e2b
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams; const sb = await createClient(); const hoje = hojeBR();
  await sb.rpc("generate_my_charges");
  const { count } = await sb.from("rent_charges").select("id", { count: "exact", head: true });
  const historico = sp.aba === "historico";
<<<<<<< HEAD
  const abas = <Segmentado itens={[{ href: "/alugueis", rotulo: "Este mês", ativo: !historico }, { href: "/alugueis?aba=historico", rotulo: "Histórico", ativo: historico }]} />;
=======
  const abas = (<div className="mb-5 flex flex-wrap gap-2"><Link href="/alugueis" className={chip(!historico)} aria-current={!historico ? "page" : undefined}>Este mês</Link><Link href="/alugueis?aba=historico" className={chip(historico)} aria-current={historico ? "page" : undefined}>Histórico</Link></div>);
>>>>>>> a3e90305993a061480649c980e79da21c6f91e2b
  if (!count) return (<><PageHeader icone={Receipt} titulo="Aluguéis" /><EmptyState titulo="Nenhum aluguel ainda" texto="Quando você criar um contrato, os aluguéis de cada mês aparecem aqui." href="/contratos/novo" cta="Criar contrato" /></>);

  if (!historico) {
    const ini = inicioMes(hoje), fim = fimMes(hoje); const abertos = ["aguardando", "parcial"];
    const [a, b, c, d] = await Promise.all([
      sb.from("rent_charges").select(CHARGE_SELECT).in("status", abertos).lt("vencimento", hoje).order("vencimento").limit(200),
      sb.from("rent_charges").select(CHARGE_SELECT).in("status", abertos).gte("vencimento", hoje).lte("vencimento", fim).order("vencimento"),
      sb.from("rent_charges").select(CHARGE_SELECT).eq("status", "pago").gte("vencimento", ini).lte("vencimento", fim),
      sb.from("payments").select("charge_id").gte("pago_em", ini).lte("pago_em", fim),
    ]);
    const ids = [...new Set(((d.data ?? []) as { charge_id: string }[]).map((x) => x.charge_id))];
    const e = ids.length ? await sb.from("rent_charges").select(CHARGE_SELECT).eq("status", "pago").in("id", ids) : { data: [] };
    const mapa = new Map<string, ChargeRow>(); [...asCharges(c.data), ...asCharges(e.data)].forEach((x) => mapa.set(x.id, x));
    const pagos = [...mapa.values()].sort((x, y) => ultimoPagamento(y).localeCompare(ultimoPagamento(x)));
    return (<><PageHeader icone={Receipt} titulo="Aluguéis" sub={`${mesRef(ini)} · registre os pagamentos e acompanhe quem está em dia.`} />{abas}
<<<<<<< HEAD
      <Secao titulo="Atrasados" tom="erro" icone={AlertTriangle} lista={asCharges(a.data)} hoje={hoje} />
      <Secao titulo="A vencer neste mês" tom="aviso" icone={Clock} lista={asCharges(b.data)} hoje={hoje} vazio="Nenhum aluguel a vencer neste mês." />
      <Secao titulo="Pagos neste mês" tom="ok" icone={CheckCircle2} lista={pagos} hoje={hoje} vazio="Nenhum pagamento recebido neste mês ainda." /></>);
=======
      <Secao titulo="Atrasados" lista={asCharges(a.data)} hoje={hoje} erro />
      <Secao titulo="A vencer neste mês" lista={asCharges(b.data)} hoje={hoje} vazio="Nenhum aluguel a vencer neste mês." />
      <Secao titulo="Pagos neste mês" lista={pagos} hoje={hoje} vazio="Nenhum pagamento recebido neste mês ainda." /></>);
>>>>>>> a3e90305993a061480649c980e79da21c6f91e2b
  }
  const ym = mesValido(sp.mes), f = sp.f ?? "todos";
  const { data } = await sb.from("rent_charges").select(CHARGE_SELECT).gte("vencimento", `${ym}-01`).lte("vencimento", fimMes(`${ym}-01`)).order("vencimento", { ascending: false });
  const lista = asCharges(data).filter((c) => { const s = situacao(c, hoje); return f === "pagos" ? s === "pago" : f === "atrasados" ? s === "atrasado" : f === "pendentes" ? ["aguardando", "parcial"].includes(s) : true; });
  const q = (m: string, ff: string) => `/alugueis?aba=historico&mes=${m}&f=${ff}`;
  return (<><PageHeader icone={Receipt} titulo="Aluguéis" sub="Consulte qualquer mês anterior." />{abas}
<<<<<<< HEAD
    <MesNav ym={ym} href={(m) => q(m, f)} />
    <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0" role="group" aria-label="Filtrar por situação">{FILTROS.map(([k, t]) => <Link key={k} href={q(ym, k)} className={chip(f === k)} aria-current={f === k ? "page" : undefined}><Icone texto={t} size={18} />{t}</Link>)}</div>
    {lista.length ? <ChargeGroups lista={lista} hoje={hoje} /> : <Card><p className="text-texto-2">Nenhum aluguel neste mês e filtro.</p></Card>}</>);
=======
    <div className="mb-4 flex flex-wrap items-center gap-2"><Link href={q(addMes(ym, -1), f)} className={chip(false)} aria-label="Mês anterior">← Anterior</Link><b className="min-w-[10rem] text-center text-lg">{mesRef(`${ym}-01`)}</b><Link href={q(addMes(ym, 1), f)} className={chip(false)} aria-label="Próximo mês">Próximo →</Link></div>
    <div className="mb-4 flex flex-wrap gap-2">{FILTROS.map(([k, t]) => <Link key={k} href={q(ym, k)} className={chip(f === k)} aria-current={f === k ? "page" : undefined}>{t}</Link>)}</div>
    <Card>{lista.length ? lista.map((c) => <ChargeItem key={c.id} c={c} hoje={hoje} acoes />) : <p className="text-texto-2">Nenhum aluguel neste mês e filtro.</p>}</Card></>);
>>>>>>> a3e90305993a061480649c980e79da21c6f91e2b
}

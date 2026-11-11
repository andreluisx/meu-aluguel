import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
<<<<<<< HEAD
import { AlertTriangle, ArrowRight, Plus, Building2, CalendarClock, CheckCircle2, Clock, FileText, Home, Receipt, TrendingUp, Wallet } from "lucide-react";
=======
import { AlertTriangle, ArrowRight, Building2, CalendarClock, CheckCircle2, Clock, FileText, Home, Receipt, TrendingUp, Wallet } from "lucide-react";
>>>>>>> a3e90305993a061480649c980e79da21c6f91e2b
import { ChargeItem } from "@/components/app/ChargeItem";
import { Card, EmptyState, PageHeader, Stat } from "@/components/app/ui";
import { ButtonLink } from "@/components/ui/Button";
import { CHARGE_SELECT, asCharges, devido, pago, saldo } from "@/lib/charges";
import { addDias, dataExtensa, diasEntre, fimMes, fmtData, hojeBR, inicioMes, mesCurto, mesRef, saudacao } from "@/lib/dates";
import { addMes } from "@/lib/financeiro";
import { fmtCentavos } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Início" };
const SECOES = { erro: "bg-[#F8E3E0] text-erro-texto", aviso: "bg-[#FCEFD0] text-[#7A5410]", ok: "bg-verde-suave text-[#27623F]" } as const;
function Titulo({ icone: I, cor, children }: { icone: LucideIcon; cor: keyof typeof SECOES; children: React.ReactNode }) {
  return <h2 className="mb-3 mt-9 flex items-center gap-2.5 text-xl font-extrabold"><span className={`grid size-10 place-items-center rounded-xl ${SECOES[cor]}`} aria-hidden><I size={22} /></span>{children}</h2>;
}
const ACOES: [string, string, LucideIcon, string][] = [
<<<<<<< HEAD
  ["/alugueis", "Pagamento", Receipt, "bg-verde text-white"], ["/imoveis/novo", "Adicionar imóvel", Building2, "bg-verde text-white"],
  ["/contratos/novo", "Novo contrato", FileText, "bg-verde text-white"], ["/despesas/nova", "Adicionar despesa", Wallet, "bg-verde text-white"],
=======
  ["/alugueis", "Registrar pagamento", Receipt, "bg-verde text-white"], ["/imoveis/novo", "Adicionar imóvel", Building2, "bg-verde-suave text-verde"],
  ["/contratos/novo", "Novo contrato", FileText, "bg-verde-suave text-verde"], ["/despesas/nova", "Adicionar despesa", Wallet, "bg-[#FCEFD0] text-[#7A5410]"],
>>>>>>> a3e90305993a061480649c980e79da21c6f91e2b
];
type Fim = { id: string; data_fim: string; properties: { nome: string } | null; tenants: { nome: string } | null };

export default async function Painel() {
  const sb = await createClient();
  const { count: nImoveis } = await sb.from("properties").select("id", { count: "exact", head: true });
<<<<<<< HEAD
  if (!nImoveis) return (<><PageHeader icone={"casa"} titulo="Bem-vindo ao Meu Aluguel" /><EmptyState titulo="Vamos organizar seu primeiro imóvel?" texto="Leva poucos minutos. Depois é só cadastrar o inquilino e o contrato." href="/imoveis/novo" cta="Adicionar meu primeiro imóvel" /></>);
=======
  if (!nImoveis) return (<><PageHeader icone={Home} titulo="Bem-vindo ao Meu Aluguel" /><EmptyState titulo="Vamos organizar seu primeiro imóvel?" texto="Leva poucos minutos. Depois é só cadastrar o inquilino e o contrato." href="/imoveis/novo" cta="Adicionar meu primeiro imóvel" /></>);
>>>>>>> a3e90305993a061480649c980e79da21c6f91e2b
  await sb.rpc("generate_my_charges");
  const hoje = hojeBR(), ini = inicioMes(hoje), fim = fimMes(hoje), ini6 = `${addMes(hoje.slice(0, 7), -5)}-01`; const abertos = ["aguardando", "parcial"];
  const { data: { user } } = await sb.auth.getUser();
  const [perfil, nContratos, mesQ, atrQ, proxQ, fimQ, pgs, dps] = await Promise.all([
    sb.from("profiles").select("nome").eq("id", user?.id ?? "").maybeSingle(),
    sb.from("leases").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    sb.from("rent_charges").select(CHARGE_SELECT).gte("vencimento", ini).lte("vencimento", fim).neq("status", "cancelado"),
    sb.from("rent_charges").select(CHARGE_SELECT).in("status", abertos).lt("vencimento", hoje).order("vencimento").limit(100),
    sb.from("rent_charges").select(CHARGE_SELECT).in("status", abertos).gte("vencimento", hoje).lte("vencimento", addDias(hoje, 7)).order("vencimento"),
    sb.from("leases").select("id,data_fim,properties(nome),tenants(nome)").eq("status", "ativo").gte("data_fim", hoje).lte("data_fim", addDias(hoje, 60)).order("data_fim"),
    sb.from("payments").select("valor_centavos,pago_em").gte("pago_em", ini6),
    sb.from("expenses").select("valor_centavos,data").gte("data", ini6),
  ]);
  const nome = ((perfil.data as { nome?: string } | null)?.nome ?? "").split(" ")[0];
  const mes = asCharges(mesQ.data), atrasados = asCharges(atrQ.data), proximos = asCharges(proxQ.data), terminando = (fimQ.data ?? []) as unknown as Fim[];
  const previsto = mes.reduce((s, c) => s + devido(c), 0), recebido = mes.reduce((s, c) => s + pago(c), 0);
  const aVencer = mes.filter((c) => c.vencimento >= hoje).reduce((s, c) => s + saldo(c), 0), totalAtraso = atrasados.reduce((s, c) => s + saldo(c), 0);
  const pct = previsto > 0 ? Math.min(100, Math.round((recebido / previsto) * 100)) : 0;
  const meses = Array.from({ length: 6 }, (_, i) => addMes(hoje.slice(0, 7), i - 5));
  const serie = meses.map((m) => ({ m, rec: ((pgs.data ?? []) as { valor_centavos: number; pago_em: string }[]).filter((p) => p.pago_em.startsWith(m)).reduce((s, p) => s + p.valor_centavos, 0), desp: ((dps.data ?? []) as { valor_centavos: number; data: string }[]).filter((d) => d.data.startsWith(m)).reduce((s, d) => s + d.valor_centavos, 0) }));
  const max = Math.max(1, ...serie.flatMap((x) => [x.rec, x.desp]));
  return (<>
    <div className="mb-5"><p className="capitalize text-texto-2">{dataExtensa()}</p><h1 className="text-[2rem] font-extrabold leading-tight">{saudacao()}{nome ? `, ${nome}` : ""}!</h1></div>

    {atrasados.length ? (
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-[18px] border-2 border-erro bg-[#FBECEA] p-5" role="status">
        <span className="grid size-14 flex-none place-items-center rounded-full bg-erro text-white" aria-hidden><AlertTriangle size={30} /></span>
        <div className="min-w-[200px] flex-1"><p className="text-xl font-extrabold text-erro-texto">{atrasados.length === 1 ? "1 aluguel atrasado" : `${atrasados.length} aluguéis atrasados`}</p>
          <p className="text-[1.05rem]">Falta receber <b className="tabular-nums">{fmtCentavos(totalAtraso)}</b></p></div>
        <ButtonLink href="/alugueis">Ver e cobrar</ButtonLink>
      </div>
    ) : (
      <div className="mb-6 flex items-center gap-4 rounded-[18px] border-2 border-verde-claro bg-[#EEF5EF] p-5" role="status">
        <span className="grid size-14 flex-none place-items-center rounded-full bg-verde-claro text-[#14210A]" aria-hidden><CheckCircle2 size={30} /></span>
        <div><p className="text-xl font-extrabold text-[#27623F]">Tudo em dia!</p><p>Nenhum aluguel atrasado.</p></div>
      </div>
    )}

    <Card className="mb-4">
      <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold"><TrendingUp size={24} className="text-verde" aria-hidden />Neste mês · {mesRef(ini)}</h2>
      <p className="text-[1.05rem]">Você recebeu <b className="text-[1.4rem] text-[#27623F] tabular-nums">{fmtCentavos(recebido)}</b> de <b className="tabular-nums">{fmtCentavos(previsto)}</b></p>
      <div className="my-3 h-5 overflow-hidden rounded-full bg-verde-suave" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Quanto do mês já foi recebido"><div className="h-full rounded-full bg-verde-claro" style={{ width: `${pct}%` }} /></div>
      <p className="font-bold text-texto-2">{pct}% do mês já recebido</p>
    </Card>
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
<<<<<<< HEAD
      <Stat label="Recebido" value={fmtCentavos(recebido)} tone="ok" icone={"checkCircle"} />
      <Stat label="Ainda a receber" value={fmtCentavos(aVencer)} tone="warn" icone={"relogio"} sub="aluguéis que ainda vão vencer" />
      <Stat label="Atrasados" value={fmtCentavos(totalAtraso)} tone={atrasados.length ? "err" : "ok"} icone={"alerta"} sub={atrasados.length ? `${atrasados.length} em atraso` : "nenhum"} />
    </div>
    <div className="mb-2 grid grid-cols-2 gap-3">
      <Stat label="Imóveis" value={String(nImoveis)} icone={"casa"} /><Stat label="Contratos ativos" value={String(nContratos.count ?? 0)} icone={"contratos"} />
=======
      <Stat label="Recebido" value={fmtCentavos(recebido)} tone="ok" icone={CheckCircle2} />
      <Stat label="Ainda a receber" value={fmtCentavos(aVencer)} tone="aviso" icone={Clock} sub="aluguéis que ainda vão vencer" />
      <Stat label="Atrasados" value={fmtCentavos(totalAtraso)} tone={atrasados.length ? "erro" : "ok"} icone={AlertTriangle} sub={atrasados.length ? `${atrasados.length} em atraso` : "nenhum"} />
    </div>
    <div className="mb-2 grid grid-cols-2 gap-3">
      <Stat label="Imóveis" value={String(nImoveis)} icone={Home} /><Stat label="Contratos ativos" value={String(nContratos.count ?? 0)} icone={FileText} />
>>>>>>> a3e90305993a061480649c980e79da21c6f91e2b
    </div>

    <Titulo icone={ArrowRight} cor="ok">O que você quer fazer?</Titulo>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{ACOES.map(([h, t, I, cor]) => (
      <Link key={h} href={h} className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-[18px] border border-borda bg-white p-4 text-center font-bold shadow-sm hover:border-verde-2">
<<<<<<< HEAD
        <span className={`grid size-12 place-items-center rounded-xl ${cor}`} aria-hidden><I size={26} /></span><span className="inline-flex items-center gap-1">{t}{<ArrowRight size={15} aria-hidden />}</span></Link>))}</div>

    {atrasados.length > 0 && (<><Titulo icone={AlertTriangle} cor="erro">Atrasados</Titulo>
      <div className="grid gap-3">{atrasados.slice(0, 5).map((c) => <ChargeItem key={c.id} c={c} hoje={hoje} acoes />)}
        {atrasados.length > 5 && <Link href="/alugueis" className="inline-flex min-h-12 items-center font-bold underline">Ver todos os atrasados ({atrasados.length})</Link>}</div></>)}

    <Titulo icone={Clock} cor="aviso">Vencem hoje e nos próximos 7 dias</Titulo>
    {proximos.length ? <div className="grid gap-3">{proximos.map((c) => <ChargeItem key={c.id} c={c} hoje={hoje} acoes />)}</div> : <Card><p className="text-texto-2">Nenhum aluguel vence nos próximos 7 dias.</p></Card>}
=======
        <span className={`grid size-12 place-items-center rounded-xl ${cor}`} aria-hidden><I size={26} /></span>{t}</Link>))}</div>

    {atrasados.length > 0 && (<><Titulo icone={AlertTriangle} cor="erro">Atrasados</Titulo>
      <Card>{atrasados.slice(0, 5).map((c) => <ChargeItem key={c.id} c={c} hoje={hoje} acoes />)}
        {atrasados.length > 5 && <Link href="/alugueis" className="mt-2 inline-flex min-h-12 items-center font-bold underline">Ver todos os atrasados ({atrasados.length})</Link>}</Card></>)}

    <Titulo icone={Clock} cor="aviso">Vencem hoje e nos próximos 7 dias</Titulo>
    <Card>{proximos.length ? proximos.map((c) => <ChargeItem key={c.id} c={c} hoje={hoje} acoes />) : <p className="text-texto-2">Nenhum aluguel vence nos próximos 7 dias.</p>}</Card>
>>>>>>> a3e90305993a061480649c980e79da21c6f91e2b

    {terminando.length > 0 && (<><Titulo icone={CalendarClock} cor="aviso">Contratos que terminam em breve</Titulo>
      <Card>{terminando.map((l) => (
        <Link key={l.id} href={`/contratos/${l.id}/editar`} className="flex items-center justify-between gap-3 border-b border-borda py-3 last:border-0"><span><b>{l.properties?.nome}</b><br /><span className="text-texto-2">{l.tenants?.nome} · termina em {fmtData(l.data_fim)}</span></span>
          <span className="whitespace-nowrap rounded-full bg-[#FCEBC4] px-3 py-1 text-[.9rem] font-bold text-[#6B4A0C]">{diasEntre(hoje, l.data_fim) === 0 ? "hoje" : `em ${diasEntre(hoje, l.data_fim)} dias`}</span></Link>))}</Card></>)}

    <Titulo icone={TrendingUp} cor="ok">Últimos 6 meses</Titulo>
    <Card>
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-[.95rem] font-bold"><span className="flex items-center gap-2"><i className="size-3.5 rounded bg-verde-claro" />Recebido</span><span className="flex items-center gap-2"><i className="size-3.5 rounded bg-dourado" />Despesas</span></div>
      <div className="grid gap-4">{serie.map((x) => (
        <div key={x.m}><p className="mb-1 font-bold capitalize">{mesCurto(x.m)}</p>
          {([["rec", x.rec, "bg-verde-claro"], ["desp", x.desp, "bg-dourado"]] as const).map(([k, v, cor]) => (
            <div key={k} className="mb-1 flex items-center gap-3"><div className="h-4 flex-1 overflow-hidden rounded-full bg-fundo"><div className={`h-full rounded-full ${cor}`} style={{ width: `${(v / max) * 100}%` }} /></div><span className="w-28 text-right text-[.95rem] font-bold tabular-nums">{fmtCentavos(v)}</span></div>))}
        </div>))}</div>
    </Card>
  </>);
}

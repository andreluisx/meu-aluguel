import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { aplicarEncargos, removerEncargos, ajustarValorAluguel, cancelarAluguel, excluirPagamento, mudarVencimento, reabrirAluguel } from "@/app/actions";
import { ChargeItem } from "@/components/app/ChargeItem";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { Card, PageHeader } from "@/components/app/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { CHARGE_SELECT, type ChargeRow, devido, pago, saldoBase, situacao } from "@/lib/charges";
import { calcularEncargos } from "@/lib/encargos";
import { FORMAS } from "@/lib/constants";
import { fmtData, hojeBR } from "@/lib/dates";
import { fmtCentavos, inputMoney } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Detalhes do aluguel" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const sb = await createClient(); const hoje = hojeBR();
  const { data } = await sb.from("rent_charges").select(CHARGE_SELECT).eq("id", id).maybeSingle();
  if (!data) notFound();
  const c = data as unknown as ChargeRow; const s = situacao(c, hoje); const h2 = "mb-3 mt-8 text-xl font-extrabold";
  return (<>
    <PageHeader titulo="Detalhes do aluguel" sub="Pagamentos, valor combinado, vencimento e cancelamento." />
    <ChargeItem c={c} hoje={hoje} acoes detalhes={false} />
    <h2 className={h2}>Pagamentos recebidos</h2>
    <Card>{c.payments.length ? c.payments.map((p) => (
      <div key={p.id} className="border-t border-borda py-3 first:border-0"><div className="flex justify-between gap-3"><span>{fmtData(p.pago_em)} · {FORMAS.find((f) => f[0] === p.forma)?.[1] ?? p.forma}{p.observacao ? <><br /><span className="text-texto-2">{p.observacao}</span></> : null}</span><b className="tabular-nums">{fmtCentavos(p.valor_centavos)}</b></div>
        <div className="mt-2"><ConfirmAction action={excluirPagamento} id={p.id} rotulo="Excluir pagamento" aviso="Excluir este pagamento? Use quando ele foi lançado por engano. O aluguel volta a ficar em aberto." confirmar="Sim, excluir pagamento" /></div></div>)) : <p className="text-texto-2">Nenhum pagamento registrado.</p>}</Card>
    {s === "cancelado" ? (<><h2 className={h2}>Aluguel cancelado</h2><Card><form action={reabrirAluguel}><input type="hidden" name="id" value={c.id} /><p className="mb-3">Reabrir faz o aluguel voltar a ser cobrado.</p><Button type="submit">Reabrir aluguel</Button></form></Card></>) : (<>
      <h2 className={h2}>Combinar outro valor</h2>
      <Card><p className="mb-3 text-texto-2">Para desconto, acordo ou acréscimo. Informe quanto será cobrado neste mês e o motivo. O valor original ({fmtCentavos(c.valor_original_centavos)}) fica guardado.</p>
        <ActionForm action={ajustarValorAluguel} submit="Salvar valor combinado"><input type="hidden" name="charge_id" value={c.id} />
          <Field label="Valor a cobrar neste mês (R$)" name="valor" mask="moeda" defaultValue={inputMoney(devido(c))} hint={pago(c) > 0 ? `Já recebido: ${fmtCentavos(pago(c))}` : undefined} />
          <Field label="Motivo" name="motivo" hint="Ex.: Desconto por reparo feito pelo inquilino" /></ActionForm></Card>
      {(() => {
        const m = Number(c.leases?.multa_percentual ?? 0), j = Number(c.leases?.juros_mensal_percentual ?? 0);
        const e = calcularEncargos({ base: saldoBase(c), vencimento: c.vencimento, hoje, multa: m, juros: j });
        return (<><h2 className={h2}>Multa e juros</h2><Card>
          {m === 0 && j === 0 ? <p className="text-texto-2">Este contrato não prevê multa nem juros. Para cobrar, informe os percentuais em Contratos &gt; Editar.</p> : <>
            <p className="mb-2 text-texto-2">Contrato: multa de {m.toFixed(2).replace(".", ",")}% e juros de {j.toFixed(2).replace(".", ",")}% ao mês. O cálculo usa o que falta pagar: multa única mais juros simples por dia de atraso. Confira com o que está escrito no seu contrato.</p>
            {c.encargos_centavos > 0 && <p className="mb-2 font-bold">Já aplicado: {fmtCentavos(c.encargos_centavos)}</p>}
            {e.total > 0 ? <p className="mb-3">Hoje ({e.dias} dias de atraso): multa {fmtCentavos(e.multa)} + juros {fmtCentavos(e.juros)} = <b>{fmtCentavos(e.total)}</b></p> : <p className="mb-3 text-texto-2">Sem atraso no momento. Nada a cobrar.</p>}
            <div className="flex flex-wrap gap-2">
              {e.total > 0 && <ConfirmAction action={aplicarEncargos} id={c.id} rotulo={c.encargos_centavos > 0 ? "Atualizar multa e juros" : "Aplicar multa e juros"} aviso={`Somar ${fmtCentavos(e.total)} ao valor deste aluguel? Você pode remover depois.`} confirmar="Sim, aplicar" />}
              {c.encargos_centavos > 0 && <ConfirmAction action={removerEncargos} id={c.id} rotulo="Remover multa e juros" aviso="Remover a multa e os juros aplicados a este aluguel?" confirmar="Sim, remover" />}
            </div></>}
        </Card></>);
      })()}
      <h2 className={h2}>Mudar vencimento deste mês</h2>
      <Card><ActionForm action={mudarVencimento} submit="Salvar vencimento"><input type="hidden" name="charge_id" value={c.id} /><Field label="Novo vencimento" name="vencimento" type="date" defaultValue={c.vencimento} /></ActionForm></Card>
      {pago(c) === 0 && (<><h2 className={h2}>Cancelar este aluguel</h2>
        <Card><p className="mb-3 text-texto-2">Use quando não haverá cobrança neste mês (ex.: imóvel em reforma). O motivo fica registrado e você pode reabrir depois.</p>
          <ActionForm action={cancelarAluguel} submit="Cancelar aluguel"><input type="hidden" name="charge_id" value={c.id} /><Field label="Motivo" name="motivo" /></ActionForm></Card></>)}
    </>)}
  </>);
}

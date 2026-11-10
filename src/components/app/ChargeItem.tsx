import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { registrarPagamento } from "@/app/actions";
import { ActionForm } from "@/components/ui/ActionForm";
import { Field, FileField, SelectField } from "@/components/ui/Field";
import { FORMAS } from "@/lib/constants";
import { type ChargeRow, devido, pago, saldo, saldoBase, situacao } from "@/lib/charges";
import { calcularEncargos } from "@/lib/encargos";
import { fmtData, mesRef } from "@/lib/dates";
import { fmtCentavos, inputMoney } from "@/lib/money";
import { cobranca } from "@/lib/whatsapp";
import { StatusBadge } from "./ui";

const FAIXA = { pago: "border-l-verde-claro", aguardando: "border-l-borda", atrasado: "border-l-erro", parcial: "border-l-dourado", cancelado: "border-l-borda" } as const;
export function ChargeItem({ c, hoje, acoes, detalhes = true }: { c: ChargeRow; hoje: string; acoes?: boolean; detalhes?: boolean }) {
  const s = situacao(c, hoje); const sd = saldo(c); const wa = acoes ? cobranca(c, s, hoje) : null; const aj = c.ajuste_centavos; const enc = c.encargos_centavos; const L = c.leases;
  const est = s === "atrasado" && enc === 0 && L && (Number(L.multa_percentual) > 0 || Number(L.juros_mensal_percentual) > 0)
    ? calcularEncargos({ base: saldoBase(c), vencimento: c.vencimento, hoje, multa: Number(L.multa_percentual), juros: Number(L.juros_mensal_percentual) }) : null;
  return (
    <div className={`mb-4 border-b border-borda border-l-[6px] pb-4 pl-3 last:mb-0 last:border-b-0 last:pb-0 ${FAIXA[s]}`}>
      <div className="flex items-start justify-between gap-3">
        <div><b>{c.leases?.tenants?.nome ?? "Inquilino"}</b><br /><span className="text-texto-2">{c.leases?.properties?.nome} · {mesRef(c.competencia)}<br />Vence em {fmtData(c.vencimento)}</span></div>
        <div className="text-right">{devido(c) !== c.valor_original_centavos && <span className="block text-[.9rem] text-texto-2 line-through tabular-nums">{fmtCentavos(c.valor_original_centavos)}</span>}
          <b className="block text-lg tabular-nums">{fmtCentavos(devido(c))}</b><StatusBadge s={s} /></div>
      </div>
      {aj !== 0 && <p className="mt-2 text-[.95rem] text-texto-2">{aj > 0 ? "Desconto" : "Acréscimo"} de {fmtCentavos(Math.abs(aj))}{c.ajuste_motivo ? ` · ${c.ajuste_motivo}` : ""}</p>}
      {enc > 0 && <p className="mt-2 text-[.95rem] text-texto-2">Multa e juros: {fmtCentavos(enc)}</p>}
      {acoes && est && est.total > 0 && <p className="mt-2 text-[.95rem] font-semibold text-texto-2">Com multa e juros hoje: + {fmtCentavos(est.total)} ({est.dias} dias de atraso). Para cobrar, abra “Mais opções”.</p>}
      {s === "cancelado" && c.motivo_cancelamento && <p className="mt-2 text-[.95rem] text-texto-2">Motivo do cancelamento: {c.motivo_cancelamento}</p>}
      {pago(c) > 0 && s !== "pago" && <p className="mt-2 font-semibold text-texto-2">Recebido {fmtCentavos(pago(c))} · Falta {fmtCentavos(sd)}</p>}
      {!!c.documents?.length && <p className="mt-2 flex flex-wrap gap-x-4 font-bold">{c.documents.map((d) => <a key={d.id} href={`/documentos/${d.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">Ver {d.tipo === "comprovante" ? "comprovante" : "documento"}</a>)}</p>}
      {wa && (<div className="mt-3">
        {wa.link ? <a href={wa.link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-verde px-4 font-bold text-white hover:bg-verde-2"><MessageCircle size={20} aria-hidden />{wa.rotulo}</a>
          : <p className="text-[.95rem] text-texto-2">Para cobrar pelo WhatsApp, cadastre o número do inquilino.</p>}
        {wa.link && <p className="mt-1 text-[.9rem] text-texto-2">Abre o WhatsApp com a mensagem pronta. Você confere e envia.</p>}
      </div>)}
      {acoes && (
        <div className="mt-3">
          {sd > 0 && s !== "cancelado" && (
            <details><summary className="inline-flex min-h-12 cursor-pointer items-center rounded-xl border-2 border-verde-2 px-4 font-bold">Registrar pagamento</summary>
              <div className="mt-3 rounded-xl bg-fundo p-4"><ActionForm action={registrarPagamento} submit="Salvar pagamento">
                <input type="hidden" name="charge_id" value={c.id} />
                <Field label="Valor recebido (R$)" name="valor" mask="moeda" defaultValue={inputMoney(sd)} hint={`Saldo pendente: ${fmtCentavos(sd)}`} />
                <Field label="Data do pagamento" name="pago_em" type="date" defaultValue={hoje} />
                <SelectField label="Forma de pagamento" name="forma">{FORMAS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</SelectField>
                <Field label="Observação (opcional)" name="observacao" />
                <label className="mb-3 flex items-start gap-3"><input type="checkbox" name="quitar" className="mt-0.5 size-7 flex-none accent-verde-2" />
                  <span><b>Considerar quitado, mesmo pagando menos</b><br /><span className="text-[.95rem] text-texto-2">A diferença vira desconto e o motivo fica registrado.</span></span></label>
                <Field label="Motivo (se considerar quitado)" name="motivo" hint="Ex.: Acordo com o inquilino" />
                <FileField label="Comprovante (opcional)" hint="PDF ou foto, até 10 MB." fotos={false} />
              </ActionForm></div></details>
          )}
          {detalhes && <Link href={`/alugueis/${c.id}`} className="mt-1 inline-flex min-h-12 items-center rounded-xl px-3 font-bold underline">Mais opções</Link>}
        </div>
      )}
    </div>
  );
}

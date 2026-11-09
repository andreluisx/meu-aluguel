import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { editarContrato } from "@/app/actions";
import { PageHeader } from "@/components/app/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { Field, SelectField } from "@/components/ui/Field";
import { fmtData } from "@/lib/dates";
import { inputMoney } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Editar contrato" };
type L = { id: string; valor_centavos: number; dia_vencimento: number; data_inicio: string; data_fim: string | null; status: string; multa_percentual: number; juros_mensal_percentual: number; properties: { nome: string } | null; tenants: { nome: string } | null };
const pctTxt = (n: number) => (Number(n) > 0 ? Number(n).toFixed(2).replace(".", ",") : "");
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const sb = await createClient();
  const { data } = await sb.from("leases").select("id,valor_centavos,dia_vencimento,data_inicio,data_fim,status,multa_percentual,juros_mensal_percentual,properties(nome),tenants(nome)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const l = data as unknown as L;
  return (<><PageHeader titulo="Editar contrato" sub={`${l.properties?.nome} · ${l.tenants?.nome} · desde ${fmtData(l.data_inicio)}`} />
    <div className="max-w-xl"><ActionForm action={editarContrato} submit="Salvar alterações"><input type="hidden" name="id" value={l.id} />
      <Field label="Valor do aluguel (R$)" name="valor" mask="moeda" defaultValue={inputMoney(l.valor_centavos)} hint="Use para um reajuste combinado. O valor só muda nos próximos aluguéis ainda sem pagamento." />
      <SelectField label="Dia do vencimento" name="dia" defaultValue={String(l.dia_vencimento)}>{Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>Dia {i + 1}</option>)}</SelectField>
      <div className="grid gap-x-4 sm:grid-cols-2"><Field label="Multa por atraso (%)" name="multa" mask="percentual" defaultValue={pctTxt(l.multa_percentual)} hint="Deixe em branco se o contrato não prevê." />
        <Field label="Juros ao mês (%)" name="juros" mask="percentual" defaultValue={pctTxt(l.juros_mensal_percentual)} hint="Deixe em branco se o contrato não prevê." /></div>
      <Field label="Término (opcional)" name="fim" type="date" defaultValue={l.data_fim ?? ""} hint="Ao definir o término, os aluguéis seguintes sem pagamento são cancelados." />
      <p className="mb-5 rounded-xl bg-verde-suave p-3 text-[.95rem]">Aluguéis já pagos, com valor combinado ou com vencimento alterado à mão não são mexidos.</p>
    </ActionForm></div></>);
}

import type { Metadata } from "next";
import { criarContrato } from "@/app/actions";
import { EmptyState, PageHeader } from "@/components/app/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { Field, FileField, SelectField } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Novo contrato" };
export default async function Page() {
  const sb = await createClient();
  const [{ data: im }, { data: te }] = await Promise.all([sb.from("properties").select("id,nome").order("nome"), sb.from("tenants").select("id,nome").order("nome")]);
  const imoveis = (im ?? []) as { id: string; nome: string }[], inq = (te ?? []) as { id: string; nome: string }[];
  if (!imoveis.length) return <EmptyState titulo="Primeiro, adicione um imóvel" texto="O contrato precisa de um imóvel." href="/imoveis/novo" cta="Adicionar imóvel" />;
  if (!inq.length) return <EmptyState titulo="Agora, adicione o inquilino" texto="O contrato precisa de um inquilino." href="/inquilinos/novo" cta="Adicionar inquilino" />;
  return (<><PageHeader titulo="Novo contrato" sub="Os aluguéis de cada mês serão criados automaticamente." />
    <div className="max-w-xl"><ActionForm action={criarContrato} submit="Criar contrato">
      <SelectField label="Imóvel" name="property_id"><option value="">Escolha…</option>{imoveis.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}</SelectField>
      <SelectField label="Inquilino" name="tenant_id"><option value="">Escolha…</option>{inq.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}</SelectField>
      <Field label="Valor do aluguel (R$)" name="valor" mask="moeda" />
      <SelectField label="Dia do vencimento" name="dia" defaultValue="10" hint="Em meses mais curtos, vence no último dia do mês.">{Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>Dia {i + 1}</option>)}</SelectField>
      <div className="grid gap-x-4 sm:grid-cols-2"><Field label="Multa por atraso (%)" name="multa" mask="percentual" hint="Só se o contrato prever. Ex.: 2,00" />
        <Field label="Juros ao mês (%)" name="juros" mask="percentual" hint="Só se o contrato prever. Ex.: 1,00" /></div>
      <div className="grid gap-x-4 sm:grid-cols-2"><Field label="Início" name="inicio" type="date" /><Field label="Término (opcional)" name="fim" type="date" /></div>
      <FileField label="Contrato assinado (opcional)" hint="PDF ou foto, até 10 MB. Você também pode anexar depois." />
    </ActionForm></div></>);
}

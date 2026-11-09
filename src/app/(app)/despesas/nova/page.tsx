import type { Metadata } from "next";
import { criarDespesa } from "@/app/actions";
import { EmptyState, PageHeader } from "@/components/app/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { Field, SelectField } from "@/components/ui/Field";
import { CATEGORIAS, FORMAS } from "@/lib/constants";
import { hojeBR } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Adicionar despesa" };
export default async function Page() {
  const sb = await createClient();
  const { data } = await sb.from("properties").select("id,nome").order("nome");
  const imoveis = (data ?? []) as { id: string; nome: string }[];
  if (!imoveis.length) return <EmptyState titulo="Primeiro, adicione um imóvel" texto="A despesa precisa estar ligada a um imóvel." href="/imoveis/novo" cta="Adicionar imóvel" />;
  return (<><PageHeader titulo="Adicionar despesa" />
    <div className="max-w-xl"><ActionForm action={criarDespesa} submit="Salvar despesa">
      <SelectField label="Imóvel" name="property_id"><option value="">Escolha…</option>{imoveis.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}</SelectField>
      <SelectField label="Tipo de despesa" name="categoria">{CATEGORIAS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</SelectField>
      <Field label="Descrição" name="descricao" hint="Ex.: Troca do chuveiro" />
      <Field label="Valor (R$)" name="valor" mask="moeda" />
      <Field label="Data" name="data" type="date" defaultValue={hojeBR()} />
      <SelectField label="Forma de pagamento (opcional)" name="forma"><option value="">—</option>{FORMAS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</SelectField>
    </ActionForm></div></>);
}

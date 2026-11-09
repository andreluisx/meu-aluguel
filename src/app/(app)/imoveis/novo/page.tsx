import type { Metadata } from "next";
import { criarImovel } from "@/app/actions";
import { PageHeader } from "@/components/app/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { Field, SelectField } from "@/components/ui/Field";
import { TIPOS, UFS } from "@/lib/constants";

export const metadata: Metadata = { title: "Adicionar imóvel" };
export default function Page() {
  return (<><PageHeader titulo="Adicionar imóvel" sub="Só o essencial. O resto você completa depois." />
    <div className="max-w-xl"><ActionForm action={criarImovel} submit="Salvar imóvel">
      <Field label="Nome do imóvel" name="nome" hint="Ex.: Casa da Rua das Flores" />
      <SelectField label="Tipo" name="tipo">{TIPOS.map((t) => <option key={t}>{t}</option>)}</SelectField>
      <Field label="Valor do aluguel (R$)" name="valor" mask="moeda" />
      <Field label="CEP (opcional)" name="cep" mask="cep" />
      <Field label="Endereço (opcional)" name="endereco" />
      <div className="grid gap-x-4 sm:grid-cols-[1fr_140px]"><Field label="Cidade (opcional)" name="cidade" />
        <SelectField label="Estado" name="estado"><option value="">—</option>{UFS.map((u) => <option key={u}>{u}</option>)}</SelectField></div>
    </ActionForm></div></>);
}

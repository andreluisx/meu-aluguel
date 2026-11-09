import type { Metadata } from "next";
import { criarInquilino } from "@/app/actions";
import { PageHeader } from "@/components/app/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { Field, FileField } from "@/components/ui/Field";

export const metadata: Metadata = { title: "Adicionar inquilino" };
export default function Page() {
  return (<><PageHeader titulo="Adicionar inquilino" sub="Só o nome é obrigatório." />
    <div className="max-w-xl"><ActionForm action={criarInquilino} submit="Salvar inquilino">
      <Field label="Nome completo" name="nome" autoComplete="off" />
      <Field label="WhatsApp" name="whatsapp" type="tel" mask="telefone" hint="Usado para enviar lembretes e cobranças." />
      <Field label="Outro telefone (opcional)" name="telefone" type="tel" mask="telefone" />
      <Field label="E-mail (opcional)" name="email" type="email" />
      <Field label="CPF (opcional)" name="cpf" mask="cpf" />
      <FileField label="Foto (opcional)" hint="Aparece em miniatura na lista de inquilinos." fotos />
    </ActionForm></div></>);
}

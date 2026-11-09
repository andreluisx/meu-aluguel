import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { editarImovel } from "@/app/actions";
import { PageHeader } from "@/components/app/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { Field, SelectField } from "@/components/ui/Field";
import { TIPOS, UFS } from "@/lib/constants";
import { masks } from "@/lib/masks";
import { inputMoney } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Editar imóvel" };
type P = { id: string; nome: string; tipo: string; cep: string | null; endereco: string | null; cidade: string | null; estado: string | null; valor_aluguel_centavos: number };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const sb = await createClient();
  const { data } = await sb.from("properties").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as P;
  return (<><PageHeader titulo="Editar imóvel" />
    <div className="max-w-xl"><ActionForm action={editarImovel} submit="Salvar alterações">
      <input type="hidden" name="id" value={p.id} />
      <Field label="Nome do imóvel" name="nome" defaultValue={p.nome} />
      <SelectField label="Tipo" name="tipo" defaultValue={p.tipo}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</SelectField>
      <Field label="Valor do aluguel (R$)" name="valor" mask="moeda" defaultValue={inputMoney(p.valor_aluguel_centavos)} hint="Mudar o valor aqui não altera contratos já criados." />
      <Field label="CEP (opcional)" name="cep" mask="cep" defaultValue={p.cep ? masks.cep(p.cep) : ""} />
      <Field label="Endereço (opcional)" name="endereco" defaultValue={p.endereco ?? ""} />
      <div className="grid gap-x-4 sm:grid-cols-[1fr_140px]"><Field label="Cidade (opcional)" name="cidade" defaultValue={p.cidade ?? ""} />
        <SelectField label="Estado" name="estado" defaultValue={p.estado ?? ""}><option value="">—</option>{UFS.map((u) => <option key={u}>{u}</option>)}</SelectField></div>
    </ActionForm></div></>);
}

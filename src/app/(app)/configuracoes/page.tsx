import type { Metadata } from "next";
import { salvarPix } from "@/app/actions";
import { PixCopia } from "@/components/app/PixCopia";
import { Card, PageHeader } from "@/components/app/ui";
import { ActionForm } from "@/components/ui/ActionForm";
import { Field, SelectField } from "@/components/ui/Field";
import { masks } from "@/lib/masks";
import { gerarPix } from "@/lib/pix";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Configurações" };
type Perfil = { nome: string | null; chave_pix: string | null; chave_pix_tipo: string | null; pix_nome: string | null; pix_cidade: string | null };
const exibir = (tipo: string | null, v: string) => (tipo === "cpf" ? masks.cpf(v) : tipo === "telefone" ? masks.telefone(v.replace(/^\+55/, "")) : v);
export default async function Page() {
  const sb = await createClient(); const { data: { user } } = await sb.auth.getUser();
  const { data } = await sb.from("profiles").select("nome,chave_pix,chave_pix_tipo,pix_nome,pix_cidade").eq("id", user?.id ?? "").maybeSingle();
  const p = (data ?? {}) as Partial<Perfil>;
  const teste = p.chave_pix ? gerarPix({ chave: p.chave_pix, valorCentavos: 1, nome: p.pix_nome ?? p.nome ?? "Proprietario", cidade: p.pix_cidade ?? "Brasil", txid: "TESTE" }) : null;
  return (<>
    <PageHeader icone="configuracoes" titulo="Configurações" sub="Como você recebe os aluguéis." />
    <div className="max-w-xl">
      <Card className="mb-6"><h2 className="mb-2 flex items-center gap-2 text-xl font-extrabold">Receber por Pix</h2>
        <p className="mb-4 text-texto-2">Informe a chave Pix que você já usa no seu banco. O inquilino paga direto para você, de qualquer banco, e o dinheiro cai na sua conta. O sistema nunca mexe no seu dinheiro: você confere no extrato e confirma aqui.</p>
        <ActionForm action={salvarPix} submit="Salvar chave Pix">
          <SelectField label="Tipo da chave" name="tipo" defaultValue={p.chave_pix_tipo ?? "cpf"}><option value="cpf">CPF</option><option value="telefone">Celular</option><option value="email">E-mail</option><option value="aleatoria">Chave aleatória</option></SelectField>
          <Field label="Sua chave Pix" name="chave" defaultValue={p.chave_pix ? exibir(p.chave_pix_tipo ?? null, p.chave_pix) : ""} hint="Digite exatamente como está cadastrada no seu banco." />
          <Field label="Seu nome (como aparece no banco)" name="nome" defaultValue={p.pix_nome ?? p.nome ?? ""} hint="Até 25 letras." maxLength={25} />
          <Field label="Sua cidade" name="cidade" defaultValue={p.pix_cidade ?? ""} hint="Até 15 letras." maxLength={15} />
        </ActionForm></Card>
      {teste && (<Card><h2 className="mb-1 text-xl font-extrabold">Teste rápido</h2>
        <p className="mb-3 text-texto-2">Para ter certeza de que está certo, pague este código de <b>R$ 0,01</b> usando o aplicativo de outro banco (ou de outra pessoa). O centavo deve cair na sua conta.</p><PixCopia codigo={teste} /></Card>)}
    </div></>);
}

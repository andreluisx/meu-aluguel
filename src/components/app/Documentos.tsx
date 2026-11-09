import { FileText } from "lucide-react";
import { enviarDocumento, enviarFotos, excluirDocumento } from "@/app/actions";
import { ActionForm } from "@/components/ui/ActionForm";
import { FileField, SelectField } from "@/components/ui/Field";
import { DOC_TIPOS, nomeDoc } from "@/lib/constants";
import { fmtData } from "@/lib/dates";
import { urlsAssinadas } from "@/lib/fotos";
import { createClient } from "@/lib/supabase/server";
import { ConfirmAction } from "./ConfirmAction";
import { Card } from "./ui";

type Doc = { id: string; tipo: string; nome_arquivo: string; caminho: string; created_at: string };
const botao = "inline-flex min-h-12 cursor-pointer items-center rounded-xl bg-verde px-4 font-bold text-white";
export async function Documentos({ propertyId }: { propertyId: string }) {
  const sb = await createClient();
  const { data } = await sb.from("documents").select("id,tipo,nome_arquivo,caminho,created_at").eq("property_id", propertyId).order("created_at");
  const todos = (data ?? []) as Doc[]; const fotos = todos.filter((d) => d.tipo === "foto"), docs = todos.filter((d) => d.tipo !== "foto").reverse();
  const urls = await urlsAssinadas(sb, fotos.map((f) => f.caminho));
  return (<>
    <section className="mt-8"><h2 className="mb-3 text-xl font-extrabold">Fotos do imóvel</h2>
      <Card>
        {fotos.length ? <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{fotos.map((f, i) => (
          <div key={f.id}><a href={`/documentos/${f.id}`} target="_blank" rel="noopener noreferrer" className="block">
            {urls.get(f.caminho) ? <img src={urls.get(f.caminho)} alt={`Foto ${i + 1} do imóvel`} loading="lazy" className="aspect-square w-full rounded-xl object-cover" /> : <span className="grid aspect-square place-items-center rounded-xl bg-verde-suave">Foto</span>}</a>
            {i === 0 && <p className="mt-1 text-[.9rem] font-bold text-texto-2">Foto principal</p>}
            <div className="mt-1"><ConfirmAction action={excluirDocumento} id={f.id} rotulo="Excluir" aviso="Excluir esta foto?" confirmar="Sim, excluir" /></div></div>))}</div>
          : <p className="mb-3 text-texto-2">As fotos são opcionais. A primeira que você enviar aparece como miniatura na lista de imóveis.</p>}
        <details><summary className={botao}>Adicionar fotos</summary>
          <div className="mt-3 rounded-xl bg-fundo p-4"><ActionForm action={enviarFotos} submit="Guardar fotos"><input type="hidden" name="property_id" value={propertyId} />
            <FileField label="Fotos" hint="Pode escolher várias (até 10 por vez). Elas são reduzidas automaticamente." fotos multiple /></ActionForm></div></details>
      </Card></section>
    <section className="mt-8"><h2 className="mb-3 text-xl font-extrabold">Documentos do imóvel</h2>
      <Card>
        {docs.length ? docs.map((d) => (
          <div key={d.id} className="border-t border-borda py-3 first:border-0">
            <div className="flex items-center gap-3"><FileText size={24} className="flex-none text-verde" aria-hidden />
              <div className="min-w-0 flex-1"><b className="block truncate">{d.nome_arquivo}</b><span className="text-[.95rem] text-texto-2">{nomeDoc(d.tipo)} · {fmtData(d.created_at.slice(0, 10))}</span></div>
              <a href={`/documentos/${d.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-xl border-2 border-verde-2 px-4 font-bold">Abrir</a></div>
            <div className="mt-2"><ConfirmAction action={excluirDocumento} id={d.id} rotulo="Excluir" aviso="Tem certeza? O arquivo será apagado e não poderá ser recuperado." confirmar="Sim, excluir arquivo" /></div>
          </div>)) : <p className="mb-3 text-texto-2">Guarde aqui escritura, IPTU, seguro, laudo de vistoria, contas e outros papéis. O contrato de aluguel fica na aba Contratos.</p>}
        <details className="mt-3"><summary className={botao}>Adicionar documento</summary>
          <div className="mt-3 rounded-xl bg-fundo p-4"><ActionForm action={enviarDocumento} submit="Guardar documento"><input type="hidden" name="property_id" value={propertyId} />
            <SelectField label="Tipo" name="tipo">{DOC_TIPOS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</SelectField>
            <FileField label="Arquivo" hint="PDF ou foto, até 10 MB." /></ActionForm></div></details>
      </Card></section>
  </>);
}

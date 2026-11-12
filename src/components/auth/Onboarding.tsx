"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";
import { Field, SelectField } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { brl, firstErrors, parseValor } from "@/lib/validation";
import { concluirOnboarding } from "@/app/actions";
import { isDemo } from "@/lib/auth";

type D = { nome: string; imovel: string; tipo: string; valor: string; inquilino: string; zap: string; inicio: string; fim: string; dia: string };
const vazio: D = { nome: "", imovel: "", tipo: "Casa", valor: "", inquilino: "", zap: "", inicio: "", fim: "", dia: "10" };
const KEY = "meu-aluguel:onboarding";
const schemas: z.ZodTypeAny[] = [
  z.object({ nome: z.string().trim().min(2, "Escreva seu nome.") }),
  z.object({ imovel: z.string().trim().min(2, "Dê um nome ao imóvel."), valor: z.string().refine((v) => parseValor(v) > 0, "Informe o valor do aluguel.") }),
  z.object({ inquilino: z.string().trim().min(2, "Escreva o nome do inquilino.") }),
  z.object({ inicio: z.string().min(1, "Informe a data de início.") }),
  z.object({}),
];
const titulos = ["Como podemos chamar você?", "Vamos organizar seu primeiro imóvel", "Quem mora nesse imóvel?", "Quando começa o contrato?", "Em que dia vence o aluguel?"];
const subs = ["Assim deixamos tudo mais pessoal.", "Só o básico. O resto você completa depois.", "Com o WhatsApp, a cobrança fica a um toque.", "Se não souber o término, pode deixar em branco.", "Todo mês, nesse dia, o aluguel aparece na sua lista."];

export function Onboarding() {
  const [d, setD] = useState<D>(vazio); const [passo, setPasso] = useState(0);
  const [salvando, setSalvando] = useState(false); const [erro, setErro] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({}); const [fim, setFim] = useState<"" | "pronto" | "depois">("");
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) { const j = JSON.parse(s); setD({ ...vazio, ...j.d }); setPasso(Math.min(Number(j.passo) || 0, 4)); } } catch {} }, []);
  const salvar = (nd: D, np: number) => { try { localStorage.setItem(KEY, JSON.stringify({ d: nd, passo: np })); } catch {} };
  const set = (k: keyof D) => (e: { target: { value: string } }) => setD({ ...d, [k]: e.target.value });
  async function avancar(e: FormEvent) {
    e.preventDefault();
    const errs = firstErrors(schemas[passo], d); setErrors(errs);
    if (Object.keys(errs).length) return;
    if (passo === 4) {
      salvar(d, 4);
      if (!isDemo) {
        setSalvando(true); setErro("");
        const r = await concluirOnboarding(d); setSalvando(false);
        if (r.error) return setErro(r.error);
        try { localStorage.removeItem(KEY); } catch {}
      }
      return setFim("pronto");
    }
    salvar(d, passo + 1); setPasso(passo + 1);
  }
  if (fim === "depois") return (<><h1 className="mb-3 text-3xl font-extrabold">Tudo salvo</h1><p className="mb-5 rounded-xl bg-verde-suave p-4 font-bold">Você pode continuar de onde parou quando quiser.</p><Button className="mb-3 w-full" onClick={() => setFim("")}>Continuar agora</Button><ButtonLink href="/painel" variant="outline" className="w-full">Ir para meu painel</ButtonLink></>);
  if (fim === "pronto") {
    const linhas = [["Imóvel", d.imovel], ["Valor", brl(parseValor(d.valor))], ["Inquilino", d.inquilino], ["Vencimento", `Todo dia ${d.dia}`]];
    return (<><h1 className="mb-2 text-3xl font-extrabold">Tudo pronto{d.nome ? `, ${d.nome.split(" ")[0]}` : ""}!</h1><p className="text-texto-2">Seu primeiro aluguel já está organizado.</p>
      <div className="my-5 rounded-[18px] border border-borda bg-white px-5">{linhas.map(([k, v]) => <div key={k} className="flex justify-between gap-3 border-t border-borda py-3 first:border-0"><span className="text-texto-2">{k}</span><b>{v}</b></div>)}</div>
      <ButtonLink href="/painel" className="w-full">Ir para meu painel</ButtonLink></>);
  }
  return (<>
    <p className="font-bold text-texto-2">Passo {passo + 1} de 5</p>
    <div className="mb-5 mt-1.5 h-2.5 overflow-hidden rounded-full bg-verde-suave" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={passo + 1}><div className="h-full bg-verde-claro transition-all" style={{ width: `${(passo + 1) * 20}%` }} /></div>
    <h1 className="mb-2 text-3xl font-extrabold">{titulos[passo]}</h1><p className="mb-6 text-texto-2">{subs[passo]}</p>
    <form onSubmit={avancar} noValidate>
      {passo === 0 && <Field label="Seu nome" name="nome" value={d.nome} onChange={set("nome")} error={errors.nome} autoComplete="name" />}
      {passo === 1 && <>
        <Field label="Nome do imóvel" name="imovel" value={d.imovel} onChange={set("imovel")} hint="Ex.: Casa da Rua das Flores" error={errors.imovel} />
        <SelectField label="Tipo" name="tipo" value={d.tipo} onChange={set("tipo")}>{["Casa", "Apartamento", "Sala comercial", "Terreno", "Outro"].map((t) => <option key={t}>{t}</option>)}</SelectField>
        <Field label="Valor do aluguel (R$)" name="valor" mask="moeda" value={d.valor} onChange={set("valor")} error={errors.valor} />
      </>}
      {passo === 2 && <>
        <Field label="Nome do inquilino" name="inquilino" value={d.inquilino} onChange={set("inquilino")} error={errors.inquilino} />
        <Field label="WhatsApp (opcional)" name="zap" type="tel" mask="telefone" value={d.zap} onChange={set("zap")} />
      </>}
      {passo === 3 && <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label="Início" name="inicio" type="date" value={d.inicio} onChange={set("inicio")} error={errors.inicio} />
        <Field label="Término (opcional)" name="fim" type="date" value={d.fim} onChange={set("fim")} />
      </div>}
      {passo === 4 && <>
        <SelectField label="Dia do vencimento" name="dia" value={d.dia} onChange={set("dia")} hint="Em meses mais curtos, vence no último dia do mês.">{Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>Dia {i + 1}</option>)}</SelectField>
        <p className="mb-5 rounded-[14px] bg-verde-suave p-4 font-bold" aria-live="polite">Todo dia {d.dia}{parseValor(d.valor) > 0 ? `, você receberá ${brl(parseValor(d.valor))}` : ""}.</p>
      </>}
      {erro && <p role="alert" className="mb-4 rounded-xl bg-[#F8E3E0] p-3 font-bold text-erro-texto">! {erro}</p>}
      <Button type="submit" disabled={salvando} className="w-full">{salvando ? "Salvando…" : passo === 4 ? "Concluir" : "Continuar"}</Button>
    </form>
    <Button variant="ghost" className="mt-2 w-full" onClick={() => { salvar(d, passo); setFim("depois"); }}>Salvar e continuar depois</Button>
    {isDemo && <p className="mt-4 text-sm text-texto-2">Modo demonstração: os dados ficam salvos apenas neste aparelho.</p>}
  </>);
}

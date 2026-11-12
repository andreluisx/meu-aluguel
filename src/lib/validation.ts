import { z } from "zod";
import { chaveValida, type TipoChave } from "./pix";
import { senhaAceita } from "./password";
import { TIPOS } from "./constants";

const email = z.string().trim().email("Digite um e-mail válido, como nome@email.com.");
export const loginSchema = z.object({ email, senha: z.string().min(1, "Digite sua senha.") });
export const cadastroSchema = z.object({
  nome: z.string().trim().min(2, "Escreva seu nome."),
  email,
  senha: z.string().refine(senhaAceita, "Use pelo menos 8 caracteres, com letras e números."),
  aceite: z.literal(true, { errorMap: () => ({ message: "Para continuar, aceite os termos." }) }),
});
export const recuperarSchema = z.object({ email });

export function firstErrors(schema: z.ZodTypeAny, data: unknown): Record<string, string> {
  const r = schema.safeParse(data);
  if (r.success) return {};
  const out: Record<string, string> = {};
  for (const i of r.error.issues) { const k = String(i.path[0] ?? ""); if (k && !out[k]) out[k] = i.message; }
  return out;
}
export const parseValor = (s: string) => { const n = parseFloat(s.replace(/\./g, "").replace(",", ".")); return Number.isFinite(n) ? n : 0; };
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const dig = (s: string) => s.replace(/\D/g, "");
const iso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.");
const opt = (f: (s: string) => boolean, m: string) => z.string().trim().default("").refine((v) => !v || f(v), m);
export const validCpf = (s: string) => {
  const c = dig(s); if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const calc = (n: number) => { let t = 0; for (let i = 0; i < n; i++) t += +c[i] * (n + 1 - i); const r = (t * 10) % 11; return r === 10 ? 0 : r; };
  return calc(9) === +c[9] && calc(10) === +c[10];
};
const valor = z.string().refine((v) => parseValor(v) > 0, "Informe o valor do aluguel.");
const tel = opt((v) => dig(v).length >= 10, "Telefone incompleto.");
export const imovelSchema = z.object({
  nome: z.string().trim().min(2, "Dê um nome ao imóvel."), tipo: z.enum(TIPOS), valor,
  cep: opt((v) => dig(v).length === 8, "CEP incompleto."),
  endereco: z.string().trim().max(200).default(""), cidade: z.string().trim().max(100).default(""), estado: z.string().max(2).default(""),
});
export const inquilinoSchema = z.object({
  nome: z.string().trim().min(2, "Escreva o nome do inquilino."), cpf: opt(validCpf, "CPF inválido."),
  whatsapp: tel, telefone: tel, email: opt((v) => /^\S+@\S+\.\S+$/.test(v), "Digite um e-mail válido."),
});
const pct = z.string().default("").refine((v) => !v || (parseValor(v) >= 0 && parseValor(v) <= 100), "Percentual inválido.");
export const contratoSchema = z.object({
  property_id: z.string().uuid("Escolha o imóvel."), tenant_id: z.string().uuid("Escolha o inquilino."), valor,
  dia: z.coerce.number().int().min(1, "Escolha o dia.").max(31), inicio: iso, multa: pct, juros: pct,
  fim: z.string().default("").refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida."),
}).refine((d) => !d.fim || d.fim >= d.inicio, { path: ["fim"], message: "O término precisa ser depois do início." });
export const pagamentoSchema = z.object({
  charge_id: z.string().uuid(), valor: z.string().refine((v) => parseValor(v) > 0, "Informe o valor recebido."), pago_em: iso,
  forma: z.enum(["pix", "dinheiro", "transferencia", "boleto", "outro"]),
});
export const onboardingSchema = z.object({
  nome: z.string().trim().min(2), imovel: z.string().trim().min(2), tipo: z.enum(TIPOS), valor, inquilino: z.string().trim().min(2),
  zap: z.string().default(""), inicio: iso, fim: z.string().default(""), dia: z.coerce.number().int().min(1).max(31),
});
export const despesaSchema = z.object({
  property_id: z.string().uuid("Escolha o imóvel."), categoria: z.enum(["manutencao", "reforma", "impostos", "agua", "energia", "condominio", "seguro", "outros"]),
  descricao: z.string().trim().min(2, "Descreva a despesa."), valor: z.string().refine((v) => parseValor(v) > 0, "Informe o valor."), data: iso,
  forma: z.string().default(""),
});
const motivo = z.string().trim().min(3, "Escreva o motivo.");
export const ajusteSchema = z.object({ charge_id: z.string().uuid(), valor: z.string().refine((v) => parseValor(v) > 0, "Informe o valor."), motivo });
export const vencimentoSchema = z.object({ charge_id: z.string().uuid(), vencimento: iso });
export const cancelamentoSchema = z.object({ charge_id: z.string().uuid(), motivo });
export const contratoEdicaoSchema = z.object({ id: z.string().uuid(), valor, multa: pct, juros: pct, dia: z.coerce.number().int().min(1).max(31), fim: z.string().default("").refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida.") });
export const pixSchema = z.object({
  tipo: z.enum(["cpf", "telefone", "email", "aleatoria"]),
  chave: z.string().trim().min(1, "Informe a chave."),
  nome: z.string().trim().min(2, "Escreva seu nome.").max(25, "Use no máximo 25 letras."),
  cidade: z.string().trim().min(2, "Escreva sua cidade.").max(15, "Use no máximo 15 letras."),
}).superRefine((d, ctx) => { if (!chaveValida(d.tipo as TipoChave, d.chave)) ctx.addIssue({ code: "custom", path: ["chave"], message: "Essa chave não parece válida para o tipo escolhido." }); });
export const avisoSchema = z.object({ charge_id: z.string().uuid(), valor: z.string().refine((v) => parseValor(v) > 0, "Informe o valor."), pago_em: iso });

export const CHARGE_SELECT = "id,competencia,vencimento,valor_original_centavos,ajuste_centavos,ajuste_motivo,encargos_centavos,motivo_cancelamento,status,leases(multa_percentual,juros_mensal_percentual,properties(nome),tenants(nome,whatsapp,telefone)),payments(id,valor_centavos,pago_em,forma,observacao),documents(id,tipo,nome_arquivo)";
export type ChargeRow = {
  id: string; competencia: string; vencimento: string; valor_original_centavos: number; ajuste_centavos: number; ajuste_motivo: string | null; encargos_centavos: number; motivo_cancelamento: string | null; status: string;
  leases: { multa_percentual: number; juros_mensal_percentual: number; properties: { nome: string } | null; tenants: { nome: string; whatsapp: string | null; telefone: string | null } | null } | null;
  payments: { id: string; valor_centavos: number; pago_em: string; forma: string; observacao: string | null }[];
  documents?: { id: string; tipo: string; nome_arquivo: string }[];
};
export const asCharges = (d: unknown) => (d ?? []) as ChargeRow[];
// Valor devido = original − desconto (ou + acréscimo) + multa/juros que o dono aplicou.
export const devido = (c: ChargeRow) => c.valor_original_centavos - c.ajuste_centavos + c.encargos_centavos;
export const pago = (c: ChargeRow) => c.payments.reduce((s, p) => s + p.valor_centavos, 0);
export const saldo = (c: ChargeRow) => Math.max(devido(c) - pago(c), 0);
// Base para calcular multa/juros: o que falta pagar do aluguel, sem contar encargos já aplicados.
export const saldoBase = (c: ChargeRow) => Math.max(c.valor_original_centavos - c.ajuste_centavos - pago(c), 0);
export type Situacao = "pago" | "aguardando" | "atrasado" | "parcial" | "cancelado";
export function situacao(c: ChargeRow, hoje: string): Situacao {
  if (c.status === "cancelado") return "cancelado";
  if (saldo(c) === 0) return "pago";
  if (c.vencimento < hoje) return "atrasado";
  return pago(c) > 0 ? "parcial" : "aguardando";
}

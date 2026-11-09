// Contrato que qualquer provedor de pagamento deve cumprir. O resto do sistema só conhece esta interface.
export type Resultado<T> = { ok: true; dados: T } | { ok: false; codigo: "nao_configurado" | "recusado" | "indisponivel"; mensagem: string };
export type CobrancaCriada = { referencia: string; link?: string; pixCopiaECola?: string };
export interface PaymentProvider {
  id: "manual" | "mercadopago";
  disponivel(): boolean;
  // Cria o pedido de pagamento de UM aluguel, na conta do PRÓPRIO proprietário (nunca numa conta única da plataforma).
  criarCobranca(i: { chargeId: string; valorCentavos: number; descricao: string; vencimento: string }): Promise<Resultado<CobrancaCriada>>;
}

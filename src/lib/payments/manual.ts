import type { PaymentProvider } from "./types";
// Modo atual: o proprietário registra os pagamentos recebidos fora da plataforma.
export const manual: PaymentProvider = {
  id: "manual", disponivel: () => true,
  async criarCobranca() { return { ok: false, codigo: "nao_configurado", mensagem: "No modo manual, registre o pagamento quando receber." }; },
};

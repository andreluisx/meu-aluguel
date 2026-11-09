import { createHmac, timingSafeEqual } from "crypto";
import type { PaymentProvider } from "./types";

// NÃO ATIVO: só funciona quando as credenciais existirem. Sem elas responde "nao_configurado", sem quebrar nada.
export const mercadopago: PaymentProvider = {
  id: "mercadopago",
  disponivel: () => Boolean(process.env.MERCADOPAGO_CLIENT_ID && process.env.MERCADOPAGO_CLIENT_SECRET),
  async criarCobranca() { return { ok: false, codigo: "nao_configurado", mensagem: "Pagamento automático ainda não está configurado." }; },
};

// Valida a assinatura (x-signature) das notificações do Mercado Pago com o segredo do webhook.
export function assinaturaValida(h: Headers, dataId: string, segredo: string) {
  const partes = Object.fromEntries((h.get("x-signature") ?? "").split(",").map((p) => p.trim().split("=") as [string, string]));
  if (!partes.ts || !partes.v1) return false;
  const manifesto = `id:${dataId.toLowerCase()};request-id:${h.get("x-request-id") ?? ""};ts:${partes.ts};`;
  const a = Buffer.from(createHmac("sha256", segredo).update(manifesto).digest("hex")), b = Buffer.from(partes.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

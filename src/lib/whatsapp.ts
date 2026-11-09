import { type ChargeRow, type Situacao, pago, saldo } from "./charges";
import { fmtData, mesRef } from "./dates";
import { fmtCentavos } from "./money";

// Primeira versão: abre o WhatsApp com a mensagem pronta. NÃO envia nada sozinho; quem envia é o proprietário.
export function waNumero(raw?: string | null) {
  const d = (raw ?? "").replace(/\D/g, "");
  if (d.length < 10) return null;
  return d.startsWith("55") && d.length >= 12 ? d : `55${d}`;
}
export type Cobranca = { rotulo: string; link: string | null };

export function cobranca(c: ChargeRow, s: Situacao, hoje: string): Cobranca | null {
  if (s === "cancelado") return null;
  const t = c.leases?.tenants; const nome = (t?.nome ?? "").split(" ")[0] || "tudo bem";
  const imovel = c.leases?.properties?.nome ?? "alugado"; const mes = mesRef(c.competencia);
  let rotulo: string, texto: string;
  if (s === "pago") {
    rotulo = "Enviar confirmação";
    texto = `Olá, ${nome}! Recebi o pagamento do aluguel de ${mes} (${imovel}), no valor de ${fmtCentavos(pago(c))}. Muito obrigado!`;
  } else if (s === "atrasado") {
    rotulo = "Cobrar pelo WhatsApp";
    texto = `Olá, ${nome}. O aluguel de ${mes} do imóvel ${imovel}, que venceu em ${fmtData(c.vencimento)}, está em aberto (${fmtCentavos(saldo(c))}). Pode me avisar quando for efetuar o pagamento? Obrigado.`;
  } else if (c.vencimento === hoje) {
    rotulo = "Lembrar pelo WhatsApp";
    texto = `Olá, ${nome}! Hoje vence o aluguel de ${mes} do imóvel ${imovel}: ${fmtCentavos(saldo(c))}. Se já pagou, desconsidere esta mensagem. Obrigado!`;
  } else {
    rotulo = "Lembrar pelo WhatsApp";
    texto = `Olá, ${nome}! Tudo bem? Passando para lembrar que o aluguel de ${mes} do imóvel ${imovel}, no valor de ${fmtCentavos(saldo(c))}, vence em ${fmtData(c.vencimento)}. Qualquer dúvida, é só me chamar. Obrigado!`;
  }
  const n = waNumero(t?.whatsapp ?? t?.telefone);
  return { rotulo, link: n ? `https://wa.me/${n}?text=${encodeURIComponent(texto)}` : null };
}

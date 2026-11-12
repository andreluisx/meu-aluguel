// Pix "copia e cola" ESTÁTICO (padrão BR Code do Banco Central). O dinheiro vai direto para a chave do dono, em qualquer banco.
export type TipoChave = "cpf" | "telefone" | "email" | "aleatoria";
const dig = (s: string) => s.replace(/\D/g, "");

function cpfValido(s: string) {
  const c = dig(s); if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const calc = (n: number) => { let t = 0; for (let i = 0; i < n; i++) t += +c[i] * (n + 1 - i); const r = (t * 10) % 11; return r === 10 ? 0 : r; };
  return calc(9) === +c[9] && calc(10) === +c[10];
}
export function normalizarChave(tipo: TipoChave, v: string) {
  const t = v.trim();
  if (tipo === "cpf") return dig(t);
  if (tipo === "telefone") { const d = dig(t); return d.startsWith("55") && d.length >= 12 ? `+${d}` : `+55${d}`; }
  return t.toLowerCase();
}
export function chaveValida(tipo: TipoChave, v: string) {
  const k = normalizarChave(tipo, v);
  if (tipo === "cpf") return cpfValido(k);
  if (tipo === "telefone") return /^\+55\d{10,11}$/.test(k);
  if (tipo === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(k) && k.length <= 77;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(k);
}
const tlv = (id: string, valor: string) => `${id}${String(valor.length).padStart(2, "0")}${valor}`;
function crc16(s: string) {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) { crc ^= s.charCodeAt(i) << 8; for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff; }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
const limpo = (s: string, max: number) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "").trim().toUpperCase().slice(0, max) || "NA";

export function gerarPix({ chave, valorCentavos, nome, cidade, txid }: { chave: string; valorCentavos: number; nome: string; cidade: string; txid?: string }) {
  const conta = tlv("00", "br.gov.bcb.pix") + tlv("01", chave);
  const id = (txid ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const corpo = tlv("00", "01") + tlv("26", conta) + tlv("52", "0000") + tlv("53", "986") + (valorCentavos > 0 ? tlv("54", (valorCentavos / 100).toFixed(2)) : "")
    + tlv("58", "BR") + tlv("59", limpo(nome, 25)) + tlv("60", limpo(cidade, 15)) + tlv("62", tlv("05", id)) + "6304";
  return corpo + crc16(corpo);
}

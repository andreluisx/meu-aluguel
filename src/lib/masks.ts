const d = (s: string) => s.replace(/\D/g, "");
export const masks = {
  telefone(s: string) {
    const x = d(s).slice(0, 11);
    if (!x) return "";
    if (x.length <= 2) return `(${x}`;
    if (x.length <= 6) return `(${x.slice(0, 2)}) ${x.slice(2)}`;
    if (x.length <= 10) return `(${x.slice(0, 2)}) ${x.slice(2, 6)}-${x.slice(6)}`;
    return `(${x.slice(0, 2)}) ${x.slice(2, 7)}-${x.slice(7)}`;
  },
  cpf(s: string) {
    const x = d(s).slice(0, 11); let o = x.slice(0, 3);
    if (x.length > 3) o += "." + x.slice(3, 6);
    if (x.length > 6) o += "." + x.slice(6, 9);
    if (x.length > 9) o += "-" + x.slice(9);
    return o;
  },
  percentual(s: string) { const x = d(s).replace(/^0+/, "").slice(0, 4); if (!x) return ""; const n = x.padStart(3, "0"); return `${n.slice(0, -2)},${n.slice(-2)}`; },
  cep(s: string) { const x = d(s).slice(0, 8); return x.length > 5 ? `${x.slice(0, 5)}-${x.slice(5)}` : x; },
  moeda(s: string) {
    const x = d(s).replace(/^0+/, ""); if (!x) return "";
    const n = x.padStart(3, "0");
    return `${n.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${n.slice(-2)}`;
  },
};
export type MaskName = keyof typeof masks;
export const maskInfo: Record<MaskName, { max: number; placeholder: string; mode: "tel" | "numeric" }> = {
  telefone: { max: 15, placeholder: "(11) 90000-0000", mode: "tel" },
  cpf: { max: 14, placeholder: "000.000.000-00", mode: "numeric" },
  cep: { max: 9, placeholder: "00000-000", mode: "numeric" },
  percentual: { max: 6, placeholder: "2,00", mode: "numeric" },
  moeda: { max: 14, placeholder: "0,00", mode: "numeric" },
};

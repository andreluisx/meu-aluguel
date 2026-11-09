import { brl, parseValor } from "./validation";
export const toCentavos = (s: string) => Math.round(parseValor(s) * 100);
export const fmtCentavos = (c: number) => brl(c / 100);
export const inputMoney = (c: number) => (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Datas como texto AAAA-MM-DD no fuso de São Paulo (evita erros de fuso horário).
export const hojeBR = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
export const inicioMes = (iso: string) => iso.slice(0, 8) + "01";
export const fimMes = (iso: string) => { const [y, m] = iso.split("-").map(Number); return `${iso.slice(0, 8)}${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`; };
export const fmtData = (iso?: string | null) => (iso ? iso.split("-").reverse().join("/") : "");
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
export const mesRef = (iso: string) => `${MESES[Number(iso.slice(5, 7)) - 1]} de ${iso.slice(0, 4)}`;
const utc = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
export const addDias = (iso: string, n: number) => new Date(utc(iso) + n * 86400000).toISOString().slice(0, 10);
export const diasEntre = (a: string, b: string) => Math.round((utc(b) - utc(a)) / 86400000);
const CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const mesCurto = (ym: string) => `${CURTOS[+ym.slice(5, 7) - 1]}/${ym.slice(2, 4)}`;
export const saudacao = () => { const h = +new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "numeric", hour12: false }); return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; };
export const dataExtensa = () => new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "numeric", month: "long" });
// Próximo vencimento a partir de hoje para um contrato com dia fixo (mês curto: último dia do mês).
export function proximoVencimento(dia: number, hoje: string) {
  const [y, m] = hoje.split("-").map(Number);
  const mk = (yy: number, mm: number) => `${yy}-${String(mm).padStart(2, "0")}-${String(Math.min(dia, new Date(Date.UTC(yy, mm, 0)).getUTCDate())).padStart(2, "0")}`;
  const a = mk(y, m); return a >= hoje ? a : m === 12 ? mk(y + 1, 1) : mk(y, m + 1);
}
export const quandoVence = (hoje: string, venc: string) => { const d = diasEntre(hoje, venc); return d < -1 ? `venceu há ${-d} dias` : d === -1 ? "venceu ontem" : d === 0 ? "vence hoje" : d === 1 ? "vence amanhã" : `vence em ${d} dias`; };

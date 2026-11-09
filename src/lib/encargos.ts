const dias = (a: string, b: string) => Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 86400000);

// Multa única (% do que falta pagar) + juros simples proporcionais por dia (% ao mês ÷ 30). Só estimativa: quem aplica é o dono.
export function calcularEncargos({ base, vencimento, hoje, multa, juros }: { base: number; vencimento: string; hoje: string; multa: number; juros: number }) {
  const d = dias(vencimento, hoje);
  if (d <= 0 || base <= 0 || (!multa && !juros)) return { multa: 0, juros: 0, total: 0, dias: Math.max(d, 0) };
  const m = Math.round((base * multa) / 100), j = Math.round(((base * juros) / 100 / 30) * d);
  return { multa: m, juros: j, total: m + j, dias: d };
}

// Valores iniciais de referência. Futuramente editáveis pelo administrador (tabela no banco).
// IMPORTANTE: o limite de imóveis deve ser SEMPRE validado no backend.
export const plans = [
  { id: "inicial", nome: "Inicial", precoCentavos: 1990, limiteImoveis: 3, destaque: false },
  { id: "profissional", nome: "Profissional", precoCentavos: 3990, limiteImoveis: 15, destaque: true },
  { id: "avancado", nome: "Avançado", precoCentavos: 6990, limiteImoveis: 40, destaque: false },
] as const;

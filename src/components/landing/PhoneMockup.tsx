import { BarChart3, Building2, FileText, Home, MoreHorizontal } from "lucide-react";

const itens: [string, string, string, string][] = [
  ["Casa Jardim", "Vence dia 10", "✓ Pago", "bg-verde-suave text-[#27623F]"],
  ["Apto 302", "Pagou R$ 600 de R$ 1.000", "◐ Parcial", "bg-[#FCEFD0] text-[#7A5410]"],
  ["Sala 12", "Venceu dia 5", "! Atrasado", "bg-[#F8E3E0] text-[#9C3A31]"],
];
const tabs = [[Home, "Início"], [Building2, "Imóveis"], [FileText, "Aluguéis"], [BarChart3, "Financeiro"], [MoreHorizontal, "Mais"]] as const;

export function PhoneMockup() {
  return (
    <div role="img" aria-label="Tela inicial do aplicativo Meu Aluguel, com exemplo de valores recebidos e vencimentos"
      className="relative mx-auto w-[292px] max-w-full rounded-[50px] bg-gradient-to-br from-[#5a625c] via-[#1b211d] to-[#3b433e] p-[9px] shadow-[0_30px_60px_rgba(49,84,66,.32),inset_0_0_0_1.5px_#727b74]">
      {[92, 136, 180].map((t) => <span key={t} className="absolute -left-[3px] h-6 w-[3px] rounded-l-sm bg-[#3b433e]" style={{ top: t }} />)}
      <span className="absolute -right-[3px] top-[150px] h-16 w-[3px] rounded-r-sm bg-[#3b433e]" />
      <div className="relative overflow-hidden rounded-[41px] bg-fundo">
        <span className="absolute left-1/2 top-2.5 h-[25px] w-[86px] -translate-x-1/2 rounded-2xl bg-[#050806]" />
        <div className="flex h-11 items-center justify-between px-[26px] pt-3 text-[.82rem] font-extrabold"><span>9:41</span><span aria-hidden>●●● ▮</span></div>
        <div className="px-3.5 pt-1">
          <div className="mb-2.5 flex items-center justify-between"><div><small className="text-xs font-semibold text-texto-2">Exemplo ilustrativo</small><b className="block text-[1.05rem] font-extrabold leading-tight">Bom dia, Marta</b></div><span className="grid size-9 place-items-center rounded-full bg-verde-2 font-extrabold text-white">M</span></div>
          <div className="mb-2.5 rounded-2xl border border-borda bg-white p-3.5">
            <small className="text-[.85rem] font-semibold leading-tight text-texto-2">Aluguéis recebidos neste mês</small>
            <b className="block text-[1.55rem] font-extrabold leading-tight tabular-nums">R$ 3.600,00</b>
            <div className="my-2 h-2.5 overflow-hidden rounded-full bg-verde-suave"><i className="block h-full w-3/4 bg-verde-claro" /></div>
            <small className="text-[.85rem] font-semibold text-texto-2">Ainda falta receber R$ 1.250,00</small>
          </div>
          <div className="rounded-2xl border border-borda bg-white px-3.5 py-1">
            {itens.map(([n, s, b, c]) => (
              <div key={n} className="flex items-center justify-between gap-2 border-t border-borda py-2.5 text-[.9rem] leading-tight first:border-0"><span><b>{n}</b><br />{s}</span><span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[.78rem] font-bold ${c}`}>{b}</span></div>
            ))}
          </div>
        </div>
        <div className="mt-1 flex justify-around border-t border-borda bg-white px-1.5 pb-1 pt-2">
          {tabs.map(([Icon, t], i) => <span key={t} className={`flex min-w-12 flex-col items-center gap-0.5 rounded-[10px] py-1 text-[.62rem] font-bold ${i === 0 ? "bg-verde-suave text-[#27623F]" : "text-texto-2"}`}><Icon size={20} aria-hidden />{t}</span>)}
        </div>
        <div className="mx-auto mb-2 mt-1.5 h-[5px] w-[100px] rounded-full bg-texto/80" />
      </div>
    </div>
  );
}

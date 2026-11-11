import { type ChargeRow, saldo } from "@/lib/charges";
import { fmtCentavos } from "@/lib/money";
import { Avatar } from "./Avatar";
import { ChargeItem } from "./ChargeItem";

// Agrupa os aluguéis por inquilino: cada pessoa tem seu cabeçalho e seus cartões, com recuo e linha lateral.
export function ChargeGroups({ lista, hoje }: { lista: ChargeRow[]; hoje: string }) {
  const grupos = new Map<string, ChargeRow[]>();
  for (const c of lista) { const k = c.leases?.tenants?.nome ?? "Sem inquilino"; grupos.set(k, [...(grupos.get(k) ?? []), c]); }
  return (
    <div className="grid gap-6">
      {[...grupos.entries()].map(([nome, cs]) => {
        const imoveis = [...new Set(cs.map((c) => c.leases?.properties?.nome).filter(Boolean))]; const falta = cs.reduce((s, c) => s + saldo(c), 0);
        return (
          <section key={nome} aria-label={`Aluguéis de ${nome}`}>
            <header className="mb-3 flex items-center gap-3 rounded-2xl bg-verde-suave px-3 py-2.5">
              <Avatar nome={nome} size={44} />
              <div className="min-w-0 flex-1"><h3 className="truncate text-lg font-extrabold">{nome}</h3><p className="truncate text-[.95rem] text-texto-2">{imoveis.join(" · ")}</p></div>
              {falta > 0 && <div className="flex-none text-right"><span className="block text-[.8rem] font-semibold text-texto-2">Falta</span><b className="tabular-nums">{fmtCentavos(falta)}</b></div>}
            </header>
            <div className="ml-4 grid gap-3 border-l-4 border-verde-suave pl-3 sm:ml-6 sm:pl-4">{cs.map((c) => <ChargeItem key={c.id} c={c} hoje={hoje} acoes mostrarInquilino={false} />)}</div>
          </section>
        );
      })}
    </div>
  );
}

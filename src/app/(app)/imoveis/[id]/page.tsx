import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { encerrarContrato, excluirImovel } from "@/app/actions";
import { ChargeItem } from "@/components/app/ChargeItem";
import { Documentos } from "@/components/app/Documentos";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { Card, PageHeader } from "@/components/app/ui";
import { ButtonLink } from "@/components/ui/Button";
import { CHARGE_SELECT, asCharges } from "@/lib/charges";
import { fmtData, hojeBR } from "@/lib/dates";
import { fmtCentavos } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Imóvel" };
type Prop = { id: string; nome: string; tipo: string; endereco: string | null; cidade: string | null; estado: string | null; valor_aluguel_centavos: number;
  leases: { id: string; status: string; valor_centavos: number; dia_vencimento: number; data_inicio: string; data_fim: string | null; tenants: { nome: string } | null }[] };
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> }) {
  const { id } = await params; const { erro } = await searchParams; const sb = await createClient();
  const { data } = await sb.from("properties").select("*,leases(id,status,valor_centavos,dia_vencimento,data_inicio,data_fim,tenants(nome))").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as unknown as Prop; const l = p.leases.find((x) => x.status === "ativo");
  const { data: ch } = l ? await sb.from("rent_charges").select(CHARGE_SELECT).eq("lease_id", l.id).order("vencimento", { ascending: false }).limit(12) : { data: [] };
  const hoje = hojeBR(); const end = [p.endereco, p.cidade, p.estado].filter(Boolean).join(", ");
  return (<>
    <PageHeader titulo={p.nome} sub={`${p.tipo}${end ? " · " + end : ""}`} href={`/imoveis/${p.id}/editar`} cta="Editar imóvel" />
    {erro === "contratos" && <p role="alert" className="mb-4 rounded-xl bg-[#F8E3E0] p-3 font-bold text-erro-texto">! Este imóvel tem contratos no histórico e não pode ser excluído. Encerre o contrato para parar de gerar aluguéis.</p>}
    <div className="mb-6 grid gap-3 md:grid-cols-2">
      <Card><p className="text-texto-2">Valor do aluguel</p><p className="text-2xl font-extrabold tabular-nums">{fmtCentavos(p.valor_aluguel_centavos)}</p></Card>
      <Card>{l ? <><p className="text-texto-2">Inquilino atual</p><p className="text-xl font-extrabold">{l.tenants?.nome}</p><p className="mb-3 text-texto-2">Vence todo dia {l.dia_vencimento} · desde {fmtData(l.data_inicio)}{l.data_fim ? ` até ${fmtData(l.data_fim)}` : ""}</p>
        <ConfirmAction action={encerrarContrato} id={l.id} rotulo="Encerrar contrato" aviso="Os aluguéis futuros sem pagamento serão cancelados. O histórico continua guardado." confirmar="Sim, encerrar contrato" /></>
        : <><p className="mb-3 font-bold">Este imóvel está disponível.</p><ButtonLink href="/contratos/novo">Criar contrato</ButtonLink></>}</Card>
    </div>
    {l && <><h2 className="mb-3 text-xl font-extrabold">Histórico de aluguéis</h2><div className="grid gap-3">{asCharges(ch).map((c) => <ChargeItem key={c.id} c={c} hoje={hoje} acoes mostrarInquilino={false} />)}</div></>}
    <Documentos propertyId={p.id} />
    {!l && !p.leases.length && <div className="mt-8"><ConfirmAction action={excluirImovel} id={p.id} rotulo="Excluir imóvel" aviso="Tem certeza? O imóvel e as despesas ligadas a ele serão apagados. Isso não pode ser desfeito." confirmar="Sim, excluir imóvel" /></div>}
  </>);
}

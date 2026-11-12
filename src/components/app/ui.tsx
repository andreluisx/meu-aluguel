import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Ban,
  Banknote,
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  CircleDot,
  Clock,
  CreditCard,
  FileText,
  Home,
  House,
  KeyRound,
  Pencil,
  PiggyBank,
  Plus,
  Printer,
  Receipt,
  Search,
  Trash2,
  User,
  Users,
  Wallet,
  Scale,
  QrCode,
  Settings
} from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icone } from "@/components/ui/Icone";
import type { Situacao } from "@/lib/charges";

export const ICONES = {
  casa: Home,
  imoveis: Building2,
  inquilinos: Users,
  contratos: FileText,
  alugueis: Receipt,
  financeiro: BarChart3,
  despesas: Wallet,
  alerta: AlertTriangle,
  ok: CheckCircle2,
  relogio: Clock,
  dinheiro: Banknote,
  calendario: CalendarClock,
  imprimir: Printer,
  chave: KeyRound,
  cofre: PiggyBank,
  mais: Plus,

  // Ícones adicionais
  check: CheckCircle2,
  checkCircle: CheckCircle2,
  horario: Clock,
  erro: AlertTriangle,
  aviso: AlertTriangle,
  entrada: ArrowUpCircle,
  saida: ArrowDownCircle,
  setaCima: ArrowUpCircle,
  setaBaixo: ArrowDownCircle,
  documento: FileText,
  arquivo: FileText,
  notificacao: Bell,
  editar: Pencil,
  excluir: Trash2,
  buscar: Search,
  usuario: User,
  dinheiroEntrada: CircleDollarSign,
  dinheiroSaida: Wallet,
  pagamento: CreditCard,
  pendente: CalendarClock,
  casaVazia: House,
  escala: Scale,
  configuracoes: Settings,
  pix: QrCode,
} as const;

export type Icone = keyof typeof ICONES;
export type Tom = "ok" | "err" | "warn" | "neutral";

// Cores com significado fixo em todo o sistema:
// verde = bom/recebido · amarelo = atenção/a vencer · vermelho = atrasado/problema.
const TONS: Record<Tom, { caixa: string; icone: string; valor: string }> = {
  ok: {
    caixa: "border-[#B9D6C2] bg-[#EEF5EF] text-[#1F4D33]",
    icone: "bg-[#27623F] text-white",
    valor: "text-[#27623F]",
  },
  err: {
    caixa: "border-[#E7B7B0] bg-[#FBEDEA] text-[#7F2F27]",
    icone: "bg-[#B2473E] text-white",
    valor: "text-erro-texto",
  },
  warn: {
    caixa: "border-[#EFD28F] bg-[#FDF5DF] text-[#6B4A0E]",
    icone: "bg-[#C8952F] text-white",
    valor: "text-[#8A5A0C]",
  },
  neutral: {
    caixa: "border-borda bg-white text-texto",
    icone: "bg-verde-suave text-verde",
    valor: "",
  },
};

export function PageHeader({
  titulo,
  sub,
  href,
  cta,
  icone,
}: {
  titulo: string;
  sub?: string;
  href?: string;
  cta?: string;
  icone?: Icone;
}) {
  const I = icone ? ICONES[icone] : null;

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {I && (
          <span className="grid size-12 flex-none place-items-center rounded-2xl bg-verde text-white">
            <I size={26} aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="break-words text-[1.9rem] font-extrabold leading-tight">{titulo}</h1>
          {sub && <p className="text-texto-2">{sub}</p>}
        </div>
      </div>
      {href && cta && (
        <ButtonLink href={href}>{cta}</ButtonLink>
      )}
    </div>
  );
}

export function Titulo({
  icone,
  children,
}: {
  icone: Icone;
  children: ReactNode;
}) {
  const I = ICONES[icone];

  return (
    <h2 className="mb-3 mt-8 flex items-center gap-2 text-xl font-extrabold">
      <I size={24} className="text-verde" aria-hidden />
      {children}
    </h2>
  );
}

export function EmptyState({
  titulo,
  texto,
  href,
  cta,
  icone = "casa",
}: {
  titulo: string;
  texto: string;
  href: string;
  cta: string;
  icone?: Icone;
}) {
  const I = ICONES[icone];

  return (
    <div className="rounded-[18px] border border-borda bg-white p-8 text-center">
      <span className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-verde-suave text-verde">
        <I size={32} aria-hidden />
      </span>
      <h2 className="mb-2 text-2xl font-extrabold">{titulo}</h2>
      <p className="mx-auto mb-5 max-w-[44ch] text-texto-2">{texto}</p>
      <ButtonLink href={href}>{cta}</ButtonLink>
    </div>
  );
}

export const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`min-w-0 [overflow-wrap:anywhere] rounded-[18px] border border-borda bg-white p-5 shadow-sm ${className}`}
  >
    {children}
  </div>
);

export function Stat({
  label,
  value,
  tone = "neutral",
  icone,
  sub,
}: {
  label: string;
  value: string;
  tone?: Tom;
  icone?: Icone;
  sub?: string;
}) {
  // Proteção adicional: evita que um valor inválido recebido em tempo de
  // execução derrube a página. O padrão visual será o tom neutro.
  const t = TONS[tone] ?? TONS.neutral;
  const I = icone ? ICONES[icone] : null;

  return (
    <Card>
      <div className="flex items-start gap-3">
        {I && (
          <span
            className={`grid size-11 flex-none place-items-center rounded-xl ${t.icone}`}
          >
            <I size={22} aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[.95rem] font-semibold leading-tight text-texto-2">
            {label}
          </p>
          <p
            className={`mt-1 text-[1.5rem] font-extrabold leading-tight tabular-nums ${t.valor}`}
          >
            {value}
          </p>
          {sub && <p className="mt-0.5 text-[.9rem] text-texto-2">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

// Aviso grande e colorido para o que mais importa na tela.
export function Alerta({
  tom,
  icone,
  titulo,
  destaque,
  children,
  href,
  cta,
}: {
  tom: Tom;
  icone: Icone;
  titulo: string;
  destaque?: string;
  children?: ReactNode;
  href?: string;
  cta?: string;
}) {
  const t = TONS[tom] ?? TONS.neutral;
  const I = ICONES[icone];

  return (
    <section className={`mb-5 rounded-[18px] border-2 p-5 ${t.caixa}`}>
      <div className="flex items-start gap-3">
        <span
          className={`grid size-12 flex-none place-items-center rounded-full ${t.icone}`}
        >
          <I size={26} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold leading-tight">{titulo}</h2>
          {destaque && (
            <p className="mt-1 text-[2rem] font-extrabold leading-tight tabular-nums">
              {destaque}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className="mt-3 rounded-xl bg-white px-4 text-texto">{children}</div>
      )}
      {href && cta && (
        <Link
          href={href}
          className="mt-3 inline-flex min-h-12 items-center rounded-xl border-2 border-current px-4 font-bold"
        >
          {cta} →
        </Link>
      )}
    </section>
  );
}

export function Atalho({
  href,
  icone,
  titulo,
}: {
  href: string;
  icone: Icone;
  titulo: string;
}) {
  const I = ICONES[icone];

  return (
    <Link
      href={href}
      className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-[18px] border border-borda bg-white p-3 text-center font-bold shadow-sm hover:border-verde-2"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-verde-suave text-verde">
        <I size={24} aria-hidden />
      </span>
      {titulo}
    </Link>
  );
}

const badges: Record<Situacao, [string, string, typeof Clock]> = {
  pago: ["Pago", "bg-verde-suave text-[#27623F]", CheckCircle2],
  aguardando: ["Aguardando", "bg-[#ECE9DC] text-texto", Clock],
  atrasado: ["Atrasado", "bg-[#F8E3E0] text-[#9C3A31]", AlertTriangle],
  parcial: ["Parcial", "bg-[#FCEFD0] text-[#7A5410]", CircleDot],
  cancelado: ["Cancelado", "bg-[#ECE9DC] text-texto-2", Ban],
};

export function StatusBadge({ s }: { s: Situacao }) {
  const [t, c, I] = badges[s];

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-0.5 text-[.9rem] font-bold ${c}`}
    >
      <I size={16} aria-hidden />
      {t}
    </span>
  );
}

export const LinkRow = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Link
    href={href}
    className="block min-w-0 [overflow-wrap:anywhere] rounded-[18px] border border-borda bg-white p-5 shadow-sm hover:border-verde-2"
  >
    {children}
  </Link>
);

// Abas lado a lado, ocupando a largura toda (boas para o celular).
export function Segmentado({
  itens,
}: {
  itens: { href: string; rotulo: string; ativo: boolean }[];
}) {
  return (
    <nav
      className="mb-5 grid gap-1 rounded-2xl bg-verde-suave p-1"
      style={{
        gridTemplateColumns: `repeat(${itens.length}, minmax(0, 1fr))`,
      }}
    >
      {itens.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={i.ativo ? "page" : undefined}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-center font-bold ${
            i.ativo ? "bg-verde text-white shadow-sm" : "text-texto"
          }`}
        >
          <Icone texto={i.rotulo} size={18} />
          {i.rotulo}
        </Link>
      ))}
    </nav>
  );
}

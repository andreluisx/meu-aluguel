import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Archive, ArrowLeft, ArrowRight, Ban, Banknote, CalendarDays, Check, CheckCircle2, Clock, Download, ExternalLink, Eye, EyeOff, FileText, History, KeyRound, List, Loader2, LogIn, LogOut, Pencil, Percent, Plus, Printer, RefreshCw, RotateCcw, Save, Send, SlidersHorizontal, Trash2, UserPlus, UserX, X } from "lucide-react";

// Escolhe o ícone pelo começo do texto do botão. Assim todo botão ganha ícone sem repetir código.
const REGRAS: [RegExp, LucideIcon][] = [
  [/^(Salvando|Aguarde|Enviando|Entrando|Criando|Excluindo)/i, Loader2],
  [/^(Registrar pagamento|Salvar pagamento)/i, Banknote],
  [/^Criar minha conta/i, UserPlus],
  [/^Remover acesso/i, UserX],
  [/^Liberar acesso/i, KeyRound],
  [/^(Adicionar|Novo|Nova|Criar|Anexar)(\s|$)/i, Plus],
  [/^(Editar|Trocar)(\s|$)/i, Pencil],
  [/^(Excluir|Remover|Apagar)(\s|$)/i, Trash2],
  [/^Encerrar(\s|$)/i, Archive],
  [/^Cancelar aluguel/i, Ban],
  [/^Cancelar$/i, X],
  [/^Reabrir(\s|$)/i, RotateCcw],
  [/^(Atualizar multa|Aplicar)/i, Percent],
  [/^(Pedir de novo|Não chegou|Atualizar)/i, RefreshCw],
  [/^Imprimir/i, Printer],
  [/^(Salvar|Guardar)(\s|$)/i, Save],
  [/^(Concluir|Confirmar)(\s|$)/i, Check],
  [/^(Continuar|Próximo|Começar|Quero|Ir para)(\s|$)/i, ArrowRight],
  [/^(Voltar|Anterior)(\s|$)/i, ArrowLeft],
  [/^(Entrar|Entre)(\s|$)/i, LogIn],
  [/^Sair(\s|$)/i, LogOut],
  [/^Enviar(\s|$)/i, Send],
  [/^(Baixar|Planilha)/i, Download],
  [/^Relatório/i, FileText],
  [/^Abrir(\s|$)/i, ExternalLink],
  [/^Ver(\s|$)/i, Eye],
  [/^Mais opções/i, SlidersHorizontal],
  [/^Mostrar$/i, Eye],
  [/^Esconder$/i, EyeOff],
  [/^Este mês/i, CalendarDays],
  [/^Histórico/i, History],
  [/^Ativos/i, CheckCircle2],
  [/^Pagos/i, CheckCircle2],
  [/^Todos/i, List],
  [/^Pendentes/i, Clock],
  [/^Atrasados/i, AlertTriangle],
];
export function iconeDoRotulo(texto: string): LucideIcon | null {
  const t = texto.replace(/^Sim,\s*/i, "").trim();
  for (const [r, I] of REGRAS) if (r.test(t)) return I;
  return null;
}
export function Icone({ texto, size = 20 }: { texto: unknown; size?: number }) {
  if (typeof texto !== "string") return null;
  const I = iconeDoRotulo(texto); if (!I) return null;
  return <I size={size} aria-hidden className={`flex-none ${I === Loader2 ? "animate-spin" : ""}`} />;
}

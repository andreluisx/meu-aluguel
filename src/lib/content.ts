import { BarChart3, CalendarDays, FileText, History, Home, MessageCircle, UserRound, Wallet } from "lucide-react";

export const problems = ["Não lembrar quem pagou.", "Precisar procurar comprovantes.", "Fazer cobranças manualmente, uma a uma.", "Perder informações de contratos.", "Não saber quanto recebeu no mês."];
export const solutions = ["Você vê na hora quem já pagou e quem está atrasado.", "Comprovantes ficam guardados junto de cada aluguel.", "A mensagem de cobrança já vem pronta para o WhatsApp.", "Contratos e vencimentos ficam no mesmo lugar.", "O total do mês aparece logo na primeira tela."];
export const steps = [
  { t: "Cadastre seus imóveis e inquilinos", d: "Informe o básico: nome do imóvel, valor e quem mora nele." },
  { t: "Organize aluguéis e vencimentos", d: "Crie o contrato e o dia do vencimento. Os aluguéis de cada mês aparecem sozinhos." },
  { t: "Acompanhe pagamentos e recebimentos", d: "Registre o que foi pago e veja quanto falta receber." },
];
export const features = [
  { icon: CalendarDays, t: "Controle de aluguéis", d: "Veja pagos, pendentes e atrasados, com pagamentos parciais." },
  { icon: Home, t: "Gestão de imóveis", d: "Cada imóvel tem sua página, com fotos, valores e histórico." },
  { icon: UserRound, t: "Cadastro de inquilinos", d: "Contatos e documentos de cada inquilino organizados." },
  { icon: FileText, t: "Gestão de contratos", d: "Avisos de término e de reajuste, com o PDF guardado." },
  { icon: MessageCircle, t: "Cobranças pelo WhatsApp", d: "Mensagem pronta com nome, valor e vencimento. Você confere e envia." },
  { icon: History, t: "Histórico de pagamentos", d: "Todos os pagamentos e comprovantes de cada inquilino." },
  { icon: Wallet, t: "Controle de despesas", d: "Registre manutenção, impostos e contas de cada imóvel." },
  { icon: BarChart3, t: "Relatórios financeiros", d: "Resumos claros por mês, por ano e por imóvel, em PDF ou planilha." },
];
export const benefits = [
  ["Menos preocupação", "Você sabe o que já entrou e o que falta entrar."], ["Mais controle", "Imóveis, contratos e valores em uma única tela."],
  ["Informações sempre organizadas", "Nada de procurar papel ou mensagem antiga."], ["Cobranças mais simples", "Mensagem pronta, a um toque do WhatsApp."],
  ["Fácil de acompanhar", "Feito para usar no celular, com letras grandes."],
];
export const faqs = [
  ["Preciso entender de tecnologia?", "Não. O Meu Aluguel usa palavras simples, letras grandes e botões fáceis de tocar. Se você usa WhatsApp no celular, vai se sentir em casa."],
  ["Posso cadastrar vários imóveis?", "Sim. O limite depende do plano: 3, 15 ou 40 imóveis."],
  ["Como acompanho quem já pagou?", "Na tela de aluguéis, cada um aparece como pago, pendente, atrasado ou parcialmente pago. Você registra os pagamentos recebidos e o total do mês se atualiza."],
  ["Posso enviar cobranças pelo WhatsApp?", "Sim. O sistema prepara a mensagem e abre o WhatsApp para você conferir e enviar. O envio automático não faz parte da primeira versão."],
  ["Meus dados ficam protegidos?", "Cada proprietário só enxerga os próprios dados. Tratamos as informações conforme a LGPD e mantemos o acesso restrito."],
  ["Posso cancelar minha assinatura?", "Sim. Você poderá cancelar pela área de configurações, sem precisar falar com ninguém."],
  ["O sistema realiza pagamentos automaticamente?", "Não. O Meu Aluguel organiza e acompanha seus recebimentos. Ele não movimenta dinheiro por conta própria."],
  ["Posso acessar pelo celular?", "Sim. O sistema foi pensado primeiro para o celular e também funciona bem no computador."],
];

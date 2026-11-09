# Meu Aluguel — regras do projeto

SaaS por assinatura para proprietários de imóveis no Brasil. Leia `docs/PROMPT_MESTRE.md` (requisitos completos) antes de qualquer tarefa grande.
Referência visual fiel: `reference/identidade.html` e `reference/landing.html` (abra no navegador). Reproduza em componentes React, sem copiar o HTML cru.

## Público e tom
- Principal: proprietários com mais de 50 anos, quase todos no celular. **Mobile first** de verdade, depois desktop.
- Linguagem simples e humana: "Aluguéis recebidos", "Aluguéis atrasados", "Adicionar imóvel". Nada de jargão.
- Confirmar antes de excluir/alterar. Sempre dar feedback ao concluir uma ação.

## Identidade (oficial)
- Cores em `src/styles/brand.css`: verde #315442 (ações), #426C59, claro #7CB342, suave #E5EEE6, dourado #F4B942 (destaque, **sempre com texto escuro**), creme #FAF9F3, fundo #F5F3EA, texto #303A34, texto 2 #5F675F, erro #C75C52.
- Fonte: **Nunito Sans** em tudo. Pesos 500/600/700/800. Títulos e valores 800, botões 700. Nunca fina, estreita ou futurista.
- Cartões brancos sobre fundo creme, cantos 18px, sombra discreta, espaçamento generoso. Interface clara.
- Logo: componente `src/components/brand/Logo.tsx` (horizontal, compact, icon; tone light/dark). Nunca use emoji no lugar do logo.
- Ícones: Lucide, traço linear. Alvo de toque mínimo 56px; fonte base 18px.
- Status nunca só por cor: ícone + texto (✓ Pago, ◐ Parcial, ! Atrasado).

## Arquitetura
- Next.js (App Router), TypeScript, Tailwind, Supabase (Auth + Postgres + RLS), Zod, React Hook Form.
- Lógica de negócio separada da UI. Sem chamadas externas em componentes visuais.
- Integrações por **adaptadores** (interface + real + mock + checagem de disponibilidade + timeout). Sem credencial, usar mock **claramente marcado como demonstração**. Segredos só no servidor.
- Nunca tratar retorno do navegador como confirmação de pagamento. Limites de plano controlados no backend. RLS em todas as tabelas.

## Fases (verificar `npm run build`, lint e tipos ao fim de cada uma)
1. Identidade, design system, landing, login/cadastro. 2. Dashboard, imóveis, inquilinos, contratos.
3. Aluguéis, pagamentos (parciais, sem duplicar competência), despesas, relatórios. 4. WhatsApp (link), arquitetura de pagamentos, área do inquilino, configurações.
5. Admin, planos, segurança, testes, performance.
Qualidade acima de quantidade. Sem botões decorativos: o que não existe ainda deve avisar.

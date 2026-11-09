# Meu Aluguel (Next.js + Supabase)

Fase 1 (landing, acesso, onboarding) + Fase 2 (painel, imóveis, inquilinos, contratos, aluguéis com pagamento parcial).

## Rodar
```
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Banco de dados (obrigatório, uma vez)
1. No Supabase: **SQL Editor > New query**, cole todo o arquivo `supabase/migrations/0001_init.sql` e clique **Run**. Depois, na ordem, `0002_despesas.sql`, `0003_somente_donos.sql`, `0004_documentos.sql` e `0005_flexibilidade_fotos_pagamentos.sql`.
2. Em **Authentication > URL Configuration**: Site URL `http://localhost:3000` e, em Redirect URLs, `http://localhost:3000/auth/callback` (e a mesma rota no domínio de produção).
3. `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou a chave "publishable").
Sem as variáveis, as telas de acesso rodam em modo demonstração e o painel pede a conexão.

## O que o banco garante (não só o frontend)
RLS em todas as tabelas · limite de imóveis por plano (trigger) · um contrato ativo por imóvel · aluguel único por contrato e mês · status do aluguel recalculado pelos pagamentos (parcial só vira "pago" quando o saldo zera) · vencimento no último dia em meses curtos.

## Ainda não existe
Relatórios em PDF, edição e exclusão de registros, upload de documentos e fotos, convite do inquilino (ver `docs/ACESSO_INQUILINO.md`), multa e juros, planos/assinatura, admin, textos jurídicos, contato e CNPJ.

## Continuar com o Claude Code
"Leia o CLAUDE.md, rode npm install e npm run build, corrija o que falhar e siga para a Fase 3."

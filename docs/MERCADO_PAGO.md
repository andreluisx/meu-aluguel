# Pagamento automático com Mercado Pago — o que já está preparado

**Princípio:** cada proprietário recebe na PRÓPRIA conta do Mercado Pago (conexão OAuth). A plataforma nunca junta o dinheiro de vários donos numa conta só.

**Já existe (nada disso está ativo):**
- `src/lib/payments`: interface `PaymentProvider`, modo `manual` (atual) e `mercadopago` (retorna "não configurado"). `getProvider()` cai no manual sem credenciais.
- Banco (`0005`): `rent_charges.provider/provider_ref/link_pagamento`; `payments.origem/provider/provider_payment_id` com índice ÚNICO (não duplica baixa); `payment_integrations` (status por dono), `payment_integration_secrets` (tokens, sem política: só servidor, guardar criptografado), `payment_events` (avisos recebidos, `event_id` único).
- `/api/webhooks/mercadopago`: valida a assinatura `x-signature` e guarda o aviso uma vez. **Não dá baixa em nada.**

**Falta para ligar:**
1. Criar o app no Mercado Pago Developers; variáveis `MERCADOPAGO_CLIENT_ID`, `MERCADOPAGO_CLIENT_SECRET`, `MERCADOPAGO_WEBHOOK_SECRET` e uma chave de criptografia para os tokens.
2. Tela "Conectar minha conta Mercado Pago" (OAuth) e gravação do token cifrado.
3. `criarCobranca`: gerar Pix/link do aluguel com `external_reference = id do aluguel`, na conta do dono.
4. Processador do webhook: consultar o pagamento na API, conferir valor/referência/dono e só então inserir em `payments` (origem `mercadopago`). Resposta do navegador NUNCA confirma pagamento.
5. Tratar pagamento parcial, estorno e valor diferente (o desconto manual continua valendo).

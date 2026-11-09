# Login do inquilino

Um único login (Supabase Auth) com papéis em `profiles.role`: `owner`, `tenant`, `admin`. Todo cadastro novo é `owner`; ninguém muda o próprio papel (trigger).

**Fluxo**
1. O proprietário cadastra o inquilino com e-mail e, na tela de edição, clica em **Liberar acesso**. Uma ação de servidor (chave `SUPABASE_SERVICE_ROLE_KEY`) cria a conta, marca como `tenant` e liga `tenants.user_id`. Se o e-mail já tiver conta, nada é alterado (impede tomar conta de um proprietário).
2. O proprietário envia o aviso pelo WhatsApp (mensagem pronta).
3. O inquilino abre `/entrar-inquilino`, digita o e-mail e recebe um link (sem senha). `shouldCreateUser:false`: só entra quem foi liberado. O link cai em `/auth/callback` e leva a `/inquilino`.

**Isolamento:** RLS deixa o inquilino SOMENTE LER seu cadastro, contrato, aluguéis e pagamentos. A migração `0003` impede contas de inquilino de criar/alterar dados de dono. O layout interno redireciona `tenant` para `/inquilino`.

**Produção:** o e-mail padrão do Supabase tem limite baixo de envios; configure SMTP próprio (Authentication > SMTP) antes de lançar.
Controlado por `features.tenant_portal_enabled` (liga sozinho quando a chave de servidor existe).

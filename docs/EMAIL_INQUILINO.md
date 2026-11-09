# O inquilino não recebe o e-mail de acesso — como descobrir o motivo

A tela do inquilino agora mostra o erro real quando é limite de envio ou falha de e-mail, e escreve o código técnico no console do navegador (F12 > Console, linha "[link-de-acesso]").

**Causas mais comuns (da mais provável para a menos):**
1. **Limite do e-mail padrão do Supabase.** Ele envia pouquíssimos e-mails por hora (cadastro, recuperação de senha e link do inquilino dividem o mesmo limite). Passou disso, o Supabase recusa e nada chega. Além disso, existe 1 pedido por minuto para o mesmo e-mail.
2. **E-mail padrão só entrega para pessoas da sua equipe do Supabase.** Endereços de fora podem ser bloqueados ("email address not authorized").
3. **Conta do inquilino não existe mais:** foi removida em "Remover acesso", ao trocar o e-mail do cadastro, ou apagada em Authentication > Users. Sem conta, o sistema não cria outra sozinho (por segurança). Solução: no cadastro do inquilino, clicar em "Liberar acesso" de novo.
4. E-mail digitado diferente do cadastrado, ou caiu no spam.

**Como confirmar:** Supabase > Authentication > **Logs** (mostra cada envio e o erro) e Authentication > **Users** (a conta do inquilino precisa estar lá).

**Solução definitiva (necessária antes de lançar):** Authentication > **SMTP Settings** com um serviço de e-mail próprio (Resend, Brevo, Amazon SES etc.). Aí o limite sobe e qualquer destinatário recebe.

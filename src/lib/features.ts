// Controle central de recursos. Recurso desligado => a interface mostra uma alternativa, nunca um erro.
export const features = {
  payments_enabled: false,
  whatsapp_automatic_enabled: false,
  email_enabled: false,
  // Liga sozinho quando a chave de servidor do Supabase estiver configurada (.env.local).
  tenant_portal_enabled: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
};

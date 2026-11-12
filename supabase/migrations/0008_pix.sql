-- Meu Aluguel — Pix direto para a conta do proprietário + aviso "já paguei" do inquilino. Rode depois do 0007.
alter table public.profiles
  add column chave_pix text,
  add column chave_pix_tipo text check (chave_pix_tipo in ('cpf','telefone','email','aleatoria')),
  add column pix_nome text, add column pix_cidade text;

-- O inquilino recebe, junto do contrato, SÓ a chave Pix do dono dele (para poder pagar).
drop function public.portal_inquilino();
create function public.portal_inquilino() returns table (
  lease_id uuid, imovel_nome text, endereco text, cidade text, estado text, proprietario_nome text,
  pix_chave text, pix_nome text, pix_cidade text,
  valor_centavos integer, dia_vencimento integer, data_inicio date, data_fim date
) language sql stable security definer set search_path = public as $$
  select l.id, p.nome, p.endereco, p.cidade, p.estado, pr.nome, pr.chave_pix, pr.pix_nome, pr.pix_cidade,
         l.valor_centavos, l.dia_vencimento, l.data_inicio, l.data_fim
  from public.leases l
  join public.tenants t on t.id = l.tenant_id
  join public.properties p on p.id = l.property_id
  left join public.profiles pr on pr.id = l.owner_id
  where t.user_id = auth.uid() and l.status = 'ativo'
$$;
revoke execute on function public.portal_inquilino() from public, anon;
grant execute on function public.portal_inquilino() to authenticated;

-- "Já paguei": o inquilino AVISA; quem dá baixa é sempre o dono (ao confirmar, vira um pagamento).
create table public.payment_claims (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  charge_id uuid not null references public.rent_charges(id) on delete cascade,
  valor_centavos integer not null check (valor_centavos > 0),
  pago_em date not null, mensagem text,
  status text not null default 'pendente' check (status in ('pendente','confirmado','recusado')),
  created_at timestamptz not null default now(), resolvido_em timestamptz
);
create unique index um_aviso_pendente_por_aluguel on public.payment_claims(charge_id) where status = 'pendente';
create index on public.payment_claims(owner_id, status);
alter table public.payment_claims enable row level security;
create policy dono on public.payment_claims for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid() and public.is_owner());
create policy inquilino_ve_seus_avisos on public.payment_claims for select to authenticated
  using (charge_id in (select id from public.rent_charges where lease_id in (select id from public.leases where tenant_id in (select id from public.tenants where user_id = auth.uid()))));
-- Quem cria o aviso é o servidor (ação do inquilino validada), por isso não há política de INSERT para o inquilino.

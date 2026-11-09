-- Meu Aluguel — flexibilidade nos aluguéis, fotos, contrato anexado e base para Mercado Pago. Rode depois do 0004.

-- ===== Documentos: fotos, contrato de cada contrato e mais tipos =====
alter table public.documents add column lease_id uuid references public.leases(id) on delete cascade;
create index on public.documents(lease_id);
alter table public.documents drop constraint if exists documents_check;
alter table public.documents add constraint documents_vinculo check (property_id is not null or charge_id is not null or lease_id is not null);
alter table public.documents drop constraint if exists documents_tipo_check;
alter table public.documents add constraint documents_tipo_check check (tipo in ('contrato','comprovante','foto','escritura','iptu','seguro','vistoria','conta','planta','outro'));
drop policy dono on public.documents;
create policy dono on public.documents for all to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_owner()
    and (property_id is null or exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()))
    and (charge_id is null or exists (select 1 from public.rent_charges c where c.id = charge_id and c.owner_id = auth.uid()))
    and (lease_id is null or exists (select 1 from public.leases l where l.id = lease_id and l.owner_id = auth.uid())));
create policy inquilino_ve_contrato on public.documents for select to authenticated
  using (visivel_inquilino and lease_id in (select id from public.leases where tenant_id in (select id from public.tenants where user_id = auth.uid())));
alter table public.tenants add column foto_caminho text;

-- ===== Aluguel flexível: desconto/acréscimo com motivo, cancelamento com motivo, vencimento combinado =====
alter table public.rent_charges
  add column ajuste_centavos integer not null default 0,        -- positivo = desconto, negativo = acréscimo
  add column ajuste_motivo text,
  add column motivo_cancelamento text,
  add column vencimento_manual boolean not null default false,
  add column provider text, add column provider_ref text, add column link_pagamento text;   -- Mercado Pago (futuro)
alter table public.rent_charges add constraint ajuste_valido check (ajuste_centavos < valor_original_centavos);
alter table public.payments
  add column observacao text,
  add column origem text not null default 'manual' check (origem in ('manual','mercadopago')),
  add column provider text, add column provider_payment_id text;
create unique index payments_provider_unico on public.payments(provider, provider_payment_id) where provider_payment_id is not null;  -- idempotência

-- Recalcula a situação: pago quando recebido >= valor devido (original - desconto).
create or replace function public.recompute_charge(cid uuid) returns void language plpgsql security definer set search_path = public as $$
declare v integer; st text; tot bigint;
begin
  select valor_original_centavos - ajuste_centavos, status into v, st from public.rent_charges where id = cid;
  if v is null or st = 'cancelado' then return; end if;
  select coalesce(sum(valor_centavos), 0) into tot from public.payments where charge_id = cid;
  update public.rent_charges set status = case when tot >= v then 'pago' when tot > 0 then 'parcial' else 'aguardando' end where id = cid;
end $$;
revoke execute on function public.recompute_charge(uuid) from public, anon, authenticated;
create or replace function public.sync_charge_status() returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.recompute_charge(coalesce(new.charge_id, old.charge_id)); return null; end $$;
create function public.charge_adjust_trigger() returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.recompute_charge(new.id); return null; end $$;
create trigger recompute_on_adjust after update of ajuste_centavos on public.rent_charges for each row execute function public.charge_adjust_trigger();

-- Ao editar um contrato (ex.: reajuste autorizado pelo dono): atualiza só aluguéis futuros sem pagamento, sem desconto e sem vencimento combinado.
create function public.update_lease_charges(p_lease uuid) returns void language plpgsql as $$
declare l public.leases%rowtype; hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  select * into l from public.leases where id = p_lease;
  if not found then return; end if;
  update public.rent_charges c set valor_original_centavos = l.valor_centavos,
    vencimento = c.competencia + (least(l.dia_vencimento, extract(day from (c.competencia + interval '1 month - 1 day'))::int) - 1)
  where c.lease_id = l.id and c.status = 'aguardando' and c.ajuste_centavos = 0 and not c.vencimento_manual
    and c.competencia >= date_trunc('month', hoje)::date and not exists (select 1 from public.payments p where p.charge_id = c.id);
  if l.data_fim is not null then
    update public.rent_charges r set status = 'cancelado', motivo_cancelamento = 'O contrato terminou em ' || to_char(l.data_fim, 'DD/MM/YYYY')
    where r.lease_id = l.id and r.status = 'aguardando' and r.vencimento > l.data_fim and not exists (select 1 from public.payments p where p.charge_id = r.id);
  end if;
  perform public.generate_rent_charges(l.id);
end $$;

-- ===== Mercado Pago (preparação; nada disso está ativo ainda) =====
create table public.payment_integrations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  provider text not null check (provider in ('mercadopago')),
  status text not null default 'desconectado' check (status in ('desconectado','conectado','erro')),
  external_account_id text, created_at timestamptz not null default now(), unique (owner_id, provider)
);
alter table public.payment_integrations enable row level security;
create policy dono_le on public.payment_integrations for select to authenticated using (owner_id = auth.uid());
-- Tokens ficam em tabela SEM nenhuma política: só o servidor (service_role) acessa. Guardar sempre criptografado.
create table public.payment_integration_secrets (
  owner_id uuid not null references auth.users(id) on delete cascade, provider text not null,
  segredo_cifrado text not null, atualizado_em timestamptz not null default now(), primary key (owner_id, provider)
);
alter table public.payment_integration_secrets enable row level security;
-- Notificações (webhooks) recebidas; event_id único evita processar duas vezes. Só o servidor acessa.
create table public.payment_events (
  id uuid primary key default gen_random_uuid(), provider text not null, event_id text not null, payload jsonb not null,
  status text not null default 'pendente' check (status in ('pendente','processado','erro')), created_at timestamptz not null default now(),
  unique (provider, event_id)
);
alter table public.payment_events enable row level security;

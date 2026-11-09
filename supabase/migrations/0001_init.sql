-- Meu Aluguel — Fase 2. Rode no Supabase: SQL Editor > New query > cole tudo > Run.
-- Valores em CENTAVOS (inteiros). Datas de vencimento como "date" (sem fuso).

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  role text not null default 'owner' check (role in ('owner','tenant','admin')),
  plano text not null default 'inicial' check (plano in ('inicial','profissional','avancado')),
  created_at timestamptz not null default now()
);
-- Todo novo usuário vira "owner". O papel NUNCA vem do cliente (tenant/admin só pelo servidor).
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome) values (new.id, coalesce(new.raw_user_meta_data->>'nome', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create function public.protect_profile() returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and (new.role is distinct from old.role or new.plano is distinct from old.plano) then
    raise exception 'Alteração não permitida';
  end if;
  return new;
end $$;
create trigger protect_profile before update on public.profiles for each row execute function public.protect_profile();

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome text not null, tipo text not null default 'Casa',
  cep text, endereco text, cidade text, estado text,
  valor_aluguel_centavos integer not null check (valor_aluguel_centavos > 0),
  situacao text not null default 'ativo' check (situacao in ('ativo','manutencao')),
  observacoes text, created_at timestamptz not null default now()
);
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,   -- login do inquilino (opcional, ver docs/ACESSO_INQUILINO.md)
  nome text not null, cpf text, telefone text, whatsapp text, email text, observacoes text,
  created_at timestamptz not null default now()
);
create table public.leases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  valor_centavos integer not null check (valor_centavos > 0),
  dia_vencimento integer not null check (dia_vencimento between 1 and 31),
  data_inicio date not null, data_fim date,
  status text not null default 'ativo' check (status in ('ativo','encerrado')),
  created_at timestamptz not null default now(),
  check (data_fim is null or data_fim >= data_inicio)
);
create unique index one_active_lease_per_property on public.leases(property_id) where status = 'ativo';
create table public.rent_charges (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lease_id uuid not null references public.leases(id) on delete cascade,
  competencia date not null, vencimento date not null,
  valor_original_centavos integer not null check (valor_original_centavos > 0),
  status text not null default 'aguardando' check (status in ('aguardando','pago','parcial','cancelado')),
  created_at timestamptz not null default now(),
  unique (lease_id, competencia)            -- impede lançamento duplicado
);
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  charge_id uuid not null references public.rent_charges(id) on delete cascade,
  valor_centavos integer not null check (valor_centavos > 0),
  pago_em date not null, forma text not null default 'pix', created_at timestamptz not null default now()
);
create index on public.properties(owner_id); create index on public.tenants(owner_id); create index on public.leases(owner_id);
create index on public.rent_charges(owner_id, vencimento); create index on public.payments(charge_id);

-- Limite de imóveis por plano: controlado AQUI, no backend.
create function public.plan_limit(p text) returns int language sql immutable as $$
  select case p when 'inicial' then 3 when 'profissional' then 15 when 'avancado' then 40 else 0 end $$;
create function public.enforce_property_limit() returns trigger language plpgsql security definer set search_path = public as $$
declare lim int; qtd int;
begin
  select public.plan_limit(plano) into lim from public.profiles where id = new.owner_id;
  select count(*) into qtd from public.properties where owner_id = new.owner_id;
  if qtd >= coalesce(lim, 0) then raise exception 'LIMITE_PLANO'; end if;
  return new;
end $$;
create trigger enforce_property_limit before insert on public.properties for each row execute function public.enforce_property_limit();

-- Atualiza a situação do aluguel conforme os pagamentos (parcial só vira "pago" quando o saldo zera).
create function public.sync_charge_status() returns trigger language plpgsql security definer set search_path = public as $$
declare cid uuid := coalesce(new.charge_id, old.charge_id); v integer; tot bigint;
begin
  select valor_original_centavos into v from public.rent_charges where id = cid;
  select coalesce(sum(valor_centavos), 0) into tot from public.payments where charge_id = cid;
  update public.rent_charges set status = case when tot >= v then 'pago' when tot > 0 then 'parcial' else 'aguardando' end
   where id = cid and status <> 'cancelado';
  return null;
end $$;
create trigger sync_charge_status after insert or update or delete on public.payments for each row execute function public.sync_charge_status();

-- Gera os aluguéis do contrato (idempotente). Meses curtos: vence no último dia. Datas no fuso de São Paulo.
create function public.generate_rent_charges(p_lease uuid, p_ahead int default 2) returns int language plpgsql as $$
declare l public.leases%rowtype; m date; lim date; venc date; ult int; n int := 0;
        hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  select * into l from public.leases where id = p_lease;
  if not found or l.status <> 'ativo' then return 0; end if;
  m := date_trunc('month', l.data_inicio)::date;
  lim := (date_trunc('month', hoje) + make_interval(months => p_ahead))::date;
  while m <= lim loop
    ult := extract(day from (m + interval '1 month - 1 day'))::int;
    venc := m + (least(l.dia_vencimento, ult) - 1);
    if venc >= l.data_inicio and (l.data_fim is null or venc <= l.data_fim) then
      insert into public.rent_charges (owner_id, lease_id, competencia, vencimento, valor_original_centavos)
      values (l.owner_id, l.id, m, venc, l.valor_centavos) on conflict (lease_id, competencia) do nothing;
      if found then n := n + 1; end if;
    end if;
    m := (m + interval '1 month')::date;
  end loop;
  return n;
end $$;
create function public.generate_my_charges() returns void language plpgsql as $$
declare r record;
begin for r in select id from public.leases where status = 'ativo' loop perform public.generate_rent_charges(r.id); end loop; end $$;

-- ===== RLS: cada dono só enxerga o que é seu =====
alter table public.profiles enable row level security; alter table public.properties enable row level security;
alter table public.tenants enable row level security; alter table public.leases enable row level security;
alter table public.rent_charges enable row level security; alter table public.payments enable row level security;

create policy profiles_self_select on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy dono on public.properties for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy dono on public.tenants for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy dono on public.leases for all to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid()
    and exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
    and exists (select 1 from public.tenants t where t.id = tenant_id and t.owner_id = auth.uid()));
create policy dono on public.rent_charges for all to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and exists (select 1 from public.leases l where l.id = lease_id and l.owner_id = auth.uid()));
create policy dono on public.payments for all to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and exists (select 1 from public.rent_charges c where c.id = charge_id and c.owner_id = auth.uid()));

-- Inquilino com login: só LÊ o que é dele.
create policy inquilino_ve_seu_cadastro on public.tenants for select to authenticated using (user_id = auth.uid());
create policy inquilino_ve_seu_contrato on public.leases for select to authenticated using (tenant_id in (select id from public.tenants where user_id = auth.uid()));
create policy inquilino_ve_seus_alugueis on public.rent_charges for select to authenticated using (lease_id in (select id from public.leases where tenant_id in (select id from public.tenants where user_id = auth.uid())));
create policy inquilino_ve_seus_pagamentos on public.payments for select to authenticated using (charge_id in (select id from public.rent_charges where lease_id in (select id from public.leases where tenant_id in (select id from public.tenants where user_id = auth.uid()))));

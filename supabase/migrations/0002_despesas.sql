-- Meu Aluguel — Fase 3: despesas. Rode no SQL Editor depois do 0001.
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  categoria text not null check (categoria in ('manutencao','reforma','impostos','agua','energia','condominio','seguro','outros')),
  descricao text not null,
  valor_centavos integer not null check (valor_centavos > 0),
  data date not null, forma text, observacoes text,
  created_at timestamptz not null default now()
);
create index on public.expenses(owner_id, data);
alter table public.expenses enable row level security;
create policy dono on public.expenses for all to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()));

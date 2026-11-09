-- Meu Aluguel — documentos e comprovantes (Supabase Storage). Rode depois do 0003.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documentos', 'documentos', false, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  charge_id uuid references public.rent_charges(id) on delete cascade,
  tipo text not null check (tipo in ('contrato','comprovante','outro')),
  nome_arquivo text not null, caminho text not null unique, tamanho integer not null, tipo_mime text not null,
  visivel_inquilino boolean not null default false,
  created_at timestamptz not null default now(),
  check (property_id is not null or charge_id is not null)
);
create index on public.documents(owner_id); create index on public.documents(property_id); create index on public.documents(charge_id);
alter table public.documents enable row level security;
create policy dono on public.documents for all to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_owner()
    and (property_id is null or exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()))
    and (charge_id is null or exists (select 1 from public.rent_charges c where c.id = charge_id and c.owner_id = auth.uid())));
create policy inquilino_ve_comprovantes on public.documents for select to authenticated
  using (visivel_inquilino and charge_id in (select id from public.rent_charges where lease_id in (select id from public.leases where tenant_id in (select id from public.tenants where user_id = auth.uid()))));

-- Arquivos: cada dono só mexe na sua pasta (primeira parte do caminho = id do usuário).
create policy "dono gerencia seus arquivos" on storage.objects for all to authenticated
  using (bucket_id = 'documentos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'documentos' and (storage.foldername(name))[1] = auth.uid()::text and public.is_owner());
create policy "inquilino le comprovantes liberados" on storage.objects for select to authenticated
  using (bucket_id = 'documentos' and exists (select 1 from public.documents d where d.caminho = name and d.visivel_inquilino));

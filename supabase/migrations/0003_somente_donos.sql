-- Meu Aluguel — Fase 5: contas de inquilino NÃO podem criar/alterar dados de dono. Rode depois do 0002.
create function public.is_owner() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('owner','admin')) $$;

drop policy dono on public.properties;
create policy dono on public.properties for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid() and public.is_owner());
drop policy dono on public.tenants;
create policy dono on public.tenants for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid() and public.is_owner());
drop policy dono on public.leases;
create policy dono on public.leases for all to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_owner()
    and exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
    and exists (select 1 from public.tenants t where t.id = tenant_id and t.owner_id = auth.uid()));
drop policy dono on public.rent_charges;
create policy dono on public.rent_charges for all to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_owner() and exists (select 1 from public.leases l where l.id = lease_id and l.owner_id = auth.uid()));
drop policy dono on public.payments;
create policy dono on public.payments for all to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_owner() and exists (select 1 from public.rent_charges c where c.id = charge_id and c.owner_id = auth.uid()));
drop policy dono on public.expenses;
create policy dono on public.expenses for all to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.is_owner() and exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()));

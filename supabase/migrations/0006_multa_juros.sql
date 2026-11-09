-- Meu Aluguel — multa e juros por atraso (só se o contrato prever; aplicado SOMENTE por ação do dono). Rode depois do 0005.
alter table public.leases
  add column multa_percentual numeric(5,2) not null default 0 check (multa_percentual between 0 and 100),
  add column juros_mensal_percentual numeric(5,2) not null default 0 check (juros_mensal_percentual between 0 and 100);
alter table public.rent_charges
  add column encargos_centavos integer not null default 0 check (encargos_centavos >= 0),   -- multa + juros aplicados pelo dono
  add column encargos_em date;

-- Valor devido = original - desconto + multa/juros aplicados.
create or replace function public.recompute_charge(cid uuid) returns void language plpgsql security definer set search_path = public as $$
declare v integer; st text; tot bigint;
begin
  select valor_original_centavos - ajuste_centavos + encargos_centavos, status into v, st from public.rent_charges where id = cid;
  if v is null or st = 'cancelado' then return; end if;
  select coalesce(sum(valor_centavos), 0) into tot from public.payments where charge_id = cid;
  update public.rent_charges set status = case when tot >= v then 'pago' when tot > 0 then 'parcial' else 'aguardando' end where id = cid;
end $$;
revoke execute on function public.recompute_charge(uuid) from public, anon, authenticated;
drop trigger recompute_on_adjust on public.rent_charges;
create trigger recompute_on_adjust after update of ajuste_centavos, encargos_centavos on public.rent_charges for each row execute function public.charge_adjust_trigger();

-- Edição de contrato não mexe em aluguéis com multa/juros aplicados.
create or replace function public.update_lease_charges(p_lease uuid) returns void language plpgsql as $$
declare l public.leases%rowtype; hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  select * into l from public.leases where id = p_lease;
  if not found then return; end if;
  update public.rent_charges c set valor_original_centavos = l.valor_centavos,
    vencimento = c.competencia + (least(l.dia_vencimento, extract(day from (c.competencia + interval '1 month - 1 day'))::int) - 1)
  where c.lease_id = l.id and c.status = 'aguardando' and c.ajuste_centavos = 0 and c.encargos_centavos = 0 and not c.vencimento_manual
    and c.competencia >= date_trunc('month', hoje)::date and not exists (select 1 from public.payments p where p.charge_id = c.id);
  if l.data_fim is not null then
    update public.rent_charges r set status = 'cancelado', motivo_cancelamento = 'O contrato terminou em ' || to_char(l.data_fim, 'DD/MM/YYYY')
    where r.lease_id = l.id and r.status = 'aguardando' and r.vencimento > l.data_fim and not exists (select 1 from public.payments p where p.charge_id = r.id);
  end if;
  perform public.generate_rent_charges(l.id);
end $$;

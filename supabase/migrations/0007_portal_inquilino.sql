-- Meu Aluguel — portal do inquilino. Rode depois do 0006.

-- O inquilino NÃO enxerga a tabela de imóveis (tem observações do dono). Esta função devolve só o necessário,
-- apenas dos contratos ativos dele.
create function public.portal_inquilino() returns table (
  lease_id uuid, imovel_nome text, endereco text, cidade text, estado text, proprietario_nome text,
  valor_centavos integer, dia_vencimento integer, data_inicio date, data_fim date
) language sql stable security definer set search_path = public as $$
  select l.id, p.nome, p.endereco, p.cidade, p.estado, pr.nome, l.valor_centavos, l.dia_vencimento, l.data_inicio, l.data_fim
  from public.leases l
  join public.tenants t on t.id = l.tenant_id
  join public.properties p on p.id = l.property_id
  left join public.profiles pr on pr.id = l.owner_id
  where t.user_id = auth.uid() and l.status = 'ativo'
$$;
revoke execute on function public.portal_inquilino() from public, anon;
grant execute on function public.portal_inquilino() to authenticated;

-- Gera os aluguéis de todos os contratos ativos. Hoje a geração acontece quando o dono abre o sistema;
-- para o inquilino ver o próximo vencimento mesmo sem isso, agende diariamente (Database > Extensions > pg_cron):
--   select cron.schedule('gerar-alugueis', '0 6 * * *', $$select public.generate_all_charges()$$);
create function public.generate_all_charges() returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin for r in select id from public.leases where status = 'ativo' loop perform public.generate_rent_charges(r.id); end loop; end $$;
revoke execute on function public.generate_all_charges() from public, anon, authenticated;

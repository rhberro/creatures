-- Creatures — hardening follow-up.
--
-- 1. The trigger function pins its search_path, so it cannot be hijacked by a
--    malicious object placed earlier in the path.
-- 2. Every table gets an explicit policy for the service role only. The anon and
--    authenticated roles keep zero policies and zero grants, so the access model
--    stays deny-by-default; the service role is the only role the server uses.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy if exists species_service_role_all on public.species;
create policy species_service_role_all on public.species
for all to service_role
using (true)
with check (true);

drop policy if exists abilities_service_role_all on public.abilities;
create policy abilities_service_role_all on public.abilities
for all to service_role
using (true)
with check (true);

drop policy if exists species_abilities_service_role_all on public.species_abilities;
create policy species_abilities_service_role_all on public.species_abilities
for all to service_role
using (true)
with check (true);

drop policy if exists items_service_role_all on public.items;
create policy items_service_role_all on public.items
for all to service_role
using (true)
with check (true);

drop policy if exists species_drops_service_role_all on public.species_drops;
create policy species_drops_service_role_all on public.species_drops
for all to service_role
using (true)
with check (true);

drop policy if exists type_effectiveness_service_role_all on public.type_effectiveness;
create policy type_effectiveness_service_role_all on public.type_effectiveness
for all to service_role
using (true)
with check (true);

drop policy if exists trainers_service_role_all on public.trainers;
create policy trainers_service_role_all on public.trainers
for all to service_role
using (true)
with check (true);

drop policy if exists creatures_service_role_all on public.creatures;
create policy creatures_service_role_all on public.creatures
for all to service_role
using (true)
with check (true);

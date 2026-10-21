-- Creatures — the ability slots write the empty slots as NULL.
--
-- The loadout of a creature is written as the whole list of the four slots, in
-- the order of the slots, and an empty slot is a NULL in the list. The first
-- version of the function treated the NULL as an unknown ability and refused
-- the whole loadout, which made it impossible to leave a slot empty in the
-- middle of the bar.
--
-- The caller is the service role, which bypasses RLS, so the function needs no
-- definer rights: security invoker keeps it from being an escalation path.

create or replace function public.set_creature_ability_slots(
  p_creature_id uuid,
  p_owner_id uuid,
  p_ability_ids uuid[]
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_species_id uuid;
begin
  select c.species_id into v_species_id
  from public.creatures c
  join public.trainers t on t.id = c.trainer_id
  where c.id = p_creature_id and t.owner_id = p_owner_id;

  if v_species_id is null then
    raise exception using errcode = 'P0001', message = 'creature_not_found';
  end if;

  -- A NULL is an empty slot: only the abilities that are there are checked.
  if exists (
    select 1
    from unnest(coalesce(p_ability_ids, '{}'::uuid[])) as requested(id)
    where requested.id is not null
      and not exists (
        select 1
        from public.species_abilities sa
        where sa.species_id = v_species_id and sa.ability_id = requested.id
      )
  ) then
    raise exception using errcode = 'P0001', message = 'invalid_team_command';
  end if;

  -- The same ability cannot take two slots of the same creature.
  if (
    select count(distinct requested.id)
    from unnest(coalesce(p_ability_ids, '{}'::uuid[])) as requested(id)
    where requested.id is not null
  ) <> (
    select count(*)
    from unnest(coalesce(p_ability_ids, '{}'::uuid[])) as requested(id)
    where requested.id is not null
  ) then
    raise exception using errcode = 'P0001', message = 'invalid_team_command';
  end if;

  delete from public.creature_ability_slots
  where creature_id = p_creature_id;

  insert into public.creature_ability_slots (creature_id, slot, ability_id)
  select p_creature_id, s.position - 1, s.id
  from unnest(coalesce(p_ability_ids, '{}'::uuid[])) with ordinality as s(id, position)
  where s.id is not null and s.position <= 4;
end;
$$;

revoke execute on function public.set_creature_ability_slots(uuid, uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.set_creature_ability_slots(uuid, uuid, uuid[]) to service_role;

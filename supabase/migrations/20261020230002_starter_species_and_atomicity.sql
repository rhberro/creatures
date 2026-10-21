-- Creatures — schema follow-up.
--
-- 1. The trainer now stores the starter species it was created with, so listing
--    trainers does not need a join with creatures.
-- 2. creatures.owner_id was redundant with trainers.owner_id and could drift;
--    the owner is now read through the trainer.
-- 3. The same ability cannot occupy two slots of the same species.
-- 4. set_updated_at is not callable by anon/authenticated anymore.
-- 5. Trainer creation became a single transactional RPC, because PostgREST has no
--    transaction across tables: without it, a trainer could be left without its
--    starter creature, and the 5-trainer limit had a race.

alter table public.trainers
  add column starter_species_id uuid not null references public.species (id) on delete restrict;

drop index if exists public.creatures_owner_id_idx;

alter table public.creatures
  drop column owner_id;

alter table public.species_abilities
  add constraint species_abilities_species_ability_key unique (species_id, ability_id);

revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- The caller is the service role, which bypasses RLS, so the function needs no
-- definer rights: security invoker keeps it from being an escalation path.
create or replace function public.create_trainer_with_starter(
  p_owner_id uuid,
  p_name text,
  p_normalized_name text,
  p_gender text,
  p_starter_species_id uuid
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_trainer_count bigint;
  v_trainer_id uuid;
  v_creature_id uuid;
begin
  -- Serializes concurrent creations of the same account until the transaction ends,
  -- so the 5-trainer limit cannot be exceeded by two simultaneous requests.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner_id::text, 0));

  select count(*) into v_trainer_count
  from public.trainers
  where owner_id = p_owner_id;

  if v_trainer_count >= 5 then
    raise exception using errcode = 'P0001', message = 'max_trainers_reached';
  end if;

  if not exists (
    select 1
    from public.species
    where id = p_starter_species_id and is_starter
  ) then
    raise exception using errcode = 'P0001', message = 'starter_unavailable';
  end if;

  -- A duplicated normalized name raises unique_violation (23505) on its own, and
  -- the error is not swallowed: the server maps it to 409 name_taken.
  insert into public.trainers (owner_id, name, normalized_name, gender, starter_species_id)
  values (p_owner_id, p_name, p_normalized_name, p_gender, p_starter_species_id)
  returning id into v_trainer_id;

  -- The starter creature is born with every potential at 50% and takes the first
  -- team slot, carrying the trainer name as nickname.
  insert into public.creatures (
    trainer_id,
    species_id,
    level,
    experience,
    potential,
    is_in_team,
    team_slot,
    nickname
  )
  values (
    v_trainer_id,
    p_starter_species_id,
    1,
    0,
    '{"vitality":50,"physicalAttack":50,"magicAttack":50,"physicalDefense":50,"magicDefense":50}'::jsonb,
    true,
    1,
    p_name
  )
  returning id into v_creature_id;

  return pg_catalog.jsonb_build_object('trainer_id', v_trainer_id, 'creature_id', v_creature_id);
end;
$$;

revoke execute on function public.create_trainer_with_starter(uuid, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.create_trainer_with_starter(uuid, text, text, text, uuid) to service_role;

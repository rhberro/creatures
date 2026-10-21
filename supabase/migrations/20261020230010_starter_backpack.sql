-- Creatures -- the backpack a new trainer is born with.
--
-- A new trainer is not born empty-handed: the backpack gets a handful of
-- consumables and capture devices, drawn from the catalog, so the interface has
-- something to show from the first minute.
--
-- The draw is seeded, so the same seed always gives the same backpack. The
-- seed comes from the creation itself: the caller can pass one, and when it
-- does not, the id of the new trainer is the seed. The id is a random uuid, so
-- the backpack of a trainer without an explicit seed is random as well, and it
-- can still be reproduced from the id of the trainer.
--
-- The draw happens inside the RPC that creates the trainer, in the same
-- transaction: there is no window in which the trainer exists without the
-- backpack.
--
-- Access model stays deny-by-default: the helpers are executable only by the
-- service role.

-- The next number of a seeded sequence.
--
-- The generator is a linear congruential one, kept in numeric so the
-- arithmetic never overflows and the sequence is the same on every machine.
create or replace function public.starter_next_random(p_state numeric)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select (p_state * 6364136223846793005 + 1442695040888963407) % 2147483647;
$$;

-- Fills the backpack of a new trainer with items drawn from the catalog.
--
-- The trainer is born with three to five consumables and two to three devices,
-- each one with a quantity between one and ninety-nine. The items of a
-- category are drawn without repetition.
create or replace function public.fill_starter_backpack(p_trainer_id uuid, p_seed bigint)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_state numeric;
  v_catalog uuid[];
  v_remaining uuid[];
  v_picked uuid;
  v_quantity int;
  v_index int;
  v_consumables int;
  v_devices int;
begin
  -- The seed decides the whole draw. Without one, the id of the trainer is
  -- the seed: the id is a random uuid, so the backpack is random as well and
  -- it can still be reproduced from the id.
  v_state := abs(coalesce(p_seed, pg_catalog.hashtextextended(p_trainer_id::text, 0))::numeric) + 1;

  -- How many of each category the trainer is born with.
  v_state := public.starter_next_random(v_state);
  v_consumables := 3 + (v_state::bigint % 3);
  v_state := public.starter_next_random(v_state);
  v_devices := 2 + (v_state::bigint % 2);

  select coalesce(array_agg(i.id order by i.id), '{}'::uuid[])
  into v_catalog
  from public.items i
  where i.category = 'consumable';

  v_remaining := v_catalog;
  for i in 1..v_consumables loop
    exit when coalesce(array_length(v_remaining, 1), 0) = 0;
    v_state := public.starter_next_random(v_state);
    v_index := (v_state::bigint % array_length(v_remaining, 1)) + 1;
    v_picked := v_remaining[v_index];
    v_remaining := pg_catalog.array_remove(v_remaining, v_picked);
    v_state := public.starter_next_random(v_state);
    v_quantity := (v_state::bigint % 99) + 1;
    insert into public.trainer_items (trainer_id, item_id, quantity)
    values (p_trainer_id, v_picked, v_quantity)
    on conflict (trainer_id, item_id) do update
      set quantity = trainer_items.quantity + excluded.quantity;
  end loop;

  select coalesce(array_agg(i.id order by i.id), '{}'::uuid[])
  into v_catalog
  from public.items i
  where i.category = 'device';

  v_remaining := v_catalog;
  for i in 1..v_devices loop
    exit when coalesce(array_length(v_remaining, 1), 0) = 0;
    v_state := public.starter_next_random(v_state);
    v_index := (v_state::bigint % array_length(v_remaining, 1)) + 1;
    v_picked := v_remaining[v_index];
    v_remaining := pg_catalog.array_remove(v_remaining, v_picked);
    v_state := public.starter_next_random(v_state);
    v_quantity := (v_state::bigint % 99) + 1;
    insert into public.trainer_items (trainer_id, item_id, quantity)
    values (p_trainer_id, v_picked, v_quantity)
    on conflict (trainer_id, item_id) do update
      set quantity = trainer_items.quantity + excluded.quantity;
  end loop;
end;
$$;

-- The creation of a trainer with its starter creature and its backpack.
--
-- The seed is optional: without one the backpack is drawn from the id of the
-- new trainer, and with one the same seed always gives the same backpack.
create or replace function public.create_trainer_with_starter_seeded(
  p_owner_id uuid,
  p_name text,
  p_normalized_name text,
  p_gender text,
  p_starter_species_id uuid,
  p_seed bigint
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

  -- The creature is born with the loadout of its species. A species with less
  -- than four abilities leaves the remaining slots empty.
  insert into public.creature_ability_slots (creature_id, slot, ability_id)
  select v_creature_id, sa.slot, sa.ability_id
  from public.species_abilities sa
  where sa.species_id = p_starter_species_id and sa.slot between 0 and 3
  order by sa.slot;

  -- The trainer is born with a backpack: the draw is part of the creation, so
  -- there is no moment in which the trainer exists without it.
  perform public.fill_starter_backpack(v_trainer_id, p_seed);

  return pg_catalog.jsonb_build_object('trainer_id', v_trainer_id, 'creature_id', v_creature_id);
end;
$$;

-- The creation of a trainer, without a seed: the backpack is drawn from the id
-- of the new trainer.
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
begin
  return public.create_trainer_with_starter_seeded(
    p_owner_id,
    p_name,
    p_normalized_name,
    p_gender,
    p_starter_species_id,
    null
  );
end;
$$;

revoke execute on function public.create_trainer_with_starter(uuid, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.create_trainer_with_starter(uuid, text, text, text, uuid) to service_role;

revoke execute on function public.create_trainer_with_starter_seeded(uuid, text, text, text, uuid, bigint) from public, anon, authenticated;
grant execute on function public.create_trainer_with_starter_seeded(uuid, text, text, text, uuid, bigint) to service_role;

revoke execute on function public.fill_starter_backpack(uuid, bigint) from public, anon, authenticated;
grant execute on function public.fill_starter_backpack(uuid, bigint) to service_role;

revoke execute on function public.starter_next_random(numeric) from public, anon, authenticated;
grant execute on function public.starter_next_random(numeric) to service_role;

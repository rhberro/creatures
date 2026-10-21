-- Creatures — the loadout of the skill bar, the life of the creature, and the
-- manual swap of the active creature.
--
-- The skill bar has seven slots. Four of them belong to the creature in the
-- field and hold its abilities; the two consumable slots and the device slot
-- belong to the trainer, because they are used by the trainer and not by the
-- creature. The loadout of the creature lives with the creature, and the loadout
-- of the trainer lives with the trainer.
--
-- The remaining life of a creature is the one value of a creature that cannot
-- be calculated on the spot: the attributes are derived from the species, the
-- potential and the level, but the life left depends on what happened in the
-- battle. A null life means a creature that never took a hit, which is the
-- same as full life.
--
-- Access model stays deny-by-default: RLS is enabled, anon and authenticated
-- have no grant and no policy, and only the service role -- which bypasses RLS
-- -- sees the rows. The server is the only writer.

alter table public.creatures
  add column current_hp int check (current_hp is null or current_hp >= 0);

create table public.creature_ability_slots (
  creature_id uuid not null references public.creatures (id) on delete cascade,
  slot int not null check (slot between 0 and 3),
  ability_id uuid not null references public.abilities (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (creature_id, slot)
);

-- ability_id is a foreign key and Postgres does not index foreign keys on its
-- own. The index keeps the restrict check and the join with the catalog of
-- abilities from degrading into a sequential scan.
create index creature_ability_slots_ability_id_idx on public.creature_ability_slots (ability_id);

create table public.trainer_gear_slots (
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  slot int not null check (slot between 4 and 6),
  kind text not null check (kind in ('consumable', 'device')),
  item_id uuid not null references public.items (id) on delete restrict,
  trigger_hp_percent int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (trainer_id, slot),
  constraint trainer_gear_slots_shape_check check (
    (slot between 4 and 5 and kind = 'consumable' and trigger_hp_percent between 1 and 100)
    or (slot = 6 and kind = 'device' and trigger_hp_percent is null)
  )
);

-- item_id is a foreign key and Postgres does not index foreign keys on its
-- own. The index keeps the restrict check and the join with the catalog of
-- items from degrading into a sequential scan.
create index trainer_gear_slots_item_id_idx on public.trainer_gear_slots (item_id);

create trigger creature_ability_slots_set_updated_at
before update on public.creature_ability_slots
for each row execute function public.set_updated_at();

create trigger trainer_gear_slots_set_updated_at
before update on public.trainer_gear_slots
for each row execute function public.set_updated_at();

alter table public.creature_ability_slots enable row level security;
alter table public.trainer_gear_slots enable row level security;

revoke all on table public.creature_ability_slots from anon, authenticated;
revoke all on table public.trainer_gear_slots from anon, authenticated;

grant all on table public.creature_ability_slots to service_role;
grant all on table public.creature_ability_slots to postgres;

grant all on table public.trainer_gear_slots to service_role;
grant all on table public.trainer_gear_slots to postgres;

drop policy if exists creature_ability_slots_service_role_all on public.creature_ability_slots;
create policy creature_ability_slots_service_role_all on public.creature_ability_slots
for all to service_role
using (true)
with check (true);

drop policy if exists trainer_gear_slots_service_role_all on public.trainer_gear_slots;
create policy trainer_gear_slots_service_role_all on public.trainer_gear_slots
for all to service_role
using (true)
with check (true);

-- The starter creature is born with the loadout of its species: the abilities
-- of the species, in the slot the species declares them.
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

  -- The creature is born with the loadout of its species. A species with less
  -- than four abilities leaves the remaining slots empty.
  insert into public.creature_ability_slots (creature_id, slot, ability_id)
  select v_creature_id, sa.slot, sa.ability_id
  from public.species_abilities sa
  where sa.species_id = p_starter_species_id and sa.slot between 0 and 3
  order by sa.slot;

  return pg_catalog.jsonb_build_object('trainer_id', v_trainer_id, 'creature_id', v_creature_id);
end;
$$;

-- The loadout of a creature is written in one transaction: the slots that are
-- missing are created and the ones that are left over are removed.
--
-- The caller is the service role, which bypasses RLS, so the function needs no
-- definer rights: security invoker keeps it from being an escalation path.
-- The owner is checked against trainers.owner_id, because the service role
-- ignores RLS and would otherwise see every creature of the game.
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

  -- An ability that is not of the species, or that is repeated, is refused: the
  -- same ability cannot take two slots of the same creature.
  if exists (
    select 1
    from unnest(coalesce(p_ability_ids, '{}'::uuid[])) as requested(id)
    where not exists (
      select 1
      from public.species_abilities sa
      where sa.species_id = v_species_id and sa.ability_id = requested.id
    )
  ) then
    raise exception using errcode = 'P0001', message = 'invalid_team_command';
  end if;

  if (
    select count(distinct requested.id)
    from unnest(coalesce(p_ability_ids, '{}'::uuid[])) as requested(id)
  ) <> coalesce(cardinality(p_ability_ids), 0) then
    raise exception using errcode = 'P0001', message = 'invalid_team_command';
  end if;

  delete from public.creature_ability_slots
  where creature_id = p_creature_id;

  insert into public.creature_ability_slots (creature_id, slot, ability_id)
  select p_creature_id, s.position - 1, s.id
  from unnest(coalesce(p_ability_ids, '{}'::uuid[])) with ordinality as s(id, position)
  where s.position <= 4;
end;
$$;

-- The manual swap puts the chosen creature in the first slot of the team, which
-- is the slot of the creature in the field, and moves the others along.
--
-- The change touches several rows of `creatures` at once, and the partial
-- unique index on (trainer_id, team_slot) makes a naive sequence of updates
-- fail with a duplicate key. The whole change happens in one transaction.
create or replace function public.swap_active_creature(
  p_trainer_id uuid,
  p_owner_id uuid,
  p_creature_id uuid
) returns int
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order uuid[];
begin
  perform 1
  from public.trainers
  where id = p_trainer_id and owner_id = p_owner_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'trainer_not_found';
  end if;

  if not exists (
    select 1
    from public.creatures
    where id = p_creature_id and trainer_id = p_trainer_id and is_in_team
  ) then
    raise exception using errcode = 'P0001', message = 'creature_not_found';
  end if;

  -- The chosen creature comes first and the others keep the order they had.
  select coalesce(array_agg(c.id order by
    case when c.id = p_creature_id then 0 else 1 end,
    c.team_slot
  ), '{}'::uuid[])
  into v_order
  from public.creatures c
  where c.trainer_id = p_trainer_id and c.is_in_team;

  -- The slots are emptied before they are filled again: the unique index on
  -- (trainer_id, team_slot) refuses a swap that would hold the same slot twice.
  update public.creatures
  set is_in_team = false, team_slot = null
  where trainer_id = p_trainer_id and is_in_team;

  update public.creatures c
  set is_in_team = true, team_slot = t.ordinality
  from unnest(v_order) with ordinality as t(id, ordinality)
  where c.id = t.id and c.trainer_id = p_trainer_id;

  return 1;
end;
$$;

revoke execute on function public.create_trainer_with_starter(uuid, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.create_trainer_with_starter(uuid, text, text, text, uuid) to service_role;

revoke execute on function public.set_creature_ability_slots(uuid, uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.set_creature_ability_slots(uuid, uuid, uuid[]) to service_role;

revoke execute on function public.swap_active_creature(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.swap_active_creature(uuid, uuid, uuid) to service_role;

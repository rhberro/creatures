-- Creatures — atomic team operations.
--
-- Changing the team touches several rows of `creatures` at once, and the
-- partial unique index on (trainer_id, team_slot) makes a naive sequence of
-- updates fail with a duplicate key: swapping two slots needs a moment where
-- neither creature holds its target slot. The same reason that created
-- `create_trainer_with_starter` applies here: each PostgREST request is its
-- own transaction, so a sequence of updates would be visible half-applied.
-- These functions do the whole change in one transaction.
--
-- The caller is the service role, which bypasses RLS, so the functions need no
-- definer rights: security invoker keeps them from being an escalation path.
-- The owner is checked against trainers.owner_id, because the service role
-- ignores RLS and would otherwise see every trainer of the game.

create or replace function public.add_creature_to_team(
  p_trainer_id uuid,
  p_owner_id uuid,
  p_creature_id uuid
) returns int
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_slot int;
begin
  -- Serializes the operations of the same trainer until the transaction ends,
  -- so two simultaneous additions cannot take the same free slot.
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
    where id = p_creature_id and trainer_id = p_trainer_id
  ) then
    raise exception using errcode = 'P0001', message = 'creature_not_found';
  end if;

  if exists (
    select 1
    from public.creatures
    where id = p_creature_id and trainer_id = p_trainer_id and is_in_team
  ) then
    raise exception using errcode = 'P0001', message = 'invalid_team_command';
  end if;

  select g.slot into v_slot
  from generate_series(1, 5) as g(slot)
  where not exists (
    select 1
    from public.creatures c
    where c.trainer_id = p_trainer_id and c.is_in_team and c.team_slot = g.slot
  )
  order by g.slot
  limit 1;

  if v_slot is null then
    raise exception using errcode = 'P0001', message = 'team_full';
  end if;

  update public.creatures
  set is_in_team = true, team_slot = v_slot
  where id = p_creature_id and trainer_id = p_trainer_id;

  return v_slot;
end;
$$;

create or replace function public.remove_creature_from_team(
  p_trainer_id uuid,
  p_owner_id uuid,
  p_creature_id uuid
) returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform 1
  from public.trainers
  where id = p_trainer_id and owner_id = p_owner_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'trainer_not_found';
  end if;

  update public.creatures
  set is_in_team = false, team_slot = null
  where id = p_creature_id and trainer_id = p_trainer_id and is_in_team;

  if not found then
    raise exception using errcode = 'P0001', message = 'creature_not_found';
  end if;

  return true;
end;
$$;

create or replace function public.reorder_team(
  p_trainer_id uuid,
  p_owner_id uuid,
  p_creature_ids uuid[]
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_team_ids uuid[];
begin
  perform 1
  from public.trainers
  where id = p_trainer_id and owner_id = p_owner_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'trainer_not_found';
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_creature_ids, '{}'::uuid[])) as requested(id)
    where not exists (
      select 1
      from public.creatures c
      where c.trainer_id = p_trainer_id and c.id = requested.id
    )
  ) then
    raise exception using errcode = 'P0001', message = 'creature_not_found';
  end if;

  select coalesce(array_agg(c.id order by c.team_slot), '{}'::uuid[])
  into v_team_ids
  from public.creatures c
  where c.trainer_id = p_trainer_id and c.is_in_team;

  if cardinality(coalesce(p_creature_ids, '{}'::uuid[])) <> cardinality(v_team_ids)
    or exists (
      select 1
      from unnest(coalesce(p_creature_ids, '{}'::uuid[])) as requested(id)
      where not (requested.id = any(v_team_ids))
    )
  then
    raise exception using errcode = 'P0001', message = 'invalid_team_command';
  end if;

  -- The slots are emptied before they are filled again: the unique index on
  -- (trainer_id, team_slot) refuses a swap that would hold the same slot
  -- twice.
  update public.creatures
  set is_in_team = false, team_slot = null
  where trainer_id = p_trainer_id and is_in_team;

  update public.creatures c
  set is_in_team = true, team_slot = t.ordinality
  from unnest(p_creature_ids) with ordinality as t(id, ordinality)
  where c.trainer_id = p_trainer_id and c.id = t.id;
end;
$$;

revoke execute on function public.add_creature_to_team(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.add_creature_to_team(uuid, uuid, uuid) to service_role;

revoke execute on function public.remove_creature_from_team(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.remove_creature_from_team(uuid, uuid, uuid) to service_role;

revoke execute on function public.reorder_team(uuid, uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.reorder_team(uuid, uuid, uuid[]) to service_role;

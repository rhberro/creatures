-- Creatures — the manual swap exchanges the positions of the two creatures.
--
-- The first version of the function moved the chosen creature to the first slot
-- and shifted the others along, but the game rule is an exchange: the chosen
-- creature takes the place of the one in the field, and the one in the field
-- takes the place of the chosen one. The creatures in between do not move.
--
-- The change touches two rows of `creatures` at once, and the partial unique
-- index on (trainer_id, team_slot) refuses two creatures in the same slot: a
-- single update that exchanges the values collides with itself. The two
-- creatures leave the slots for a moment and take them again, in the same
-- transaction.

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
  v_active_id uuid;
  v_target_slot int;
begin
  perform 1
  from public.trainers
  where id = p_trainer_id and owner_id = p_owner_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'trainer_not_found';
  end if;

  select c.team_slot into v_target_slot
  from public.creatures c
  where c.id = p_creature_id and c.trainer_id = p_trainer_id and c.is_in_team;

  if v_target_slot is null then
    raise exception using errcode = 'P0001', message = 'creature_not_found';
  end if;

  -- The creature in the field is the one in the first slot of the team.
  select c.id into v_active_id
  from public.creatures c
  where c.trainer_id = p_trainer_id and c.is_in_team and c.team_slot = 1;

  if v_active_id is null or v_target_slot = 1 then
    return 1;
  end if;

  -- The two creatures leave the slots for a moment: the unique index on
  -- (trainer_id, team_slot) refuses a swap that would hold the same slot twice.
  update public.creatures
  set is_in_team = false, team_slot = null
  where trainer_id = p_trainer_id and is_in_team and team_slot in (1, v_target_slot);

  update public.creatures
  set is_in_team = true, team_slot = 1
  where id = p_creature_id and trainer_id = p_trainer_id;

  update public.creatures
  set is_in_team = true, team_slot = v_target_slot
  where id = v_active_id and trainer_id = p_trainer_id;

  return 1;
end;
$$;

revoke execute on function public.swap_active_creature(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.swap_active_creature(uuid, uuid, uuid) to service_role;

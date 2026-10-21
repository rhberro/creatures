-- Creatures — initial schema.
--
-- Access model: every table is deny-by-default. The server is the only writer and
-- it connects with the service role key, which bypasses RLS and holds explicit
-- grants. The anon/authenticated roles are revoked from every table and get no
-- RLS policy, so a leaked anon key can never read or write game data.
-- Grants and policies are intentionally asymmetric with the Supabase defaults.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.species (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  element text not null,
  description text not null default '',
  base_vitality int not null,
  base_physical_attack int not null,
  base_magic_attack int not null,
  base_physical_defense int not null,
  base_magic_defense int not null,
  capture_chance numeric(6, 5) not null,
  base_experience int not null default 100,
  is_starter boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint species_slug_check check (char_length(slug) > 0),
  constraint species_element_check check (element in ('fire', 'water', 'plant', 'neutral')),
  constraint species_base_vitality_check check (base_vitality >= 0),
  constraint species_base_physical_attack_check check (base_physical_attack >= 0),
  constraint species_base_magic_attack_check check (base_magic_attack >= 0),
  constraint species_base_physical_defense_check check (base_physical_defense >= 0),
  constraint species_base_magic_defense_check check (base_magic_defense >= 0),
  constraint species_capture_chance_check check (capture_chance > 0 and capture_chance <= 1),
  constraint species_base_experience_check check (base_experience >= 0)
);

create table public.abilities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  element text not null,
  damage int not null,
  cooldown_ms int not null,
  description text not null default '',
  constraint abilities_slug_check check (char_length(slug) > 0),
  constraint abilities_element_check check (element in ('fire', 'water', 'plant', 'neutral')),
  constraint abilities_damage_check check (damage >= 0),
  constraint abilities_cooldown_ms_check check (cooldown_ms >= 0)
);

create table public.species_abilities (
  species_id uuid not null references public.species (id) on delete cascade,
  ability_id uuid not null references public.abilities (id) on delete cascade,
  slot int not null,
  primary key (species_id, slot),
  constraint species_abilities_slot_check check (slot between 0 and 3)
);

create index species_abilities_ability_id_idx on public.species_abilities (ability_id);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null default '',
  price int not null default 0,
  constraint items_slug_check check (char_length(slug) > 0),
  constraint items_category_check check (category in ('consumable', 'device', 'material')),
  constraint items_price_check check (price >= 0)
);

create table public.species_drops (
  species_id uuid not null references public.species (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete cascade,
  chance numeric(6, 5) not null,
  primary key (species_id, item_id),
  constraint species_drops_chance_check check (chance > 0 and chance <= 1)
);

create index species_drops_item_id_idx on public.species_drops (item_id);

create table public.type_effectiveness (
  attacker_element text not null,
  defender_element text not null,
  multiplier numeric(3, 2) not null default 1.00,
  primary key (attacker_element, defender_element),
  constraint type_effectiveness_attacker_element_check check (
    attacker_element in ('fire', 'water', 'plant', 'neutral')
  ),
  constraint type_effectiveness_defender_element_check check (
    defender_element in ('fire', 'water', 'plant', 'neutral')
  ),
  constraint type_effectiveness_multiplier_check check (multiplier > 0)
);

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  normalized_name text not null unique,
  gender text not null,
  level int not null default 1,
  experience int not null default 0,
  gold bigint not null default 0,
  diamonds bigint not null default 0,
  stamina_minutes int not null default 720,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trainers_name_check check (char_length(name) between 3 and 15),
  constraint trainers_normalized_name_check check (char_length(normalized_name) between 3 and 15),
  constraint trainers_gender_check check (gender in ('male', 'female')),
  constraint trainers_level_check check (level >= 1),
  constraint trainers_experience_check check (experience >= 0),
  constraint trainers_gold_check check (gold >= 0),
  constraint trainers_diamonds_check check (diamonds >= 0),
  constraint trainers_stamina_minutes_check check (stamina_minutes >= 0 and stamina_minutes <= 720)
);

create index trainers_owner_id_created_at_idx on public.trainers (owner_id, created_at);

create table public.creatures (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  species_id uuid not null references public.species (id) on delete restrict,
  nickname text,
  level int not null default 1,
  experience int not null default 0,
  potential jsonb not null,
  is_in_team boolean not null default false,
  team_slot int,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint creatures_level_check check (level >= 1),
  constraint creatures_experience_check check (experience >= 0),
  constraint creatures_team_slot_check check (team_slot is null or team_slot between 1 and 5),
  constraint creatures_team_consistency_check check (
    (is_in_team and team_slot is not null) or (not is_in_team and team_slot is null)
  ),
  constraint creatures_potential_check check (
    jsonb_typeof(potential->'vitality') = 'number'
    and jsonb_typeof(potential->'physicalAttack') = 'number'
    and jsonb_typeof(potential->'magicAttack') = 'number'
    and jsonb_typeof(potential->'physicalDefense') = 'number'
    and jsonb_typeof(potential->'magicDefense') = 'number'
    and potential->'vitality' between '0'::jsonb and '100'::jsonb
    and potential->'physicalAttack' between '0'::jsonb and '100'::jsonb
    and potential->'magicAttack' between '0'::jsonb and '100'::jsonb
    and potential->'physicalDefense' between '0'::jsonb and '100'::jsonb
    and potential->'magicDefense' between '0'::jsonb and '100'::jsonb
  )
);

create index creatures_owner_id_idx on public.creatures (owner_id);
create index creatures_trainer_id_idx on public.creatures (trainer_id);
create index creatures_species_id_idx on public.creatures (species_id);
create unique index creatures_trainer_team_slot_idx on public.creatures (trainer_id, team_slot)
where is_in_team;

create trigger species_set_updated_at
before update on public.species
for each row execute function public.set_updated_at();

create trigger trainers_set_updated_at
before update on public.trainers
for each row execute function public.set_updated_at();

-- Deny-by-default access model: RLS is enabled everywhere and no policy is created
-- for anon/authenticated, so those roles see nothing. The service role bypasses RLS
-- and keeps explicit grants, which is the only path the server uses.
alter table public.species enable row level security;
alter table public.abilities enable row level security;
alter table public.species_abilities enable row level security;
alter table public.items enable row level security;
alter table public.species_drops enable row level security;
alter table public.type_effectiveness enable row level security;
alter table public.trainers enable row level security;
alter table public.creatures enable row level security;

revoke all on table public.species from anon, authenticated;
revoke all on table public.abilities from anon, authenticated;
revoke all on table public.species_abilities from anon, authenticated;
revoke all on table public.items from anon, authenticated;
revoke all on table public.species_drops from anon, authenticated;
revoke all on table public.type_effectiveness from anon, authenticated;
revoke all on table public.trainers from anon, authenticated;
revoke all on table public.creatures from anon, authenticated;

grant all on table public.species to service_role;
grant all on table public.abilities to service_role;
grant all on table public.species_abilities to service_role;
grant all on table public.items to service_role;
grant all on table public.species_drops to service_role;
grant all on table public.type_effectiveness to service_role;
grant all on table public.trainers to service_role;
grant all on table public.creatures to service_role;

grant all on table public.species to postgres;
grant all on table public.abilities to postgres;
grant all on table public.species_abilities to postgres;
grant all on table public.items to postgres;
grant all on table public.species_drops to postgres;
grant all on table public.type_effectiveness to postgres;
grant all on table public.trainers to postgres;
grant all on table public.creatures to postgres;

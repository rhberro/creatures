-- Creatures — the hunt areas.
--
-- A hunt area is a place the trainer can hunt. It owns the species that live
-- there and the primary species, the one that represents the place. The items
-- of an area are not stored: they are the union of the drops of its species,
-- which keeps the rule of the design in one place only.
--
-- Access model stays deny-by-default: RLS is enabled, anon and authenticated
-- have no grant and no policy, and only the service role -- which bypasses RLS
-- -- sees the rows. The server is the only writer.

create table public.hunt_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  recommended_level int not null check (recommended_level >= 1),
  minimum_level int not null check (minimum_level >= 1),
  tone text not null check (tone in ('arcane', 'blood', 'ember', 'frost', 'gold', 'neutral', 'verdant')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hunt_areas_slug_check check (char_length(slug) > 0),
  constraint hunt_areas_name_check check (char_length(name) > 0)
);

create table public.hunt_area_species (
  hunt_area_id uuid not null references public.hunt_areas (id) on delete cascade,
  species_id uuid not null references public.species (id) on delete restrict,
  is_primary boolean not null default false,
  position int not null default 0,
  primary key (hunt_area_id, species_id)
);

-- species_id is a foreign key and Postgres does not index foreign keys on its
-- own. The index keeps the lookup of the areas of a species from degrading
-- into a sequential scan.
create index hunt_area_species_species_id_idx on public.hunt_area_species (species_id);

create trigger hunt_areas_set_updated_at
before update on public.hunt_areas
for each row execute function public.set_updated_at();

alter table public.hunt_areas enable row level security;
alter table public.hunt_area_species enable row level security;

revoke all on table public.hunt_areas from anon, authenticated;
revoke all on table public.hunt_area_species from anon, authenticated;

grant all on table public.hunt_areas to service_role;
grant all on table public.hunt_area_species to service_role;
grant all on table public.hunt_areas to postgres;
grant all on table public.hunt_area_species to postgres;

drop policy if exists hunt_areas_service_role_all on public.hunt_areas;
create policy hunt_areas_service_role_all on public.hunt_areas
for all to service_role
using (true)
with check (true);

drop policy if exists hunt_area_species_service_role_all on public.hunt_area_species;
create policy hunt_area_species_service_role_all on public.hunt_area_species
for all to service_role
using (true)
with check (true);

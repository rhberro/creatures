-- Creatures — the trainer inventory, the backpack.
--
-- The backpack is the list of items the trainer owns. It is a join between the
-- trainer and the catalog of items, with the quantity owned of each one. The
-- rows with quantity zero are kept: they are the place the item would go back
-- to when it is spent, and the backpack only shows what the trainer has.
--
-- Access model stays deny-by-default: RLS is enabled, anon and authenticated
-- have no grant and no policy, and only the service role -- which bypasses RLS
-- -- sees the rows. The server is the only writer.

create table public.trainer_items (
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete restrict,
  quantity int not null default 0 check (quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (trainer_id, item_id)
);

-- item_id is a foreign key and Postgres does not index foreign keys on its
-- own. The index keeps the join with the catalog and the restrict check from
-- degrading into a sequential scan.
create index trainer_items_item_id_idx on public.trainer_items (item_id);

create trigger trainer_items_set_updated_at
before update on public.trainer_items
for each row execute function public.set_updated_at();

alter table public.trainer_items enable row level security;

revoke all on table public.trainer_items from anon, authenticated;

grant all on table public.trainer_items to service_role;
grant all on table public.trainer_items to postgres;

drop policy if exists trainer_items_service_role_all on public.trainer_items;
create policy trainer_items_service_role_all on public.trainer_items
for all to service_role
using (true)
with check (true);

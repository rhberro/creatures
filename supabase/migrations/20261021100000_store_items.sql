-- Creatures -- the store.
--
-- The store sells a small part of the catalog: the basic consumables and the
-- capture devices. The flag `is_store_item` says which items the shop offers,
-- and it is the only thing that decides the catalog of the shop: everything
-- else in `items` is either loot or something the shop does not carry.
--
-- The price of the item is the price of the shop: the buy price is the whole
-- value, and the sell price is 90% of it. The store item is never free, so
-- the constraint below refuses an item the shop would sell for nothing.
--
-- Buying and selling are transactional functions: the gold of the trainer and
-- the quantity of the item are written in the same transaction, so the
-- balance never goes inconsistent. The functions refuse the operation with a
-- raised exception, and the exception carries the reason of the refusal.
--
-- Access model stays deny-by-default: the helpers are executable only by the
-- service role.

alter table public.items
  add column is_store_item boolean not null default false;

alter table public.items
  add constraint items_store_price_check check (not is_store_item or price > 0);

-- Buys an item of the store for the trainer.
--
-- The gold is debited and the quantity is added to the backpack of the
-- trainer, in the same transaction. The row of the backpack is created when it
-- does not exist yet.
create or replace function public.store_buy_item(
  p_trainer_id uuid,
  p_item_id uuid,
  p_quantity int
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_price int;
  v_gold bigint;
  v_total bigint;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 999999 then
    raise exception using errcode = 'P0001', message = 'store_invalid_quantity';
  end if;

  -- The item has to be in the catalog of the store, and it has to cost
  -- something: an item with no price is not for sale.
  select i.price into v_price
  from public.items i
  where i.id = p_item_id and i.is_store_item and i.price > 0;

  if v_price is null then
    raise exception using errcode = 'P0001', message = 'store_item_unavailable';
  end if;

  -- The row of the trainer is locked for the rest of the transaction, so two
  -- buys at the same time cannot spend the same gold twice.
  select t.gold into v_gold
  from public.trainers t
  where t.id = p_trainer_id
  for update;

  if v_gold is null then
    raise exception using errcode = 'P0001', message = 'store_trainer_not_found';
  end if;

  v_total := v_price::bigint * p_quantity::bigint;

  if v_gold < v_total then
    raise exception using errcode = 'P0001', message = 'store_insufficient_gold';
  end if;

  update public.trainers
  set gold = gold - v_total
  where id = p_trainer_id;

  insert into public.trainer_items (trainer_id, item_id, quantity)
  values (p_trainer_id, p_item_id, p_quantity)
  on conflict (trainer_id, item_id) do update
    set quantity = public.trainer_items.quantity + excluded.quantity;

  return pg_catalog.jsonb_build_object('gold', v_gold - v_total, 'total', v_total);
end;
$$;

-- Sells a quantity of an item the trainer owns.
--
-- The sale yields 90% of the price of the item: the difference is the cost of
-- passing through the shop. The quantity is removed from the backpack and the
-- gold is credited, in the same transaction.
create or replace function public.store_sell_item(
  p_trainer_id uuid,
  p_item_id uuid,
  p_quantity int
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_owned int;
  v_price int;
  v_unit bigint;
  v_gold bigint;
  v_total bigint;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 999999 then
    raise exception using errcode = 'P0001', message = 'store_invalid_quantity';
  end if;

  select ti.quantity into v_owned
  from public.trainer_items ti
  where ti.trainer_id = p_trainer_id and ti.item_id = p_item_id
  for update;

  if v_owned is null or v_owned < p_quantity then
    raise exception using errcode = 'P0001', message = 'store_item_not_in_backpack';
  end if;

  select i.price into v_price
  from public.items i
  where i.id = p_item_id and i.price > 0;

  if v_price is null then
    raise exception using errcode = 'P0001', message = 'store_item_unavailable';
  end if;

  select t.gold into v_gold
  from public.trainers t
  where t.id = p_trainer_id
  for update;

  if v_gold is null then
    raise exception using errcode = 'P0001', message = 'store_trainer_not_found';
  end if;

  -- The price of the sale is the price of the item, rounded to the nearest
  -- coin. The rounding happens here, so the server and the client never
  -- disagree about the value of a sale.
  v_unit := pg_catalog.round(v_price::numeric * 0.9)::bigint;
  v_total := v_unit * p_quantity::bigint;

  update public.trainer_items
  set quantity = quantity - p_quantity
  where trainer_id = p_trainer_id and item_id = p_item_id;

  update public.trainers
  set gold = gold + v_total
  where id = p_trainer_id;

  return pg_catalog.jsonb_build_object('gold', v_gold + v_total, 'total', v_total);
end;
$$;

revoke execute on function public.store_buy_item(uuid, uuid, int) from public, anon, authenticated;
grant execute on function public.store_buy_item(uuid, uuid, int) to service_role;

revoke execute on function public.store_sell_item(uuid, uuid, int) from public, anon, authenticated;
grant execute on function public.store_sell_item(uuid, uuid, int) to service_role;

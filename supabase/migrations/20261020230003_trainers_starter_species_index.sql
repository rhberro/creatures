-- Creatures — index for the new foreign key.
--
-- trainers.starter_species_id is a foreign key and Postgres does not index
-- foreign keys on its own. The index keeps the join and the cascade checks from
-- degrading into a sequential scan.

create index trainers_starter_species_id_idx on public.trainers (starter_species_id);

-- `updated_at` maintained by the database, not by the application.
--
-- Every editable table defaults `updated_at` to now() on insert, but a
-- default does nothing on UPDATE. Leaving it to the API means the timestamp
-- is a claim about what the API did, not about the row: an `UPDATE` run from
-- psql to fix one field leaves a lying timestamp behind, and the admin's
-- "last edited" column quietly stops being true.
--
-- The trigger is `before update` and compares the whole row, so an UPDATE
-- that changes nothing does not bump the timestamp. `pg_trigger_depth() = 0`
-- is not needed here because this trigger writes only to NEW and so cannot
-- recurse.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  -- An UPDATE that sets every column to the value it already had is not an
  -- edit, and should not look like one in the audit trail.
  if new is distinct from old then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'BEFORE UPDATE trigger: stamps updated_at when the row actually changed.';

-- Attach it to every table that has an `updated_at` column, found by asking
-- the catalogue rather than by listing names here. A table added in a later
-- migration needs this block re-run (or its own trigger); listing twenty-odd
-- names by hand guarantees the next one is forgotten.
do $$
declare
  t record;
begin
  for t in
    select c.table_name
    from information_schema.columns c
    join information_schema.tables tb
      on tb.table_schema = c.table_schema
     and tb.table_name  = c.table_name
    where c.table_schema = 'public'
      and c.column_name  = 'updated_at'
      and tb.table_type  = 'BASE TABLE'
    order by c.table_name
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I', t.table_name
    );
    execute format(
      'create trigger set_updated_at
         before update on public.%I
         for each row execute function public.set_updated_at()',
      t.table_name
    );
  end loop;
end
$$;

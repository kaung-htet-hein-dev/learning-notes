-- Kaung's Notes — initial schema.
-- Public is read-only (RLS: SELECT only). Writes happen only from local scripts
-- using the service_role key, which bypasses RLS.

create table entries (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,              -- URL: /notes/[slug]
  url         text[]                             -- original article(s); url[1] is the primary source.
              check (cardinality(url) >= 1),     -- null when there is no source, never '{}'
  title       text not null,
  description text not null,                     -- 1–2 lines for feed rows
  author      text,
  source_name text,                              -- e.g. "System Design Newsletter"
  read_at     date not null default current_date,
  body_md     text not null,                     -- free-form Markdown note
  self_test   jsonb not null default '[]'        -- [{ "q": "...", "a": "..." }]
              check (jsonb_typeof(self_test) = 'array'),
  my_note     text,                              -- one line in my own words (public)
  tags        text[] not null default '{}',      -- lowercase kebab-case
  -- Lets feed rows and search results show reading time without fetching body_md.
  word_count  integer generated always as (
    coalesce(array_length(regexp_split_to_array(btrim(body_md), '\s+'), 1), 0)
  ) stored,
  search tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')),       'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body_md, '')),     'C') ||
    setweight(to_tsvector('english', coalesce(my_note, '')),     'C')
  ) stored,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index entries_search_idx  on entries using gin (search);
create index entries_tags_idx    on entries using gin (tags);
create index entries_url_idx     on entries using gin (url);      -- url @> array['https://…']
create index entries_read_at_idx on entries (read_at desc);

alter table entries enable row level security;
create policy "public read" on entries for select using (true);
-- No insert/update/delete policies: anon is read-only. service_role bypasses RLS.

-- keep updated_at fresh
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
create trigger entries_updated_at before update on entries
  for each row execute function set_updated_at();

-- Tag counts for /tags and scripts/list-tags.ts.
-- security_invoker makes the view respect the caller's RLS instead of the owner's.
create view tag_counts with (security_invoker = true) as
  select tag, count(*)::integer as count
  from entries, unnest(tags) as tag
  group by tag
  order by count desc, tag asc;

grant select on entries    to anon, authenticated;
grant select on tag_counts to anon, authenticated;

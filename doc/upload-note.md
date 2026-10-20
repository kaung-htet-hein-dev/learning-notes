# Uploading a Note to Supabase (LLM guide)

How an AI agent turns an article into a row in `entries`. Schema:
[`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql),
[`erd.md`](./erd.md).

## Access

RLS allows `SELECT` only, so the anon key cannot write. Write via:

1. **Supabase Dashboard → SQL Editor** (default): output one SQL statement for the user to paste.
2. **Local script** with `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`. Never print, commit, or expose this key (`NEXT_PUBLIC_*`, Vercel).

## Fields

| column | required | rule |
| --- | --- | --- |
| `slug` | yes | Unique lowercase kebab-case from the title. Becomes `/notes/<slug>`. |
| `title` | yes | Article title or a clear topic title. |
| `description` | yes | 1–2 plain-text lines for the feed. No Markdown, no "This article is about...". |
| `body_md` | yes | Markdown in the [teaching style](#writing-style). Sections start at `##` (page renders `title` as `h1`). Explain in your own words; never paste the article. |
| `url` | no | `text[]`, primary source first. `null` if no source; never `'{}'`. |
| `author` | no | Article author. |
| `source_name` | no | Publication, e.g. `MDN Web Docs`. |
| `read_at` | no | `'YYYY-MM-DD'`, defaults to today. |
| `self_test` | no | JSON array of 2–5 `{ "q", "a" }` items. |
| `my_note` | no | One public line in the user's words. Only if the user gave it; never invent. |
| `tags` | no | 2–5 lowercase kebab-case tags. Reuse existing ones. |

Never set `id`, `word_count`, `search`, `created_at`, `updated_at` (defaults,
generated columns, or trigger).

## Writing style

Write `body_md` like a patient tutor explaining the topic to a smart learner,
not like a summary of the article.

- **Start with the big picture.** Open with 1–2 sentences in plain language:
  what this is and why it matters.
- **Build up step by step.** Order sections from simple to advanced. Each
  section answers one question (What is it? Why does it exist? How does it
  work? When to use it?).
- **Use analogies.** Tie new ideas to familiar ones ("a load balancer is like
  a host seating guests across tables").
- **Show, don't just tell.** Add a concrete example, code snippet, or small
  walkthrough for each key idea.
- **Add a diagram whenever possible.** Flows, architectures, request paths,
  data structures, state changes, before/after comparisons. Draw it as ASCII
  art in a ` ```text ` fence and put it next to the paragraph it explains.
  The renderer (`src/components/markdown.tsx`) has no Mermaid and skips raw
  HTML, so ` ```mermaid ` and `<svg>` will not render as diagrams. Keep lines
  under ~70 characters so they fit on mobile.
- **Define terms on first use.** Bold the term, then explain it in one line.
- **Call out pitfalls.** Note common mistakes and misconceptions.
- **Keep it scannable.** Short paragraphs, bullet lists, tables for
  comparisons.
- **End with `## Key takeaways`.** 3–5 bullets the reader should remember.

## Procedure

1. **Check duplicates and tags.**
   ```sql
   select slug, title from entries
   where slug = '<slug>' or url @> array['<primary-url>'];
   select tag, count from tag_counts;
   ```
   If a row exists, upsert instead of insert.
2. **Write the content** following the field rules.
3. **Preview and wait for approval.** Do not output the SQL or run the script
   yet. Show `title`, `slug`, `description`, `tags`, `url` as a short list;
   `body_md` rendered as normal Markdown (not in a code fence); `self_test` as
   a numbered Q/A list. Apply the user's edits and re-preview until they
   approve. Only approved text gets uploaded.
4. **Output the SQL** (or run the script).
5. **Revalidate the deployed cache.** Reads use `"use cache"` +
   `cacheLife("max")` (refresh after 30 days), so a new note shows in
   `pnpm dev` but not on the deployed site until revalidated. After upload:
   ```sh
   curl -X POST "$SITE_URL/api/revalidate" \
     -H "x-revalidate-secret: $REVALIDATE_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"slug":"<slug>"}'
   ```
   `SITE_URL` and `REVALIDATE_SECRET` come from `.env.local`; never print the
   secret. Expect `{"revalidated":true,...}`; `401` means the secret differs
   from the one set in Vercel. If the user pastes SQL instead, give them this
   command to run.

## SQL template

`$md$ ... $md$` dollar-quotes `body_md` so apostrophes need no escaping. In
other strings, escape `'` as `''`.

````sql
insert into entries (
  slug, url, title, description, author, source_name,
  read_at, body_md, self_test, my_note, tags
)
values (
  'consistent-hashing',
  array['https://blog.example.com/consistent-hashing'],
  'Consistent Hashing',
  'How consistent hashing keeps cache reshuffling small when nodes join or leave.',
  'Jane Doe',
  'System Design Newsletter',
  '2026-10-20',
  $md$
Consistent hashing decides which server stores which key, so adding or
removing a server moves only a few keys instead of almost all of them.

## Why the simple approach breaks
With `hash(key) % N`, changing `N` from 4 to 5 remaps most keys. In a cache,
that means a sudden wave of misses.

## How it works
Picture a clock face. Servers sit at points on the ring; each key walks
clockwise to the first server it meets. Remove a server and only its keys
move to the next one.

```text
            S1
        .--------.
   k3 /            \ k1      k1 -> S2
     |              |        k2 -> S3
  S3 |     ring     | S2     k3 -> S1
     |              |
      \            /
        '--------'
            k2
```

## Key takeaways
- Modulo hashing reshuffles almost everything on resize.
- A ring limits movement to about `1/N` of keys.
$md$,
  '[{"q": "Why does modulo hashing break on resize?", "a": "Changing N remaps nearly every key."}]'::jsonb,
  null,
  array['system-design', 'caching']
)
-- To update an existing note, add before `returning`:
-- on conflict (slug) do update set
--   title = excluded.title, description = excluded.description,
--   body_md = excluded.body_md, tags = excluded.tags
returning slug;
````

Script equivalent:
`supabase.from("entries").upsert({ ...row }, { onConflict: "slug" }).select("slug").single()`.

## Common errors

- `duplicate key ... "entries_slug_key"`: slug taken. Pick another or upsert.
- `violates check constraint` on `url`: `url` is `'{}'`. Use `null`.
- `violates check constraint` on `self_test`: not an array. Wrap in `[...]`.
- `cannot insert a non-DEFAULT value into column`: wrote a generated column. Remove it.
- `new row violates row-level security policy`: used the anon key.

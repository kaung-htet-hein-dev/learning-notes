import { cacheLife, cacheTag } from "next/cache";
import sample from "../../supabase/seed/http-1-1-vs-http-2-vs-http-3.json";
import type { Database } from "./database.types";
import { countWords } from "./format";
import { mockNotes } from "./mock-notes";
import { getSupabase, isSupabaseConfigured } from "./supabase";

type EntryRow = Database["public"]["Tables"]["entries"]["Row"];

export type Entry = Omit<EntryRow, "search">;
export type EntrySummary = Pick<
  EntryRow,
  "slug" | "title" | "description" | "read_at" | "tags" | "word_count"
>;

const SUMMARY_COLUMNS = "slug, title, description, read_at, tags, word_count";
const ENTRY_COLUMNS =
  "id, slug, url, title, description, author, source_name, read_at, body_md, self_test, my_note, tags, word_count, created_at, updated_at";

// Without Supabase env vars (fresh clone, local design work) the site renders the
// seeded sample note plus mock notes instead of failing the build.
let warnedAboutSample = false;

function sampleEntries(): Entry[] {
  if (!warnedAboutSample) {
    console.warn("[entries] Supabase env vars missing — rendering sample data only.");
    warnedAboutSample = true;
  }
  const now = "2026-10-18T00:00:00.000Z";
  return [sample, ...mockNotes]
    .map((note, i) => ({
      ...note,
      id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`,
      word_count: countWords(note.body_md),
      created_at: now,
      updated_at: now,
    }))
    .sort((a, b) => b.read_at.localeCompare(a.read_at));
}

function toSummary({ slug, title, description, read_at, tags, word_count }: Entry): EntrySummary {
  return { slug, title, description, read_at, tags, word_count };
}

/** All entries, newest first. */
export async function getFeed(): Promise<EntrySummary[]> {
  "use cache";
  cacheLife("max");
  cacheTag("entries");

  if (!isSupabaseConfigured) return sampleEntries().map(toSummary);

  const { data, error } = await getSupabase()
    .from("entries")
    .select(SUMMARY_COLUMNS)
    .order("read_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load entries: ${error.message}`);
  return data;
}

export async function getEntry(slug: string): Promise<Entry | null> {
  "use cache";
  cacheLife("max");
  cacheTag(`entry:${slug}`);

  if (!isSupabaseConfigured) return sampleEntries().find((e) => e.slug === slug) ?? null;

  const { data, error } = await getSupabase()
    .from("entries")
    .select(ENTRY_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load entry "${slug}": ${error.message}`);
  return data;
}

/** Neighbours in feed order: `newer` is above this entry in the feed, `older` below. */
export async function getAdjacent(
  slug: string,
): Promise<{ newer: EntrySummary | null; older: EntrySummary | null }> {
  const feed = await getFeed();
  const index = feed.findIndex((e) => e.slug === slug);
  if (index === -1) return { newer: null, older: null };
  return { newer: feed[index - 1] ?? null, older: feed[index + 1] ?? null };
}

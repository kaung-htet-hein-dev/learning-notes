import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { NotesDrawer } from "@/components/notes-drawer";
import { TagList } from "@/components/tag-list";
import { getAdjacent, getEntry, getFeed, type EntrySummary } from "@/lib/entries";
import { formatDate, readingTime, sourceLabel } from "@/lib/format";
import { notePath } from "@/lib/site";

// Params are awaited outside <Suspense> on purpose: each note prerenders as a full static
// page and unknown slugs get a real 404 status instead of a streamed soft-404.
export const instant = false;

// Cache Components requires at least one param; an empty DB gets a placeholder that 404s.
const PLACEHOLDER_SLUG = "__placeholder__";

export async function generateStaticParams() {
  const feed = await getFeed();
  if (feed.length === 0) return [{ slug: PLACEHOLDER_SLUG }];
  return feed.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps<"/notes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry) return {};
  const path = notePath(entry.slug);
  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.description,
      url: path,
      publishedTime: entry.read_at,
      modifiedTime: entry.updated_at,
      tags: entry.tags,
    },
  };
}

export default async function NotePage({ params }: PageProps<"/notes/[slug]">) {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry) notFound();

  const [{ newer, older }, feed] = await Promise.all([getAdjacent(entry.slug), getFeed()]);

  return (
    <article className="page-width pt-6 md:pt-12">
      <NotesDrawer entries={feed} currentSlug={entry.slug} />

      <header className="mt-8 md:mt-14">
        <TagList tags={entry.tags} />
        <h1 className="mt-6 font-serif text-[34px] font-bold leading-[1.15] tracking-[-0.015em] text-balance break-words sm:text-[42px] md:text-[56px] md:leading-[1.1]">
          {entry.title}
        </h1>
        <p className="mt-4 text-xl leading-snug text-muted text-pretty md:text-[26px]">{entry.description}</p>

        <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 border-y py-4 text-[15px] text-muted sm:text-base">
          <time dateTime={entry.read_at}>{formatDate(entry.read_at)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingTime(entry.word_count)}</span>
          {entry.url && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {entry.url.length > 1 ? "Sources" : "Source"}:{" "}
                {entry.url.map((url, i) => (
                  <span key={url}>
                    {i > 0 && ", "}
                    {/* source_name describes the primary source only */}
                    <a href={url} target="_blank" rel="noopener noreferrer" className="link">
                      {sourceLabel(i === 0 ? entry.source_name : null, url)}
                      <span aria-hidden="true"> ↗</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </span>
                ))}
              </span>
            </>
          )}
        </p>
      </header>

      <div className="mt-10">
        <Markdown source={entry.body_md} />
      </div>

      {entry.my_note && (
        <aside className="mt-12 rounded-md border bg-surface px-5 py-5 md:px-7 md:py-6" aria-label="My take">
          <p className="text-base font-semibold text-muted">My take</p>
          <p className="reading mt-2">{entry.my_note}</p>
        </aside>
      )}

      <AdjacentNav newer={newer} older={older} />
    </article>
  );
}

function AdjacentNav({ newer, older }: { newer: EntrySummary | null; older: EntrySummary | null }) {
  if (!newer && !older) return null;
  return (
    <nav aria-label="Previous and next notes" className="mt-16 grid gap-3 sm:grid-cols-2 sm:gap-4">
      {older ? (
        <AdjacentLink entry={older} direction="previous" />
      ) : (
        <span className="hidden sm:block" />
      )}
      {newer && <AdjacentLink entry={newer} direction="next" />}
    </nav>
  );
}

function AdjacentLink({ entry, direction }: { entry: EntrySummary; direction: "previous" | "next" }) {
  const next = direction === "next";
  return (
    <Link
      href={notePath(entry.slug)}
      rel={next ? "next" : "prev"}
      className={`group flex min-h-[112px] flex-col justify-between gap-3 rounded-lg border px-5 py-4 transition-colors duration-150 hover:border-muted hover:bg-surface ${
        next ? "sm:items-end sm:text-right" : ""
      }`}
    >
      <span className={`flex items-center gap-2 text-[15px] text-muted ${next ? "sm:flex-row-reverse" : ""}`}>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform duration-150 ${
            next ? "rotate-180 group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"
          }`}
        >
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {next ? "Next note" : "Previous note"}
      </span>
      <span className="text-lg font-semibold leading-snug text-pretty md:text-xl">{entry.title}</span>
    </Link>
  );
}

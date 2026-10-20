import Link from "next/link";
import type { ReactNode } from "react";
import type { EntrySummary } from "@/lib/entries";
import { formatDate, readingTime } from "@/lib/format";
import { notePath } from "@/lib/site";
import { TagList } from "./tag-list";

type Props = {
  entry: EntrySummary;
  /** Optional pre-rendered title/description (e.g. with search highlights). */
  title?: ReactNode;
  description?: ReactNode;
};

export function EntryRow({ entry, title, description }: Props) {
  return (
    <article className="group relative border-b py-8 first:pt-6">
      <p className="text-[15px] text-muted">
        <time dateTime={entry.read_at}>{formatDate(entry.read_at)}</time>
        <span aria-hidden="true"> · </span>
        {readingTime(entry.word_count)}
      </p>
      <h2 className="mt-2 text-[22px] font-bold leading-snug tracking-tight text-pretty sm:text-2xl md:text-[28px]">
        {/* Stretched link: the whole row is clickable; tags sit above it (z-10). */}
        <Link
          href={notePath(entry.slug)}
          className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4"
        >
          {title ?? entry.title}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-2 text-lg leading-relaxed text-muted">
        {description ?? entry.description}
      </p>
      <TagList tags={entry.tags} className="mt-4" />
    </article>
  );
}

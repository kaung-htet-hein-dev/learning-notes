const WORDS_PER_MINUTE = 230;

/** Same rule as the `word_count` generated column: whitespace-separated tokens. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function readingTime(wordCount: number): string {
  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** `read_at` is a plain date (YYYY-MM-DD); parse and format it in UTC so it never shifts a day. */
function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function formatDate(date: string): string {
  return dateFormatter.format(parseDate(date));
}

export function formatMonth(date: string): string {
  return monthFormatter.format(parseDate(date));
}

export function sourceLabel(sourceName: string | null, url: string): string {
  if (sourceName) return sourceName;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

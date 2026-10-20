import Link from "next/link";

export function TagList({ tags, className = "" }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null;
  return (
    <ul className={`relative z-10 flex flex-wrap gap-2 ${className}`} aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${tag}`}
            className="inline-block rounded-full border px-3 py-1 font-sans text-sm leading-none text-muted transition-colors duration-150 hover:border-muted hover:text-fg"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}

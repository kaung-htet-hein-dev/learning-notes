import { EntryRow } from "@/components/entry-row";
import { getFeed } from "@/lib/entries";
import { site } from "@/lib/site";

export default async function HomePage() {
  const entries = await getFeed();

  return (
    <div className="page-width">
      <section className="border-b pb-10 pt-10 md:pt-20">
        <h1 className="font-serif text-[40px] font-bold leading-[1.08] tracking-tight sm:text-[52px] md:text-[64px]">
          {site.name}
        </h1>
        <p className="reading mt-4 text-muted">{site.intro}</p>
      </section>

      {entries.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">No notes yet.</p>
      ) : (
        <div>
          {entries.map((entry) => (
            <EntryRow key={entry.slug} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

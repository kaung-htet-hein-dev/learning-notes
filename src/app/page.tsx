import { EntryRow } from "@/components/entry-row";
import { getFeed } from "@/lib/entries";

export default async function HomePage() {
  const entries = await getFeed();

  return (
    <div className="page-width">
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

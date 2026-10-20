import { revalidateTag } from "next/cache";

// Called after uploading a note so the deployed site drops its cached feed and entry.
// `expire: 0` makes the next visit fetch fresh data instead of serving the stale copy.
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = (await request.json().catch(() => ({}))) as { slug?: unknown };

  revalidateTag("entries", { expire: 0 });
  if (typeof slug === "string" && slug) revalidateTag(`entry:${slug}`, { expire: 0 });

  return Response.json({ revalidated: true, slug: typeof slug === "string" ? slug : null });
}

export const site = {
  name: "Kaung's Notes",
  intro: "Notes I write after reading technical articles — in my own words.",
  url:
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000",
  nav: [
    { href: "/tags", label: "Tags" },
    { href: "/archive", label: "Archive" }
  ]
} as const;

export function notePath(slug: string): string {
  return `/notes/${slug}`;
}

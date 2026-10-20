import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="page-width flex flex-wrap items-center justify-between gap-4 py-8 text-[15px] text-muted">
        <p>{site.name}</p>
        <nav aria-label="Footer">
          <ul className="flex gap-6">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors duration-150 hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="page-width flex h-14 items-center justify-between gap-4 sm:h-16">
        <Link
          href="/"
          className="font-serif text-[22px] font-bold tracking-tight text-fg sm:text-2xl md:text-[28px]"
        >
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-5 text-[15px] text-muted sm:gap-6 sm:text-base">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors duration-150 hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

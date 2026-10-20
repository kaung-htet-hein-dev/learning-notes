import type { Entry } from "./entries";

type MockNote = Omit<Entry, "id" | "word_count" | "created_at" | "updated_at">;

// Placeholder notes for local design work. Only rendered when Supabase is not configured;
// never part of supabase/seed, so they cannot reach the real database.
export const mockNotes: MockNote[] = [
  {
    slug: "react-server-components-mental-model",
    url: "https://react.dev/reference/rsc/server-components",
    title: "A mental model for React Server Components",
    description:
      "Server Components are not SSR with extra steps. They are a second component tree that runs once, on the server, and ships its output — not its code.",
    author: null,
    source_name: "react.dev",
    read_at: "2026-10-12",
    body_md: `## Two trees, one UI

The easiest way I found to think about RSC: there are two component trees stitched together. The **server tree** runs once per request (or once at build time) and never re-renders. The **client tree** is the React I already know — state, effects, event handlers.

The server tree's output is serialized into a payload that describes the UI. The client receives that description, not the code that produced it. A 40 kB markdown parser used only on the server costs the browser zero bytes.

## What "use client" actually marks

\`"use client"\` is not "this component runs on the client". It marks a **boundary**: this module and everything it imports become part of the client bundle. Server Components can render Client Components and pass them props, but those props must be serializable.

\`\`\`tsx
// Server Component — can await data directly
export default async function Page() {
  const notes = await db.notes.findMany();
  return <NoteList notes={notes} />; // NoteList can be a Client Component
}
\`\`\`

## What can cross the boundary

| Can pass as props | Cannot pass |
| --- | --- |
| Strings, numbers, plain objects, arrays | Functions (except Server Actions) |
| Dates, Maps, Sets, Promises | Class instances |
| JSX rendered by the server | Symbols created at runtime |

## Where it clicked for me

Children are the escape hatch. A Client Component can receive \`children\` that were rendered on the server. So an interactive \`<Drawer>\` can wrap server-rendered content without that content becoming client code.`,
    self_test: [],
    my_note:
      "Stop asking “where does this run?” and ask “where does this module get bundled?” — that question has a clear answer.",
    tags: ["react", "architecture"],
  },
  {
    slug: "goroutines-vs-the-event-loop",
    url: "https://go.dev/blog/waza-talk",
    title: "Goroutines vs the JavaScript event loop",
    description:
      "Both handle thousands of concurrent tasks on few threads. JavaScript makes you mark every pause with await; Go hides the pauses inside the runtime.",
    author: "Rob Pike",
    source_name: "The Go Blog",
    read_at: "2026-10-05",
    body_md: `## Same problem, opposite ergonomics

Coming from Node, I assumed goroutines were "Go's async/await". They solve the same problem — lots of waiting I/O on a handful of OS threads — but the cost lands in a different place.

In JavaScript, every function that might pause has to say so. \`async\` spreads up the call stack until it reaches the top. In Go, any function can block, and the scheduler parks the goroutine and runs another one on the same thread.

## The scheduler in one paragraph

Go multiplexes **M** goroutines onto **N** OS threads. Each thread has a local run queue. When a goroutine blocks on a channel, a mutex or network I/O, it is parked and the thread picks up the next runnable goroutine. Idle threads steal work from busy ones.

\`\`\`go
results := make(chan string)
for _, url := range urls {
    go func(u string) {
        results <- fetch(u) // blocks this goroutine only
    }(url)
}
\`\`\`

## The part that bit me

Real parallelism means real data races. In Node, two callbacks never touch a variable at the same instant. In Go they can. \`go test -race\` is not optional.

> Don't communicate by sharing memory; share memory by communicating.`,
    self_test: [],
    my_note: "The event loop gives me safety for free and makes me pay in syntax. Go flips that trade.",
    tags: ["go", "concurrency", "javascript"],
  },
  {
    slug: "how-postgres-b-tree-indexes-work",
    url: "https://www.postgresql.org/docs/current/btree.html",
    title: "How Postgres B-tree indexes actually find a row",
    description:
      "An index is a sorted copy of some columns plus a pointer back to the table. Most query-plan surprises come from forgetting the second half.",
    author: null,
    source_name: "PostgreSQL Docs",
    read_at: "2026-09-27",
    body_md: `## Sorted, shallow, wide

A B-tree page holds hundreds of keys, so even a table with a hundred million rows needs only three or four levels. Finding one key is a handful of page reads from the root down to a leaf.

The leaf entry stores the key and a **TID** — the physical location of the row in the heap. Postgres then has to visit the heap to fetch the rest of the row and check it is visible to the current transaction.

## Why column order matters

An index on \`(user_id, created_at)\` is sorted by \`user_id\` first. It can answer:

- \`where user_id = 42\`
- \`where user_id = 42 order by created_at desc\`

It cannot efficiently answer \`where created_at > now() - interval '1 day'\` on its own, because matching rows are scattered across every \`user_id\`.

## Index-only scans

If every column the query needs is in the index, Postgres can skip the heap — but only for pages the visibility map marks as all-visible. A table that is never vacuumed quietly loses this optimisation.`,
    self_test: [],
    my_note: "Put equality columns first, range columns last, and check EXPLAIN instead of guessing.",
    tags: ["postgres", "databases"],
  },
  {
    slug: "css-container-queries",
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries",
    title: "Container queries make components honest",
    description:
      "Media queries ask how big the screen is. Container queries ask how much room this component was given — the question a component can actually use.",
    author: null,
    source_name: "MDN Web Docs",
    read_at: "2026-09-14",
    body_md: `## The problem with the viewport

A card in a sidebar and the same card in a main column live on the same screen. A media query gives them the same answer, so the card can't adapt to where it was placed.

## Declaring a container

\`\`\`css
.card-slot {
  container-type: inline-size;
}

@container (min-width: 420px) {
  .card { grid-template-columns: 160px 1fr; }
}
\`\`\`

\`container-type: inline-size\` tells the browser this element's width does not depend on its children, which is what makes querying it safe.

## Units that follow the container

\`cqi\` is 1% of the container's inline size. Using it for type and spacing lets a component scale with its slot instead of the window.`,
    self_test: [],
    my_note: null,
    tags: ["css", "frontend"],
  },
  {
    slug: "what-happens-during-a-dns-lookup",
    url: "https://howdns.works/",
    title: "What actually happens during a DNS lookup",
    description:
      "Your laptop asks one resolver. That resolver does the walking: root, then TLD, then the domain's own nameservers — with caches short-circuiting almost every step.",
    author: null,
    source_name: "howdns.works",
    read_at: "2026-08-30",
    body_md: `## Stub resolver vs recursive resolver

My machine runs a **stub resolver**: it asks one question and expects a final answer. The **recursive resolver** (my ISP's, or 1.1.1.1) does the real work.

## The walk

1. Ask a root server: "who handles \`.dev\`?"
2. Ask the \`.dev\` TLD servers: "who handles \`example.dev\`?"
3. Ask \`example.dev\`'s authoritative nameserver: "what is the A record?"

Each answer carries a TTL, and every layer caches it. In practice, steps 1 and 2 are almost always cached.

## Why changes "take time to propagate"

Nothing propagates. Old answers simply live in caches until their TTL expires. Lowering the TTL a day before a migration is the whole trick.`,
    self_test: [],
    my_note: "“DNS propagation” is just cache expiry with better PR.",
    tags: ["networking", "dns"],
  },
  {
    slug: "sessions-vs-jwt",
    url: "https://developer.okta.com/blog/2017/08/17/why-jwts-suck-as-session-tokens",
    title: "Sessions vs JWTs for web auth",
    description:
      "A JWT is a signed claim you cannot take back. A session ID is a pointer into state you control. For browser logins, the boring option usually wins.",
    author: "Randall Degges",
    source_name: "Okta Developer",
    read_at: "2026-08-16",
    body_md: `## The trade

A **session** stores state on the server and gives the browser an opaque ID in a cookie. A **JWT** puts the state in the token itself and signs it so the server can trust it without a lookup.

The pitch for JWTs is "stateless". The catch: revocation. If a token is valid for an hour, logging out or banning a user doesn't stop it for that hour — unless you keep a denylist, which is server state again.

## Where JWTs fit

- Short-lived tokens passed between services
- Mobile apps talking to an API, paired with refresh tokens
- One-time links (email verification, password reset)

## Where sessions fit

Browser logins. An \`HttpOnly\`, \`Secure\`, \`SameSite=Lax\` cookie holding a random ID is hard to steal with XSS and trivial to revoke.`,
    self_test: [],
    my_note: null,
    tags: ["security", "auth"],
  },
  {
    slug: "react-native-new-architecture",
    url: "https://reactnative.dev/architecture/landing-page",
    title: "React Native's new architecture without the jargon",
    description:
      "The bridge is gone. JavaScript now holds direct references to native objects through JSI, which makes synchronous calls and concurrent rendering possible.",
    author: null,
    source_name: "React Native Docs",
    read_at: "2026-07-22",
    body_md: `## What the bridge was

The old architecture sent every message between JavaScript and native as serialized JSON across an asynchronous queue. Scrolling a list meant batches of JSON flying both ways, and any call into native was asynchronous whether it needed to be or not.

## The pieces that replaced it

- **JSI** — a C++ interface that lets JavaScript hold references to native objects and call them directly.
- **Turbo Modules** — native modules loaded lazily through JSI, with typed interfaces generated by Codegen.
- **Fabric** — the new renderer. It shares a shadow tree with C++ and supports React's concurrent features.

## What changed for me as an app developer

Mostly nothing day to day. Libraries had to migrate, and layout reads like \`measure\` can now be synchronous, which removes a whole class of "jumping" UI.`,
    self_test: [],
    my_note: "Less a rewrite of React Native than the removal of a bottleneck everything else was routed through.",
    tags: ["react-native", "mobile", "architecture"],
  },
];

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[680px] px-4 py-24 text-center md:px-6">
      <p className="text-sm text-muted">404</p>
      <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">This note doesn’t exist.</h1>
      <p className="mt-6 text-sm">
        <Link href="/" className="link">
          Back to all notes
        </Link>
      </p>
    </div>
  );
}

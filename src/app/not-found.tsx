import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">This page wandered off.</h1>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-rose">
          Back to the question
        </Link>
      </div>
    </main>
  );
}

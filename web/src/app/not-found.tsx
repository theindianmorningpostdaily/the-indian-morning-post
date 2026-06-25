import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="font-serif text-5xl font-black text-accent">404</h1>
      <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
        This story could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-accent px-5 py-2 font-medium text-white hover:bg-accent/90"
      >
        Back to the front page
      </Link>
    </div>
  );
}

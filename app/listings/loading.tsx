export default function ListingsLoading() {
  return (
    <main className="mx-auto flex min-h-full max-w-6xl flex-1 flex-col gap-4 px-6 py-16">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100"
          />
        ))}
      </div>
    </main>
  );
}

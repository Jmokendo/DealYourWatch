export default function ListingsLoading() {
  return (
    <main className="mx-auto flex min-h-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-4 w-72 animate-pulse rounded bg-zinc-100" />
      </div>

      {/* Search skeleton */}
      <div className="h-12 animate-pulse rounded-xl bg-zinc-100" />

      {/* Chips skeleton */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-zinc-100" />
          ))}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-28 animate-pulse rounded-full bg-zinc-100" />
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="aspect-[4/3] animate-pulse bg-zinc-100" />
            <div className="space-y-3 p-4">
              <div className="space-y-1.5">
                <div className="h-2.5 w-16 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
              </div>
              <div className="h-7 w-1/2 animate-pulse rounded bg-zinc-100" />
              <div className="flex gap-1.5">
                <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-zinc-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

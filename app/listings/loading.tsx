export default function ListingsLoading() {
  return (
    <main className="mx-auto min-h-full max-w-7xl px-6 py-16">
      <div className="space-y-8">
        <div className="h-14 w-72 animate-pulse rounded-full bg-zinc-100" />

        <section className="space-y-6">
          <div className="h-14 w-full animate-pulse rounded-full bg-zinc-100" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 min-w-[100px] animate-pulse rounded-full bg-zinc-100" />
            ))}
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[20px] border border-zinc-200 bg-white shadow-sm"
            >
              <div className="aspect-[4/3] bg-zinc-100" />
              <div className="space-y-4 p-5">
                <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-5 w-32 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-10 animate-pulse rounded-[14px] bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

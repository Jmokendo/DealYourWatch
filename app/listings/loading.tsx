export default function ListingsLoading() {
  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1b1b1d]">
      <div className="border-b border-black/[0.08] bg-white">
        <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="h-7 w-28 animate-pulse rounded-full bg-[#ece9e4]" />
          <div className="flex gap-2">
            <div className="h-10 w-28 animate-pulse rounded-full bg-[#ece9e4]" />
            <div className="h-10 w-20 animate-pulse rounded-full bg-[#ece9e4]" />
          </div>
        </div>
      </div>

      <section className="px-5 pb-10 pt-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="h-[46px] flex-1 animate-pulse rounded-full bg-[#ece9e4]" />
              <div className="flex gap-2 overflow-hidden">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-[#ece9e4]"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="h-5 w-40 animate-pulse rounded-full bg-[#ece9e4]" />
              <div className="h-5 w-32 animate-pulse rounded-full bg-[#ece9e4]" />
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[22px] border border-[#e7e3dc] bg-white"
              >
                <div className="aspect-[1.06/0.72] animate-pulse bg-[#ece9e4]" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-16 animate-pulse rounded-full bg-[#ece9e4]" />
                  <div className="h-5 w-40 animate-pulse rounded-full bg-[#ece9e4]" />
                  <div className="h-4 w-28 animate-pulse rounded-full bg-[#ece9e4]" />
                  <div className="h-9 animate-pulse rounded-full bg-[#ece9e4]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

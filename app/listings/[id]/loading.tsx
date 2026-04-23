export default function ListingDetailLoading() {
  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1d1d21]">
      <div className="border-b border-black/[0.08] bg-white">
        <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="h-7 w-28 animate-pulse rounded-full bg-[#ece9e4]" />
          <div className="flex gap-2">
            <div className="h-10 w-28 animate-pulse rounded-full bg-[#ece9e4]" />
            <div className="h-10 w-20 animate-pulse rounded-full bg-[#ece9e4]" />
          </div>
        </div>
      </div>

      <section className="px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <div className="h-5 w-56 animate-pulse rounded-full bg-[#ece9e4]" />
          <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_640px]">
            <div className="space-y-4">
              <div className="aspect-[1.08/0.9] animate-pulse rounded-[26px] bg-[#ece9e4]" />
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square animate-pulse rounded-[18px] bg-[#ece9e4]"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <div className="h-3 w-16 animate-pulse rounded-full bg-[#ece9e4]" />
                <div className="h-12 w-64 animate-pulse rounded-full bg-[#ece9e4]" />
                <div className="h-6 w-28 animate-pulse rounded-full bg-[#ece9e4]" />
                <div className="h-14 w-52 animate-pulse rounded-full bg-[#ece9e4]" />
              </div>
              <div className="h-28 animate-pulse rounded-[22px] bg-[#ece9e4]" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-12 animate-pulse rounded-full bg-[#ece9e4]" />
                <div className="h-12 animate-pulse rounded-full bg-[#ece9e4]" />
              </div>
              <div className="h-64 animate-pulse rounded-[22px] bg-[#ece9e4]" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

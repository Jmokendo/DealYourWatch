export default function NegotiationLoading() {
  return (
    <main className="mx-auto flex min-h-full max-w-5xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="h-10 w-40 animate-pulse rounded bg-zinc-100" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-[34rem] animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100" />
        <div className="h-64 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100" />
      </div>
    </main>
  );
}

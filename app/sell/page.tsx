import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { SellForm } from "@/app/sell/SellForm";
import Link from "next/link";

export default async function SellPage() {
  const session = await auth();
  const label = session?.user?.name ?? session?.user?.email ?? "your account";

  if (!session?.user) {
    return (
      <main className="mx-auto flex min-h-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Create your listing</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Sign in first so we can attach the listing to your account.
        </p>
        <div>
          <Button asChild>
            <Link href="/login?callbackUrl=/sell">Sign in to continue</Link>
          </Button>
        </div>
      </main>
    );
  }

  return <SellForm signedInLabel={label} />;
}

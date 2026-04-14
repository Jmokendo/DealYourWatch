import { SellForm } from "@/app/sell/SellForm";
import { getServerSession } from "@/lib/auth-session";

export default async function SellPage() {
  const session = await getServerSession();
  const label = session?.user?.name ?? session?.user?.email ?? "your account";

  return <SellForm signedInLabel={label} />;
}

import { SellForm } from "@/app/sell/SellForm";
import { requireAuthUser } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function SellPage() {
  const user = await requireAuthUser();
  if (!user) redirect("/login");

  const label = user.name ?? user.email;
  return <SellForm signedInLabel={label} />;
}

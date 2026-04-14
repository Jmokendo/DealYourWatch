import { SellForm } from "@/app/sell/SellForm";
import { DEV_USER } from "@/lib/devUser";

export default async function SellPage() {
  const label = DEV_USER.name ?? DEV_USER.email ?? "your account";
  return <SellForm signedInLabel={label} />;
}

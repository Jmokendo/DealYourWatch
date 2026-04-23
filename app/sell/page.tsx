import { redirect } from "next/navigation";
import { SellForm } from "./components/SellForm";
import { getUserIdFromCookie } from "@/lib/getUser";
import { SellPageFrame } from "@/components/sell/SellPageFrame";

export default async function SellPage() {
  const userId = await getUserIdFromCookie();

  if (!userId) {
    const loginUrl = `/login?${new URLSearchParams({
      redirectTo: "/sell",
    }).toString()}`;
    redirect(loginUrl);
  }

  return <SellPageFrame form={<SellForm />} />;
}

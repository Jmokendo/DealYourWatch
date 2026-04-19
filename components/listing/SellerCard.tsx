import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UserPublic } from "@/lib/api/contracts";

export default function SellerCard({ user }: { user: UserPublic }) {
  const label = user.name ?? user.email;
  const initials = label
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="rounded-[24px] border border-zinc-200 bg-white">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-zinc-100 text-lg font-semibold text-zinc-700">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-950">{label}</p>
            <p className="text-sm text-zinc-600">Vendedor verificado</p>
          </div>
        </div>

        <div className="space-y-3 rounded-[18px] border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          <div className="flex items-center justify-between">
            <span>Rating</span>
            <span className="font-semibold text-zinc-900">No disponible</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Ventas</span>
            <span className="font-semibold text-zinc-900">Sin datos</span>
          </div>
        </div>

        <Button type="button" variant="outline" size="lg" className="w-full">
          Ver perfil
        </Button>
      </CardContent>
    </Card>
  );
}

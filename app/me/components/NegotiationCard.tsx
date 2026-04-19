"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getNegotiationStatusLabel } from "@/lib/marketplace-ui";
import type { NegotiationStatus } from "@/lib/api/contracts";
import type { UserNegotiation } from "@/lib/api/contracts";

const STATUS_STYLES: Record<NegotiationStatus, string> = {
  ACTIVE: "border-blue-200 bg-blue-50 text-blue-800",
  ACCEPTED: "border-green-200 bg-green-50 text-green-800",
  CLOSED: "border-zinc-300 bg-zinc-100 text-zinc-600",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  EXPIRED: "border-zinc-200 bg-zinc-50 text-zinc-400",
};

function formatRelativeTime(iso: string) {
  const deltaMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(deltaMs / 86400000);
  const hours = Math.floor(deltaMs / 3600000);
  const minutes = Math.floor(deltaMs / 60000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${Math.max(minutes, 1)}m ago`;
}

interface NegotiationCardProps {
  negotiation: UserNegotiation;
}

export function NegotiationCard({ negotiation }: NegotiationCardProps) {
  return (
    <Card className="rounded-[18px] border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {negotiation.listingTitle}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Ronda {negotiation.round} · {formatRelativeTime(negotiation.updatedAt)}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium",
              STATUS_STYLES[negotiation.status],
            )}
          >
            {getNegotiationStatusLabel(negotiation.status)}
          </span>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full rounded-[10px]">
          <Link href={`/negotiations/${negotiation.id}`}>Ver negociación</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

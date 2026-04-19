import type { OfferDto } from "@/lib/api/contracts";

export function toOfferDto(o: {
  id: string;
  negotiationId: string;
  userId: string;
  amount: { toString(): string };
  currency: string;
  reasonType: string;
  reasonNote: string | null;
  status: string;
  createdAt: Date;
}): OfferDto {
  return {
    id: o.id,
    negotiationId: o.negotiationId,
    userId: o.userId,
    amount: o.amount.toString(),
    currency: o.currency,
    reasonType: o.reasonType,
    reasonNote: o.reasonNote,
    status: o.status as OfferDto["status"],
    createdAt: o.createdAt.toISOString(),
  };
}

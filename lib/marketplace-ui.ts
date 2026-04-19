import type {
  Condition,
  NegotiationStatus,
  OfferStatus,
} from "@/lib/api/contracts";

const conditionLabels: Record<Condition, string> = {
  NEW: "New",
  MINT: "Mint",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
};

const negotiationStatusLabels: Record<NegotiationStatus, string> = {
  ACTIVE: "Active",
  ACCEPTED: "Accepted",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

const offerStatusLabels: Record<OfferStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  COUNTERED: "Countered",
};

export function formatMoney(amount: string | number, currency: string) {
  const value =
    typeof amount === "number" ? amount : Number.parseFloat(String(amount));

  if (!Number.isFinite(value)) {
    return `${amount} ${currency}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getConditionLabel(condition: Condition) {
  return conditionLabels[condition];
}

export function getNegotiationStatusLabel(status: NegotiationStatus) {
  return negotiationStatusLabels[status];
}

export function getOfferStatusLabel(status: OfferStatus) {
  return offerStatusLabels[status];
}

import type {
  ListingSummary,
  NegotiationSummary,
  OfferDto,
  MessageDto,
} from "@/lib/api/contracts";

const now = new Date().toISOString();

export const mockListings: ListingSummary[] = [
  {
    id: "mock-listing-1",
    title: "Rolex Submariner Date — full set",
    description: "Example listing for UI without database.",
    price: "12500.00",
    currency: "USD",
    condition: "EXCELLENT",
    hasBox: true,
    hasPapers: true,
    status: "APPROVED",
    createdAt: now,
    updatedAt: now,
    images: [
      {
        id: "mock-img-1",
        url: "https://placehold.co/800x600/1a1a1a/fff?text=Watch+A",
        order: 0,
      },
    ],
    model: {
      id: "mock-model-1",
      name: "Submariner Date",
      slug: "submariner-date",
      reference: "126610LN",
      brand: {
        id: "mock-brand-1",
        name: "Rolex",
        slug: "rolex",
      },
    },
    user: {
      id: "mock-user-1",
      email: "seller@example.com",
      name: "Demo Seller",
      image: null,
    },
  },
  {
    id: "mock-listing-2",
    title: "Omega Speedmaster Professional",
    description: null,
    price: "5200.00",
    currency: "USD",
    condition: "MINT",
    hasBox: true,
    hasPapers: false,
    status: "APPROVED",
    createdAt: now,
    updatedAt: now,
    images: [],
    model: {
      id: "mock-model-2",
      name: "Speedmaster Moonwatch",
      slug: "speedmaster-moonwatch",
      reference: null,
      brand: {
        id: "mock-brand-2",
        name: "Omega",
        slug: "omega",
      },
    },
    user: {
      id: "mock-user-2",
      email: "omega_fan@example.com",
      name: null,
      image: null,
    },
  },
];

export const mockNegotiationsByListing: Record<string, NegotiationSummary[]> = {
  "mock-listing-1": [],
};

export const mockNegotiationById: Record<string, NegotiationSummary> = {};

export const mockOffersByNegotiation: Record<string, OfferDto[]> = {};

export const mockMessagesByThread: Record<string, MessageDto[]> = {};

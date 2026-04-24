import { ListingsFeedPage } from "@/components/listings/ListingsFeedPage";

type ListingsPageProps = {
  searchParams: Promise<{
    q?: string | string[] | undefined;
  }>;
};

export default async function ListingsPage({
  searchParams,
}: ListingsPageProps) {
  const params = await searchParams;
  const queryParam = Array.isArray(params.q) ? params.q[0] : params.q;

  return <ListingsFeedPage initialQuery={queryParam ?? ""} />;
}

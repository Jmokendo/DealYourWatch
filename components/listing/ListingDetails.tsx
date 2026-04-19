import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ListingDetail } from "@/lib/api/contracts";
import { formatMoney, getConditionLabel } from "@/lib/marketplace-ui";

interface ListingDetailsProps {
  listing: ListingDetail;
}

export default function ListingDetails({ listing }: ListingDetailsProps) {
  const isSold = listing.status === "SOLD";
  const priceLabel = formatMoney(listing.price, listing.currency);

  const similarItems = [
    {
      id: "similar-1",
      title: `${listing.model.brand.name} ${listing.model.name}`,
      price: formatMoney(listing.price, listing.currency),
      image: listing.images[0]?.url,
    },
    {
      id: "similar-2",
      title: `Modelos similares a ${listing.model.name}`,
      price: "Desde " + formatMoney(listing.price, listing.currency),
      image: listing.images[0]?.url,
    },
    {
      id: "similar-3",
      title: `Piezas similares en stock`,
      price: "Ver catálogo",
      image: listing.images[0]?.url,
    },
  ];

  return (
    <aside className="space-y-6">
      <Card className="rounded-[24px] border border-zinc-200 bg-white">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                {listing.model.brand.name}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                ✓ Verificado
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
                {listing.model.name}
              </h1>
              {listing.model.reference ? (
                <p className="mt-2 text-sm text-zinc-500">Referencia {listing.model.reference}</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[20px] border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Precio listado</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">{priceLabel}</p>
          </div>

          <div className="rounded-[20px] border border-zinc-200 bg-zinc-50 p-5">
            <div className="grid gap-4 text-sm text-zinc-600">
              {[
                { label: "Condition", value: getConditionLabel(listing.condition) },
                {
                  label: "Box / Papers",
                  value: `${listing.hasBox ? "Box" : "No box"} · ${listing.hasPapers ? "Papers" : "No papers"}`,
                },
                { label: "Estado", value: listing.status },
                {
                  label: "Publicado",
                  value: new Date(listing.createdAt).toLocaleDateString("es-ES", {
                    month: "short",
                    year: "numeric",
                  }),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="grid gap-2 border-b border-zinc-200 pb-4 last:border-b-0 last:pb-0"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{item.label}</p>
                  <p className="font-medium text-zinc-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {isSold ? (
            <div className="space-y-6 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="space-y-3 rounded-[24px] border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-lg font-semibold text-zinc-950">Esta pieza fue vendida</p>
                <p className="text-sm leading-6 text-zinc-600">
                  Pero encontramos piezas similares disponibles ahora.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  Recomendaciones
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {similarItems.map((item) => (
                    <Link
                      key={item.id}
                      href="/listings"
                      className="group overflow-hidden rounded-[20px] border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <div className="relative aspect-[4/3] bg-zinc-100">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="space-y-2 p-4">
                        <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                        <p className="text-sm text-zinc-600">{item.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <Button type="button" variant="default" size="lg" className="w-full">
                Ver todos los {listing.model.brand.name} disponibles →
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </aside>
  );
}

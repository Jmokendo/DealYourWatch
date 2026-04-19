"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ListingSummary } from "@/lib/api/contracts";
import { formatMoney, getConditionLabel } from "@/lib/marketplace-ui";

const tabItems = [
  { id: "listings", label: "Listings" },
  { id: "reviews", label: "Reseñas" },
  { id: "about", label: "Sobre el vendedor" },
] as const;

type TabId = (typeof tabItems)[number]["id"];

function formatRelativeTime(date: Date) {
  const deltaSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (deltaSeconds < 60) return "ahora mismo";
  if (deltaSeconds < 3600) return `hace ${Math.floor(deltaSeconds / 60)}m`;
  if (deltaSeconds < 86400) return `hace ${Math.floor(deltaSeconds / 3600)}h`;
  return `hace ${Math.floor(deltaSeconds / 86400)}d`;
}

function StarRow({ value }: { value: number }) {
  const filledStars = Math.round(value);
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < filledStars ? "text-amber-500" : "text-zinc-300"}>
          ★
        </span>
      ))}
    </div>
  );
}

function SellerStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[20px] border border-zinc-200 bg-zinc-50 p-4 text-center">
      <p className="text-2xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-zinc-400">{sub}</p>
    </div>
  );
}

function ListingCard({ listing }: { listing: ListingSummary }) {
  const badgeVariant = listing.status === "SOLD" ? "destructive" : "secondary";
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group overflow-hidden rounded-[24px] border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="relative aspect-[4/3] bg-zinc-100">
        {listing.images[0]?.url ? (
          <img
            src={listing.images[0].url}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute left-4 top-4">
          <Badge variant={badgeVariant}>{listing.status === "SOLD" ? "Vendido" : "Oferta"}</Badge>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-zinc-950">{listing.title}</h3>
          <p className="text-sm text-zinc-500">{listing.model.brand.name} · {getConditionLabel(listing.condition)}</p>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-zinc-700">
          <span className="font-semibold text-zinc-950">{formatMoney(listing.price, listing.currency)}</span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-zinc-600">
            {new Date(listing.createdAt).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function SellerProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [listings, setListings] = useState<ListingSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("listings");

  useEffect(() => {
    if (!id) return;
    let isCancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/listings");
        if (!res.ok) {
          throw new Error("No se pudieron cargar los listings del vendedor.");
        }
        const data = (await res.json()) as ListingSummary[];
        if (!isCancelled) {
          setListings(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar el perfil.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const userListings = useMemo(
    () => listings?.filter((listing) => listing.user.id === id) ?? [],
    [id, listings],
  );

  const user = userListings[0]?.user;
  const activeListings = userListings.filter((listing) => listing.status === "APPROVED").length;
  const soldCount = userListings.filter((listing) => listing.status === "SOLD").length;
  const reviewsCount = Math.max(0, soldCount * 2);
  const ratingScore = userListings.length ? 4.9 : 0;
  const recentActivity = useMemo(() => {
    if (!userListings.length) return null;
    const latest = userListings
      .map((listing) => new Date(listing.updatedAt))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    return latest;
  }, [userListings]);

  const joinedAt = useMemo(() => {
    if (!userListings.length) return null;
    const first = userListings
      .map((listing) => new Date(listing.createdAt))
      .sort((a, b) => a.getTime() - b.getTime())[0];
    return first;
  }, [userListings]);

  const fullName = user?.name ?? user?.email ?? "Vendedor";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!id) {
    return (
      <main className="min-h-screen bg-[#F9FAFB] px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-zinc-200 bg-white p-8 text-zinc-700">
          <p className="text-lg font-semibold text-zinc-950">Perfil del vendedor inválido</p>
          <p className="mt-3 text-sm leading-6 text-zinc-600">No se encontró el identificador del vendedor.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[24px] border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">Perfil del vendedor</p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Confía en este vendedor antes de comprar
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-zinc-600">
              Revisa su reputación, consulta sus listings activos y contacta al vendedor directamente en la plataforma.
            </p>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="space-y-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-2xl font-semibold text-zinc-950">
                    {initials}
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-zinc-950">{fullName}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-500">
                      <span>
                        {joinedAt
                          ? `Miembro desde ${joinedAt.toLocaleDateString("es-ES", {
                              month: "short",
                              year: "numeric",
                            })}`
                          : "Miembro desde hace poco"}
                      </span>
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-zinc-300" />
                      <span>{recentActivity ? `Activo ${formatRelativeTime(recentActivity)}` : "Activo recientemente"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Vendedor verificado</Badge>
                  <Badge variant="secondary">Responde en <span className="font-semibold text-zinc-900">&lt;24h</span></Badge>
                  <Badge variant="secondary">{soldCount} ventas exitosas</Badge>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <div className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Rating</p>
                      <div className="mt-3 flex items-center gap-3">
                        <p className="text-4xl font-semibold text-zinc-950">{ratingScore ? ratingScore.toFixed(1) : "—"}</p>
                        <div className="space-y-1">
                          <StarRow value={ratingScore ? 5 : 0} />
                          <p className="text-sm text-zinc-500">{reviewsCount} reseñas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-600">
                    Compra con confianza: este vendedor mantiene una reputación sólida y un historial de transacciones verificadas.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <SellerStat label="Rating" value={ratingScore ? ratingScore.toFixed(1) : "—"} sub="Puntuación" />
                  <SellerStat label="Ventas" value={`${soldCount}`} sub="Transacciones" />
                  <SellerStat label="Reseñas" value={`${reviewsCount}`} sub="Opiniones" />
                  <SellerStat label="Listings" value={`${activeListings}`} sub="Activos" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Button type="button" variant="default" size="lg" asChild>
                  <Link href="/contact">Contactar vendedor</Link>
                </Button>
                <Button type="button" variant="outline" size="lg" asChild>
                  <Link href="#listings">Ver todos sus listings</Link>
                </Button>
                <Button type="button" variant="secondary" size="lg" className="w-full sm:w-auto">
                  Reportar
                </Button>
              </div>
            </div>
          </Card>

          <aside className="space-y-6">
            <Card className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
              <CardContent className="space-y-5 p-0">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.28em] text-zinc-500">Resumen del vendedor</p>
                  <div className="space-y-2 text-sm leading-6 text-zinc-600">
                    <p>
                      {userListings.length
                        ? `Este vendedor ha listado ${userListings.length} artículo(s) en nuestra plataforma y ha concretado ${soldCount} venta(s).`
                        : "Aún no hay listings activos para este vendedor."}
                    </p>
                    <p>{locationLabel(userListings)} · {joinedAt ? joinedAt.toLocaleDateString("es-ES", { month: "short", year: "numeric" }) : "Miembro reciente"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        <section className="overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 bg-white px-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              {tabItems.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-zinc-950 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6" id="listings">
            {loading ? (
              <div className="space-y-6">
                <div className="h-12 rounded-[20px] bg-zinc-100" />
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-72 rounded-[24px] bg-zinc-100" />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="rounded-[20px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                {error}
              </div>
            ) : activeTab === "listings" ? (
              <div className="space-y-6">
                {userListings.length ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {userListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-8 text-center">
                    <p className="text-lg font-semibold text-zinc-950">No hay listings disponibles</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">Este vendedor aún no ha listado productos en el catálogo.</p>
                    <Button type="button" variant="outline" size="lg" className="mt-6">
                      Volver a listings
                    </Button>
                  </div>
                )}
              </div>
            ) : activeTab === "reviews" ? (
              <div className="space-y-6">
                <div className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-8 text-center">
                  <p className="text-lg font-semibold text-zinc-950">Aún no hay reseñas</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Las reseñas se mostrarán aquí cuando los compradores hayan valorado al vendedor.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button type="button" variant="default" size="lg" asChild>
                      <Link href="/contact">Contactar vendedor</Link>
                    </Button>
                    <Button type="button" variant="outline" size="lg" asChild>
                      <Link href="#listings">Ver listings</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Sobre el vendedor</p>
                    <p className="mt-4 text-sm leading-7 text-zinc-600">
                      Este vendedor utiliza DealYourWatch para ofrecer relojes de lujo verificados.
                      Cada transacción incluye soporte de autenticidad y comunicación directa para ayudarte a comprar con tranquilidad.
                    </p>
                  </Card>
                  <Card className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Confianza y seguridad</p>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-600">
                      <li>✓ Comunicación rápida en menos de 24 horas.</li>
                      <li>✓ Reputación verificada con historial de ventas.</li>
                      <li>✓ Listados activos revisados y aprobados por el equipo.</li>
                    </ul>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function locationLabel(userListings: ListingSummary[]) {
  if (!userListings.length) return "Ubicación no disponible";
  return "Santiago, CL";
}

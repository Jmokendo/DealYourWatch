"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PriceInput } from "./PriceInput";
import { ImageUploader } from "./ImageUploader";
import type { BrandSummary, Condition, CreateListingBody } from "@/lib/api/contracts";

const CONDITIONS: Array<{ value: Condition; label: string }> = [
  { value: "NEW", label: "Nuevo" },
  { value: "MINT", label: "Mint" },
  { value: "EXCELLENT", label: "Excelente" },
  { value: "GOOD", label: "Bueno" },
  { value: "FAIR", label: "Regular" },
];

export function SellForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<Condition>("EXCELLENT");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [hasBox, setHasBox] = useState(false);
  const [hasPapers, setHasPapers] = useState(false);
  const [currency] = useState("USD");

  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [brandId, setBrandId] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    try {
      const res = await fetch("/api/brands");
      if (res.ok) setBrands((await res.json()) as BrandSummary[]);
    } catch {
      // Brands are optional — proceed without them
    }
  }, []);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Ingresá un precio válido.");
      return;
    }

    setBusy(true);
    try {
      const body: CreateListingBody = {
        title: title.trim(),
        price: parsedPrice,
        condition,
        description: description.trim() || undefined,
        imageUrl: imageUrl || undefined,
        currency,
        hasBox,
        hasPapers,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("API response:", data);

      if (!res.ok || !data?.id) {
        setError(
          (data as { error?: string })?.error ?? "Error al publicar el reloj.",
        );
        return;
      }

      router.push(`/listings/${data.id}`);
    } catch {
      setError("Error inesperado. Intentá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700">
          Título <span className="text-red-500">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Rolex Submariner Date 116610LN"
          required
          disabled={busy}
        />
      </div>

      {/* Brand (optional) */}
      {brands.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700">
            Marca
          </label>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            disabled={busy}
            className="w-full rounded-[10px] border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Seleccioná una marca</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Condition */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700">
          Condición <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCondition(value)}
              disabled={busy}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                condition === value
                  ? "bg-zinc-950 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <PriceInput
        value={price}
        onChange={setPrice}
        currency={currency}
        label="Precio"
        required
        disabled={busy}
      />

      {/* Accessories */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700">
          Accesorios
        </label>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={hasBox}
              onChange={(e) => setHasBox(e.target.checked)}
              disabled={busy}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Caja original
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={hasPapers}
              onChange={(e) => setHasPapers(e.target.checked)}
              disabled={busy}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Papeles / garantía
          </label>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contá el estado, historial, accesorios incluidos..."
          rows={4}
          disabled={busy}
          className="w-full resize-none rounded-[10px] border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {/* Image */}
      <ImageUploader imageUrl={imageUrl} onChange={setImageUrl} disabled={busy} />

      {error && (
        <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={busy || !title.trim() || !price}
        className="w-full rounded-[12px] bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Publicando...
          </span>
        ) : (
          "Publicar reloj"
        )}
      </Button>

      <p className="text-center text-xs text-zinc-400">
        Tu publicación quedará pendiente de revisión antes de aparecer en el marketplace.
      </p>
    </form>
  );
}

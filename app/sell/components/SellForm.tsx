"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  BrandSummary,
  Condition,
  CreateListingBody,
  CreateListingImageInput,
} from "@/lib/api/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceInput } from "./PriceInput";
import { ImageUploader } from "./ImageUploader";
import { SellStepSidebar } from "@/components/sell/SellStepSidebar";
import { SellFormSection } from "@/components/sell/SellFormSection";
import { ImageUploadSection } from "@/components/sell/ImageUploadSection";
import { DetailsSection } from "@/components/sell/DetailsSection";
import { ConditionSection } from "@/components/sell/ConditionSection";
import { PricingSection } from "@/components/sell/PricingSection";

const CONDITIONS: Array<{ value: Condition; label: string; hint: string }> = [
  { value: "NEW", label: "Nuevo", hint: "Sin uso" },
  { value: "MINT", label: "Mint", hint: "Como nuevo" },
  { value: "EXCELLENT", label: "Excelente", hint: "Muy buen estado" },
  { value: "GOOD", label: "Bueno", hint: "Uso normal" },
  { value: "FAIR", label: "Regular", hint: "Con desgaste visible" },
];

export function SellForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<Condition>("EXCELLENT");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<CreateListingImageInput[]>([]);
  const [hasBox, setHasBox] = useState(false);
  const [hasPapers, setHasPapers] = useState(false);
  const [currency] = useState("USD");
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [brandId, setBrandId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftListingId] = useState(() => {
    const randomPart =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
        : Math.random().toString(36).slice(2, 14);

    return `draft-${randomPart}`;
  });

  const selectedBrand = useMemo(
    () => brands.find((brand) => brand.id === brandId)?.name ?? "Marca",
    [brandId, brands],
  );

  const previewCondition = useMemo(
    () => CONDITIONS.find((item) => item.value === condition)?.label ?? "Condicion",
    [condition],
  );

  const imageUrls = images.map((image) => image.url);
  const primaryImageUrl = imageUrls[0] ?? "";

  const completedSteps = useMemo(
    () => ({
      photos: imageUrls.length > 0,
      data: Boolean(title.trim()) || Boolean(brandId),
      condition: Boolean(condition) || hasBox || hasPapers,
      price: Boolean(price),
    }),
    [brandId, condition, hasBox, hasPapers, imageUrls.length, price, title],
  );

  const loadBrands = useCallback(async () => {
    try {
      const response = await fetch("/api/brands");
      if (response.ok) {
        setBrands((await response.json()) as BrandSummary[]);
      }
    } catch {
      // optional
    }
  }, []);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Ingresa un precio valido.");
      return;
    }

    setBusy(true);
    try {
      const body: CreateListingBody = {
        title: title.trim(),
        price: parsedPrice,
        condition,
        description: description.trim() || undefined,
        images: images.length > 0 ? images : undefined,
        imageUrl: primaryImageUrl || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        currency,
        hasBox,
        hasPapers,
      };

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok || !data?.id) {
        setError(
          (data as { error?: string })?.error ?? "Error al publicar el reloj.",
        );
        return;
      }

      router.push(`/listings/${data.id}`);
    } catch {
      setError("Error inesperado. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid min-h-[calc(100vh-57px)] lg:grid-cols-[300px_minmax(0,1fr)]">
      <SellStepSidebar
        title={title}
        brand={selectedBrand}
        price={price}
        imageUrl={primaryImageUrl}
        previewCondition={previewCondition}
        steps={completedSteps}
      />

      <div className="flex min-h-full flex-col bg-white">
        <div className="flex-1 px-6 py-8 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-[980px] space-y-10">
            <SellFormSection
              step="1"
              title="Agrega fotos de tu reloj"
              description="La primera foto sera la imagen principal del listing."
            >
              <ImageUploadSection
                uploader={
                  <ImageUploader
                    listingId={draftListingId}
                    images={images}
                    onChange={setImages}
                    disabled={busy}
                  />
                }
              />
            </SellFormSection>

            <SellFormSection
              step="2"
              title="Completa los datos base"
              description="Usamos estos datos para construir el titulo visible del listing."
            >
              <DetailsSection
                brandSelect={
                  brands.length > 0 ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="brand"
                        className="block text-sm font-medium text-[#5a5752]"
                      >
                        Marca
                      </label>
                      <select
                        id="brand"
                        value={brandId}
                        onChange={(event) => setBrandId(event.target.value)}
                        disabled={busy}
                        className="h-12 w-full rounded-[16px] border border-[#e0dcd5] bg-white px-4 text-sm text-[#1e1e22] focus:outline-none focus:ring-2 focus:ring-black/10"
                      >
                        <option value="">Selecciona una marca</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null
                }
                titleField={
                  <div className="space-y-2">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-[#5a5752]"
                    >
                      Titulo <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Ej: Rolex Submariner Date 116610LN"
                      required
                      disabled={busy}
                      className="h-12 rounded-[16px] border-[#e0dcd5] px-4 shadow-none placeholder:text-[#b0aca5] focus-visible:ring-black/10"
                    />
                  </div>
                }
                referencePlaceholder={
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#5a5752]">
                      Referencia
                    </label>
                    <Input
                      value=""
                      onChange={() => undefined}
                      placeholder="Placeholder visual - no conectado al backend"
                      disabled
                      aria-disabled="true"
                      className="h-12 rounded-[16px] border-[#e0dcd5] bg-[#f7f6f3] px-4 text-[#a6a29a] shadow-none"
                    />
                  </div>
                }
                descriptionField={
                  <div className="space-y-2 lg:col-span-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-[#5a5752]"
                    >
                      Descripcion
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Cuenta el estado, historial, accesorios incluidos y cualquier detalle relevante."
                      rows={5}
                      disabled={busy}
                      className="w-full resize-none rounded-[16px] border border-[#e0dcd5] bg-white px-4 py-3 text-sm text-[#1e1e22] placeholder:text-[#b0aca5] focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                }
              />
            </SellFormSection>

            <SellFormSection
              step="3"
              title="Define la condicion"
              description="Estado general y accesorios incluidos."
            >
              <ConditionSection
                conditions={CONDITIONS}
                selectedCondition={condition}
                onConditionChange={setCondition}
                hasBox={hasBox}
                hasPapers={hasPapers}
                onHasBoxChange={setHasBox}
                onHasPapersChange={setHasPapers}
                disabled={busy}
              />
            </SellFormSection>

            <SellFormSection
              step="4"
              title="Precio y visibilidad"
              description="Tu listing quedara pendiente de revision antes de aparecer en el marketplace."
            >
              <PricingSection
                priceInput={
                  <PriceInput
                    value={price}
                    onChange={setPrice}
                    currency={currency}
                    label="Precio"
                    required
                    disabled={busy}
                  />
                }
              />
            </SellFormSection>

            {error ? (
              <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#e5e1da] px-6 py-4 sm:px-10 lg:px-12">
          <div className="mx-auto flex max-w-[980px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="h-11 rounded-full border-[#1d1d21] bg-white px-10 text-base font-medium text-[#1d1d21] hover:bg-[#f7f6f3]"
            >
              Atras
            </Button>

            <Button
              type="submit"
              disabled={busy || !title.trim() || !price}
              className="h-11 min-w-[280px] rounded-full bg-[#1d1d21] px-10 text-base font-semibold text-white hover:bg-[#303036] sm:min-w-[320px]"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </span>
              ) : (
                "Guardar y continuar"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

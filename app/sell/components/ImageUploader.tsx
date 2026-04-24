"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreateListingImageInput } from "@/lib/api/contracts";
import { normalizeListingImageUrl } from "@/lib/listing-images";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  listingId: string;
  images: CreateListingImageInput[];
  onChange: (images: CreateListingImageInput[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
}

const MAX_IMAGES = 8;
const MAX_BYTES = 10 * 1024 * 1024;

function pickString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function parseUploadPayload(payload: unknown): {
  url: string | null;
  publicId: string | null;
  error: string | null;
} {
  if (!payload || typeof payload !== "object") {
    return { url: null, publicId: null, error: null };
  }

  const record = payload as Record<string, unknown>;

  return {
    url: pickString(record, "url") ?? pickString(record, "secure_url"),
    publicId:
      pickString(record, "publicId") ?? pickString(record, "public_id"),
    error: pickString(record, "error"),
  };
}

export function ImageUploader({
  listingId,
  images,
  onChange,
  onUploadingChange,
  disabled,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateUploading(nextValue: boolean) {
    setUploading(nextValue);
    onUploadingChange?.(nextValue);
  }

  async function uploadFile(file: File): Promise<CreateListingImageInput> {
    if (!file.type.startsWith("image/")) {
      throw new Error("Solo puedes subir imagenes.");
    }

    if (file.size > MAX_BYTES) {
      throw new Error("Cada imagen debe pesar menos de 10MB.");
    }

    const form = new FormData();
    form.append("file", file);
    form.append("listingId", listingId);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: form,
      credentials: "same-origin",
    });

    const rawPayload: unknown = await response.json().catch(() => null);
    const data = parseUploadPayload(rawPayload);
    const url = normalizeListingImageUrl(data.url);

    if (!response.ok || !url) {
      throw new Error(data.error ?? "Error al subir imagen");
    }

    return {
      url,
      publicId: data.publicId ?? null,
    };
  }

  async function handleFiles(fileList: FileList | File[]) {
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError("Puedes subir hasta 8 imagenes por listing.");
      return;
    }

    const files = Array.from(fileList).slice(0, remainingSlots);
    if (files.length === 0) return;

    setError(null);
    updateUploading(true);

    try {
      const uploadedImages: CreateListingImageInput[] = [];

      for (const file of files) {
        uploadedImages.push(await uploadFile(file));
      }

      onChange([...images, ...uploadedImages]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Error al subir imagen",
      );
    } finally {
      updateUploading(false);
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) {
      void handleFiles(event.target.files);
    }

    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();

    if (event.dataTransfer.files.length) {
      void handleFiles(event.dataTransfer.files);
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex min-h-[350px] flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-[#d9d5ce] bg-white px-6 py-10 text-center transition sm:min-h-[400px]",
          !disabled && "cursor-pointer hover:border-[#bbb5ac]",
          disabled && "opacity-60",
        )}
        aria-disabled={disabled}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#f3f1ee]">
          {uploading ? (
            <Loader2 className="h-7 w-7 animate-spin text-[#8f8a83]" />
          ) : (
            <Upload className="h-7 w-7 text-[#8f8a83]" />
          )}
        </div>

        <p className="mt-6 text-[28px] font-semibold tracking-[-0.05em] text-[#5a5862]">
          {images.length > 0 ? "Agregar mas fotos" : "Subir fotos del reloj"}
        </p>
        <p className="mt-2 text-sm text-[#aaa59d]">
          JPG, PNG o WEBP / Max 10MB por imagen / Hasta 8 fotos
        </p>
        <p className="mt-2 text-xs text-[#b2ada5]">
          La primera imagen sera la portada del listing.
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-8 h-10 rounded-full border-[#1d1d21] bg-white px-8 text-base font-medium text-[#1d1d21] hover:bg-[#f7f6f3]"
          disabled={disabled || uploading}
        >
          Seleccionar archivo
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />
      </div>

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="relative overflow-hidden rounded-[20px] border border-[#dfdbd4] bg-[#f7f6f3]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={
                  index === 0
                    ? "Vista previa principal del reloj"
                    : `Vista previa ${index + 1} del reloj`
                }
                className="h-44 w-full object-cover"
              />

              <div className="absolute left-3 top-3 rounded-full bg-[#1d1d21] px-3 py-1 text-xs font-medium text-white">
                {index === 0 ? "Principal" : `Foto ${index + 1}`}
              </div>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-3 top-3 h-9 w-9 rounded-full p-0"
                onClick={() => removeImage(index)}
                disabled={disabled || uploading}
                aria-label={`Quitar foto ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

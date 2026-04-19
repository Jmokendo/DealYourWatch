"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  imageUrl: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUploader({ imageUrl, onChange, disabled }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Error al subir imagen");
        return;
      }
      const { url } = (await res.json()) as { url: string };
      onChange(url);
    } catch {
      setError("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700">
        Imagen del reloj
      </label>

      {imageUrl ? (
        <div className="relative overflow-hidden rounded-[14px] border border-zinc-200 bg-zinc-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Preview"
            className="h-48 w-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 rounded-full p-0"
            onClick={() => onChange("")}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-[14px] border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center transition",
            !disabled && "cursor-pointer hover:border-zinc-400 hover:bg-zinc-100",
            disabled && "opacity-50",
          )}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          ) : (
            <Upload className="h-6 w-6 text-zinc-400" />
          )}
          <div>
            <p className="text-sm font-medium text-zinc-600">
              {uploading ? "Subiendo..." : "Arrastrá o hacé clic para subir"}
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">PNG, JPG o WEBP · máx 5 MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
            disabled={disabled}
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

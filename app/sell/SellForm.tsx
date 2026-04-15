"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  Condition,
  ListingSummary,
  UploadSignatureResponse,
} from "@/lib/api/contracts";

type SellFormProps = {
  signedInLabel: string;
};

type FormState = {
  title: string;
  price: string;
  condition: Condition;
  description: string;
  hasBox: boolean;
  hasPapers: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type CloudinaryUploadResult = {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
};

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const maxImageSize = 5 * 1024 * 1024;

const conditionOptions: Condition[] = [
  "NEW",
  "MINT",
  "EXCELLENT",
  "GOOD",
  "FAIR",
];

const conditionLabels: Record<Condition, string> = {
  NEW: "New",
  MINT: "Mint",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
};

const initialState: FormState = {
  title: "",
  price: "",
  condition: "EXCELLENT",
  description: "",
  hasBox: false,
  hasPapers: false,
};

function validateForm(form: FormState) {
  const errors: FormErrors = {};

  if (!form.title.trim()) {
    errors.title = "Title is required.";
  }

  const price = Number.parseFloat(form.price);
  if (!form.price.trim()) {
    errors.price = "Price is required.";
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Price must be greater than 0.";
  }

  if (!form.description.trim()) {
    errors.description = "Description is required.";
  }

  return errors;
}

export function SellForm({ signedInLabel }: SellFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdListing, setCreatedListing] = useState<ListingSummary | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const canSubmit = useMemo(() => !busy && !uploading, [busy, uploading]);

  function isErrorPayload(value: unknown): value is { error?: string } {
    return value !== null && typeof value === "object" && "error" in value;
  }

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      return { ...current, [field]: undefined };
    });
  }

  function setImage(file: File | null) {
    setImageError(null);

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!allowedImageTypes.includes(file.type)) {
      setImageFile(null);
      setImageError("Use a JPG, PNG, WebP, or AVIF image.");
      return;
    }

    if (file.size > maxImageSize) {
      setImageFile(null);
      setImageError("Image must be 5 MB or smaller.");
      return;
    }

    setImageFile(file);
  }

  async function uploadImage(file: File): Promise<string> {
    setUploading(true);
    try {
      const signatureRes = await fetch("/api/upload", { method: "POST" });
      const signaturePayload: unknown = await signatureRes.json().catch(() => null);

      if (!signatureRes.ok) {
        const message = isErrorPayload(signaturePayload)
          ? signaturePayload.error ?? "We couldn't prepare the image upload."
          : "We couldn't prepare the image upload.";
        throw new Error(message);
      }

      const signature = signaturePayload as UploadSignatureResponse;

      if (!signature.allowedMimeTypes.includes(file.type)) {
        throw new Error("Use a JPG, PNG, WebP, or AVIF image.");
      }

      if (file.size > signature.maxFileSize) {
        throw new Error("Image must be 5 MB or smaller.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signature.apiKey);
      formData.append("timestamp", String(signature.timestamp));
      formData.append("signature", signature.signature);
      formData.append("folder", signature.folder);
      formData.append("public_id", signature.publicId);
      if (signature.uploadPreset) {
        formData.append("upload_preset", signature.uploadPreset);
      }

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const uploadPayload = (await uploadRes.json().catch(() => null)) as
        | CloudinaryUploadResult
        | null;

      if (!uploadRes.ok) {
        throw new Error(
          uploadPayload?.error?.message ?? "We couldn't upload the image.",
        );
      }

      if (!uploadPayload?.secure_url) {
        throw new Error("Cloudinary did not return an image URL.");
      }

      return uploadPayload.secure_url;
    } finally {
      setUploading(false);
    }
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    setError(null);
    setImageError(null);
    setSuccess(null);

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted fields before publishing.");
      return;
    }

    setBusy(true);
    try {
      const imageUrl = imageFile ? await uploadImage(imageFile) : undefined;

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          price: Number.parseFloat(form.price),
          condition: form.condition,
          description: form.description.trim(),
          imageUrl,
          hasBox: form.hasBox,
          hasPapers: form.hasPapers,
        }),
      });

      const payload: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        setError(isErrorPayload(payload) ? payload.error ?? "We couldn't create your listing." : "We couldn't create your listing.");
        return;
      }

      if (!payload || typeof payload !== "object" || !("id" in payload)) {
        setError("We couldn't create your listing.");
        return;
      }

      const listing = payload as ListingSummary;
      setCreatedListing(listing);
      setForm(initialState);
      setImageFile(null);
      setErrors({});
      setSuccess("Listing created. It is now in review and ready for buyers once approved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't create your listing.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-full max-w-5xl flex-1 flex-col gap-8 px-6 py-16">
      <section className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          Sell
        </Badge>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Create your listing</h1>
          <p className="max-w-2xl text-sm text-zinc-600">
            Signed in as <span className="font-medium text-zinc-900">{signedInLabel}</span>. Add the
            essentials now so buyers can understand the watch quickly and send an offer with confidence.
          </p>
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <p>{success}</p>
          {createdListing ? (
            <p className="mt-1">
              <Link className="font-medium underline" href={`/listings/${createdListing.id}`}>
                View listing
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form className="space-y-6" onSubmit={submitForm} noValidate>
          <Card className="rounded-2xl border-zinc-200">
            <CardContent className="grid gap-5 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm text-zinc-700">
                  Title <span className="text-red-600">*</span>
                  <Input
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    placeholder="Example: Rolex Submariner Date 126610LN"
                    aria-invalid={Boolean(errors.title)}
                    className="mt-1"
                  />
                  <span className="mt-1 block text-xs text-zinc-500">
                    Include brand, model, and reference if you have it.
                  </span>
                  {errors.title ? (
                    <span className="mt-1 block text-xs text-red-600">{errors.title}</span>
                  ) : null}
                </label>

                <label className="text-sm text-zinc-700">
                  Price <span className="text-red-600">*</span>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder="12000"
                    aria-invalid={Boolean(errors.price)}
                    className="mt-1"
                  />
                  <span className="mt-1 block text-xs text-zinc-500">
                    Set a realistic opening price so buyers can act faster.
                  </span>
                  {errors.price ? (
                    <span className="mt-1 block text-xs text-red-600">{errors.price}</span>
                  ) : null}
                </label>
              </div>

              <label className="text-sm text-zinc-700">
                Condition
                <select
                  value={form.condition}
                  onChange={(e) => setField("condition", e.target.value as Condition)}
                  className="mt-1 flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                >
                  {conditionOptions.map((condition) => (
                    <option key={condition} value={condition}>
                      {conditionLabels[condition]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-zinc-700">
                Description <span className="text-red-600">*</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Include year, service history, visible wear, and anything a buyer should know."
                  aria-invalid={Boolean(errors.description)}
                  className="mt-1 min-h-32 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                />
                <span className="mt-1 block text-xs text-zinc-500">
                  A good description answers the first buyer questions before they ask.
                </span>
                {errors.description ? (
                  <span className="mt-1 block text-xs text-red-600">
                    {errors.description}
                  </span>
                ) : null}
              </label>

              <label className="text-sm text-zinc-700">
                Photo
                <input
                  type="file"
                  accept={allowedImageTypes.join(",")}
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  className="mt-1 block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                />
                <span className="mt-1 block text-xs text-zinc-500">
                  Use a JPG, PNG, WebP, or AVIF image up to 5 MB.
                </span>
                {imageFile ? (
                  <span className="mt-1 block text-xs text-zinc-500">
                    Selected: {imageFile.name}
                  </span>
                ) : null}
                {imageError ? (
                  <span className="mt-1 block text-xs text-red-600">
                    {imageError}
                  </span>
                ) : null}
              </label>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={form.hasBox}
                    onChange={(e) => setField("hasBox", e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  Original box included
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={form.hasPapers}
                    onChange={(e) => setField("hasPapers", e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  Papers included
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" disabled={!canSubmit}>
                  {uploading
                    ? "Uploading photo..."
                    : busy
                      ? "Creating listing..."
                      : "Create listing"}
                </Button>
                <p className="text-sm text-zinc-500">
                  Required fields are marked with <span className="text-red-600">*</span>.
                </p>
              </div>
            </CardContent>
          </Card>
        </form>

        <aside>
          <Card className="rounded-2xl border-zinc-200">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-medium text-zinc-900">What helps listings convert</h2>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>Clear title with brand, model, and reference.</li>
                <li>Accurate condition and visible wear notes.</li>
                <li>Sharp photos of dial, case, bracelet, box, and papers.</li>
                <li>Price that reflects the watch and included accessories.</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

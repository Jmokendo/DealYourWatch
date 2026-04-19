"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export function PriceInput({
  value,
  onChange,
  currency = "USD",
  label = "Precio",
  required = false,
  disabled = false,
}: PriceInputProps) {
  const id = useId();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    // Allow only one decimal point
    const parts = raw.split(".");
    const sanitized =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : raw;
    onChange(sanitized);
  }

  const formatted =
    value !== "" && !isNaN(Number(value))
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
        }).format(Number(value))
      : "";

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
          {currency}
        </span>
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder="0.00"
          required={required}
          disabled={disabled}
          className="pl-14"
        />
        {formatted && value !== "" && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
            {formatted}
          </span>
        )}
      </div>
    </div>
  );
}

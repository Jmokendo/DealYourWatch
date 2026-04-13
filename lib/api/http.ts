import { NextResponse } from "next/server";
import { API_CONTRACT_VERSION } from "@/lib/api/contracts";

const contractHeaders = {
  "X-Api-Contract-Version": API_CONTRACT_VERSION,
} as const;

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse<T> {
  const headers = new Headers(init?.headers);
  headers.set("X-Api-Contract-Version", API_CONTRACT_VERSION);
  return NextResponse.json(data, { ...init, headers });
}

export function jsonError(
  message: string,
  status: number,
  code?: string,
): NextResponse<{ error: string; code?: string }> {
  return NextResponse.json(
    code ? { error: message, code } : { error: message },
    { status, headers: { ...contractHeaders } },
  );
}

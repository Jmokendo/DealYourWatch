import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Shared response types
// ---------------------------------------------------------------------------
type SuccessBody<T> = { success: true; data: T };
type ErrorBody = { success: false; error: string; details?: unknown };

// ---------------------------------------------------------------------------
// Success helpers
// ---------------------------------------------------------------------------

/** 200 OK — wraps data in { success: true, data } */
export function ok<T>(data: T, status = 200): NextResponse<SuccessBody<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/** 201 Created */
export function created<T>(data: T): NextResponse<SuccessBody<T>> {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

/** 400 Bad Request */
export function badRequest(
  msg: string,
  details?: unknown,
): NextResponse<ErrorBody> {
  const body: ErrorBody = { success: false, error: msg };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status: 400 });
}

/** 404 Not Found */
export function notFound(resource: string): NextResponse<ErrorBody> {
  return NextResponse.json(
    { success: false, error: `${resource} no encontrado` },
    { status: 404 },
  );
}

/** 409 Conflict */
export function conflict(msg: string): NextResponse<ErrorBody> {
  return NextResponse.json({ success: false, error: msg }, { status: 409 });
}

/** 500 Internal Server Error */
export function serverError(err: unknown): NextResponse<ErrorBody> {
  const msg =
    err instanceof Error ? err.message : "Error interno del servidor";
  console.error("[SERVER ERROR]", err);
  return NextResponse.json(
    { success: false, error: "Error interno del servidor" },
    { status: 500 },
  );
}

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

/**
 * Returns an error string if any of the listed fields are missing/empty on
 * the given body object; returns null when all fields are present.
 */
export function requireFields(
  body: Record<string, unknown>,
  fields: string[],
): string | null {
  for (const field of fields) {
    const val = body[field];
    if (val === undefined || val === null || val === "") {
      return `El campo '${field}' es requerido`;
    }
  }
  return null;
}

import { isApiMockMode } from "@/lib/env";
import { jsonOk } from "@/lib/api/http";
import type { HealthDto } from "@/lib/api/contracts";
import { API_CONTRACT_VERSION } from "@/lib/api/contracts";

export async function GET() {
  const body: HealthDto = {
    ok: true,
    mock: isApiMockMode(),
    contractVersion: API_CONTRACT_VERSION,
  };
  return jsonOk(body);
}

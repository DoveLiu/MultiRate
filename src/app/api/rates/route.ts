import { NextResponse } from "next/server";
import { getRatesPayload, RATES_CACHE_TTL_SECONDS } from "@/lib/rates/fetch-bot-rates";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "1";
  const payload = await getRatesPayload(force);
  const status = payload.rates ? 200 : 503;

  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": force
        ? "no-store"
        : `s-maxage=${RATES_CACHE_TTL_SECONDS}, stale-while-revalidate=86400`
    }
  });
}

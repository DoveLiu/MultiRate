import { BOT_HTML_URL, BOT_TEXT_URL } from "@/lib/rates/constants";
import { parseBotHtmlDocument } from "@/lib/rates/parse-bot-html";
import { parseBotTextRates } from "@/lib/rates/parse-bot-text";
import type { RatesPayload } from "@/lib/rates/types";

export const RATES_CACHE_TTL_SECONDS = 60 * 15;
const RATES_CACHE_TTL_MS = RATES_CACHE_TTL_SECONDS * 1000;

type CachedPayload = {
  storedAt: number;
  payload: RatesPayload;
};

let inMemoryPayload: CachedPayload | null = null;

async function fetchBotResource(url: string, force: boolean) {
  return fetch(url, {
    cache: force ? "no-store" : undefined,
    next: force ? undefined : { revalidate: RATES_CACHE_TTL_SECONDS },
    headers: {
      "User-Agent": "MultiRate/1.0 (+https://vercel.com)"
    }
  });
}

function createPayload(overrides: Partial<RatesPayload>): RatesPayload {
  return {
    source: "bot-text",
    sourceUpdatedAt: null,
    lastSuccessfulAt: null,
    fetchedAt: new Date().toISOString(),
    stale: false,
    error: null,
    availableRateTypes: ["cashBuy", "cashSell", "spotBuy", "spotSell"],
    rates: null,
    ...overrides
  };
}

async function fetchFromText(force: boolean) {
  const textResponse = await fetchBotResource(BOT_TEXT_URL, force);

  if (!textResponse.ok) {
    throw new Error(`Text endpoint failed with status ${textResponse.status}`);
  }

  const rawText = await textResponse.text();
  const rates = parseBotTextRates(rawText);

  if (!Object.keys(rates).length) {
    throw new Error("Text endpoint returned an empty rates payload");
  }

  let sourceUpdatedAt: string | null = null;

  try {
    const htmlResponse = await fetchBotResource(BOT_HTML_URL, force);

    if (htmlResponse.ok) {
      const rawHtml = await htmlResponse.text();
      sourceUpdatedAt = parseBotHtmlDocument(rawHtml).sourceUpdatedAt;
    }
  } catch {
    sourceUpdatedAt = null;
  }

  return createPayload({
    source: "bot-text",
    sourceUpdatedAt,
    lastSuccessfulAt: new Date().toISOString(),
    rates
  });
}

async function fetchFromHtml(force: boolean) {
  const htmlResponse = await fetchBotResource(BOT_HTML_URL, force);

  if (!htmlResponse.ok) {
    throw new Error(`HTML endpoint failed with status ${htmlResponse.status}`);
  }

  const rawHtml = await htmlResponse.text();
  const parsed = parseBotHtmlDocument(rawHtml);

  if (!Object.keys(parsed.rates).length) {
    throw new Error("HTML endpoint returned an empty rates payload");
  }

  return createPayload({
    source: "bot-html",
    sourceUpdatedAt: parsed.sourceUpdatedAt,
    lastSuccessfulAt: new Date().toISOString(),
    rates: parsed.rates
  });
}

function getFreshMemoryCache() {
  if (!inMemoryPayload) {
    return null;
  }

  if (Date.now() - inMemoryPayload.storedAt > RATES_CACHE_TTL_MS) {
    return null;
  }

  return inMemoryPayload.payload;
}

function storeMemoryCache(payload: RatesPayload) {
  inMemoryPayload = {
    storedAt: Date.now(),
    payload
  };
}

export async function getRatesPayload(force = false): Promise<RatesPayload> {
  if (!force) {
    const cached = getFreshMemoryCache();

    if (cached) {
      return {
        ...cached,
        source: "memory-cache"
      };
    }
  }

  const errors: string[] = [];

  try {
    const payload = await fetchFromText(force);
    storeMemoryCache(payload);
    return payload;
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Unknown text endpoint error");
  }

  try {
    const payload = await fetchFromHtml(force);
    storeMemoryCache(payload);
    return payload;
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Unknown HTML endpoint error");
  }

  if (inMemoryPayload?.payload.rates) {
    return {
      ...inMemoryPayload.payload,
      source: "memory-cache",
      fetchedAt: new Date().toISOString(),
      stale: true,
      error: `BOT source refresh failed. ${errors.join(" | ")}`
    };
  }

  return createPayload({
    fetchedAt: new Date().toISOString(),
    stale: true,
    error: `BOT source refresh failed. ${errors.join(" | ")}`
  });
}

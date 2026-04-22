import type { RateRecord } from "@/lib/rates/types";
import { createEmptyRateRecord, parseRateValue } from "@/lib/rates/shared";

const TEXT_ROW_PATTERN =
  /([A-Z]{3})\s+Buying\s+([\d.]+)\s+([\d.]+)(?:\s+[\d.]+){7}\s+Selling\s+([\d.]+)\s+([\d.]+)(?:\s+[\d.]+){7}/g;

export function parseBotTextRates(rawText: string) {
  const normalizedText = rawText.replace(/^\uFEFF/, " ").replace(/\s+/g, " ").trim();
  const rates: Record<string, RateRecord> = {};

  for (const match of normalizedText.matchAll(TEXT_ROW_PATTERN)) {
    const [, code, cashBuy, spotBuy, cashSell, spotSell] = match;
    rates[code] = createEmptyRateRecord();
    rates[code].cashBuy = parseRateValue(cashBuy);
    rates[code].cashSell = parseRateValue(cashSell);
    rates[code].spotBuy = parseRateValue(spotBuy);
    rates[code].spotSell = parseRateValue(spotSell);
  }

  return rates;
}

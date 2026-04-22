import type { RateRecord } from "@/lib/rates/types";
import { createEmptyRateRecord, parseBotDateToIso, parseRateValue } from "@/lib/rates/shared";

const NUMBER_OR_DASH_PATTERN = /^(\d+(?:\.\d+)?)$|^-$/;
const HTML_ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&#39;": "'"
};

function stripHtml(rawValue: string) {
  return rawValue
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => HTML_ENTITY_MAP[entity] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseBotHtmlDocument(rawHtml: string) {
  const pageText = stripHtml(rawHtml);
  const updateMatches = [...pageText.matchAll(/\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}/g)];
  const latestUpdateText = updateMatches.at(0)?.[0] ?? null;

  const rates: Record<string, RateRecord> = {};

  for (const rowMatch of rawHtml.matchAll(/<tr[\s\S]*?<\/tr>/gi)) {
    const rowHtml = rowMatch[0];
    const cellTexts = [...rowHtml.matchAll(/<td[\s\S]*?<\/td>/gi)]
      .map((cellMatch) => stripHtml(cellMatch[0]))
      .filter(Boolean);

    const codeMatch = cellTexts.join(" ").match(/\(([A-Z]{3})\)/);

    if (!codeMatch) {
      continue;
    }

    const code = codeMatch[1];
    const numericTokens = cellTexts
      .flatMap((cell) => cell.split(/\s+/))
      .filter((token) => NUMBER_OR_DASH_PATTERN.test(token))
      .slice(0, 4);

    if (numericTokens.length < 4) {
      continue;
    }

    rates[code] = createEmptyRateRecord();
    rates[code].cashBuy = numericTokens[0] === "-" ? null : parseRateValue(numericTokens[0]);
    rates[code].cashSell = numericTokens[1] === "-" ? null : parseRateValue(numericTokens[1]);
    rates[code].spotBuy = numericTokens[2] === "-" ? null : parseRateValue(numericTokens[2]);
    rates[code].spotSell = numericTokens[3] === "-" ? null : parseRateValue(numericTokens[3]);
  }

  return {
    sourceUpdatedAt: latestUpdateText ? parseBotDateToIso(latestUpdateText) : null,
    rates
  };
}

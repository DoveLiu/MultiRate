import type { RateRecord } from "@/lib/rates/types";

export function parseRateValue(rawValue: string) {
  const value = Number(rawValue);

  if (!Number.isFinite(value) || value === 0) {
    return null;
  }

  return value;
}

export function createEmptyRateRecord(): RateRecord {
  return {
    cashBuy: null,
    cashSell: null,
    spotBuy: null,
    spotSell: null
  };
}

export function parseBotDateToIso(rawValue: string) {
  const match = rawValue.match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:00+08:00`;
}

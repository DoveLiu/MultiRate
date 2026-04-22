export type RateType = "cashBuy" | "cashSell" | "spotBuy" | "spotSell";

export interface RateRecord {
  cashBuy: number | null;
  cashSell: number | null;
  spotBuy: number | null;
  spotSell: number | null;
}

export interface RatesPayload {
  source: "bot-text" | "bot-html" | "memory-cache";
  sourceUpdatedAt: string | null;
  lastSuccessfulAt: string | null;
  fetchedAt: string;
  stale: boolean;
  error: string | null;
  availableRateTypes: RateType[];
  rates: Record<string, RateRecord> | null;
}

import type { RateRecord, RateType } from "@/lib/rates/types";

function resolveRateByType(record: RateRecord | undefined, rateType: RateType) {
  if (!record) {
    return null;
  }

  switch (rateType) {
    case "spotSell":
      return record.spotSell ?? record.cashSell ?? null;
    case "spotBuy":
      return record.spotBuy ?? record.cashBuy ?? null;
    case "cashSell":
      return record.cashSell ?? record.spotSell ?? null;
    case "cashBuy":
      return record.cashBuy ?? record.spotBuy ?? null;
    default:
      return null;
  }
}

export function getRateValue(
  rates: Record<string, RateRecord> | null,
  code: string,
  rateType: RateType
) {
  if (code === "TWD") {
    return 1;
  }

  if (!rates) {
    return null;
  }

  return resolveRateByType(rates[code], rateType);
}

export function convertAmountWithTwdBridge({
  amount,
  fromCode,
  toCode,
  rates,
  rateType
}: {
  amount: number;
  fromCode: string;
  toCode: string;
  rates: Record<string, RateRecord> | null;
  rateType: RateType;
}) {
  const fromRate = getRateValue(rates, fromCode, rateType);
  const toRate = getRateValue(rates, toCode, rateType);

  if (fromRate == null || toRate == null) {
    return null;
  }

  const twdAmount = fromCode === "TWD" ? amount : amount * fromRate;
  const converted = toCode === "TWD" ? twdAmount : twdAmount / toRate;

  if (!Number.isFinite(converted)) {
    return null;
  }

  return converted;
}

export function computeConvertedAmounts({
  amount,
  baseCode,
  selectedCodes,
  rates,
  rateType
}: {
  amount: number | null;
  baseCode: string;
  selectedCodes: string[];
  rates: Record<string, RateRecord> | null;
  rateType: RateType;
}) {
  return Object.fromEntries(
    selectedCodes.map((code) => {
      if (amount == null) {
        return [code, null];
      }

      if (code === baseCode) {
        return [code, amount];
      }

      return [
        code,
        convertAmountWithTwdBridge({
          amount,
          fromCode: baseCode,
          toCode: code,
          rates,
          rateType
        })
      ];
    })
  ) as Record<string, number | null>;
}

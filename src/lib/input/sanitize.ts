export function sanitizeNumericInput(rawValue: string) {
  const withoutCommas = rawValue.replace(/,/g, "");
  const filtered = withoutCommas.replace(/[^\d.]/g, "");

  if (!filtered) {
    return "";
  }

  const firstDotIndex = filtered.indexOf(".");

  if (firstDotIndex === -1) {
    return filtered;
  }

  const integerPart = filtered.slice(0, firstDotIndex);
  const decimalPart = filtered.slice(firstDotIndex + 1).replace(/\./g, "");
  return `${integerPart || "0"}.${decimalPart}`;
}

export function parseNumericInput(rawValue: string) {
  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : null;
}

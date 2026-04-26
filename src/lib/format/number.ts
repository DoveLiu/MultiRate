const LOW_VALUE_CODES = new Set(["JPY", "KRW", "VND", "IDR"]);

export function formatDisplayAmount(value: number, code: string) {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: LOW_VALUE_CODES.has(code) ? 4 : 2
  });

  return formatter.format(value);
}

export function formatEditableAmount(value: number) {
  return String(Number(value.toFixed(8)));
}

export function formatRateValue(value: number | null) {
  if (value == null) {
    return "unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5
  }).format(value);
}

export function formatDateTime(rawValue: string | null) {
  if (!rawValue) {
    return "unavailable";
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return "unavailable";
  }

  const formatter = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const valueByType = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${valueByType.year}/${valueByType.month}/${valueByType.day} ${valueByType.hour}:${valueByType.minute}`;
}

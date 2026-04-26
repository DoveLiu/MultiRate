import type { CurrencyMeta } from "@/lib/currency/types";

export const DEFAULT_SELECTED_CODES = ["TWD", "USD", "JPY", "CNY", "KRW"];

export const CURRENCY_OPTIONS: CurrencyMeta[] = [
  { code: "TWD", nameZh: "新台幣", nameEn: "Taiwan Dollar", flag: "🇹🇼", sortOrder: 0 },
  { code: "USD", nameZh: "美金", nameEn: "US Dollar", flag: "🇺🇸", sortOrder: 1 },
  { code: "HKD", nameZh: "港幣", nameEn: "Hong Kong Dollar", flag: "🇭🇰", sortOrder: 2 },
  { code: "GBP", nameZh: "英鎊", nameEn: "British Pound", flag: "🇬🇧", sortOrder: 3 },
  { code: "AUD", nameZh: "澳幣", nameEn: "Australian Dollar", flag: "🇦🇺", sortOrder: 4 },
  { code: "CAD", nameZh: "加拿大幣", nameEn: "Canadian Dollar", flag: "🇨🇦", sortOrder: 5 },
  { code: "SGD", nameZh: "新加坡幣", nameEn: "Singapore Dollar", flag: "🇸🇬", sortOrder: 6 },
  { code: "CHF", nameZh: "瑞士法郎", nameEn: "Swiss Franc", flag: "🇨🇭", sortOrder: 7 },
  { code: "JPY", nameZh: "日圓", nameEn: "Japanese Yen", flag: "🇯🇵", sortOrder: 8 },
  { code: "ZAR", nameZh: "南非幣", nameEn: "South African Rand", flag: "🇿🇦", sortOrder: 9 },
  { code: "SEK", nameZh: "瑞典幣", nameEn: "Swedish Krona", flag: "🇸🇪", sortOrder: 10 },
  { code: "NZD", nameZh: "紐元", nameEn: "New Zealand Dollar", flag: "🇳🇿", sortOrder: 11 },
  { code: "THB", nameZh: "泰銖", nameEn: "Thai Baht", flag: "🇹🇭", sortOrder: 12 },
  { code: "PHP", nameZh: "菲律賓披索", nameEn: "Philippine Peso", flag: "🇵🇭", sortOrder: 13 },
  { code: "IDR", nameZh: "印尼盾", nameEn: "Indonesian Rupiah", flag: "🇮🇩", sortOrder: 14 },
  { code: "EUR", nameZh: "歐元", nameEn: "Euro", flag: "🇪🇺", sortOrder: 15 },
  { code: "KRW", nameZh: "韓元", nameEn: "Korean Won", flag: "🇰🇷", sortOrder: 16 },
  { code: "VND", nameZh: "越南盾", nameEn: "Vietnamese Dong", flag: "🇻🇳", sortOrder: 17 },
  { code: "MYR", nameZh: "馬來幣", nameEn: "Malaysian Ringgit", flag: "🇲🇾", sortOrder: 18 },
  { code: "CNY", nameZh: "人民幣", nameEn: "Chinese Yuan", flag: "🇨🇳", sortOrder: 19 }
];

export function getCurrencyMeta(code: string) {
  return CURRENCY_OPTIONS.find((currency) => currency.code === code);
}

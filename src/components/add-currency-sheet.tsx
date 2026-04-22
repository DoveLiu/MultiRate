"use client";

import { useDeferredValue, useState } from "react";
import { CURRENCY_OPTIONS } from "@/lib/currency/meta";

interface AddCurrencySheetProps {
  open: boolean;
  selectedCodes: string[];
  onClose: () => void;
  onSelect: (code: string) => void;
}

export function AddCurrencySheet({
  open,
  selectedCodes,
  onClose,
  onSelect
}: AddCurrencySheetProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  if (!open) {
    return null;
  }

  const filteredCurrencies = CURRENCY_OPTIONS.filter((currency) => {
    if (selectedCodes.includes(currency.code)) {
      return false;
    }

    if (!deferredQuery) {
      return true;
    }

    return [currency.code, currency.nameZh, currency.nameEn]
      .join(" ")
      .toLowerCase()
      .includes(deferredQuery);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-0 sm:items-center sm:justify-center sm:p-3">
      <div className="subtle-scrollbar max-h-[82vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#191919] p-4 shadow-[0_-18px_60px_rgba(0,0,0,0.4)] sm:max-w-xl sm:rounded-[2rem] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Add Currency</p>
            <h2 className="mt-2 text-xl font-semibold text-white">新增顯示幣別</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300"
          >
            關閉
          </button>
        </div>

        <label className="mt-4 block">
          <span className="sr-only">搜尋幣別</span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋幣別代碼或名稱"
            className="w-full rounded-2xl border border-white/10 bg-[#232323] px-4 py-3 text-base text-white outline-none placeholder:text-slate-500"
          />
        </label>

        <div className="mt-4 space-y-2">
          {filteredCurrencies.length ? (
            filteredCurrencies.map((currency) => (
              <button
                key={currency.code}
                type="button"
                onClick={() => {
                  onSelect(currency.code);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-[#232323] px-4 py-3 text-left transition hover:border-slate-400/40 hover:bg-[#282828]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {currency.flag}
                  </span>
                  <div>
                    <p className="font-medium text-white">{currency.code}</p>
                    <p className="text-sm text-slate-400">{currency.nameZh}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-200">加入</span>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-400">
              查無可加入的幣別
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

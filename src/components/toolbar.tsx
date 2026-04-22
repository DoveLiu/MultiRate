"use client";

import { formatDateTime } from "@/lib/format/number";

interface ToolbarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  sourceUpdatedAt: string | null;
  fetchedAt: string | null;
  stale: boolean;
}

export function Toolbar({
  onRefresh,
  isRefreshing,
  sourceUpdatedAt,
  fetchedAt,
  stale
}: ToolbarProps) {
  return (
    <header className="overflow-hidden border-b border-white/6 bg-[#202020]">
      <div className="relative flex items-center justify-center px-4 py-6">
        <div className="w-10 shrink-0" />
        <h1 className="truncate text-[1.75rem] font-semibold tracking-tight text-white">
          加強型貨幣換算器
        </h1>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="重新整理匯率"
          className="absolute right-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-slate-100 transition hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshIcon spinning={isRefreshing} />
        </button>
      </div>

      <div className="border-t border-white/5 bg-[#141414] px-4 py-3 text-center">
        <p className="text-[15px] tracking-[0.02em] text-slate-300">
          更新: {formatDateTime(sourceUpdatedAt)}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          伺服器抓取: {formatDateTime(fetchedAt)}
          {stale ? " · fallback" : ""}
        </p>
      </div>
    </header>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 fill-none stroke-current stroke-[2] ${spinning ? "animate-spin" : ""}`}
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

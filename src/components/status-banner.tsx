"use client";

import { formatDateTime } from "@/lib/format/number";

interface StatusBannerProps {
  isOnline: boolean;
  stale: boolean;
  error: string | null;
  lastSuccessfulAt: string | null;
}

export function StatusBanner({
  isOnline,
  stale,
  error,
  lastSuccessfulAt
}: StatusBannerProps) {
  if (isOnline && !stale && !error) {
    return null;
  }

  return (
    <section className="border-b border-white/6 bg-[#2e2917] px-4 py-2 text-xs text-amber-50">
      <div className="flex flex-col gap-1">
        {!isOnline ? <p>目前為離線狀態，畫面會優先使用最近一次成功資料。</p> : null}
        {stale ? <p>台銀來源暫時無法更新，正在顯示最近一次成功取得的匯率。</p> : null}
        {error ? <p className="text-amber-100/90">{error}</p> : null}
        <p className="text-[11px] text-amber-100/80">
          最近成功更新 {formatDateTime(lastSuccessfulAt)}
        </p>
      </div>
    </section>
  );
}

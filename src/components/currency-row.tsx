"use client";

import { FlagBadge } from "@/components/flag-badge";

interface CurrencyRowProps {
  code: string;
  value: string;
  isActive: boolean;
  showTrend: boolean;
  onSelect: () => void;
}

export function CurrencyRow({
  code,
  value,
  isActive,
  showTrend,
  onSelect
}: CurrencyRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 px-4 py-4 text-left ${
        isActive ? "bg-[#1e2534]" : "bg-[#111111]"
      }`}
    >
      <FlagBadge code={code} />

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[2rem] font-light leading-none tracking-tight text-[#dfdfdf] sm:text-[2.2rem]">
            {code}
          </span>
          <ChevronDownIcon />
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`min-w-[5.5rem] text-right text-[2rem] font-light leading-none tracking-tight sm:min-w-[7rem] sm:text-[2.2rem] ${
              isActive ? "text-white" : "text-[#a8a8a8]"
            }`}
          >
            {value || "0"}
          </span>

          <span className="flex w-6 justify-center text-[#b7b7b7] sm:w-7">
            {showTrend ? <TrendIcon /> : <span className="h-6 w-6 sm:h-7 sm:w-7" />}
          </span>
        </div>
      </div>
    </button>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#d0d0d0] sm:h-6 sm:w-6">
      <path
        d="M5 8.5l7 7 7-7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8] sm:h-7 sm:w-7">
      <path d="M4 18V6" />
      <path d="M4 18h16" />
      <path d="M8 14l4-4 3 2 5-6" />
      <path d="M17 6h3v3" />
    </svg>
  );
}

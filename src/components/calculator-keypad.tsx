"use client";

import type { ReactNode } from "react";

interface CalculatorKeypadProps {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onBackspace: () => void;
  onClear: () => void;
  onRefresh: () => void;
}

export function CalculatorKeypad({
  onDigit,
  onDecimal,
  onBackspace,
  onClear,
  onRefresh
}: CalculatorKeypadProps) {
  return (
    <section className="border-t border-white/6 bg-[#202020] px-4 pb-4 pt-3">
      <div className="grid grid-cols-4 gap-3">
        <KeyButton label="C" accent="danger" onClick={onClear} />
        <KeyButton label="7" onClick={() => onDigit("7")} />
        <KeyButton label="8" onClick={() => onDigit("8")} />
        <KeyButton label="9" onClick={() => onDigit("9")} />

        <IconButton accent="info" onClick={onRefresh} icon={<RefreshGlyph />} />
        <KeyButton label="4" onClick={() => onDigit("4")} />
        <KeyButton label="5" onClick={() => onDigit("5")} />
        <KeyButton label="6" onClick={() => onDigit("6")} />

        <div className="row-span-2 flex items-center justify-center rounded-[1.2rem] border border-[#1f1f1f] bg-[#262626] text-[2.4rem] text-[#d08b4b] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="flex flex-col items-center leading-[1.1]">
            <span>+</span>
            <span>-</span>
            <span>x</span>
            <span>/</span>
          </div>
        </div>
        <KeyButton label="1" onClick={() => onDigit("1")} />
        <KeyButton label="2" onClick={() => onDigit("2")} />
        <KeyButton label="3" onClick={() => onDigit("3")} />

        <KeyButton label="0" onClick={() => onDigit("0")} />
        <KeyButton label="." onClick={onDecimal} />
        <IconButton onClick={onBackspace} icon={<BackspaceGlyph />} />
      </div>
    </section>
  );
}

function KeyButton({
  label,
  onClick,
  accent = "default"
}: {
  label: string;
  onClick: () => void;
  accent?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[5.4rem] items-center justify-center rounded-[1.2rem] border border-[#1f1f1f] text-[2.6rem] font-light shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition active:scale-[0.98] ${
        accent === "danger"
          ? "bg-[#262626] text-[#d86459]"
          : "bg-[#262626] text-[#f1f1f1]"
      }`}
    >
      {label}
    </button>
  );
}

function IconButton({
  icon,
  onClick,
  accent = "default"
}: {
  icon: ReactNode;
  onClick: () => void;
  accent?: "default" | "info";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[5.4rem] items-center justify-center rounded-[1.2rem] border border-[#1f1f1f] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition active:scale-[0.98] ${
        accent === "info" ? "bg-[#262626] text-[#76a9e8]" : "bg-[#262626] text-[#f1f1f1]"
      }`}
    >
      {icon}
    </button>
  );
}

function RefreshGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-[1.8]">
      <path d="M17.5 6.5A7 7 0 0 0 6 9" />
      <path d="M6.5 17.5A7 7 0 0 0 18 15" />
      <path d="M18 6v4h-4" />
      <path d="M6 18v-4h4" />
    </svg>
  );
}

function BackspaceGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-[1.8]">
      <path d="M9 7 4 12l5 5h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
      <path d="m12 10 4 4" />
      <path d="m16 10-4 4" />
    </svg>
  );
}

"use client";

import { useState } from "react";
import { DEFAULT_SELECTED_CODES } from "@/lib/currency/meta";
import type { RateType } from "@/lib/rates/types";

export function useCalculatorState() {
  const [selectedCodes, setSelectedCodes] = useState<string[]>(DEFAULT_SELECTED_CODES);
  const [activeCode, setActiveCode] = useState<string>("TWD");
  const [rawInputMap, setRawInputMap] = useState<Record<string, string>>({
    TWD: ""
  });
  const [rateType, setRateType] = useState<RateType>("spotSell");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [inputNotice, setInputNotice] = useState<string | null>(null);

  return {
    selectedCodes,
    setSelectedCodes,
    activeCode,
    setActiveCode,
    rawInputMap,
    setRawInputMap,
    rateType,
    setRateType,
    isPickerOpen,
    setIsPickerOpen,
    inputNotice,
    setInputNotice
  };
}

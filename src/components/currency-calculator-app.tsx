"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState, startTransition } from "react";
import styles from "./currency-calculator-app.module.css";
import { computeConvertedAmounts, getRateValue } from "@/lib/converter/convert";
import { CURRENCY_OPTIONS, getCurrencyMeta } from "@/lib/currency/meta";
import type { CurrencyMeta } from "@/lib/currency/types";
import { formatDateTime, formatDisplayAmount, formatEditableAmount } from "@/lib/format/number";
import { useCalculatorState } from "@/store/use-calculator-state";
import { useOnlineStatus } from "@/store/use-online-status";
import { useRates } from "@/store/use-rates";

const FLAG_CODES: Record<string, string> = {
  TWD: "tw",
  USD: "us",
  HKD: "hk",
  GBP: "gb",
  AUD: "au",
  CAD: "ca",
  SGD: "sg",
  CHF: "ch",
  JPY: "jp",
  ZAR: "za",
  SEK: "se",
  NZD: "nz",
  THB: "th",
  PHP: "ph",
  IDR: "id",
  EUR: "eu",
  KRW: "kr",
  VND: "vn",
  MYR: "my",
  CNY: "cn"
};

type CalculatorOperator = "+" | "-" | "x" | "/";

type PendingOperation = {
  accumulator: number;
  code: string;
  operator: CalculatorOperator;
  awaitingNextValue: boolean;
};

export function CurrencyCalculatorApp() {
  const {
    selectedCodes,
    setSelectedCodes,
    activeCode,
    setActiveCode,
    rawInputMap,
    setRawInputMap,
    rateType,
    isPickerOpen,
    setIsPickerOpen,
    inputNotice,
    setInputNotice
  } = useCalculatorState();
  const { data, isLoading, isRefreshing, error, refresh } = useRates();
  const isOnline = useOnlineStatus();
  const [pickerQuery, setPickerQuery] = useState("");
  const [pendingOperation, setPendingOperation] = useState<PendingOperation | null>(null);

  const activeRawValue = rawInputMap[activeCode] ?? "";
  const activeAmount = parseRawToNumber(activeRawValue);
  const convertedAmounts = computeConvertedAmounts({
    amount: activeAmount,
    baseCode: activeCode,
    selectedCodes,
    rates: data?.rates ?? null,
    rateType
  });

  useEffect(() => {
    if (!inputNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setInputNotice(null);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [inputNotice, setInputNotice]);

  const listItems = useMemo(
    () =>
      selectedCodes
        .map((code) => getCurrencyMeta(code))
        .filter((currency): currency is CurrencyMeta => Boolean(currency)),
    [selectedCodes]
  );

  const filteredCurrencies = useMemo(() => {
    const keyword = pickerQuery.trim().toLowerCase();

    return CURRENCY_OPTIONS.filter((currency) => {
      if (selectedCodes.includes(currency.code)) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [currency.code, currency.nameZh, currency.nameEn]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [pickerQuery, selectedCodes]);

  function selectCode(code: string) {
    setPendingOperation(null);
    setActiveCode(code);

    setRawInputMap((previous) => {
      const currentRaw = previous[code];

      if (currentRaw != null && currentRaw !== "") {
        return previous;
      }

      const nextRawValue =
        convertedAmounts[code] != null ? formatEditableAmount(convertedAmounts[code] as number) : "";

      return {
        ...previous,
        [code]: nextRawValue
      };
    });
  }

  function appendDigit(digit: string) {
    setRawInputMap((previous) => {
      const shouldReplace =
        pendingOperation?.code === activeCode && pendingOperation.awaitingNextValue;
      const current = shouldReplace ? "" : previous[activeCode] ?? "";
      const next =
        current === "0" && digit !== "0" && !current.includes(".") ? digit : `${current}${digit}`;

      return {
        ...previous,
        [activeCode]: next
      };
    });

    setPendingOperation((previous) =>
      previous?.code === activeCode && previous.awaitingNextValue
        ? { ...previous, awaitingNextValue: false }
        : previous
    );
  }

  function appendDecimal() {
    setRawInputMap((previous) => {
      const shouldReplace =
        pendingOperation?.code === activeCode && pendingOperation.awaitingNextValue;
      const current = shouldReplace ? "" : previous[activeCode] ?? "";

      if (current.includes(".")) {
        return previous;
      }

      return {
        ...previous,
        [activeCode]: current ? `${current}.` : "0."
      };
    });

    setPendingOperation((previous) =>
      previous?.code === activeCode && previous.awaitingNextValue
        ? { ...previous, awaitingNextValue: false }
        : previous
    );
  }

  function backspace() {
    if (pendingOperation?.code === activeCode && pendingOperation.awaitingNextValue) {
      return;
    }

    setRawInputMap((previous) => {
      const current = previous[activeCode] ?? "";
      return {
        ...previous,
        [activeCode]: current.slice(0, -1)
      };
    });
  }

  function clearActive() {
    setPendingOperation(null);
    setRawInputMap((previous) => ({
      ...previous,
      [activeCode]: ""
    }));
  }

  function handleOperator(operator: CalculatorOperator) {
    const currentValue = parseRawToNumber(rawInputMap[activeCode] ?? "") ?? 0;

    if (!pendingOperation || pendingOperation.code !== activeCode) {
      setPendingOperation({
        accumulator: currentValue,
        code: activeCode,
        operator,
        awaitingNextValue: true
      });
      return;
    }

    if (pendingOperation.awaitingNextValue) {
      setPendingOperation({
        ...pendingOperation,
        operator
      });
      return;
    }

    const result = applyCalculatorOperation(
      pendingOperation.accumulator,
      currentValue,
      pendingOperation.operator
    );

    if (result == null) {
      setPendingOperation(null);
      setInputNotice("除數不能為 0");
      return;
    }

    setRawInputMap((previous) => ({
      ...previous,
      [activeCode]: formatEditableAmount(result)
    }));

    setPendingOperation({
      accumulator: result,
      code: activeCode,
      operator,
      awaitingNextValue: true
    });
  }

  function handleAddCurrency(code: string) {
    startTransition(() => {
      setSelectedCodes((previous) =>
        previous.includes(code) ? previous : [...previous, code].sort(sortSelectedCodes)
      );
      setIsPickerOpen(false);
      setPickerQuery("");
    });
  }

  function handleRemoveCurrency(code: string) {
    if (selectedCodes.length <= 1) {
      return;
    }

    const remainingCodes = selectedCodes.filter((selectedCode) => selectedCode !== code);

    setRawInputMap((previous) => {
      const next = { ...previous };
      delete next[code];

      if (code === activeCode) {
        const fallbackCode = remainingCodes[0];
        const fallbackValue = convertedAmounts[fallbackCode];
        next[fallbackCode] = fallbackValue != null ? formatEditableAmount(fallbackValue) : "";
      }

      return next;
    });

    setSelectedCodes(remainingCodes);

    if (code === activeCode) {
      setPendingOperation(null);
      setActiveCode(remainingCodes[0]);
    }
  }

  return (
    <>
      <div className={styles.phone}>
        <header className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <h1 className={styles.headerTitle}>匯率計算機</h1>
          </div>
        </header>

        <div className={styles.updateBar}>
          <div className={styles.updatePrimary}>更新: {formatDateTime(data?.sourceUpdatedAt ?? null)}</div>
          <div className={styles.updateSecondary}>
            伺服器抓取: {formatDateTime(data?.fetchedAt ?? null)}
            {data?.stale ? " · fallback" : ""}
          </div>
        </div>

        {!isOnline || data?.stale || error ? (
          <div className={styles.noticeBar}>
            {!isOnline ? <div>目前為離線狀態，畫面會優先使用最近一次成功資料。</div> : null}
            {data?.stale ? <div>台銀來源暫時無法更新，正在顯示最近一次成功取得的匯率。</div> : null}
            {error ? <div>{error}</div> : null}
          </div>
        ) : null}

        {!data?.rates && !isLoading ? (
          <div className={styles.errorBar}>目前尚未取得台灣銀行匯率資料，請稍後再試。</div>
        ) : null}

        {inputNotice ? <div className={styles.infoBar}>{inputNotice}</div> : null}

        <section className={styles.currencyList}>
          {listItems.map((currency) => {
            const isActive = currency.code === activeCode;
            const numericValue = convertedAmounts[currency.code];
            const currentRate = getRateValue(data?.rates ?? null, currency.code, rateType);

            const displayValue = isActive
              ? formatRawInputLikeApp(rawInputMap[currency.code] ?? "")
              : numericValue != null
                ? formatDisplayAmount(numericValue, currency.code)
                : currentRate == null && activeAmount != null
                  ? "unavailable"
                  : "0";

            return (
              <button
                key={currency.code}
                type="button"
                onClick={() => selectCode(currency.code)}
                className={`${styles.currencyRow} ${isActive ? styles.currencyRowActive : ""}`}
              >
                <div className={styles.flagBox}>{renderFlag(currency, styles)}</div>

                <div className={styles.currencyCodeWrap}>
                  <span className={styles.currencyCode}>{currency.code}</span>
                </div>

                <div className={styles.currencyValueWrap}>
                  <span className={`${styles.currencyValue} ${isActive ? styles.currencyValueActive : ""}`}>
                    {displayValue || "0"}
                  </span>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveCurrency(currency.code);
                    }}
                    aria-label={`移除 ${currency.code}`}
                    disabled={selectedCodes.length <= 1}
                  >
                    ×
                  </button>
                </div>
              </button>
            );
          })}

          <button type="button" onClick={() => setIsPickerOpen(true)} className={styles.addRow}>
            <span className={styles.addFlag}>+</span>
            <span className={styles.addText}>添加貨幣</span>
          </button>
        </section>

        <section className={styles.keypad}>
          <div className={styles.keyGrid}>
            <KeyButton label="C" danger onClick={clearActive} />
            <KeyButton label="7" onClick={() => appendDigit("7")} />
            <KeyButton label="8" onClick={() => appendDigit("8")} />
            <KeyButton label="9" onClick={() => appendDigit("9")} />

            <IconKeyButton info onClick={refresh}>
              <RefreshIcon />
            </IconKeyButton>
            <KeyButton label="4" onClick={() => appendDigit("4")} />
            <KeyButton label="5" onClick={() => appendDigit("5")} />
            <KeyButton label="6" onClick={() => appendDigit("6")} />

            <div className={styles.opsKey}>
              {(["+", "-", "x", "/"] as CalculatorOperator[]).map((operator) => (
                <button
                  key={operator}
                  type="button"
                  onClick={() => handleOperator(operator)}
                  className={`${styles.opsButton} ${
                    pendingOperation?.code === activeCode && pendingOperation.operator === operator
                      ? styles.opsButtonActive
                      : ""
                  }`}
                >
                  {operator}
                </button>
              ))}
            </div>
            <KeyButton label="1" onClick={() => appendDigit("1")} />
            <KeyButton label="2" onClick={() => appendDigit("2")} />
            <KeyButton label="3" onClick={() => appendDigit("3")} />

            <KeyButton label="0" onClick={() => appendDigit("0")} />
            <KeyButton label="." onClick={appendDecimal} />
            <IconKeyButton onClick={backspace}>
              <BackspaceIcon />
            </IconKeyButton>
          </div>
        </section>
      </div>

      {isPickerOpen ? (
        <div className={styles.sheetBackdrop}>
          <div className={styles.sheet}>
            <div className={styles.sheetHeader}>
              <div>
                <div className={styles.sheetKicker}>Add Currency</div>
                <div className={styles.sheetTitle}>新增顯示幣別</div>
              </div>
              <button type="button" onClick={() => setIsPickerOpen(false)} className={styles.sheetClose}>
                關閉
              </button>
            </div>

            <input
              type="text"
              value={pickerQuery}
              onChange={(event) => setPickerQuery(event.target.value)}
              placeholder="搜尋幣別代碼或名稱"
              className={styles.sheetSearch}
            />

            <div className={styles.sheetList}>
              {filteredCurrencies.length ? (
                filteredCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => handleAddCurrency(currency.code)}
                    className={styles.sheetItem}
                  >
                    <div className={styles.sheetItemLeft}>
                      <div className={styles.sheetItemFlag}>{renderFlag(currency, styles)}</div>
                      <div>
                        <div className={styles.sheetItemCode}>{currency.code}</div>
                        <div className={styles.sheetItemName}>{currency.nameZh}</div>
                      </div>
                    </div>
                    <div className={styles.sheetItemAction}>加入</div>
                  </button>
                ))
              ) : (
                <div className={styles.sheetEmpty}>查無可加入的幣別</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function KeyButton({
  label,
  onClick,
  danger = false
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={`${styles.keyButton} ${danger ? styles.keyDanger : ""}`}>
      {label}
    </button>
  );
}

function IconKeyButton({
  children,
  onClick,
  info = false
}: {
  children: ReactNode;
  onClick: () => void;
  info?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={`${styles.keyButton} ${info ? styles.keyInfo : ""}`}>
      {children}
    </button>
  );
}

function renderFlag(currency: CurrencyMeta, currentStyles: Record<string, string>) {
  const countryCode = FLAG_CODES[currency.code];

  if (!countryCode) {
    return <span className={currentStyles.emojiFlag}>{currency.flag}</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w80/${countryCode}.png`}
      alt={`${currency.code} flag`}
      className={currentStyles.flagImage}
      loading="lazy"
    />
  );
}

function RefreshIcon({ spinning = false }: { spinning?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${styles.icon} ${spinning ? styles.spin : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M17.5 6.5A7 7 0 0 0 6 9" />
      <path d="M6.5 17.5A7 7 0 0 0 18 15" />
      <path d="M18 6v4h-4" />
      <path d="M6 18v-4h4" />
    </svg>
  );
}

function BackspaceIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 7 4 12l5 5h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
      <path d="m12 10 4 4" />
      <path d="m16 10-4 4" />
    </svg>
  );
}

function parseRawToNumber(rawValue: string) {
  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function applyCalculatorOperation(
  leftValue: number,
  rightValue: number,
  operator: CalculatorOperator
) {
  switch (operator) {
    case "+":
      return leftValue + rightValue;
    case "-":
      return leftValue - rightValue;
    case "x":
      return leftValue * rightValue;
    case "/":
      return rightValue === 0 ? null : leftValue / rightValue;
    default:
      return rightValue;
  }
}

function formatRawInputLikeApp(rawValue: string) {
  if (!rawValue) {
    return "";
  }

  const endsWithDot = rawValue.endsWith(".");
  const [integerPart, decimalPart] = rawValue.split(".");
  const formattedInteger = Number(integerPart || "0").toLocaleString("en-US");

  if (endsWithDot) {
    return `${formattedInteger}.`;
  }

  if (decimalPart != null) {
    return `${formattedInteger}.${decimalPart}`;
  }

  return formattedInteger;
}

function sortSelectedCodes(leftCode: string, rightCode: string) {
  const leftCurrency = CURRENCY_OPTIONS.find((currency) => currency.code === leftCode);
  const rightCurrency = CURRENCY_OPTIONS.find((currency) => currency.code === rightCode);

  return (leftCurrency?.sortOrder ?? 999) - (rightCurrency?.sortOrder ?? 999);
}

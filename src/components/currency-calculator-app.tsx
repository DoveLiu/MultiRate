"use client";

import type { ReactNode } from "react";
import { startTransition, useEffect, useMemo, useState } from "react";
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

const TAG_COLORS = ["rose", "sky", "sage", "gold", "lavender", "sand", "coral"];

type CalculatorOperator = "+" | "-" | "×" | "÷";

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
  const updatedAt = data?.fetchedAt ?? data?.sourceUpdatedAt ?? null;
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
    }, 2400);

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
      setPendingOperation(null);
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

  function toggleSign() {
    setPendingOperation(null);
    setRawInputMap((previous) => {
      const current = previous[activeCode] ?? "";

      if (!current || current === "0") {
        return previous;
      }

      return {
        ...previous,
        [activeCode]: current.startsWith("-") ? current.slice(1) : `-${current}`
      };
    });
  }

  function applyPercent() {
    const currentValue = parseRawToNumber(rawInputMap[activeCode] ?? "");

    if (currentValue == null) {
      return;
    }

    setPendingOperation(null);
    setRawInputMap((previous) => ({
      ...previous,
      [activeCode]: formatEditableAmount(currentValue / 100)
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
      setInputNotice("Cannot divide by zero");
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

  function handleEquals() {
    if (!pendingOperation || pendingOperation.code !== activeCode || pendingOperation.awaitingNextValue) {
      return;
    }

    const currentValue = parseRawToNumber(rawInputMap[activeCode] ?? "") ?? 0;
    const result = applyCalculatorOperation(
      pendingOperation.accumulator,
      currentValue,
      pendingOperation.operator
    );

    if (result == null) {
      setPendingOperation(null);
      setInputNotice("Cannot divide by zero");
      return;
    }

    setRawInputMap((previous) => ({
      ...previous,
      [activeCode]: formatEditableAmount(result)
    }));
    setPendingOperation(null);
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

  function handleRowKeyDown(event: React.KeyboardEvent<HTMLDivElement>, code: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectCode(code);
    }
  }

  async function handleRefresh() {
    const didRefresh = await refresh();
    if (!didRefresh) {
      setInputNotice("更新失敗，請稍後再試");
    }
  }

  return (
    <>
      <div className={styles.phone}>
        <header className={styles.hero}>
          <div className={styles.heroStamp}>✦</div>
          <div className={styles.heroBadge}>🧳</div>
          <div className={styles.heroContent}>
            <p className={styles.heroKicker}>Travel Exchange Notes</p>
            <h1 className={styles.heroTitle}>Exchange Calculator</h1>
            <div className={styles.heroMeta}>Updated: {formatDateTime(updatedAt)}</div>
          </div>
          <button
            type="button"
            className={styles.heroRefresh}
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh exchange rates"
          >
            <RefreshIcon spinning={isRefreshing} />
          </button>
        </header>

        {!isOnline || data?.stale || error ? (
          <div className={styles.noticeStack}>
            {!isOnline ? <div className={styles.noticeCard}>目前離線中，將顯示最近一次成功抓到的匯率。</div> : null}
            {data?.stale ? <div className={styles.noticeCard}>官方來源暫時異常，畫面正在使用快取資料。</div> : null}
            {error ? <div className={styles.noticeCard}>{error}</div> : null}
          </div>
        ) : null}

        {!data?.rates && !isLoading ? (
          <div className={styles.noticeStack}>
            <div className={styles.noticeCard}>目前沒有可用匯率資料，請稍後重新整理。</div>
          </div>
        ) : null}

        {inputNotice ? (
          <div className={styles.noticeStack}>
            <div className={styles.infoCard}>{inputNotice}</div>
          </div>
        ) : null}

        <section className={styles.tagList}>
          {listItems.map((currency, index) => {
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
              <div
                key={currency.code}
                role="button"
                tabIndex={0}
                onClick={() => selectCode(currency.code)}
                onKeyDown={(event) => handleRowKeyDown(event, currency.code)}
                className={`${styles.tagRow} ${isActive ? styles.tagRowActive : ""}`}
              >
                <span
                  className={styles.tagSide}
                  data-color={TAG_COLORS[index % TAG_COLORS.length]}
                  aria-hidden="true"
                >
                  <span className={styles.tagHole} />
                </span>

                <span className={styles.tagMain}>
                  <span className={styles.tagFlagBox}>{renderFlag(currency, styles)}</span>

                  <span className={styles.tagCurrency}>
                    <span className={styles.tagCode}>{currency.code}</span>
                    <span className={styles.tagName}>{currency.nameZh}</span>
                  </span>

                  <span className={styles.tagValueWrap}>
                  <span className={`${styles.tagValue} ${isActive ? styles.tagValueActive : ""}`}>
                    {displayValue || "0"}
                  </span>
                  </span>

                  <span className={styles.tagActions}>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveCurrency(currency.code);
                      }}
                      aria-label={`刪除 ${currency.code}`}
                      disabled={selectedCodes.length <= 1}
                    >
                      ×
                    </button>
                  </span>
                </span>
              </div>
            );
          })}

          <button type="button" onClick={() => setIsPickerOpen(true)} className={styles.addTicket}>
            <span className={styles.addTicketPlus}>＋</span>
            <span className={styles.addTicketText}>Add Currency</span>
            <span className={styles.addTicketStamp}>🧳</span>
          </button>
        </section>

        <section className={styles.keypadSection}>
          <div className={styles.keypad}>
            <IconKeyButton tone="function" onClick={backspace}>
              <BackspaceIcon />
            </IconKeyButton>
            <KeyButton label="AC" tone="function" onClick={clearActive} />
            <KeyButton label="%" tone="function" onClick={applyPercent} />
            <KeyButton
              label="÷"
              tone="operator"
              active={pendingOperation?.code === activeCode && pendingOperation.operator === "÷"}
              onClick={() => handleOperator("÷")}
            />

            <KeyButton label="7" onClick={() => appendDigit("7")} />
            <KeyButton label="8" onClick={() => appendDigit("8")} />
            <KeyButton label="9" onClick={() => appendDigit("9")} />
            <KeyButton
              label="×"
              tone="operator"
              active={pendingOperation?.code === activeCode && pendingOperation.operator === "×"}
              onClick={() => handleOperator("×")}
            />

            <KeyButton label="4" onClick={() => appendDigit("4")} />
            <KeyButton label="5" onClick={() => appendDigit("5")} />
            <KeyButton label="6" onClick={() => appendDigit("6")} />
            <KeyButton
              label="-"
              tone="operator"
              active={pendingOperation?.code === activeCode && pendingOperation.operator === "-"}
              onClick={() => handleOperator("-")}
            />

            <KeyButton label="1" onClick={() => appendDigit("1")} />
            <KeyButton label="2" onClick={() => appendDigit("2")} />
            <KeyButton label="3" onClick={() => appendDigit("3")} />
            <KeyButton
              label="+"
              tone="operator"
              active={pendingOperation?.code === activeCode && pendingOperation.operator === "+"}
              onClick={() => handleOperator("+")}
            />

            <KeyButton label="+/-" tone="function" onClick={toggleSign} />
            <KeyButton label="0" onClick={() => appendDigit("0")} />
            <KeyButton label="." onClick={appendDecimal} />
            <KeyButton label="=" tone="operator" onClick={handleEquals} />
          </div>
        </section>
      </div>

      {isPickerOpen ? (
        <div className={styles.sheetBackdrop}>
          <div className={styles.sheet}>
            <div className={styles.sheetAirmail} />

            <div className={styles.sheetHeader}>
              <button type="button" onClick={() => setIsPickerOpen(false)} className={styles.sheetBackButton}>
                ←
              </button>
              <div className={styles.sheetTitleGroup}>
                <div className={styles.sheetTitle}>Add Display Currencies</div>
                <div className={styles.sheetSubtitle}>Search by currency code or name</div>
              </div>
              <div className={styles.sheetDecor}>✈️</div>
            </div>

            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>⌕</span>
              <input
                type="text"
                value={pickerQuery}
                onChange={(event) => setPickerQuery(event.target.value)}
                placeholder="搜尋幣別代碼或名稱"
                className={styles.sheetSearch}
              />
              <span className={styles.searchStamp}>🪪</span>
            </div>

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
                <div className={styles.sheetEmpty}>找不到符合條件的幣別。</div>
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
  tone = "number",
  active = false
}: {
  label: string;
  onClick: () => void;
  tone?: "number" | "function" | "operator";
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.keyButton} ${tone === "function" ? styles.keyFunction : ""} ${
        tone === "operator" ? styles.keyOperator : ""
      } ${active ? styles.keyActive : ""}`}
    >
      {label}
    </button>
  );
}

function IconKeyButton({
  children,
  onClick,
  tone = "number",
  disabled = false
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "number" | "function" | "operator";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${styles.keyButton} ${tone === "function" ? styles.keyFunction : ""} ${
        tone === "operator" ? styles.keyOperator : ""
      } ${disabled ? styles.keyDisabled : ""}`}
    >
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
    case "×":
      return leftValue * rightValue;
    case "÷":
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

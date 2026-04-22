import { CurrencyCalculatorApp } from "@/components/currency-calculator-app";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0f0f10] px-0 py-0">
      <div className="mx-auto max-w-[430px]">
        <CurrencyCalculatorApp />
      </div>
    </main>
  );
}

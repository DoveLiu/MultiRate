import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MultiRate 多幣別匯率換算器",
  description: "使用台灣銀行牌告匯率的手機版多幣別匯率換算工具",
  applicationName: "MultiRate",
  themeColor: "#111111"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}

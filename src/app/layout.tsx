import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MultiRate 匯率計算機",
  description: "旅行手帳風的多幣別匯率計算工具，可即時換算台銀牌告匯率。",
  applicationName: "MultiRate",
  themeColor: "#f6ead7",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
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

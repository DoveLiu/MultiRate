# MultiRate

手機優先、多幣別、無廣告的台灣銀行匯率計算機。

## Tech Stack

- Next.js App Router
- Tailwind CSS
- Route Handler `/api/rates`
- 台灣銀行牌告匯率文字檔為 primary source
- 台灣銀行牌告匯率 HTML 表格為 fallback source

## Quick Start

```bash
npm install
npm run dev
```

開發伺服器預設為 [http://localhost:3000](http://localhost:3000)。

## 如何停止 `npm run dev`

在終端機執行開發伺服器後，如果要跳出來，按：

```bash
Ctrl + C
```

如果終端機詢問是否終止批次工作，輸入：

```bash
Y
```

再按 Enter 即可結束。

## 專案結構

```text
src/
  app/
    api/rates/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    add-currency-sheet.tsx
    currency-calculator-app.tsx
    currency-row.tsx
    status-banner.tsx
    toolbar.tsx
  lib/
    converter/
    currency/
    format/
    input/
    rates/
  store/
    use-calculator-state.ts
    use-online-status.ts
    use-rates.ts
```

## 資料來源策略

- Primary: `https://rate.bot.com.tw/xrt/fltxt/0/day`
- Fallback: `https://rate.bot.com.tw/xrt?Lang=zh-TW`

API 會回傳：

- `cashBuy`
- `cashSell`
- `spotBuy`
- `spotSell`
- `sourceUpdatedAt`
- `fetchedAt`
- `stale`
- `error`

## MVP 已實作

- 多幣別同畫面即時換算
- 任一列輸入作為基準幣別
- 新增 / 刪除 / 搜尋幣別
- 匯率類型切換架構
- 重新整理與 stale fallback UI
- 伺服器端抓台銀資料與 15 分鐘快取

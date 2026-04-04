# CardSense — 情境式信用卡回饋推薦平台

根據消費情境（金額、類別、通路）即時比較各家信用卡回饋，找出最佳選擇。

**線上版本：** https://cardsense-web.vercel.app

---

## 功能

- **年度損失計算機 `/calc`** — 社群傳播入口頁，計算器風格金額輸入、消費類別/場景選擇、持有卡片比較、回饋排名、年度損失動畫、分享圖片生成
- **情境式推薦 `/recommend`** — 輸入消費金額、類別、通路，比較所有已收錄卡片的預估回饋
- **優惠明細展開** — 逐一列出每個優惠的回饋金額、條件與有效期
- **損益平衡分析** — 疊加模式下自動計算兩張卡片的損益平衡消費點
- **卡片目錄 `/cards`** — 多維篩選（銀行、資格類型、優惠類別、年費區間、推薦範圍），可收合進階篩選
- **卡片詳情 `/cards/:cardCode`** — 優惠明細依類別分組、權益切換提醒、一鍵跳轉推薦
- **深色模式** — 跟隨系統偏好，可手動切換
- **行動裝置最佳化** — 響應式 header、touch target 合規（44px/36px）、300ms tap delay 消除

## 技術棧

| 層次 | 套件 |
|------|------|
| 框架 | React 19 + TypeScript + Vite |
| 路由 | React Router v7 |
| 樣式 | Tailwind CSS v4 + OKLCH 語意色彩 token |
| 元件 | Radix UI + shadcn/ui |
| 圖示 | Lucide React |
| 資料請求 | TanStack Query v5 |
| 部署 | Vercel |

## 本地開發

### 環境需求

- Node.js 20+
- 後端 API 服務（`cardsense` 或相容介面）

### 安裝與啟動

```bash
# 安裝相依套件
npm install

# 設定環境變數
cp .env.example .env.local
# 編輯 .env.local，填入 VITE_API_BASE_URL

# 啟動開發伺服器
npm run dev
```

### 環境變數

| 變數 | 說明 | 範例 |
|------|------|------|
| `VITE_API_BASE_URL` | 後端 API 根路徑 | `http://localhost:8080` |

### 常用指令

```bash
npm run dev      # 開發伺服器（含 HMR）
npm run build    # 生產版本建置
npm run preview  # 預覽生產建置結果
npm run lint     # ESLint 檢查
```

## 專案結構

```
src/
├── api/           # API client、React Query hooks
├── components/
│   ├── ui/        # shadcn/ui 基礎元件（Button、FilterChip、Input 等）
│   ├── Layout.tsx
│   ├── RecommendationForm.tsx
│   └── RecommendationResults.tsx
├── hooks/         # use-dark-mode、use-debounce
├── pages/
│   ├── CalcPage.tsx          # /calc 年度損失社群入口頁
│   ├── HomePage.tsx          # /recommend 推薦頁
│   ├── CardsPage.tsx         # /cards 卡片目錄
│   ├── CardDetailPage.tsx    # /cards/:cardCode 卡片詳情
│   └── calc/                 # /calc 子元件
│       ├── AmountInput.tsx   # 計算機風格金額輸入
│       ├── CategoryGrid.tsx  # 消費類別選擇
│       ├── SubcategoryGrid.tsx # 消費場景選擇
│       ├── CardSelector.tsx  # 持有卡片勾選
│       ├── ResultPanel.tsx   # 回饋排名結果
│       ├── AnnualLossBox.tsx # 年度損失動畫計數器
│       ├── ShareButton.tsx   # 分享結果圖片
│       └── CtaStrip.tsx      # CTA 導流按鈕
├── types/         # TypeScript 型別與 enum
└── index.css      # 全域樣式 + 色彩 token + touch target sizing tokens
```

## 設計系統

### 共用元件

| 元件 | 用途 |
|------|------|
| `FilterChip` | 篩選按鈕（active/inactive 切換），支援 `lg`（44px）/ `default`（36px）兩種 touch target 尺寸 |

### Touch Target Tokens

在 `index.css` 的 `@theme` 中定義，供 Tailwind class 使用：

| Token | 值 | Tailwind class | 用途 |
|-------|-----|---------------|------|
| `--spacing-touch` | 44px | `min-h-touch` | 主要 CTA、銀行篩選等大型 touch target |
| `--spacing-touch-sm` | 36px | `min-h-touch-sm` | 進階篩選、子類別 chip 等次要 touch target |

### 行動裝置適配

- Header 導覽列：手機只顯示 icon，`sm` 以上顯示文字 label
- 所有互動元素符合 44px / 36px 最低 touch target
- 計算器按鈕加入 `touch-manipulation` 消除 300ms tap delay
- 結果排名卡名/金額欄位響應式寬度
- CardsPage 進階篩選可收合
- `prefers-reduced-motion` 停用動畫

## 部署

推送到 `master` 分支後，Vercel 自動觸發部署。需在 Vercel 專案設定中配置 `VITE_API_BASE_URL` 環境變數。

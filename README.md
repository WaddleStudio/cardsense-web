# CardSense — 情境式信用卡回饋推薦平台

根據消費情境（金額、類別、通路）即時比較各家信用卡回饋，找出最佳選擇。

**線上版本：** https://cardsense-web.vercel.app

---

## 功能

- **情境式推薦** — 輸入消費金額、類別、通路，比較所有已收錄卡片的預估回饋
- **兩種比較模式** — 最佳單一優惠 / 所有可疊加優惠
- **優惠明細展開** — 逐一列出每個優惠的回饋金額、條件與有效期
- **損益平衡分析** — 疊加模式下自動計算兩張卡片的損益平衡消費點
- **卡片目錄** — 依銀行、名稱篩選與排序所有已收錄卡片
- **深色模式** — 跟隨系統偏好，可手動切換

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
│   ├── ui/        # shadcn/ui 基礎元件
│   ├── Layout.tsx
│   ├── RecommendationForm.tsx
│   └── RecommendationResults.tsx
├── hooks/         # use-dark-mode、use-debounce
├── pages/         # HomePage、CardsPage、CardDetailPage
├── types/         # TypeScript 型別與 enum
└── index.css      # 全域樣式 + 色彩 token
```

## 部署

推送到 `master` 分支後，Vercel 自動觸發部署。需在 Vercel 專案設定中配置 `VITE_API_BASE_URL` 環境變數。

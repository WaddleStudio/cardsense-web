# Dynamic Taxonomy from Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `SUBCATEGORIES` and `MERCHANT_SUGGESTIONS` auto-derive from contracts JSON files so the frontend never drifts when merchants or subcategories are added.

**Architecture:** Add a Vite alias `@contracts` pointing to `../../cardsense-contracts`. Create a new `src/lib/taxonomy.ts` that imports the two JSON files (`subcategory-taxonomy.json`, `merchant-registry.json`) and derives `SUBCATEGORIES` and `MERCHANT_SUGGESTIONS` at build time. A small label map in the same file handles Chinese translations. `enums.ts` removes the hardcoded versions and re-exports from `taxonomy.ts`.

**Tech Stack:** Vite (JSON import), TypeScript

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `vite.config.ts` | Modify | Add `@contracts` alias |
| `src/vite-env.d.ts` | Modify | Add type declaration for `@contracts/*.json` imports |
| `src/lib/taxonomy.ts` | Create | Import contracts JSON, maintain label map, derive & export `SUBCATEGORIES`, `SUBCATEGORY_LABELS`, `MERCHANT_SUGGESTIONS` |
| `src/types/enums.ts` | Modify | Remove hardcoded `SUBCATEGORIES`, `SUBCATEGORY_LABELS`, `MERCHANT_SUGGESTIONS`; re-export from `taxonomy.ts` |

---

### Task 1: Add `@contracts` Vite alias

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/vite-env.d.ts` (or create if missing)

- [ ] **Step 1: Add alias to vite.config.ts**

```ts
// In resolve.alias, add:
'@contracts': path.resolve(__dirname, '../cardsense-contracts'),
```

Full file after edit:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@contracts': path.resolve(__dirname, '../cardsense-contracts'),
    },
  },
})
```

- [ ] **Step 2: Add module declaration for contracts JSON imports**

In `src/vite-env.d.ts`, append:

```ts
declare module '@contracts/taxonomy/*.json' {
  const value: Record<string, unknown>
  export default value
}
```

This lets TypeScript accept the JSON imports without errors. The actual shape will be typed in `taxonomy.ts`.

- [ ] **Step 3: Verify alias works**

Run: `npx vite build --mode development 2>&1 | head -20`

Expected: No alias resolution errors (the build may fail on other things since we haven't changed imports yet — that's fine, just verify no "Cannot find module @contracts" errors).

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts src/vite-env.d.ts
git commit -m "feat: add @contracts Vite alias for taxonomy JSON imports"
```

---

### Task 2: Create `src/lib/taxonomy.ts` — derive SUBCATEGORIES and MERCHANT_SUGGESTIONS

**Files:**
- Create: `src/lib/taxonomy.ts`

This is the core file. It:
1. Imports the two contracts JSONs
2. Maintains a `SUBCATEGORY_LABEL_MAP` (Chinese labels — the only manual part)
3. Derives `SUBCATEGORIES` grouped by category
4. Derives `MERCHANT_SUGGESTIONS` grouped by `CATEGORY:SUBCATEGORY`
5. Derives `SUBCATEGORY_LABELS` flat lookup

- [ ] **Step 1: Create `src/lib/taxonomy.ts`**

```ts
import type { Category } from '@/types/enums'
import rawSubcategoryTaxonomy from '@contracts/taxonomy/subcategory-taxonomy.json'
import rawMerchantRegistry from '@contracts/taxonomy/merchant-registry.json'

// ---------- Types for raw JSON ----------

interface RawSubcategory {
  category: string
  description: string
}

interface RawMerchant {
  code: string
  label: string
  category: string
  subcategory: string
  aliases: string[]
}

const subcategoryTaxonomy = rawSubcategoryTaxonomy as Record<string, RawSubcategory>
const merchantRegistry = rawMerchantRegistry as RawMerchant[]

// ---------- Chinese label map (presentation concern, maintained here) ----------

const SUBCATEGORY_LABEL_MAP: Record<string, string> = {
  // ENTERTAINMENT
  MOVIE: '電影',
  THEME_PARK: '主題樂園',
  SINGING: 'KTV',
  LIVE_EVENT: '展演 / 演唱會',
  STREAMING: '影音串流',
  // DINING
  DELIVERY: '外送',
  RESTAURANT: '餐廳',
  CAFE: '咖啡 / 茶飲',
  HOTEL_DINING: '飯店餐飲',
  // SHOPPING
  DEPARTMENT: '百貨',
  WAREHOUSE: '量販',
  ELECTRONICS: '3C 家電',
  DRUGSTORE: '藥妝',
  SPORTING_GOODS: '運動用品',
  APPAREL: '服飾',
  // ONLINE
  ECOMMERCE: '電商平台',
  SUBSCRIPTION: '訂閱服務',
  AI_TOOL: 'AI 工具',
  MOBILE_PAY: '行動支付',
  INTERNATIONAL_ECOMMERCE: '跨境電商',
  // TRANSPORT
  RIDESHARE: '叫車 / 共享',
  PUBLIC_TRANSIT: '大眾運輸',
  GAS_STATION: '加油',
  AIRLINE: '航空',
  // GROCERY
  SUPERMARKET: '超市量販',
  CONVENIENCE_STORE: '便利商店',
  // OVERSEAS
  OVERSEAS_IN_STORE: '海外實體',
  HOTEL: '旅宿',
  TRAVEL_PLATFORM: '旅遊平台',
  TRAVEL_AGENCY: '旅行社',
  // OTHER
  EV_CHARGING: '充電',
  PARKING: '停車',
  HOME_LIVING: '居家生活',
  CHARITY_DONATION: '公益 / 捐款',
  // fallback
  GENERAL: '一般',
}

// ---------- Derive SUBCATEGORIES from taxonomy ----------

/** Category overrides: some subcategories are reclassified in the frontend for UX reasons. */
const FRONTEND_CATEGORY_OVERRIDES: Record<string, Category> = {
  // TRAVEL_PLATFORM is OVERSEAS in contracts but shown under ONLINE in frontend
  TRAVEL_PLATFORM: 'ONLINE',
  // GAS_STATION is OTHER in contracts but shown under TRANSPORT in frontend
  GAS_STATION: 'TRANSPORT',
}

function deriveSubcategories(): Partial<Record<Category, { value: string; label: string }[]>> {
  const grouped: Record<string, { value: string; label: string }[]> = {}

  for (const [subKey, sub] of Object.entries(subcategoryTaxonomy)) {
    if (subKey === 'GENERAL') continue
    const cat = FRONTEND_CATEGORY_OVERRIDES[subKey] ?? sub.category
    if (!grouped[cat]) grouped[cat] = []
    const label = SUBCATEGORY_LABEL_MAP[subKey] ?? subKey
    grouped[cat].push({ value: subKey, label })
  }

  return grouped as Partial<Record<Category, { value: string; label: string }[]>>
}

export const SUBCATEGORIES = deriveSubcategories()

export const SUBCATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(SUBCATEGORIES).flatMap((subs) => subs?.map((s) => [s.value, s.label]) ?? []),
)

// ---------- Derive MERCHANT_SUGGESTIONS from registry ----------

function deriveMerchantSuggestions(): Record<string, { value: string; label: string }[]> {
  const result: Record<string, { value: string; label: string }[]> = {}

  for (const m of merchantRegistry) {
    const subKey = `${m.category}:${m.subcategory}`
    if (!result[subKey]) result[subKey] = []
    result[subKey].push({ value: m.code, label: m.label })
  }

  // Also build category-level fallbacks (first 3 merchants per category)
  const byCat: Record<string, { value: string; label: string }[]> = {}
  for (const m of merchantRegistry) {
    if (!byCat[m.category]) byCat[m.category] = []
    if (byCat[m.category].length < 3) {
      byCat[m.category].push({ value: m.code, label: m.label })
    }
  }
  for (const [cat, merchants] of Object.entries(byCat)) {
    if (!result[cat]) result[cat] = merchants
  }

  return result
}

export const MERCHANT_SUGGESTIONS = deriveMerchantSuggestions()
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: No errors in `taxonomy.ts`. If there are circular import issues (because `taxonomy.ts` imports `Category` from `enums.ts` which will later re-export from `taxonomy.ts`), we'll fix the type import to be inline in the next step.

- [ ] **Step 3: Commit**

```bash
git add src/lib/taxonomy.ts
git commit -m "feat: add taxonomy.ts — derive SUBCATEGORIES and MERCHANT_SUGGESTIONS from contracts JSON"
```

---

### Task 3: Wire `enums.ts` to use `taxonomy.ts` exports

**Files:**
- Modify: `src/types/enums.ts`

Remove the three hardcoded blocks (`SUBCATEGORIES`, `SUBCATEGORY_LABELS`, `MERCHANT_SUGGESTIONS`) and re-export them from `taxonomy.ts`.

- [ ] **Step 1: Replace hardcoded SUBCATEGORIES block**

In `enums.ts`, delete the entire `export const SUBCATEGORIES: Partial<Record<...>> = { ... }` block (lines 58–106) and the `SUBCATEGORY_LABELS` derivation (lines 108-110). Replace with:

```ts
export { SUBCATEGORIES, SUBCATEGORY_LABELS } from '@/lib/taxonomy'
```

- [ ] **Step 2: Replace hardcoded MERCHANT_SUGGESTIONS block**

Delete the entire `export const MERCHANT_SUGGESTIONS: Record<...> = { ... }` block (lines 175–265). Replace with:

```ts
export { MERCHANT_SUGGESTIONS } from '@/lib/taxonomy'
```

- [ ] **Step 3: Fix circular import if needed**

`taxonomy.ts` imports `Category` from `enums.ts`. If this causes a circular dependency issue (since `enums.ts` now re-exports from `taxonomy.ts`), change the import in `taxonomy.ts` to use `import type` (which it already does) — TypeScript type-only imports don't create runtime circular deps.

If there's still an issue, define `Category` as a string literal union directly in `taxonomy.ts` and remove the import.

- [ ] **Step 4: Verify full build**

Run: `npx tsc --noEmit && npx vite build 2>&1 | tail -10`

Expected: Clean build with no errors.

- [ ] **Step 5: Verify dev server**

Run: `npx vite --host 2>&1 | head -15`

Expected: Dev server starts. Manually check that the recommendation form and calc page show subcategory chips and merchant suggestions.

- [ ] **Step 6: Commit**

```bash
git add src/types/enums.ts src/lib/taxonomy.ts
git commit -m "refactor: replace hardcoded SUBCATEGORIES/MERCHANT_SUGGESTIONS with contracts-derived exports"
```

---

### Task 4: Add missing OVERSEAS subcategories to frontend overrides

**Files:**
- Modify: `src/lib/taxonomy.ts` (if needed)

The contracts taxonomy has `HOTEL` and `TRAVEL_AGENCY` under OVERSEAS, but the old frontend only showed `OVERSEAS_IN_STORE`. Since `taxonomy.ts` now derives from contracts automatically, these should already appear. Verify and adjust if needed.

- [ ] **Step 1: Verify OVERSEAS subcategories are present**

After the build from Task 3, check that `SUBCATEGORIES.OVERSEAS` now includes:
- `OVERSEAS_IN_STORE` (海外實體)
- `HOTEL` (旅宿)
- `TRAVEL_AGENCY` (旅行社)

If `TRAVEL_PLATFORM` should also appear under OVERSEAS (in addition to ONLINE), add a dual-mapping. Currently `FRONTEND_CATEGORY_OVERRIDES` moves it to ONLINE only.

- [ ] **Step 2: Verify labels exist for all new subcategories**

Check that `SUBCATEGORY_LABEL_MAP` in `taxonomy.ts` has entries for `HOTEL` and `TRAVEL_AGENCY`. They're already included in the Step 1 code above:
- `HOTEL: '旅宿'`
- `TRAVEL_AGENCY: '旅行社'`

- [ ] **Step 3: Commit (if any changes)**

```bash
git add src/lib/taxonomy.ts
git commit -m "feat: expose HOTEL and TRAVEL_AGENCY subcategories under OVERSEAS"
```

---

### Task 5: Smoke test — verify all pages render correctly

**Files:** None (testing only)

- [ ] **Step 1: Start dev server**

Run: `npx vite`

- [ ] **Step 2: Test RecommendationForm**

Navigate to the recommendation page. For each category:
1. Select the category
2. Verify subcategory chips appear (including new ones like 便利商店, 餐廳, 百貨)
3. Select a subcategory and verify merchant tag suggestions appear
4. Verify OVERSEAS now shows 海外實體, 旅宿, 旅行社

- [ ] **Step 3: Test CalcPage**

Navigate to the calculation page. For each category:
1. Verify subcategory grid shows all subcategories
2. Select subcategories and verify merchant suggestions appear in the hint text

- [ ] **Step 4: Test CardDetailPage**

Open a card detail page with promotions. Verify subcategory labels render correctly (e.g., `[便利商店優惠]` badge).

- [ ] **Step 5: Final commit if any fix-ups needed**

```bash
git add -A
git commit -m "fix: smoke test fix-ups for dynamic taxonomy"
```

# Merchant Search Category Facet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `/calc` from merchant-intent free text into a registry-backed merchant search flow where category is an assistive facet and no-match fallback.

**Architecture:** Add pure merchant-search helpers and a dedicated `MerchantSearchPicker` for `/calc`. `CalcPage` owns only selected merchant/category/payment/amount orchestration, and `buildCalcRecommendationRequest` sends either a canonical selected merchant with registry metadata or an explicit category fallback.

**Tech Stack:** React 19, TypeScript, Vite JSON imports, Tailwind CSS, lucide-react, Vitest, CardSense recommendation API.

---

## Source Inputs

- Design spec: `d:/Projects/cardsense-workspace/fleet-command/specs/2026-05-07-merchant-search-category-facet-design.md`
- Superseded plan: `docs/superpowers/plans/2026-05-06-merchant-first-calculator-flow.md`
- Primary surface: `src/pages/CalcPage.tsx`
- Registry source: `../../cardsense-contracts/taxonomy/merchant-registry.json` through the existing `@contracts` Vite alias
- Existing taxonomy derivation: `src/lib/taxonomy.ts`

## File Structure

- Create `src/pages/calc/merchant-search.ts`: pure types/helpers for registry options, search filtering, category facets, and selected merchant metadata.
- Create `src/pages/calc/merchant-search.test.ts`: focused unit tests for search, facet filtering, selected metadata, and no-match fallback options.
- Create `src/pages/calc/MerchantSearchPicker.tsx`: UI for merchant search, featured merchants, category facets, selected state, no-match fallback, and validation copy.
- Modify `src/pages/calc/buildCalcRecommendationRequest.ts`: remove `merchantIntent`, accept registry-backed merchant/fallback semantics, and keep payload construction centralized.
- Modify `src/pages/calc/buildCalcRecommendationRequest.test.ts`: replace general-intent tests with selected merchant and category fallback tests.
- Modify `src/pages/CalcPage.tsx`: remove `merchantIntent`, free-text merchant input, primary category editor, and general-purchase segmented control; wire in `MerchantSearchPicker`.
- Modify `src/pages/calc/ResultPanel.tsx`: clarify selected merchant vs category fallback result copy.
- Modify `src/pages/calc/submit-cta-layout.test.ts`: keep sticky CTA regression test aligned if text/query expectations change.
- Modify `docs/superpowers/plans/2026-05-07-merchant-search-category-facet.md`: check off tasks as they complete.

## Data Flow

```text
MerchantSearchPicker
  -> selectedMerchant OR explicit fallback category
  -> paymentMethod + amount + selectedCards
  -> buildCalcRecommendationRequest()
  -> RecommendationRequest
  -> useRecommendation()
  -> ResultPanel
```

Facet state is search-only. It must not become request category unless the user explicitly chooses category fallback after no merchant match.

---

### Task 1: Merchant Search Pure Helpers

**Files:**
- Create: `src/pages/calc/merchant-search.ts`
- Create: `src/pages/calc/merchant-search.test.ts`

- [x] **Step 1: Write failing helper tests**

Create `src/pages/calc/merchant-search.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  CATEGORY_FACETS,
  FEATURED_MERCHANT_CODES,
  buildMerchantSearchOptions,
  filterMerchantSearchOptions,
  getFeaturedMerchantOptions,
  getNoMatchFallbackCategories,
} from './merchant-search'

describe('merchant search helpers', () => {
  const options = buildMerchantSearchOptions()

  it('keeps featured merchants registry-backed and ordered', () => {
    expect(getFeaturedMerchantOptions(options).map((merchant) => merchant.value)).toEqual(
      FEATURED_MERCHANT_CODES,
    )
  })

  it('searches by label, code, and aliases', () => {
    expect(filterMerchantSearchOptions({ options, query: '星巴克', categoryFacet: null })[0]).toMatchObject({
      value: 'STARBUCKS',
      category: 'DINING',
      subcategory: 'CAFE',
    })

    expect(filterMerchantSearchOptions({ options, query: 'uber', categoryFacet: null })[0]).toMatchObject({
      value: 'UBER_EATS',
    })
  })

  it('uses category facet only to narrow results', () => {
    const dining = filterMerchantSearchOptions({ options, query: '', categoryFacet: 'DINING' })
    expect(dining.length).toBeGreaterThan(0)
    expect(dining.every((merchant) => merchant.category === 'DINING')).toBe(true)
    expect(CATEGORY_FACETS.map((facet) => facet.value)).toContain('DINING')
  })

  it('returns explicit fallback categories for no-match search', () => {
    expect(getNoMatchFallbackCategories().map((category) => category.value)).toEqual([
      'DINING',
      'ONLINE',
      'TRAVEL',
      'GROCERY',
    ])
  })
})
```

- [x] **Step 2: Run helper tests and verify they fail**

Run:

```bash
npm run test:unit -- src/pages/calc/merchant-search.test.ts
```

Expected: FAIL because `merchant-search.ts` does not exist.

- [x] **Step 3: Create merchant search helper module**

Create `src/pages/calc/merchant-search.ts`:

```ts
import rawMerchantRegistry from '@contracts/taxonomy/merchant-registry.json'
import { CATEGORY_LABELS, type Category } from '@/types'

interface RawMerchant {
  code: string
  label: string
  category: Category
  subcategory: string
  aliases?: string[]
}

export interface MerchantSearchOption {
  value: string
  label: string
  category: Category
  subcategory: string
  aliases: string[]
}

export const FEATURED_MERCHANT_CODES = [
  'PXMART',
  'CARREFOUR',
  'MOMO',
  'SHOPEE',
  'AGODA',
  'STARBUCKS',
  'UBER_EATS',
  'MCDONALD',
] as const

export const CATEGORY_FACETS: { value: Category | null; label: string }[] = [
  { value: null, label: '全部' },
  { value: 'DINING', label: CATEGORY_LABELS.DINING },
  { value: 'ONLINE', label: CATEGORY_LABELS.ONLINE },
  { value: 'GROCERY', label: CATEGORY_LABELS.GROCERY },
  { value: 'TRAVEL', label: CATEGORY_LABELS.TRAVEL },
  { value: 'TRANSPORT', label: CATEGORY_LABELS.TRANSPORT },
  { value: 'SHOPPING', label: CATEGORY_LABELS.SHOPPING },
  { value: 'ENTERTAINMENT', label: CATEGORY_LABELS.ENTERTAINMENT },
  { value: 'OVERSEAS', label: CATEGORY_LABELS.OVERSEAS },
]

export function buildMerchantSearchOptions(): MerchantSearchOption[] {
  return (rawMerchantRegistry as RawMerchant[]).map((merchant) => ({
    value: merchant.code,
    label: merchant.label,
    category: merchant.category,
    subcategory: merchant.subcategory,
    aliases: merchant.aliases ?? [],
  }))
}

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase()
}

function matchesQuery(merchant: MerchantSearchOption, query: string) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true
  return [merchant.value, merchant.label, ...merchant.aliases].some((candidate) =>
    normalizeSearchText(candidate).includes(normalizedQuery),
  )
}

export function filterMerchantSearchOptions({
  options,
  query,
  categoryFacet,
}: {
  options: MerchantSearchOption[]
  query: string
  categoryFacet: Category | null
}) {
  return options
    .filter((merchant) => !categoryFacet || merchant.category === categoryFacet)
    .filter((merchant) => matchesQuery(merchant, query))
}

export function getFeaturedMerchantOptions(options: MerchantSearchOption[]) {
  const byCode = new Map(options.map((merchant) => [merchant.value, merchant]))
  return FEATURED_MERCHANT_CODES.map((code) => byCode.get(code)).filter(
    (merchant): merchant is MerchantSearchOption => merchant !== undefined,
  )
}

export function getNoMatchFallbackCategories() {
  return [
    { value: 'DINING' as const, label: CATEGORY_LABELS.DINING },
    { value: 'ONLINE' as const, label: CATEGORY_LABELS.ONLINE },
    { value: 'TRAVEL' as const, label: CATEGORY_LABELS.TRAVEL },
    { value: 'GROCERY' as const, label: CATEGORY_LABELS.GROCERY },
  ]
}
```

- [x] **Step 4: Run helper tests and verify they pass**

Run:

```bash
npm run test:unit -- src/pages/calc/merchant-search.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add src/pages/calc/merchant-search.ts src/pages/calc/merchant-search.test.ts
git commit -m "[agent] feat: add calculator merchant search helpers"
```

---

### Task 2: Request Builder Semantics

**Files:**
- Modify: `src/pages/calc/buildCalcRecommendationRequest.ts`
- Modify: `src/pages/calc/buildCalcRecommendationRequest.test.ts`

- [x] **Step 1: Replace request-builder tests**

Replace the merchant/general-intent tests in `src/pages/calc/buildCalcRecommendationRequest.test.ts` so the suite covers:

```ts
it('builds selected merchant requests with registry metadata', () => {
  expect(
    buildCalcRecommendationRequest({
      ...baseInput,
      category: 'DINING',
      subcategory: 'CAFE',
      merchantName: 'STARBUCKS',
      cardCodes: ['CARD_A', 'CARD_B'],
      comparison: { includePromotionBreakdown: false, maxResults: 10 },
      customExchangeRates: {},
    }),
  ).toMatchObject({
    amount: 1200,
    category: 'DINING',
    subcategory: 'CAFE',
    scenario: {
      merchantName: 'STARBUCKS',
      paymentMethod: 'APPLE_PAY',
    },
  })
})

it('builds explicit category fallback requests without merchant', () => {
  expect(
    buildCalcRecommendationRequest({
      ...baseInput,
      category: 'DINING',
      subcategory: null,
      merchantName: null,
      cardCodes: ['CARD_A', 'CARD_B'],
      comparison: { includePromotionBreakdown: false, maxResults: 10 },
      customExchangeRates: {},
    }),
  ).toMatchObject({
    amount: 1200,
    category: 'DINING',
    scenario: {
      paymentMethod: 'APPLE_PAY',
    },
  })
})
```

- [x] **Step 2: Run request-builder tests and verify they fail**

Run:

```bash
npm run test:unit -- src/pages/calc/buildCalcRecommendationRequest.test.ts
```

Expected: FAIL because `merchantName` does not accept `null` and `merchantIntent` still exists.

- [x] **Step 3: Update request-builder input and payload construction**

In `src/pages/calc/buildCalcRecommendationRequest.ts`, remove `merchantIntent` from `BuildCalcRecommendationRequestInput`, change `merchantName` to `string | null`, and build scenario with only the trimmed merchant:

```ts
interface BuildCalcRecommendationRequestInput {
  amount: number
  category: Category | null
  subcategory?: string | null
  merchantName: string | null
  paymentMethod: string | null
  activePlansByCard: Record<string, string>
  planRuntimeByCard: Record<string, Record<string, string>>
  benefitPlanTiers: Record<string, string>
  cardCodes: string[]
  comparison: NonNullable<RecommendationRequest['comparison']>
  customExchangeRates: Record<string, number>
}
```

Use:

```ts
const trimmedMerchantName = merchantName?.trim() ?? ''
const scenario: NonNullable<RecommendationRequest['scenario']> = {
  ...(trimmedMerchantName && { merchantName: trimmedMerchantName.toUpperCase() }),
  ...(paymentMethod && { paymentMethod }),
}
```

- [x] **Step 4: Run request-builder tests and verify they pass**

Run:

```bash
npm run test:unit -- src/pages/calc/buildCalcRecommendationRequest.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add src/pages/calc/buildCalcRecommendationRequest.ts src/pages/calc/buildCalcRecommendationRequest.test.ts
git commit -m "[agent] refactor: model merchant search request semantics"
```

---

### Task 3: Merchant Search Picker UI

**Files:**
- Create: `src/pages/calc/MerchantSearchPicker.tsx`

- [ ] **Step 1: Create picker component**

Create `src/pages/calc/MerchantSearchPicker.tsx` with props for `selectedMerchant`, `fallbackCategory`, `onMerchantSelect`, `onMerchantClear`, and `onFallbackCategorySelect`. The component should:

- Render search input.
- Render category facet chips.
- Render featured merchants when search is empty.
- Render filtered results when search/facet is active.
- Render selected merchant metadata.
- Render fallback buttons when a non-empty search has no matches.
- Render validation error text passed from `CalcPage`.

- [ ] **Step 2: Run TypeScript build and expect failure until wired later**

Run:

```bash
npm run build
```

Expected: PASS if the component is self-contained, or FAIL only if imports/types are mistyped. Fix any local component type errors in this task.

- [ ] **Step 3: Commit Task 3**

Run:

```bash
git add src/pages/calc/MerchantSearchPicker.tsx
git commit -m "[agent] feat: add calculator merchant search picker"
```

---

### Task 4: Wire Picker Into CalcPage

**Files:**
- Modify: `src/pages/CalcPage.tsx`
- Delete if unused: `src/pages/calc/merchant-intent.ts`
- Delete if unused: `src/pages/calc/merchant-intent.test.ts`

- [ ] **Step 1: Replace merchant intent state**

Remove `merchantIntent`, free-text `merchantName`, `PRIMARY_MERCHANT_SHORTCUTS`, `MERCHANT_SHORTCUT_SCENES`, `handleMerchantShortcutClick`, and `getEffectiveMerchantName` usage.

Add:

```ts
import { MerchantSearchPicker } from './calc/MerchantSearchPicker'
import type { MerchantSearchOption } from './calc/merchant-search'

const [selectedMerchant, setSelectedMerchant] = useState<MerchantSearchOption | null>(null)
const [merchantFallbackCategory, setMerchantFallbackCategory] = useState<Category | null>(null)
const [merchantSearchError, setMerchantSearchError] = useState<string | undefined>()
```

- [ ] **Step 2: Add selection handlers**

Add:

```ts
function handleMerchantSelect(merchant: MerchantSearchOption) {
  setSelectedMerchant(merchant)
  setMerchantFallbackCategory(null)
  setCategory(merchant.category)
  setSubcategory(merchant.subcategory)
  setMerchantSearchError(undefined)
}

function handleMerchantClear() {
  setSelectedMerchant(null)
  setCategory(null)
  setSubcategory(null)
}

function handleFallbackCategorySelect(nextCategory: Category) {
  setSelectedMerchant(null)
  setMerchantFallbackCategory(nextCategory)
  setCategory(nextCategory)
  setSubcategory(null)
  setMerchantSearchError(undefined)
}
```

- [ ] **Step 3: Replace merchant JSX**

Replace the merchant intent segmented-control block and free-text block with:

```tsx
<MerchantSearchPicker
  selectedMerchant={selectedMerchant}
  fallbackCategory={merchantFallbackCategory}
  error={merchantSearchError}
  onMerchantSelect={handleMerchantSelect}
  onMerchantClear={handleMerchantClear}
  onFallbackCategorySelect={handleFallbackCategorySelect}
/>
```

- [ ] **Step 4: Remove primary advanced category editor**

Remove the `Advanced category` block that contains `CategoryGrid` and `SubcategoryGrid`. Keep exchange rates and switching card settings in advanced settings.

- [ ] **Step 5: Update auto-select and submit request calls**

Pass:

```ts
merchantName: selectedMerchant?.value ?? null,
category,
subcategory,
```

Do not pass `merchantIntent`.

- [ ] **Step 6: Update submit validation**

Before `getRecommendation`, add:

```ts
if (!selectedMerchant && !merchantFallbackCategory) {
  setMerchantSearchError('請先選擇支援商家，或在搜尋不到時改用消費類別比較。')
  return
}
```

- [ ] **Step 7: Run build and focused tests**

Run:

```bash
npm run test:unit -- src/pages/calc/buildCalcRecommendationRequest.test.ts src/pages/calc/merchant-search.test.ts src/pages/calc/submit-cta-layout.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit Task 4**

Run:

```bash
git add src/pages/CalcPage.tsx src/pages/calc/merchant-intent.ts src/pages/calc/merchant-intent.test.ts
git commit -m "[agent] feat: wire calculator to merchant search flow"
```

If the merchant-intent files were deleted, `git add -A src/pages/calc/merchant-intent.ts src/pages/calc/merchant-intent.test.ts` instead of `git add` may be required.

---

### Task 5: Result and Empty-State Copy

**Files:**
- Modify: `src/pages/calc/ResultPanel.tsx`
- Modify: `src/pages/CalcPage.tsx`

- [ ] **Step 1: Add result locator copy**

In `ResultPanel`, change the scenario sentence so null category says `未指定場景`, selected category says `以 {categoryLabel} 場景`, and no longer implies category was the primary user input.

- [ ] **Step 2: Update no-result recovery copy**

In `CalcPage`, update the no-result message to:

```tsx
<p>
  Try selecting another supported merchant, changing payment method, using category fallback, or selecting different cards.
</p>
```

- [ ] **Step 3: Run focused tests and build**

Run:

```bash
npm run test:unit -- src/pages/calc/buildCalcRecommendationRequest.test.ts src/pages/calc/merchant-search.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit Task 5**

Run:

```bash
git add src/pages/calc/ResultPanel.tsx src/pages/CalcPage.tsx
git commit -m "[agent] fix: clarify merchant search result messaging"
```

---

### Task 6: Full Verification and Browser Smoke

**Files:**
- Modify: `docs/superpowers/plans/2026-05-07-merchant-search-category-facet.md`
- Create evidence under: `../fleet-command/reviews/2026-05-07-merchant-search-category-facet/`

- [ ] **Step 1: Run full unit tests**

Run:

```bash
npm run test:unit
```

Expected: PASS.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Start local dev server**

Run:

```powershell
$env:VITE_API_BASE_URL='https://cardsense-api-production.up.railway.app'; npm run dev -- --host 127.0.0.1
```

Expected: Vite serves on `http://127.0.0.1:5173` or the next available port.

- [ ] **Step 4: Mobile selected-merchant smoke**

Open `http://127.0.0.1:5173/calc`, set viewport `375x812`, select a featured merchant such as `momo`, select `LINE Pay`, run compare, and save:

```text
../fleet-command/reviews/2026-05-07-merchant-search-category-facet/mobile-merchant.png
```

Expected: merchant search appears first, selected merchant metadata is visible, no blocking console errors.

- [ ] **Step 5: Mobile no-match fallback smoke**

Search for an unsupported merchant string, choose `改用餐飲比較`, run compare, and save:

```text
../fleet-command/reviews/2026-05-07-merchant-search-category-facet/mobile-fallback.png
```

Expected: fallback copy is visible and the request does not imply merchant-specific matching.

- [ ] **Step 6: Desktop facet smoke**

Set viewport `1440x900`, use a category facet such as `餐飲`, verify results narrow to dining merchants, select a merchant, and save:

```text
../fleet-command/reviews/2026-05-07-merchant-search-category-facet/desktop-facet.png
```

Expected: no overlap, selected merchant shows system-located category/subcategory.

- [ ] **Step 7: Stop dev server**

Stop the Vite process started in Step 3.

- [ ] **Step 8: Commit verification evidence**

From `fleet-command`, run:

```bash
git add reviews/2026-05-07-merchant-search-category-facet
git commit -m "[agent] test: add merchant search calculator smoke evidence"
```

---

## Plan Self-Review

- Spec coverage: merchant search, category facets, selected metadata, no-match fallback, request semantics, validation, tests, and browser smoke each map to at least one task.
- Placeholder scan: no TBD/TODO markers remain.
- Type consistency: `MerchantSearchOption.value` is the canonical merchant code used as `scenario.merchantName`; `category` and `subcategory` remain request fields derived from selected merchant or explicit fallback.
- Scope check: contracts schema migration for `visibility` and `sources` is intentionally excluded from this implementation pass.

# Merchant-First Calculator Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `/calc` so the first calculator inputs are merchant intent, payment method, and amount, with category/subcategory optional in advanced details.

**Architecture:** Introduce explicit calculator intent state in `CalcPage` and pass that intent into `buildCalcRecommendationRequest` so omitted merchant/category fields are modeled honestly. Keep existing calculator components and API hook boundaries; only adjust the `/calc` surface, request builder, focused unit tests, and browser smoke evidence.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Vitest, CardSense recommendation API, gstack/browser with installed Chrome.

---

## Source Inputs

- Design spec: `d:/Projects/cardsense-workspace/fleet-command/specs/2026-05-06-merchant-first-calculator-flow-design.md`
- Primary frontend surface: `cardsense-web/src/pages/CalcPage.tsx`
- Request builder: `cardsense-web/src/pages/calc/buildCalcRecommendationRequest.ts`
- Current tests: `cardsense-web/src/pages/calc/buildCalcRecommendationRequest.test.ts`, `cardsense-web/src/pages/calc/submit-cta-layout.test.ts`
- Verification skill: `fleet-command/skills/cardsense-dev-checks/SKILL.md`

## File Structure

- Modify `src/pages/calc/buildCalcRecommendationRequest.ts`: add merchant intent and optional category input semantics.
- Modify `src/pages/calc/buildCalcRecommendationRequest.test.ts`: lock request payload behavior before UI changes.
- Modify `src/pages/calc/CategoryGrid.tsx`: allow `null` selection and provide a clear category control.
- Modify `src/pages/CalcPage.tsx`: reorder the calculator, add merchant intent controls, move category/subcategory into advanced details, and pass request intent into the builder.
- Create `src/pages/calc/merchant-intent.ts`: focused pure helpers and types for merchant/general request behavior.
- Create `src/pages/calc/merchant-intent.test.ts`: pure validation tests for escape-hatch semantics and inferred scenes.
- Modify `docs/superpowers/plans/2026-05-06-merchant-first-calculator-flow.md`: check off tasks as they complete.

## Data Flow

```text
User controls
  -> merchantIntent + merchantName + inferred/selected category + paymentMethod + amount
  -> buildCalcRecommendationRequest()
  -> RecommendationRequest
  -> useRecommendation()
  -> ResultPanel / empty state
```

`merchantIntent === 'general'` means merchant input is ignored in the request. `merchantIntent === 'merchant'` means trimmed merchant text becomes `scenario.merchantName` when present. Category is optional and only included when selected or inferred.

---

### Task 1: Request Builder Semantics

**Files:**
- Modify: `src/pages/calc/buildCalcRecommendationRequest.ts`
- Modify: `src/pages/calc/buildCalcRecommendationRequest.test.ts`

- [x] **Step 1: Write failing request-builder tests**

Replace `src/pages/calc/buildCalcRecommendationRequest.test.ts` with this expanded suite:

```ts
import { describe, expect, it } from 'vitest'
import type { RecommendationRequest } from '@/types'
import { buildCalcRecommendationRequest } from './buildCalcRecommendationRequest'

const baseInput = {
  amount: 1200,
  category: 'DINING' as const,
  subcategory: 'BUFFET',
  merchantName: 'Agoda',
  merchantIntent: 'merchant' as const,
  paymentMethod: 'APPLE_PAY',
  activePlansByCard: { CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL' },
  planRuntimeByCard: { CATHAY_CUBE: { tier: 'LEVEL_1' } },
  benefitPlanTiers: { CATHAY_CUBE: 'LEVEL_1' },
}

describe('buildCalcRecommendationRequest', () => {
  it('omits customExchangeRates when no overrides are active', () => {
    expect(
      buildCalcRecommendationRequest({
        ...baseInput,
        cardCodes: ['CARD_A', 'CARD_B'],
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 6,
        },
        customExchangeRates: {},
      }),
    ).toEqual<RecommendationRequest>({
      amount: 1200,
      category: 'DINING',
      subcategory: 'BUFFET',
      scenario: {
        merchantName: 'AGODA',
        paymentMethod: 'APPLE_PAY',
      },
      activePlansByCard: { CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL' },
      planRuntimeByCard: { CATHAY_CUBE: { tier: 'LEVEL_1' } },
      benefitPlanTiers: { CATHAY_CUBE: 'LEVEL_1' },
      cardCodes: ['CARD_A', 'CARD_B'],
      comparison: {
        includePromotionBreakdown: false,
        maxResults: 6,
      },
    })
  })

  it('includes customExchangeRates when overrides are active', () => {
    expect(
      buildCalcRecommendationRequest({
        ...baseInput,
        cardCodes: ['CARD_A', 'CARD_B'],
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 10,
        },
        customExchangeRates: {
          'POINTS.ESUN': 0.8,
          'MILES._DEFAULT': 0.6,
        },
      }),
    ).toEqual<RecommendationRequest>({
      amount: 1200,
      category: 'DINING',
      subcategory: 'BUFFET',
      scenario: {
        merchantName: 'AGODA',
        paymentMethod: 'APPLE_PAY',
      },
      activePlansByCard: { CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL' },
      planRuntimeByCard: { CATHAY_CUBE: { tier: 'LEVEL_1' } },
      benefitPlanTiers: { CATHAY_CUBE: 'LEVEL_1' },
      cardCodes: ['CARD_A', 'CARD_B'],
      comparison: {
        includePromotionBreakdown: false,
        maxResults: 10,
      },
      customExchangeRates: {
        'POINTS.ESUN': 0.8,
        'MILES._DEFAULT': 0.6,
      },
    })
  })

  it('allows merchant and payment without category', () => {
    expect(
      buildCalcRecommendationRequest({
        ...baseInput,
        category: null,
        subcategory: null,
        merchantName: 'pxmart',
        paymentMethod: 'LINE_PAY',
        cardCodes: ['CARD_A', 'CARD_B'],
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 10,
        },
        customExchangeRates: {},
      }),
    ).toEqual<RecommendationRequest>({
      amount: 1200,
      scenario: {
        merchantName: 'PXMART',
        paymentMethod: 'LINE_PAY',
      },
      activePlansByCard: { CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL' },
      planRuntimeByCard: { CATHAY_CUBE: { tier: 'LEVEL_1' } },
      benefitPlanTiers: { CATHAY_CUBE: 'LEVEL_1' },
      cardCodes: ['CARD_A', 'CARD_B'],
      comparison: {
        includePromotionBreakdown: false,
        maxResults: 10,
      },
    })
  })

  it('omits merchant when general intent is active', () => {
    expect(
      buildCalcRecommendationRequest({
        ...baseInput,
        merchantIntent: 'general',
        category: null,
        subcategory: null,
        merchantName: 'SHOPEE',
        paymentMethod: 'LINE_PAY',
        cardCodes: ['CARD_A', 'CARD_B'],
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 10,
        },
        customExchangeRates: {},
      }),
    ).toEqual<RecommendationRequest>({
      amount: 1200,
      scenario: {
        paymentMethod: 'LINE_PAY',
      },
      activePlansByCard: { CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL' },
      planRuntimeByCard: { CATHAY_CUBE: { tier: 'LEVEL_1' } },
      benefitPlanTiers: { CATHAY_CUBE: 'LEVEL_1' },
      cardCodes: ['CARD_A', 'CARD_B'],
      comparison: {
        includePromotionBreakdown: false,
        maxResults: 10,
      },
    })
  })

  it('omits subcategory when category is cleared', () => {
    expect(
      buildCalcRecommendationRequest({
        ...baseInput,
        category: null,
        subcategory: 'BUFFET',
        merchantName: '',
        paymentMethod: null,
        cardCodes: ['CARD_A', 'CARD_B'],
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 10,
        },
        customExchangeRates: {},
      }),
    ).toEqual<RecommendationRequest>({
      amount: 1200,
      activePlansByCard: { CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL' },
      planRuntimeByCard: { CATHAY_CUBE: { tier: 'LEVEL_1' } },
      benefitPlanTiers: { CATHAY_CUBE: 'LEVEL_1' },
      cardCodes: ['CARD_A', 'CARD_B'],
      comparison: {
        includePromotionBreakdown: false,
        maxResults: 10,
      },
    })
  })
})
```

- [x] **Step 2: Run request-builder tests and verify they fail**

Run:

```bash
npm run test:unit -- src/pages/calc/buildCalcRecommendationRequest.test.ts
```

Expected: FAIL because `merchantIntent` is not accepted and `category` cannot be `null`.

- [x] **Step 3: Update request-builder types and payload construction**

Edit `src/pages/calc/buildCalcRecommendationRequest.ts` to match this implementation:

```ts
import type { Category, RecommendationRequest } from '@/types'

interface BuildCalcRecommendationRequestInput {
  amount: number
  category: Category | null
  subcategory?: string | null
  merchantName: string
  merchantIntent: 'merchant' | 'general'
  paymentMethod: string | null
  activePlansByCard: Record<string, string>
  planRuntimeByCard: Record<string, Record<string, string>>
  benefitPlanTiers: Record<string, string>
  cardCodes: string[]
  comparison: NonNullable<RecommendationRequest['comparison']>
  customExchangeRates: Record<string, number>
}

function hasPlanRuntimeValues(planRuntimeByCard: Record<string, Record<string, string>>) {
  return Object.values(planRuntimeByCard).some((runtime) => Object.keys(runtime).length > 0)
}

export function buildCalcRecommendationRequest({
  amount,
  category,
  subcategory,
  merchantName,
  merchantIntent,
  paymentMethod,
  activePlansByCard,
  planRuntimeByCard,
  benefitPlanTiers,
  cardCodes,
  comparison,
  customExchangeRates,
}: BuildCalcRecommendationRequestInput): RecommendationRequest {
  const trimmedMerchantName = merchantName.trim()
  const scenario = {
    ...(merchantIntent === 'merchant' &&
      trimmedMerchantName && { merchantName: trimmedMerchantName.toUpperCase() }),
    ...(paymentMethod && { paymentMethod }),
  }

  return {
    amount,
    ...(category && { category }),
    ...(category && subcategory && { subcategory }),
    ...(Object.keys(scenario).length > 0 && { scenario }),
    ...(Object.keys(activePlansByCard).length > 0 && { activePlansByCard }),
    ...(hasPlanRuntimeValues(planRuntimeByCard) && { planRuntimeByCard }),
    ...(Object.keys(benefitPlanTiers).length > 0 && { benefitPlanTiers }),
    cardCodes,
    ...(Object.keys(customExchangeRates).length > 0 && { customExchangeRates }),
    comparison,
  }
}
```

- [x] **Step 4: Run request-builder tests and verify they pass**

Run:

```bash
npm run test:unit -- src/pages/calc/buildCalcRecommendationRequest.test.ts
```

Expected: PASS.

- [x] **Step 5: Commit Task 1**

Run:

```bash
git add src/pages/calc/buildCalcRecommendationRequest.ts src/pages/calc/buildCalcRecommendationRequest.test.ts
git commit -m "[agent] test: lock merchant-first request semantics"
```

---

### Task 2: Merchant Intent Pure Helpers

**Files:**
- Create: `src/pages/calc/merchant-intent.ts`
- Create: `src/pages/calc/merchant-intent.test.ts`
- Modify: `src/pages/CalcPage.tsx`

- [x] **Step 1: Write helper tests**

Create `src/pages/calc/merchant-intent.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  getEffectiveMerchantName,
  getNextCategoryState,
  type MerchantIntent,
} from './merchant-intent'

describe('merchant intent helpers', () => {
  it('uses merchant name only for merchant intent', () => {
    expect(getEffectiveMerchantName('merchant', ' pxmart ')).toBe('pxmart')
    expect(getEffectiveMerchantName('general', 'pxmart')).toBe('')
  })

  it('keeps inferred scene when shortcut supplies one', () => {
    expect(
      getNextCategoryState({
        currentCategory: null,
        currentSubcategory: null,
        nextCategory: 'GROCERY',
        nextSubcategory: 'SUPERMARKET',
      }),
    ).toEqual({
      category: 'GROCERY',
      subcategory: 'SUPERMARKET',
    })
  })

  it('clears stale subcategory when category is cleared', () => {
    expect(
      getNextCategoryState({
        currentCategory: 'DINING',
        currentSubcategory: 'BUFFET',
        nextCategory: null,
        nextSubcategory: 'BUFFET',
      }),
    ).toEqual({
      category: null,
      subcategory: null,
    })
  })

  it('clears stale subcategory when category changes without an explicit subcategory', () => {
    expect(
      getNextCategoryState({
        currentCategory: 'DINING',
        currentSubcategory: 'BUFFET',
        nextCategory: 'ONLINE',
        nextSubcategory: undefined,
      }),
    ).toEqual({
      category: 'ONLINE',
      subcategory: null,
    })
  })

  it('exports the intent type used by CalcPage', () => {
    const intent: MerchantIntent = 'general'
    expect(intent).toBe('general')
  })
})
```

- [x] **Step 2: Run helper tests and verify they fail**

Run:

```bash
npm run test:unit -- src/pages/calc/merchant-intent.test.ts
```

Expected: FAIL because `merchant-intent.ts` does not exist.

- [x] **Step 3: Create merchant intent helper module**

Create `src/pages/calc/merchant-intent.ts`:

```ts
import type { Category } from '@/types'

export type MerchantIntent = 'merchant' | 'general'

interface CategoryStateInput {
  currentCategory: Category | null
  currentSubcategory: string | null
  nextCategory: Category | null
  nextSubcategory?: string | null
}

export function getEffectiveMerchantName(intent: MerchantIntent, merchantName: string) {
  if (intent === 'general') return ''
  return merchantName.trim()
}

export function getNextCategoryState({
  currentCategory,
  currentSubcategory,
  nextCategory,
  nextSubcategory,
}: CategoryStateInput): { category: Category | null; subcategory: string | null } {
  if (!nextCategory) {
    return { category: null, subcategory: null }
  }

  if (nextSubcategory !== undefined) {
    return { category: nextCategory, subcategory: nextSubcategory }
  }

  if (currentCategory === nextCategory) {
    return { category: nextCategory, subcategory: currentSubcategory }
  }

  return { category: nextCategory, subcategory: null }
}
```

- [x] **Step 4: Run helper tests and existing request tests**

Run:

```bash
npm run test:unit -- src/pages/calc/merchant-intent.test.ts src/pages/calc/buildCalcRecommendationRequest.test.ts
```

Expected: PASS.

- [x] **Step 5: Commit Task 2**

Run:

```bash
git add src/pages/calc/merchant-intent.ts src/pages/calc/merchant-intent.test.ts
git commit -m "[agent] feat: add merchant intent helpers"
```

---

### Task 3: Optional Category Controls

**Files:**
- Modify: `src/pages/calc/CategoryGrid.tsx`
- Modify: `src/pages/CalcPage.tsx`

- [x] **Step 1: Update `CategoryGrid` to accept `null`**

Edit `src/pages/calc/CategoryGrid.tsx`:

```ts
import { Bus, Globe, Luggage, Package, Popcorn, ShoppingBag, ShoppingCart, Store, Utensils, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

const CALC_CATEGORIES: { value: Category; label: string; icon: LucideIcon }[] = [
  { value: 'DINING', label: '餐飲', icon: Utensils },
  { value: 'ONLINE', label: '線上', icon: ShoppingCart },
  { value: 'GROCERY', label: '生活採買', icon: Store },
  { value: 'TRANSPORT', label: '交通', icon: Bus },
  { value: 'TRAVEL', label: '旅遊', icon: Luggage },
  { value: 'OVERSEAS', label: '海外', icon: Globe },
  { value: 'SHOPPING', label: '購物', icon: ShoppingBag },
  { value: 'ENTERTAINMENT', label: '娛樂', icon: Popcorn },
  { value: 'OTHER', label: '其他', icon: Package },
]

interface CategoryGridProps {
  value: Category | null
  onChange: (value: Category | null) => void
}

export function CategoryGrid({ value, onChange }: CategoryGridProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium">消費類別</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {CALC_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onChange(cat.value)}
              className={cn(
                'flex min-h-touch cursor-pointer flex-col items-center gap-1 rounded-lg border p-2 text-xs font-medium transition-colors',
                value === cat.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:border-primary/50 hover:bg-accent',
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="mt-0.5 leading-none">{cat.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [x] **Step 2: Update CalcPage category state type**

In `src/pages/CalcPage.tsx`, change:

```ts
const DEFAULT_CATEGORY: Category = 'DINING'
```

to:

```ts
const DEFAULT_CATEGORY: Category | null = null
```

Then change:

```ts
const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY)
```

to:

```ts
const [category, setCategory] = useState<Category | null>(DEFAULT_CATEGORY)
```

- [x] **Step 3: Guard `SubcategoryGrid` rendering**

Replace direct `SubcategoryGrid` rendering in the left/main form with:

```tsx
{category && (
  <SubcategoryGrid
    category={category}
    value={subcategory}
    onChange={(value) => {
      setSubcategory(value)
    }}
  />
)}
```

If Task 4 moves this section into advanced details, apply this guard there instead.

- [x] **Step 4: Run TypeScript build**

Run:

```bash
npm run build
```

Expected: PASS after all `CategoryGrid`, `SubcategoryGrid`, `buildCalcRecommendationRequest`, and `ResultPanel` call sites accept `Category | null`. If TypeScript reports `Type 'Category | null' is not assignable to type 'Category'`, update that named call site in the same step by adding a `category && (...)` guard or changing the prop type to `Category | null`.

- [x] **Step 5: Commit Task 3**

Run:

```bash
git add src/pages/calc/CategoryGrid.tsx src/pages/CalcPage.tsx
git commit -m "[agent] feat: make calculator category optional"
```

---

### Task 4: Merchant-First CalcPage UX

**Files:**
- Modify: `src/pages/CalcPage.tsx`
- Modify: `src/pages/calc/submit-cta-layout.test.ts`

- [x] **Step 1: Add merchant intent state**

In `src/pages/CalcPage.tsx`, add this import near the other local calc imports:

```ts
import {
  getEffectiveMerchantName,
  getNextCategoryState,
  type MerchantIntent,
} from './calc/merchant-intent'
```

Then add this state next to `merchantName`:

```ts
const [merchantIntent, setMerchantIntent] = useState<MerchantIntent>('merchant')
```

Add a helper near `handleMerchantShortcutClick`:

```ts
function handleCategoryChange(nextCategory: Category | null) {
  const next = getNextCategoryState({
    currentCategory: category,
    currentSubcategory: subcategory,
    nextCategory,
  })
  setCategory(next.category)
  setSubcategory(next.subcategory)
}
```

- [x] **Step 2: Update merchant shortcut behavior**

Replace `handleMerchantShortcutClick` with:

```ts
function handleMerchantShortcutClick(merchantValue: (typeof PRIMARY_MERCHANT_SHORTCUTS)[number]['value']) {
  setMerchantIntent('merchant')
  setMerchantName(merchantValue)
  const scene = MERCHANT_SHORTCUT_SCENES[merchantValue]
  if (!scene) return
  const next = getNextCategoryState({
    currentCategory: category,
    currentSubcategory: subcategory,
    nextCategory: scene.category,
    nextSubcategory: scene.subcategory,
  })
  setCategory(next.category)
  setSubcategory(next.subcategory)
}
```

- [x] **Step 3: Pass merchant intent into auto-select and submit requests**

In both `buildCalcRecommendationRequest` calls in `CalcPage`, add:

```ts
merchantIntent,
merchantName: getEffectiveMerchantName(merchantIntent, merchantName),
```

Replace the existing `merchantName,` argument line. The payload must use the effective merchant value so general intent never leaks stale merchant text.

- [x] **Step 4: Reorder the main form**

In `CalcPage` JSX, the first column should render sections in this order:

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium">Merchant intent</label>
  <div className="grid grid-cols-2 gap-1 rounded-lg border bg-muted/20 p-1">
    <button
      type="button"
      onClick={() => setMerchantIntent('merchant')}
      className={merchantIntent === 'merchant' ? 'rounded-md bg-background px-3 py-2 text-sm font-medium shadow-sm' : 'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground'}
    >
      Specific merchant
    </button>
    <button
      type="button"
      onClick={() => setMerchantIntent('general')}
      className={merchantIntent === 'general' ? 'rounded-md bg-background px-3 py-2 text-sm font-medium shadow-sm' : 'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground'}
    >
      General purchase
    </button>
  </div>
</div>
```

Then render the merchant input block only when `merchantIntent === 'merchant'`. Keep the existing merchant shortcuts and suggested merchants inside that conditional block.

After the merchant block, render:

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium">Payment method</label>
  <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
</div>

<AmountInput
  value={amount}
  onChange={(value) => {
    setAmount(value)
    setAmountTouched(false)
  }}
  error={amountError}
/>
```

Remove the original top-of-form `AmountInput`, original top-level `CategoryGrid`, original top-level `SubcategoryGrid`, and original top-level payment method block so each control appears once.

- [x] **Step 5: Move category/subcategory into advanced details**

Inside the advanced details content block, before `InlineExchangeRatesPanel`, add:

```tsx
<div className="space-y-3 rounded-lg border bg-background p-3">
  <div className="space-y-1">
    <p className="text-sm font-medium">Advanced category</p>
    <p className="text-xs text-muted-foreground">
      Optional. Use this when the merchant is unknown or you want to narrow a broad comparison.
    </p>
  </div>
  <CategoryGrid value={category} onChange={handleCategoryChange} />
  {category && (
    <SubcategoryGrid
      category={category}
      value={subcategory}
      onChange={(value) => {
        setSubcategory(value)
      }}
    />
  )}
</div>
```

- [x] **Step 6: Add general escape-hatch copy**

Below the intent segmented control, render this copy when general intent is active:

```tsx
{merchantIntent === 'general' && (
  <p className="text-xs leading-relaxed text-muted-foreground">
    General purchase mode skips merchant-specific filters. Add an advanced category if you want a narrower comparison.
  </p>
)}
```

- [x] **Step 7: Update inferred-scene note**

When a shortcut has applied a category/subcategory, show:

```tsx
{merchantIntent === 'merchant' &&
  merchantName.trim() &&
  merchantName.trim().toUpperCase() in MERCHANT_SHORTCUT_SCENES &&
  category && (
    <p className="text-xs text-muted-foreground">
      Inferred scene applied. Open advanced category to clear or adjust it.
    </p>
  )}
```

- [x] **Step 8: Keep submit CTA layout test passing**

Run:

```bash
npm run test:unit -- src/pages/calc/submit-cta-layout.test.ts
```

Expected: PASS. If the CTA class changes, update only the test expectations that match the intended sticky mobile/static desktop behavior.

- [x] **Step 9: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [x] **Step 10: Commit Task 4**

Run:

```bash
git add src/pages/CalcPage.tsx src/pages/calc/submit-cta-layout.test.ts
git commit -m "[agent] feat: reorder calculator around merchant intent"
```

---

### Task 5: Result and Empty-State Messaging

**Files:**
- Modify: `src/pages/CalcPage.tsx`
- Modify: `src/pages/calc/ResultPanel.tsx`

- [x] **Step 1: Pass nullable category to `ResultPanel` safely**

Inspect `ResultPanel` props. If it requires `category: Category`, change it to:

```ts
category: Category | null
```

Where the result copy currently assumes `CATEGORY_LABELS[category]`, replace with:

```ts
const categoryLabel = category ? CATEGORY_LABELS[category] : null
```

Then render broad-copy fallback:

```tsx
{categoryLabel
  ? `Using ${categoryLabel} and NT${amount.toLocaleString()} as the scenario,`
  : `Using NT${amount.toLocaleString()} with no category filter,`}
```

- [x] **Step 2: Update no-result action copy in CalcPage**

In the existing `result && result.recommendations.length < 2` message, replace the second sentence with:

```tsx
<p>
  Try choosing a known merchant shortcut, opening advanced category, clearing payment constraints, or selecting different cards.
</p>
```

- [x] **Step 3: Run focused tests and build**

Run:

```bash
npm run test:unit -- src/pages/calc/buildCalcRecommendationRequest.test.ts src/pages/calc/submit-cta-layout.test.ts
npm run build
```

Expected: PASS.

- [x] **Step 4: Commit Task 5**

Run:

```bash
git add src/pages/CalcPage.tsx src/pages/calc/ResultPanel.tsx
git commit -m "[agent] fix: clarify broad calculator result messaging"
```

---

### Task 6: Full Verification and Browser Smoke

**Files:**
- Modify: `docs/superpowers/plans/2026-05-06-merchant-first-calculator-flow.md`
- Create evidence under: `../fleet-command/reviews/2026-05-06-merchant-first-calculator-flow/`

- [x] **Step 1: Run full unit tests**

Run:

```bash
npm run test:unit
```

Expected: PASS.

- [x] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [x] **Step 3: Start local dev server**

Run from PowerShell:

```bash
$env:VITE_API_BASE_URL='https://cardsense-api-production.up.railway.app'; npm run dev -- --host 127.0.0.1
```

Expected: Vite serves on `http://127.0.0.1:5173` or the next available port.

- [x] **Step 4: Mobile merchant-specific smoke with gstack/browser**

Use the gstack browse binary as `$B`. Run:

```bash
$B goto http://127.0.0.1:5173/calc
$B viewport 375x812
$B console --errors
$B snapshot -i
$B click "text=momo"
$B click "text=LINE Pay"
$B click "text=Compare cards"
$B snapshot -D
$B screenshot --viewport ../fleet-command/reviews/2026-05-06-merchant-first-calculator-flow/mobile-merchant.png
```

Expected:

- Console has no blocking errors.
- Snapshot shows merchant intent before payment method and amount.
- Screenshot shows the merchant-first layout on mobile.
- Either results render or the UI shows a clear recoverable API/card-selection state. A silent blank state fails this smoke.

- [x] **Step 5: Mobile general-purchase smoke with gstack/browser**

Run:

```bash
$B click "text=General purchase"
$B click "text=Compare cards"
$B snapshot -D
$B console --errors
$B screenshot --viewport ../fleet-command/reviews/2026-05-06-merchant-first-calculator-flow/mobile-general.png
```

Expected:

- Merchant input is hidden or clearly inactive.
- General purchase copy is visible.
- Console has no blocking errors.
- Either results render or the UI shows a clear recoverable API/card-selection state. A stale merchant constraint in the result state fails this smoke.

- [x] **Step 6: Desktop advanced-category smoke with gstack/browser**

Run:

```bash
$B viewport 1440x900
$B snapshot -i
$B click "text=Advanced category"
$B screenshot --viewport ../fleet-command/reviews/2026-05-06-merchant-first-calculator-flow/desktop-advanced.png
```

Expected:

- Advanced category is visible or reachable.
- Category can be selected and cleared.
- The layout has no incoherent overlap.

- [x] **Step 7: Production API payload smoke**

After browser smoke, run one read-only-style recommendation POST against production API to verify category omission is accepted:

```bash
curl -s -X POST https://cardsense-api-production.up.railway.app/v1/recommendations/card `
  -H "Content-Type: application/json" `
  -d "{\"amount\":1200,\"scenario\":{\"merchantName\":\"PXMART\",\"paymentMethod\":\"LINE_PAY\"},\"comparison\":{\"includePromotionBreakdown\":false,\"maxResults\":3}}" 
```

Expected: HTTP 200 JSON with `recommendations` or a JSON response with clear `noResultReasons`. HTTP 400 for missing `category` fails this task and requires pausing before frontend-only completion.

- [x] **Step 8: Stop dev server**

Stop the Vite process started in Step 3.

- [x] **Step 9: Commit verification evidence if screenshots were produced**

From `fleet-command`, run:

```bash
git add reviews/2026-05-06-merchant-first-calculator-flow
git commit -m "[agent] test: add merchant-first calculator smoke evidence"
```

If gstack is unavailable and Chrome headless fallback is used, include that fallback in the final report and still save screenshots when possible.

---

## Plan Self-Review

- Spec coverage: Task 1 covers request semantics; Tasks 3-4 cover UX order, optional category, inferred scenes, and escape hatch; Task 5 covers result messaging; Task 6 covers unit/build/browser verification.
- Placeholder scan: no placeholder markers or open-ended implementation instructions remain.
- Type consistency: `MerchantIntent` is exported from `merchant-intent.ts` for UI code; `buildCalcRecommendationRequest.ts` uses the same literal union shape without exporting a competing type.

## NOT in Scope

- API engine changes: deferred because frontend API types already allow optional `category`.
- `/recommend` `RecommendationForm` redesign: deferred because `/calc` is the app index and primary calculator surface.
- Merchant registry/taxonomy changes: deferred because this task changes request UX, not data coverage.
- LLM merchant parsing: deferred because money decisions must remain deterministic and auditable.

## What Already Exists

- `PaymentMethodPicker` already provides grouped optional payment method selection and should be reused.
- `AmountInput` already provides keypad, quick amounts, and validation display and should be reused.
- `CategoryGrid` and `SubcategoryGrid` already provide category refinement controls and should be reused inside advanced details.
- `buildCalcRecommendationRequest` already centralizes payload construction and should remain the single request-builder boundary.

## Failure Modes

- General intent leaks a stale merchant: covered by Task 1 request-builder test and Task 2 helper test.
- Clearing category leaves stale subcategory: covered by Task 1 and Task 2 tests.
- Result copy crashes on `category === null`: covered by Task 5 build.
- Mobile sticky CTA overlaps reordered controls: covered by Task 4 layout test and Task 6 mobile screenshots.
- API returns weak results without category: not fixed in request builder; Task 5 empty-state copy gives the user recovery actions.
- Production API rejects omitted category with HTTP 400: covered by Task 6 production API payload smoke; this blocks frontend-only closeout.

## Parallelization Strategy

Sequential implementation is recommended. Tasks 1 and 2 are helper/request boundaries, Tasks 3-5 all touch `CalcPage.tsx`, and Task 6 depends on all UI work being complete. Parallel lanes would create avoidable merge conflicts in the same primary module.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | not run | Scope already approved through brainstorming方案 B |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | not run | Deferred until implementation diff exists |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | clear | 2 plan gaps found and fixed: API base for browser smoke, and real compare/API omission smoke |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | not run | Deferred; implementation will be checked with mobile/desktop screenshots |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | not run | Not needed for this consumer calculator flow |

- **UNRESOLVED:** 0
- **VERDICT:** ENG CLEARED, ready to implement with SDD.

# Calc Settings Two-Column Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder `/calc` controls into a shorter desktop two-column settings layout while keeping mobile ordering, wallet behavior, exchange-rate requests, and recommendation results unchanged.

**Architecture:** Keep `CalcPage` as the only implementation file that changes. Widen the page-level settings column on `xl` screens, then add a nested responsive settings grid: one column for scenario inputs and one column for wallet, cards, exchange rates, and benefit-plan controls. Preserve all component props and state ownership so this remains a layout-only change.

**Tech Stack:** React 19 / TypeScript 5.9 / Vite 8 / Tailwind CSS 4 / ESLint / Vitest

---

## File Structure

- Modify: `src/pages/CalcPage.tsx`
  Owns the `/calc` page layout and receives the widened page grid plus nested settings grid.
- Verify existing behavior with: `src/pages/calc/buildCalcRecommendationRequest.test.ts`
  Confirms custom exchange rates still flow into recommendation request construction.

No new components or state utilities are required for this layout-only implementation.

### Task 1: Capture Baseline Behavior Before Layout Changes

**Files:**

- Test: `src/pages/calc/buildCalcRecommendationRequest.test.ts`
- Verify: `src/pages/CalcPage.tsx`

- [x] **Step 1: Run the existing request-builder regression test**

Run:

```bash
npx vitest run src/pages/calc/buildCalcRecommendationRequest.test.ts
```

Expected:

- PASS
- The test confirms that `customExchangeRates` request behavior is already covered before layout changes.

- [x] **Step 2: Run the targeted CalcPage lint check before editing**

Run:

```bash
npx eslint src/pages/CalcPage.tsx
```

Expected:

- PASS
- If this fails before editing, inspect the failure and do not attribute the baseline failure to the layout change.

### Task 2: Reorder The Calc Settings Panel

**Files:**

- Modify: `src/pages/CalcPage.tsx`

- [x] **Step 1: Replace the flat settings stack with a nested responsive grid**

Update the page-level grid so the settings panel becomes wide enough for two columns on `xl` screens:

```tsx
<div className="grid gap-6 lg:grid-cols-[380px_1fr] xl:grid-cols-[minmax(760px,0.95fr)_minmax(0,1.05fr)]">
```

Then replace the flat settings panel body with this structure while preserving the existing child component props and handlers:

```tsx
<div className="min-w-0 rounded-xl border bg-card p-5 shadow-sm">
  <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
    <div className="min-w-0 space-y-5">
      <AmountInput ... />
      <CategoryGrid ... />
      <SubcategoryGrid ... />
      <div className="space-y-2">
        ...
      </div>
      <div className="space-y-2">
        ...
      </div>
    </div>

    <div className="min-w-0 space-y-5">
      <MyWalletPanel ... />
      <CardSelector ... />
      <InlineExchangeRatesPanel ... />
      <SwitchingCardPanel ... />
    </div>
  </div>

  <div className="sticky bottom-0 -mx-5 -mb-5 mt-5 rounded-b-xl border-t bg-card/95 px-5 py-3 backdrop-blur-sm">
    <Button
      className="min-h-touch w-full gap-2"
      onClick={handleSubmit}
      disabled={isPending || isAutoSelecting}
    >
      <Calculator className="h-4 w-4" />
      {isPending ? 'Calculating...' : 'Compare cards'}
    </Button>
  </div>
</div>
```

Use `xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]` for the nested settings grid and `xl:grid-cols-[minmax(760px,0.95fr)_minmax(0,1.05fr)]` for the page-level grid. This keeps mobile and medium widths single-column while giving the settings panel enough width for a true two-column desktop layout.

- [x] **Step 2: Preserve the scenario column content exactly**

Ensure the left nested column contains the same props and handlers for:

```tsx
<AmountInput
  value={amount}
  onChange={(value) => {
    setAmount(value)
    setAmountTouched(false)
  }}
  error={amountError}
/>

<CategoryGrid
  value={category}
  onChange={(nextCategory) => {
    setCategory(nextCategory)
    setSubcategory(null)
    setMerchantName('')
  }}
/>

<SubcategoryGrid
  category={category}
  value={subcategory}
  onChange={(value) => {
    setSubcategory(value)
    setMerchantName('')
  }}
/>
```

Also keep the merchant/channel hint and payment method blocks unchanged except for indentation.

- [x] **Step 3: Preserve the card and rates column behavior exactly**

Ensure the right nested column renders this order:

```tsx
<MyWalletPanel ... />
<CardSelector ... />
<InlineExchangeRatesPanel ... />
<SwitchingCardPanel ... />
```

Keep all existing props and handlers unchanged:

```tsx
<MyWalletPanel
  selectedCardCount={selectedCards.length}
  customRateCount={Object.keys(customExchangeRates).length}
  savedAt={walletSavedAt}
  hasRestoredWallet={hasRestoredWallet}
  statusMessage={effectiveWalletStatusMessage}
  canClear={walletCanClear}
  onSave={handleSaveWallet}
  onClear={handleClearWallet}
/>

<CardSelector
  selected={selectedCards}
  onChange={(codes) => {
    setSelectedCards(codes)
    setCardSelectionMode('manual')
    setCardSelectorError(undefined)
  }}
  error={cardSelectorError}
  isUpdating={isAutoSelecting}
/>

<InlineExchangeRatesPanel
  key={exchangeRatesPanelKey}
  initialCustomRates={customExchangeRates}
  onChange={setCustomExchangeRates}
/>
```

Keep the full existing `SwitchingCardPanel` props and `renderCardExtra` body unchanged.

- [x] **Step 4: Run the targeted lint check**

Run:

```bash
npx eslint src/pages/CalcPage.tsx
```

Expected:

- PASS

- [x] **Step 5: Run the request-builder regression test again**

Run:

```bash
npx vitest run src/pages/calc/buildCalcRecommendationRequest.test.ts
```

Expected:

- PASS
- Confirms the request construction behavior remains intact after moving the exchange-rate panel.

### Task 3: Final Verification And Commit

**Files:**

- Verify: `src/pages/CalcPage.tsx`
- Verify: `src/pages/calc/buildCalcRecommendationRequest.test.ts`

- [x] **Step 1: Run type-check**

Run:

```bash
npx tsc -b
```

Expected:

- PASS

- [x] **Step 2: Inspect the diff for layout-only scope**

Run:

```bash
git diff -- src/pages/CalcPage.tsx
```

Expected:

- Diff only reorders existing JSX and changes wrapper layout classes.
- No changes to `buildCalcRecommendationRequest`, wallet storage, auto-select logic, or component prop signatures.

- [ ] **Step 3: Commit the implementation**

Run:

```bash
git add src/pages/CalcPage.tsx docs/superpowers/plans/2026-04-12-calc-settings-two-column-layout.md
git commit -m "feat: reorganize calc settings layout"
```

Expected:

- Commit succeeds.

---

## Self-Review

Spec coverage:

- Desktop two-column settings layout: Task 2.
- Mobile single-column order: Task 2 uses `xl:grid-cols-*`, so mobile remains one column in DOM order.
- My Wallet and card selector no longer at the bottom: Task 2 puts them before exchange rates and benefit-plan controls.
- Exchange-rate tool near card workflow: Task 2 places it after card selection and before benefit plans.
- Compare button remains sticky: Task 2 keeps the sticky button below the nested grid.
- Existing request and wallet behavior unchanged: Tasks 1, 2, and 3 explicitly preserve props and verify request construction.

Placeholder scan:

- No TODO, TBD, placeholder, or deferred implementation details remain.

Type consistency:

- `customExchangeRates`, `exchangeRatesPanelKey`, `setCustomExchangeRates`, `selectedCards`, `setCardSelectionMode`, and wallet prop names match the current `CalcPage.tsx` implementation.

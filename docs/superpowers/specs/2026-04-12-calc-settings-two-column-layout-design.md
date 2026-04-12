# Calc Settings Two-Column Layout Design

Date: 2026-04-12

## Goal

Shorten the `/calc` setup flow and make the most important controls visible earlier. The current single-column settings card stacks scenario inputs, benefit-plan controls, exchange rates, My Wallet, and card selection vertically, which makes the page feel too long and pushes My Wallet and card selection too far down.

The redesign keeps the existing calculator behavior, request payloads, exchange-rate override semantics, and recommendation results. It only changes the placement and grouping of `/calc` controls.

## Scope

In scope:

- Reorder `/calc` settings so My Wallet and card selection are no longer at the bottom.
- Place the exchange-rate tool near the card/wallet workflow so users can adjust POINTS and MILES early.
- Use a two-column settings layout on desktop to reduce vertical height.
- Preserve a clear, single-column order on mobile.
- Keep the compare button sticky at the bottom of the settings panel.

Out of scope:

- Changing recommendation API contracts.
- Changing `customExchangeRates` request behavior.
- Changing `ExchangeRatesBoard` normalization or default-rate semantics.
- Changing recommendation page drawer behavior.
- Changing wallet persistence fields or localStorage shape.
- Redesigning result cards.

## Current State

`CalcPage` currently renders the left settings panel in this order:

1. Amount
2. Category
3. Subcategory
4. Merchant / channel hint
5. Payment method
6. Benefit-plan switching controls
7. Inline exchange-rate tool
8. My Wallet
9. Card selector
10. Sticky compare button

This makes the workflow feel longer than necessary because card ownership, wallet restore, and exchange-rate overrides appear after benefit-plan settings. Users who want to start from their saved wallet or quickly tune point valuation have to scroll before they can act.

## Selected Approach

Use a desktop two-column settings layout inside the existing left-side calculator panel:

```text
Card Calculator
+-------------------------- settings -------------------------+ +---- result ----+
| +-- Scenario -------------+ +-- Cards & rates ------------+ | | recommendations |
| | Amount                  | | My Wallet                   | | |                 |
| | Category / Subcategory  | | Card Selector               | | |                 |
| | Merchant / Payment      | | Exchange Rate Tool          | | |                 |
| +-------------------------+ | Benefit Plan / Switching    | | |                 |
|                             +------------------------------+ | |                 |
| Compare cards sticky bottom                                | |                 |
+-------------------------------------------------------------+ +-----------------+
```

Why this approach:

- It directly addresses the page length by splitting the setup controls into two compact desktop columns.
- It moves My Wallet and card selection into the first desktop viewport.
- It keeps exchange-rate edits close to card selection, where the valuation affects comparison choices.
- It avoids a larger information-architecture change to the results area.

## Desktop Layout

Keep the page-level grid as settings plus results. Inside the settings panel, add a nested responsive grid:

- Left column: scenario setup.
- Right column: wallet, selected cards, exchange rates, and benefit-plan switching.
- Sticky compare button remains below the nested grid, still attached to the bottom of the settings panel.

Desktop order:

1. Scenario column:
   Amount, category, subcategory, merchant/channel hint, payment method.
2. Cards and rates column:
   My Wallet, Card Selector, Inline Exchange Rates Panel, Switching Card Panel.
3. Sticky compare button.

The benefit-plan controls move below card selection because they refine selected-card behavior. This also prevents the benefit-plan block from blocking access to wallet, card selection, and exchange-rate controls.

## Mobile Layout

On mobile, keep one column and use this order:

1. Amount
2. Category
3. Subcategory
4. Merchant / channel hint
5. Payment method
6. My Wallet
7. Card Selector
8. Inline Exchange Rates Panel
9. Benefit-plan switching controls
10. Sticky compare button
11. Results

This order keeps the required scenario inputs first, then quickly exposes wallet/card/rate controls before deeper benefit-plan configuration.

## Component Boundaries

No shared component behavior changes are required. The initial implementation can be a layout-only change in `CalcPage.tsx`:

- Keep `InlineExchangeRatesPanel` API unchanged.
- Keep `MyWalletPanel` API unchanged.
- Keep `CardSelector` API unchanged.
- Keep `SwitchingCardPanel` API unchanged.
- Do not introduce new persistence or recommendation state.

If the nested JSX becomes hard to read, extract small local render sections in a follow-up, but avoid unrelated refactors.

## Data Flow

Data flow remains unchanged:

- `customExchangeRates` stays owned by `CalcPage`.
- `InlineExchangeRatesPanel` still receives `initialCustomRates` and `onChange`.
- Auto-select and final submit still call `buildCalcRecommendationRequest` with `customExchangeRates`.
- Wallet save, restore, clear, and unsaved-change tracking keep the same state and localStorage semantics.
- Card selection still updates `cardSelectionMode` to `manual`.

## Verification

Run:

```bash
npx eslint src/pages/CalcPage.tsx
npx tsc -b
```

Manual checks:

- Desktop `/calc` shows scenario controls and card/rate controls side by side.
- My Wallet and card selection are visible before the benefit-plan block on desktop and mobile.
- Exchange-rate edits still update auto-select and final compare requests.
- Wallet restore, save, clear, and unsaved-change messaging still work.
- The compare button remains sticky at the bottom of the settings panel.
- Recommendation results still render in the right column on desktop.

## Risks

The main risk is that moving `SwitchingCardPanel` below card selection could make benefit-plan controls feel less prominent for power users. This is acceptable for the first redesign because wallet, cards, and exchange rates are the higher-priority controls for shortening the page and making setup easier to start.

Another risk is mobile ordering. The proposed mobile order keeps scenario fields first, then wallet/cards/rates, then benefit plans. If manual testing shows that benefit-plan users need faster access, a later refinement can make the benefit-plan section collapsible or summarize active plans near the card selector.

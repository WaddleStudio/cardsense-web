import { useEffect, useRef, useState } from 'react'
import { Calculator } from 'lucide-react'
import { useCards, useRecommendation } from '@/api'
import { MerchantPicker } from '@/components/MerchantPicker'
import { PaymentMethodPicker } from '@/components/PaymentMethodPicker'
import { SwitchingCardPanel } from '@/components/SwitchingCardPanel'
import { InlineExchangeRatesPanel } from '@/components/exchange-rates/InlineExchangeRatesPanel'
import { Button } from '@/components/ui/button'
import { FilterChip } from '@/components/ui/filter-chip'
import { Input } from '@/components/ui/input'
import { MERCHANT_SUGGESTIONS, POPULAR_MERCHANT_SHORTCUTS, SUBCATEGORY_LABELS } from '@/types'
import type { Category } from '@/types'
import { AmountInput } from './calc/AmountInput'
import { buildCalcRecommendationRequest } from './calc/buildCalcRecommendationRequest'
import { CardSelector } from './calc/CardSelector'
import { CategoryGrid } from './calc/CategoryGrid'
import { MyWalletPanel } from './calc/MyWalletPanel'
import { ResultPanel } from './calc/ResultPanel'
import { SubcategoryGrid } from './calc/SubcategoryGrid'
import {
  shouldRunWalletAutoSelect,
  type WalletCardSelectionMode,
} from './calc/my-wallet-auto-select'
import {
  MY_WALLET_STORAGE_KEY,
  buildMyWalletSnapshot,
  parseStoredMyWalletSnapshot,
} from './calc/my-wallet-storage'

const DEFAULT_AMOUNT = '1200'
const DEFAULT_CATEGORY: Category = 'DINING'
const AUTO_SELECT_AMOUNT = 1200
const AUTO_SELECT_COUNT = 6
const PRIMARY_MERCHANT_SHORTCUTS = [
  { value: 'PXMART', label: '全聯' },
  { value: 'CARREFOUR', label: '家樂福' },
  { value: 'MOMO', label: 'momo' },
  { value: 'SHOPEE', label: '蝦皮' },
  { value: 'AGODA', label: 'Agoda' },
  { value: 'STARBUCKS', label: '星巴克' },
  { value: 'UBER_EATS', label: 'Uber Eats' },
] as const
export const SUBMIT_CTA_BAR_CLASS_NAME =
  'sticky bottom-0 -mx-5 -mb-5 mt-5 rounded-b-xl border-t bg-card/95 px-5 py-3 backdrop-blur-sm lg:static'
const MERCHANT_SHORTCUT_SCENES = {
  PXMART: { category: 'GROCERY', subcategory: 'SUPERMARKET' },
  CARREFOUR: { category: 'GROCERY', subcategory: 'SUPERMARKET' },
  MOMO: { category: 'ONLINE', subcategory: 'ECOMMERCE' },
  SHOPEE: { category: 'ONLINE', subcategory: 'ECOMMERCE' },
  AGODA: { category: 'ONLINE', subcategory: 'TRAVEL_PLATFORM' },
  STARBUCKS: { category: 'DINING', subcategory: 'CAFE' },
  UBER_EATS: { category: 'DINING', subcategory: 'DELIVERY' },
  MCDONALD: { category: 'DINING', subcategory: 'RESTAURANT' },
} as const

function buildWalletStateSignature(input: {
  selectedCards: string[]
  activePlansByCard: Record<string, string>
  planRuntimeByCard: Record<string, Record<string, string>>
  customExchangeRates: Record<string, number>
}) {
  return JSON.stringify({
    selectedCards: [...input.selectedCards].sort(),
    activePlansByCard: Object.fromEntries(
      Object.entries(input.activePlansByCard).sort(([left], [right]) => left.localeCompare(right)),
    ),
    planRuntimeByCard: Object.fromEntries(
      Object.entries(input.planRuntimeByCard)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([cardCode, runtime]) => [
          cardCode,
          Object.fromEntries(
            Object.entries(runtime).sort(([left], [right]) => left.localeCompare(right)),
          ),
        ]),
    ),
    customExchangeRates: Object.fromEntries(
      Object.entries(input.customExchangeRates).sort(([left], [right]) => left.localeCompare(right)),
    ),
  })
}

export function CalcPage() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT)
  const [amountTouched, setAmountTouched] = useState(false)
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY)
  const [subcategory, setSubcategory] = useState<string | null>(null)
  const [merchantName, setMerchantName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [cardSelectionMode, setCardSelectionMode] = useState<WalletCardSelectionMode>('initial')
  const [cardSelectorError, setCardSelectorError] = useState<string | undefined>()
  const [activePlansByCard, setActivePlansByCard] = useState<Record<string, string>>({})
  const [planRuntimeByCard, setPlanRuntimeByCard] = useState<Record<string, Record<string, string>>>({})
  const [customExchangeRates, setCustomExchangeRates] = useState<Record<string, number>>({})
  const [walletSavedAt, setWalletSavedAt] = useState<string | null>(null)
  const [walletStatusMessage, setWalletStatusMessage] = useState<string | null>(null)
  const [hasRestoredWallet, setHasRestoredWallet] = useState(false)
  const [hasResolvedWalletRestore, setHasResolvedWalletRestore] = useState(false)
  const [walletBaselineSignature, setWalletBaselineSignature] = useState<string | null>(null)
  const [exchangeRatesPanelKey, setExchangeRatesPanelKey] = useState(0)
  const resultRef = useRef<HTMLDivElement>(null)

  const { data: cards } = useCards()
  const { mutate: getRecommendation, data: result, isPending } = useRecommendation()
  const { mutate: autoSelectCards, isPending: isAutoSelecting } = useRecommendation()

  const sceneSpecificMerchantSuggestions =
    category && subcategory ? (MERCHANT_SUGGESTIONS[`${category}:${subcategory}`] ?? []) : []
  const merchantSuggestions =
    sceneSpecificMerchantSuggestions.length > 0
      ? sceneSpecificMerchantSuggestions
      : category
        ? (MERCHANT_SUGGESTIONS[category] ?? [])
        : []
  const displayedMerchantSuggestions =
    merchantSuggestions.length > 0 ? merchantSuggestions : POPULAR_MERCHANT_SHORTCUTS
  const hasMerchantScopedScene = Boolean(
    category && subcategory && MERCHANT_SUGGESTIONS[`${category}:${subcategory}`]?.length,
  )
  const merchantPlaceholder =
    displayedMerchantSuggestions.length > 0
      ? `e.g. ${displayedMerchantSuggestions
          .slice(0, 3)
          .map((merchant) => merchant.label)
          .join(', ')}`
      : 'e.g. ChatGPT, Claude, Uber Eats'
  const benefitPlanTiers = Object.fromEntries(
    Object.entries(planRuntimeByCard)
      .map(([cardCode, runtime]) => [cardCode, runtime?.tier])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  )
  const walletCanClear = walletSavedAt !== null || hasRestoredWallet
  const walletStateSignature = buildWalletStateSignature({
    selectedCards,
    activePlansByCard,
    planRuntimeByCard,
    customExchangeRates,
  })
  const hasWalletUnsavedChanges =
    walletBaselineSignature !== null && walletStateSignature !== walletBaselineSignature
  const effectiveWalletStatusMessage = hasWalletUnsavedChanges
    ? 'Wallet has unsaved changes. Save to update the wallet stored in this browser.'
    : walletStatusMessage

  useEffect(() => {
    if (!cards || cards.length === 0 || hasResolvedWalletRestore) return

    const snapshot = parseStoredMyWalletSnapshot(localStorage.getItem(MY_WALLET_STORAGE_KEY))

    if (!snapshot) {
      setHasResolvedWalletRestore(true)
      return
    }

    const availableCardCodes = new Set(cards.map((card) => card.cardCode))
    const restoredSelectedCards = snapshot.selectedCards.filter((cardCode) =>
      availableCardCodes.has(cardCode),
    )
    const restoredActivePlansByCard = Object.fromEntries(
      Object.entries(snapshot.activePlansByCard).filter(([cardCode]) => availableCardCodes.has(cardCode)),
    )
    const restoredPlanRuntimeByCard = Object.fromEntries(
      Object.entries(snapshot.planRuntimeByCard).filter(([cardCode]) => availableCardCodes.has(cardCode)),
    )
    const unavailableCardCodes = new Set(
      [
        ...snapshot.selectedCards,
        ...Object.keys(snapshot.activePlansByCard),
        ...Object.keys(snapshot.planRuntimeByCard),
      ].filter((cardCode) => !availableCardCodes.has(cardCode)),
    )

    setSelectedCards(restoredSelectedCards)
    setCardSelectionMode(restoredSelectedCards.length >= 2 ? 'manual' : 'initial')
    setActivePlansByCard(restoredActivePlansByCard)
    setPlanRuntimeByCard(restoredPlanRuntimeByCard)
    setCustomExchangeRates(snapshot.customExchangeRates)
    setWalletSavedAt(snapshot.savedAt)
    setHasRestoredWallet(true)
    setWalletBaselineSignature(
      buildWalletStateSignature({
        selectedCards: restoredSelectedCards,
        activePlansByCard: restoredActivePlansByCard,
        planRuntimeByCard: restoredPlanRuntimeByCard,
        customExchangeRates: snapshot.customExchangeRates,
      }),
    )
    localStorage.setItem(
      MY_WALLET_STORAGE_KEY,
      JSON.stringify(
        buildMyWalletSnapshot({
          savedAt: snapshot.savedAt,
          selectedCards: restoredSelectedCards,
          activePlansByCard: restoredActivePlansByCard,
          planRuntimeByCard: restoredPlanRuntimeByCard,
          customExchangeRates: snapshot.customExchangeRates,
        }),
      ),
    )
    setWalletStatusMessage(
      unavailableCardCodes.size > 0
        ? `Wallet restored, but ${unavailableCardCodes.size} unavailable card${
            unavailableCardCodes.size === 1 ? ' was' : 's were'
          } removed.`
        : 'Wallet restored from saved data.',
    )
    setHasResolvedWalletRestore(true)
    setExchangeRatesPanelKey((prev) => prev + 1)
  }, [cards, hasResolvedWalletRestore])

  useEffect(() => {
    if (!cards || cards.length === 0 || !hasResolvedWalletRestore) return
    if (
      !shouldRunWalletAutoSelect({
        hasRestoredWallet,
        selectedCardCount: selectedCards.length,
        selectionMode: cardSelectionMode,
      })
    ) {
      return
    }

    autoSelectCards(
      buildCalcRecommendationRequest({
        amount: AUTO_SELECT_AMOUNT,
        category,
        subcategory,
        merchantName,
        paymentMethod,
        activePlansByCard,
        planRuntimeByCard,
        benefitPlanTiers,
        cardCodes: cards.map((card) => card.cardCode),
        comparison: {
          includePromotionBreakdown: false,
          maxResults: AUTO_SELECT_COUNT,
        },
        customExchangeRates,
      }),
      {
        onSuccess: (res) => {
          const topCodes = res.recommendations
            .filter((recommendation) => recommendation.cardCode)
            .slice(0, AUTO_SELECT_COUNT)
            .map((recommendation) => recommendation.cardCode!)

          if (topCodes.length >= 2) {
            setSelectedCards(topCodes)
          }
        },
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cards,
    hasResolvedWalletRestore,
    hasRestoredWallet,
    cardSelectionMode,
    category,
    subcategory,
    merchantName,
    paymentMethod,
    activePlansByCard,
    planRuntimeByCard,
    customExchangeRates,
  ])

  const amountNum = parseInt(amount, 10)
  const amountError =
    amountTouched && (!amountNum || amountNum < 100 || amountNum > 100_000)
      ? 'Enter an amount between 100 and 100,000.'
      : undefined

  function handleActivePlanChange(cardCode: string, planValue: string | null) {
    if (planValue === null) {
      setActivePlansByCard((prev) => {
        const next = { ...prev }
        delete next[cardCode]
        return next
      })
      setPlanRuntimeByCard((prev) => {
        const next = { ...prev }
        delete next[cardCode]
        return next
      })
      return
    }

    setActivePlansByCard((prev) => ({ ...prev, [cardCode]: planValue }))
    if (cardCode === 'CATHAY_CUBE' || cardCode === 'TAISHIN_RICHART') {
      setPlanRuntimeByCard((prev) => ({
        ...prev,
        [cardCode]: {
          ...prev[cardCode],
          tier: prev[cardCode]?.tier ?? 'LEVEL_1',
        },
      }))
    }
  }

  function handleRuntimeChange(cardCode: string, key: string, value: string) {
    setPlanRuntimeByCard((prev) => ({
      ...prev,
      [cardCode]: { ...prev[cardCode], [key]: value },
    }))
  }

  function handleMerchantShortcutClick(merchantValue: (typeof PRIMARY_MERCHANT_SHORTCUTS)[number]['value']) {
    setMerchantName(merchantValue)
    const scene = MERCHANT_SHORTCUT_SCENES[merchantValue]
    if (!scene) return
    setCategory(scene.category)
    setSubcategory(scene.subcategory)
  }

  function handleSubmit() {
    setAmountTouched(true)
    if (!amountNum || amountNum < 100 || amountNum > 100_000) return

    if (selectedCards.length < 2) {
      setCardSelectorError('Select at least 2 cards to compare.')
      return
    }

    setCardSelectorError(undefined)
    getRecommendation(
      buildCalcRecommendationRequest({
        amount: amountNum,
        category,
        subcategory,
        merchantName,
        paymentMethod,
        activePlansByCard,
        planRuntimeByCard,
        benefitPlanTiers,
        cardCodes: selectedCards,
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 10,
        },
        customExchangeRates,
      }),
      {
        onSuccess: () => {
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        },
      },
    )
  }

  function handleSaveWallet() {
    const savedAt = new Date().toISOString()
    const snapshot = buildMyWalletSnapshot({
      savedAt,
      selectedCards,
      activePlansByCard,
      planRuntimeByCard,
      customExchangeRates,
    })

    localStorage.setItem(MY_WALLET_STORAGE_KEY, JSON.stringify(snapshot))
    setWalletSavedAt(savedAt)
    setHasRestoredWallet(true)
    setHasResolvedWalletRestore(true)
    setWalletBaselineSignature(
      buildWalletStateSignature({
        selectedCards: snapshot.selectedCards,
        activePlansByCard: snapshot.activePlansByCard,
        planRuntimeByCard: snapshot.planRuntimeByCard,
        customExchangeRates: snapshot.customExchangeRates,
      }),
    )
    setWalletStatusMessage('Wallet saved for your next calculator session.')
  }

  function handleClearWallet() {
    localStorage.removeItem(MY_WALLET_STORAGE_KEY)
    setSelectedCards([])
    setCardSelectionMode('manual')
    setCardSelectorError(undefined)
    setActivePlansByCard({})
    setPlanRuntimeByCard({})
    setCustomExchangeRates({})
    setWalletSavedAt(null)
    setWalletBaselineSignature(null)
    setWalletStatusMessage('Saved wallet cleared from this browser.')
    setHasRestoredWallet(false)
    setHasResolvedWalletRestore(true)
    setExchangeRatesPanelKey((prev) => prev + 1)
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Card Calculator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start with a merchant or spending scenario, then compare the best cards side by side.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="min-w-0 rounded-xl border bg-card p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-[minmax(280px,0.9fr)_minmax(300px,1.1fr)]">
            <div className="min-w-0 space-y-5">
              <AmountInput
                value={amount}
                onChange={(value) => {
                  setAmount(value)
                  setAmountTouched(false)
                }}
                error={amountError}
              />

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <label htmlFor="calc-merchant-name" className="text-sm font-medium">
                      Merchant-first entry
                    </label>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Ask questions like "Which card should I use at Pxmart?" by starting with the merchant first.
                    </p>
                  </div>
                  {merchantName.trim() && (
                    <button
                      type="button"
                      onClick={() => setMerchantName('')}
                      className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="space-y-3">
                    <Input
                      id="calc-merchant-name"
                      type="text"
                      placeholder={merchantPlaceholder}
                      value={merchantName}
                      onChange={(event) => setMerchantName(event.target.value)}
                    />

                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Popular merchant shortcuts</p>
                      <div className="flex flex-wrap gap-1.5">
                        {PRIMARY_MERCHANT_SHORTCUTS.map((merchant) => (
                          <FilterChip
                            key={merchant.value}
                            active={merchantName.trim().toUpperCase() === merchant.value}
                            onClick={() => handleMerchantShortcutClick(merchant.value)}
                          >
                            {merchant.label}
                          </FilterChip>
                        ))}
                      </div>
                    </div>

                    {merchantName.trim() &&
                      merchantName.trim().toUpperCase() in MERCHANT_SHORTCUT_SCENES && (
                        <p className="text-xs text-muted-foreground">
                          Scene preset applied. You can still change the category below if needed.
                        </p>
                      )}

                    {!merchantName.trim() && hasMerchantScopedScene && subcategory && (
                      <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                        Add a merchant when comparing {SUBCATEGORY_LABELS[subcategory] ?? subcategory} so
                        the calculator can match bank-specific merchant promotions.
                      </p>
                    )}

                    {merchantSuggestions.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">
                          {subcategory ? 'Suggested merchants for this scene' : 'Suggested merchants for this category'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {merchantSuggestions.map((merchant) => (
                            <FilterChip
                              key={merchant.value}
                              active={merchantName.trim().toUpperCase() === merchant.value}
                              onClick={() => setMerchantName(merchant.value)}
                            >
                              {merchant.label}
                            </FilterChip>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <CategoryGrid
                value={category}
                onChange={(nextCategory) => {
                  setCategory(nextCategory)
                  setSubcategory(null)
                }}
              />

              <SubcategoryGrid
                category={category}
                value={subcategory}
                onChange={(value) => {
                  setSubcategory(value)
                }}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment method</label>
                <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
              </div>
            </div>

            <div className="min-w-0 space-y-5">
              <MyWalletPanel
                selectedCardCodes={selectedCards}
                cards={cards}
                selectedCardCount={selectedCards.length}
                activePlanCount={Object.keys(activePlansByCard).length}
                customRateCount={Object.keys(customExchangeRates).length}
                savedAt={walletSavedAt}
                hasRestoredWallet={hasRestoredWallet}
                hasUnsavedChanges={hasWalletUnsavedChanges}
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

              <details className="rounded-xl border bg-muted/20 p-4 open:bg-card">
                <summary className="cursor-pointer text-sm font-medium text-foreground">
                  Advanced valuation and plan settings
                </summary>
                <div className="mt-4 space-y-5">
                  <InlineExchangeRatesPanel
                    key={exchangeRatesPanelKey}
                    initialCustomRates={customExchangeRates}
                    onChange={setCustomExchangeRates}
                  />

                  <SwitchingCardPanel
                    activePlansByCard={activePlansByCard}
                    planRuntimeByCard={planRuntimeByCard}
                    onActivePlanChange={handleActivePlanChange}
                    onRuntimeChange={handleRuntimeChange}
                    renderCardExtra={(cardCode, activePlan) =>
                      cardCode === 'ESUN_UNICARD' && activePlan === 'ESUN_UNICARD_FLEXIBLE' ? (
                        <MerchantPicker
                          value={planRuntimeByCard.ESUN_UNICARD?.selected_merchants ?? ''}
                          onChange={(value) =>
                            handleRuntimeChange('ESUN_UNICARD', 'selected_merchants', value)
                          }
                        />
                      ) : null
                    }
                  />
                </div>
              </details>
            </div>
          </div>

          <div className={SUBMIT_CTA_BAR_CLASS_NAME}>
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

        <div ref={resultRef}>
          {!result && !isPending && (
            <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed bg-muted/20">
              <div className="text-center text-muted-foreground">
                <Calculator className="mx-auto mb-3 h-10 w-10 opacity-25" />
                <p className="text-sm">Adjust the scenario and run a comparison.</p>
                <p className="text-sm">Results will appear here once at least two cards are selected.</p>
              </div>
            </div>
          )}

          {isPending && (
            <div className="space-y-3 rounded-xl border bg-muted/20 p-5">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="space-y-2">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg border bg-card p-4">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && result.recommendations.length >= 2 && (
            <ResultPanel
              recommendations={result.recommendations}
              amount={amountNum}
              category={category}
              customExchangeRates={customExchangeRates}
            />
          )}

          {result && result.recommendations.length < 2 && (
            <div className="flex min-h-56 items-center justify-center rounded-xl border bg-muted/20 p-5">
              <div className="max-w-md space-y-3 text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Not enough recommendable cards were returned.</p>
                <p>Try broadening the filters, clearing merchant/payment constraints, or selecting a different category.</p>
                {result.noResultReasons?.length > 0 && (
                  <div className="rounded-lg border bg-card p-3 text-left text-xs">
                    <p className="mb-2 font-medium text-foreground">Why this happened</p>
                    <ul className="space-y-1">
                      {result.noResultReasons.map((reason) => (
                        <li key={reason}>• {formatNoResultReason(reason)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function formatNoResultReason(reason: string) {
  switch (reason) {
    case 'NO_ACTIVE_PROMOTIONS_FOR_DATE':
      return 'No active promotions matched the transaction date.'
    case 'NO_PROMOTIONS_MATCH_SCENARIO':
      return 'Promotions existed, but none matched this category, merchant, channel, or payment method.'
    case 'NO_POSITIVE_REWARD_AFTER_CAPS':
      return 'Matching promotions did not produce a positive estimated reward after caps or limits.'
    case 'MERCHANT_FILTER_APPLIED':
      return 'A merchant filter was applied.'
    case 'PAYMENT_METHOD_FILTER_APPLIED':
      return 'A payment method filter was applied.'
    case 'CHANNEL_FILTER_APPLIED':
      return 'A channel filter was applied.'
    case 'CARD_FILTER_APPLIED':
      return 'Only selected wallet cards were compared.'
    default:
      return reason
  }
}

import { useEffect, useRef, useState } from 'react'
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react'
import { useCards, useRecommendation } from '@/api'
import { MerchantPicker } from '@/components/MerchantPicker'
import { PaymentMethodPicker } from '@/components/PaymentMethodPicker'
import { SwitchingCardPanel } from '@/components/SwitchingCardPanel'
import { InlineExchangeRatesPanel } from '@/components/exchange-rates/InlineExchangeRatesPanel'
import { Button } from '@/components/ui/button'
import { CATEGORY_LABELS, PAYMENT_METHOD_LABELS, type Category } from '@/types'
import { AmountInput } from './calc/AmountInput'
import { buildCalcRecommendationRequest } from './calc/buildCalcRecommendationRequest'
import { CardSelector } from './calc/CardSelector'
import { buildDecisionReadinessSummary } from './calc/decision-readiness'
import { MerchantSearchPicker } from './calc/MerchantSearchPicker'
import type { MerchantSearchOption } from './calc/merchant-search'
import { MyWalletPanel } from './calc/MyWalletPanel'
import { ResultPanel } from './calc/ResultPanel'
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
const DEFAULT_CATEGORY: Category | null = null
const AUTO_SELECT_AMOUNT = 1200
const AUTO_SELECT_COUNT = 6
export const SUBMIT_CTA_BAR_CLASS_NAME =
  'sticky bottom-0 -mx-5 -mb-5 mt-5 rounded-b-xl border-t bg-card/95 px-5 py-3 backdrop-blur-sm lg:static'

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
  const [category, setCategory] = useState<Category | null>(DEFAULT_CATEGORY)
  const [subcategory, setSubcategory] = useState<string | null>(null)
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantSearchOption | null>(null)
  const [merchantFallbackCategory, setMerchantFallbackCategory] = useState<Category | null>(null)
  const [merchantSearchError, setMerchantSearchError] = useState<string | undefined>()
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
  const [showAdvanced, setShowAdvanced] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const { data: cards } = useCards()
  const { mutate: getRecommendation, data: result, isPending } = useRecommendation()
  const { mutate: autoSelectCards, isPending: isAutoSelecting } = useRecommendation()
  const amountNum = parseInt(amount, 10)

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
    ? '卡包有變更，儲存後下次會沿用。'
    : walletStatusMessage
  const hasMerchantScenario = Boolean(selectedMerchant || merchantFallbackCategory)
  const decisionReadiness = buildDecisionReadinessSummary({
    hasMerchantScenario,
    selectedCardCount: selectedCards.length,
    amount: amountNum,
  })
  const checkoutMerchantLabel =
    selectedMerchant?.label ??
    (merchantFallbackCategory ? `${CATEGORY_LABELS[merchantFallbackCategory]}場景` : '尚未選擇')
  const checkoutPaymentMethodLabel = paymentMethod
    ? PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod
    : '信用卡直刷'

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
        ? `已載入卡包，並移除 ${unavailableCardCodes.size} 張不可用卡片。`
        : '已載入上次儲存的卡包。',
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
        merchantName: selectedMerchant?.value ?? null,
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
    selectedMerchant,
    paymentMethod,
    activePlansByCard,
    planRuntimeByCard,
    customExchangeRates,
  ])

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

  function handleSubmit() {
    setAmountTouched(true)
    if (!amountNum || amountNum < 100 || amountNum > 100_000) return

    if (selectedCards.length < 2) {
      setCardSelectorError('請至少選 2 張卡，才能比較你的卡包。')
      return
    }

    if (!selectedMerchant && !merchantFallbackCategory) {
      setMerchantSearchError('請先選擇商家；找不到商家時，可改用分類場景。')
      return
    }

    setCardSelectorError(undefined)
    getRecommendation(
      buildCalcRecommendationRequest({
        amount: amountNum,
        category,
        subcategory,
        merchantName: selectedMerchant?.value ?? null,
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
    setWalletStatusMessage('卡包已儲存。')
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
    setWalletStatusMessage('已清除本瀏覽器的卡包。')
    setHasRestoredWallet(false)
    setHasResolvedWalletRestore(true)
    setExchangeRatesPanelKey((prev) => prev + 1)
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          這間商家該刷哪張卡？
          <span className="ml-2 text-base font-normal text-muted-foreground">Payment Decision</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          選商家、付款方式與金額，再用你的卡包比較最高回饋與限制條件。
        </p>
      </div>

      <div className="grid gap-6">
        <div className="min-w-0 rounded-xl border bg-card p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-[minmax(280px,0.9fr)_minmax(300px,1.1fr)]">
            <div className="min-w-0 space-y-5">
              <MerchantSearchPicker
                selectedMerchant={selectedMerchant}
                fallbackCategory={merchantFallbackCategory}
                error={merchantSearchError}
                onMerchantSelect={handleMerchantSelect}
                onMerchantClear={handleMerchantClear}
                onFallbackCategorySelect={handleFallbackCategorySelect}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">付款方式</label>
                <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
              </div>

              <AmountInput
                value={amount}
                onChange={(value) => {
                  setAmount(value)
                  setAmountTouched(false)
                }}
                error={amountError}
                merchantLabel={checkoutMerchantLabel}
                paymentMethodLabel={checkoutPaymentMethodLabel}
                walletCardCount={selectedCards.length}
                readiness={decisionReadiness}
              />
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

              <div className="rounded-xl border bg-muted/20">
                {/* Mobile toggle - hidden on md+ where section is always open */}
                <button
                  className="md:hidden flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
                  onClick={() => setShowAdvanced((v) => !v)}
                  type="button"
                  aria-expanded={showAdvanced}
                >
                  <span>進階設定</span>
                  {showAdvanced ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {/* Desktop header */}
                <div className="hidden md:flex items-center px-4 py-3">
                  <span className="text-sm font-medium text-foreground">進階設定</span>
                </div>
                {/* Content: always visible on md+, toggle on mobile */}
                <div className={`px-4 pb-4 space-y-5 ${showAdvanced ? 'block' : 'hidden md:block'}`}>
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
              </div>
            </div>
          </div>

          <div className={SUBMIT_CTA_BAR_CLASS_NAME}>
            <Button
              className="min-h-touch w-full gap-2"
              onClick={handleSubmit}
              disabled={isPending || isAutoSelecting}
            >
              <Calculator className="h-4 w-4" />
              {isPending ? '計算中...' : '比較我的卡包'}
            </Button>
          </div>
        </div>

        <div ref={resultRef}>
          {!result && !isPending && (
            <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed bg-muted/20">
              <div className="text-center text-muted-foreground">
                <Calculator className="mx-auto mb-3 h-10 w-10 opacity-25" />
                <p className="text-sm">完成左側條件後，CardSense 會比較你的卡包。</p>
                <p className="text-sm">結果會顯示最佳卡、回饋差距與信任檢查。</p>
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
                <p>
                  Try selecting another supported merchant, changing payment method, using category fallback, or selecting different cards.
                </p>
                {result.noResultReasons?.length > 0 && (
                  <div className="rounded-lg border bg-card p-3 text-left text-xs">
                    <p className="mb-2 font-medium text-foreground">Why this happened</p>
                    <ul className="space-y-1">
                      {result.noResultReasons.map((reason) => (
                        <li key={reason}>- {formatNoResultReason(reason)}</li>
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

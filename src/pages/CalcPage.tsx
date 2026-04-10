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
import { MERCHANT_SUGGESTIONS, SUBCATEGORY_LABELS } from '@/types'
import type { Category } from '@/types'
import { AmountInput } from './calc/AmountInput'
import { buildCalcRecommendationRequest } from './calc/buildCalcRecommendationRequest'
import { CardSelector } from './calc/CardSelector'
import { CategoryGrid } from './calc/CategoryGrid'
import { ResultPanel } from './calc/ResultPanel'
import { SubcategoryGrid } from './calc/SubcategoryGrid'

const DEFAULT_AMOUNT = '1200'
const DEFAULT_CATEGORY: Category = 'DINING'
const AUTO_SELECT_AMOUNT = 1200
const AUTO_SELECT_COUNT = 6

export function CalcPage() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT)
  const [amountTouched, setAmountTouched] = useState(false)
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY)
  const [subcategory, setSubcategory] = useState<string | null>(null)
  const [merchantName, setMerchantName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [cardSelectorError, setCardSelectorError] = useState<string | undefined>()
  const [activePlansByCard, setActivePlansByCard] = useState<Record<string, string>>({})
  const [planRuntimeByCard, setPlanRuntimeByCard] = useState<Record<string, Record<string, string>>>({})
  const [customExchangeRates, setCustomExchangeRates] = useState<Record<string, number>>({})
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
  const hasMerchantScopedScene = Boolean(
    category && subcategory && MERCHANT_SUGGESTIONS[`${category}:${subcategory}`]?.length,
  )
  const merchantPlaceholder =
    merchantSuggestions.length > 0
      ? `e.g. ${merchantSuggestions
          .slice(0, 3)
          .map((merchant) => merchant.label)
          .join(', ')}`
      : 'e.g. ChatGPT, Claude, Uber Eats'
  const benefitPlanTiers = Object.fromEntries(
    Object.entries(planRuntimeByCard)
      .map(([cardCode, runtime]) => [cardCode, runtime?.tier])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  )

  useEffect(() => {
    if (!cards || cards.length === 0) return

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

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Card Calculator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tune the scenario, adjust exchange rates, and compare the best cards side by side.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="min-w-0 space-y-5 rounded-xl border bg-card p-5 shadow-sm">
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

          <div className="space-y-2">
            <label htmlFor="calc-merchant-name" className="text-sm font-medium">
              Merchant / Channel hint
              <span className="ml-1 font-normal text-muted-foreground">
                (Examples: Agoda, Trip.com, ChatGPT)
              </span>
            </label>
            <Input
              id="calc-merchant-name"
              type="text"
              placeholder={merchantPlaceholder}
              value={merchantName}
              onChange={(event) => setMerchantName(event.target.value)}
            />
            {hasMerchantScopedScene && !merchantName.trim() && subcategory && (
              <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                Add a merchant when comparing {SUBCATEGORY_LABELS[subcategory] ?? subcategory} so
                the calculator can match bank-specific merchant promotions.
              </p>
            )}
            {merchantSuggestions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Suggested merchants</p>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment method</label>
            <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
          </div>

          <SwitchingCardPanel
            activePlansByCard={activePlansByCard}
            planRuntimeByCard={planRuntimeByCard}
            onActivePlanChange={handleActivePlanChange}
            onRuntimeChange={handleRuntimeChange}
            renderCardExtra={(cardCode, activePlan) =>
              cardCode === 'ESUN_UNICARD' && activePlan === 'ESUN_UNICARD_FLEXIBLE' ? (
                <MerchantPicker
                  value={planRuntimeByCard.ESUN_UNICARD?.selected_merchants ?? ''}
                  onChange={(value) => handleRuntimeChange('ESUN_UNICARD', 'selected_merchants', value)}
                />
              ) : null
            }
          />

          <InlineExchangeRatesPanel onChange={setCustomExchangeRates} />

          <CardSelector
            selected={selectedCards}
            onChange={(codes) => {
              setSelectedCards(codes)
              setCardSelectorError(undefined)
            }}
            error={cardSelectorError}
            isUpdating={isAutoSelecting}
          />

          <div className="sticky bottom-0 -mx-5 -mb-5 rounded-b-xl border-t bg-card/95 px-5 py-3 backdrop-blur-sm">
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
            <div className="flex min-h-56 items-center justify-center rounded-xl border bg-muted/20">
              <p className="px-4 text-center text-sm text-muted-foreground">
                Not enough recommendable cards were returned for this scenario. Try broadening the
                filters or selecting a different category.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

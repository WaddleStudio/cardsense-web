import { useEffect, useRef, useState } from 'react'
import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterChip } from '@/components/ui/filter-chip'
import { Input } from '@/components/ui/input'
import { MerchantPicker } from '@/components/MerchantPicker'
import { SwitchingCardPanel } from '@/components/SwitchingCardPanel'
import { useCards, useRecommendation } from '@/api'
import {
  MERCHANT_SUGGESTIONS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  SUBCATEGORY_LABELS,
} from '@/types'
import type { Category } from '@/types'
import { AmountInput } from './calc/AmountInput'
import { CategoryGrid } from './calc/CategoryGrid'
import { SubcategoryGrid } from './calc/SubcategoryGrid'
import { CardSelector } from './calc/CardSelector'
import { ResultPanel } from './calc/ResultPanel'

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
      ? `例如 ${merchantSuggestions.slice(0, 3).map((merchant) => merchant.label).join('、')}`
      : '例如 ChatGPT、Claude、Uber Eats'
  const benefitPlanTiers = Object.fromEntries(
    Object.entries(planRuntimeByCard)
      .map(([cardCode, runtime]) => [cardCode, runtime?.tier])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  )

  useEffect(() => {
    if (!cards || cards.length === 0) return

    autoSelectCards(
      {
        amount: AUTO_SELECT_AMOUNT,
        category,
        subcategory: subcategory ?? undefined,
        ...((merchantName.trim() || paymentMethod) && {
          scenario: {
            ...(merchantName.trim() && { merchantName: merchantName.trim().toUpperCase() }),
            ...(paymentMethod && { paymentMethod }),
          },
        }),
        ...(Object.keys(activePlansByCard).length > 0 && { activePlansByCard }),
        ...(Object.values(planRuntimeByCard).some((runtime) => Object.keys(runtime).length > 0) && { planRuntimeByCard }),
        ...(Object.keys(benefitPlanTiers).length > 0 && { benefitPlanTiers }),
        cardCodes: cards.map((c) => c.cardCode),
        comparison: {
          includePromotionBreakdown: false,
          maxResults: AUTO_SELECT_COUNT,
        },
      },
      {
        onSuccess: (res) => {
          const topCodes = res.recommendations
            .filter((r) => r.cardCode)
            .slice(0, AUTO_SELECT_COUNT)
            .map((r) => r.cardCode!)
          if (topCodes.length >= 2) {
            setSelectedCards(topCodes)
          }
        },
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, category, subcategory, merchantName, paymentMethod, activePlansByCard, planRuntimeByCard])

  const amountNum = parseInt(amount, 10)
  const amountError =
    amountTouched && (!amountNum || amountNum < 100 || amountNum > 100_000)
      ? '金額需介於 100 到 100,000 之間'
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
    } else {
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
  }

  function handleRuntimeChange(cardCode: string, key: string, value: string) {
    setPlanRuntimeByCard((prev) => ({
      ...prev,
      [cardCode]: { ...prev[cardCode], [key]: value },
    }))
  }

  const handleSubmit = () => {
    setAmountTouched(true)
    if (!amountNum || amountNum < 100 || amountNum > 100_000) return
    if (selectedCards.length < 2) {
      setCardSelectorError('請至少選擇 2 張卡片再比較')
      return
    }
    setCardSelectorError(undefined)

    getRecommendation(
      {
        amount: amountNum,
        category,
        subcategory: subcategory ?? undefined,
        ...((merchantName.trim() || paymentMethod) && {
          scenario: {
            ...(merchantName.trim() && { merchantName: merchantName.trim().toUpperCase() }),
            ...(paymentMethod && { paymentMethod }),
          },
        }),
        ...(Object.keys(activePlansByCard).length > 0 && { activePlansByCard }),
        ...(Object.values(planRuntimeByCard).some((runtime) => Object.keys(runtime).length > 0) && { planRuntimeByCard }),
        ...(Object.keys(benefitPlanTiers).length > 0 && { benefitPlanTiers }),
        cardCodes: selectedCards,
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 10,
        },
      },
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
        <h1 className="text-2xl font-bold tracking-tight">刷卡差異計算器</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          先設定消費情境，再比較不同卡片在同一筆消費下的回饋差距。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="min-w-0 space-y-5 rounded-xl border bg-card p-5 shadow-sm">
          <AmountInput
            value={amount}
            onChange={(v) => {
              setAmount(v)
              setAmountTouched(false)
            }}
            error={amountError}
          />

          <CategoryGrid
            value={category}
            onChange={(c) => {
              setCategory(c)
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
            <label className="text-sm font-medium">支付方式</label>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={paymentMethod === null} onClick={() => setPaymentMethod(null)}>
                不限方式
              </FilterChip>
              {PAYMENT_METHODS.map((method) => (
                <FilterChip
                  key={method.value}
                  active={paymentMethod === method.value}
                  onClick={() => setPaymentMethod(method.value)}
                >
                  {method.label}
                </FilterChip>
              ))}
            </div>
            {paymentMethod && (
              <p className="text-xs text-muted-foreground">
                已套用支付方式：{PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="calc-merchant-name" className="text-sm font-medium">
              指定商家 / 通路
              <span className="ml-1 font-normal text-muted-foreground">(像 Agoda、Trip.com、ChatGPT、全聯這類指定通路再填即可)</span>
            </label>
            <Input
              id="calc-merchant-name"
              type="text"
              placeholder={merchantPlaceholder}
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
            />
            {hasMerchantScopedScene && !merchantName.trim() && subcategory && (
              <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                {SUBCATEGORY_LABELS[subcategory] ?? subcategory} 場景常有指定商家優惠，補上通路後比較會更準。
              </p>
            )}
            {merchantSuggestions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">常見商家</p>
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

          <SwitchingCardPanel
            activePlansByCard={activePlansByCard}
            planRuntimeByCard={planRuntimeByCard}
            onActivePlanChange={handleActivePlanChange}
            onRuntimeChange={handleRuntimeChange}
            renderCardExtra={(cardCode, activePlan) =>
              cardCode === 'ESUN_UNICARD' && activePlan === 'ESUN_UNICARD_FLEXIBLE' ? (
                <MerchantPicker
                  value={planRuntimeByCard.ESUN_UNICARD?.selected_merchants ?? ''}
                  onChange={(v) => handleRuntimeChange('ESUN_UNICARD', 'selected_merchants', v)}
                />
              ) : null
            }
          />

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
            <Button className="min-h-touch w-full gap-2" onClick={handleSubmit} disabled={isPending || isAutoSelecting}>
              <Calculator className="h-4 w-4" />
              {isPending ? '計算中…' : '開始比較回饋'}
            </Button>
          </div>
        </div>

        <div ref={resultRef}>
          {!result && !isPending && (
            <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed bg-muted/20">
              <div className="text-center text-muted-foreground">
                <Calculator className="mx-auto mb-3 h-10 w-10 opacity-25" />
                <p className="text-sm">完成左側條件後，這裡會顯示比較結果。</p>
                <p className="text-sm">至少選兩張卡，才能看到差距分析。</p>
              </div>
            </div>
          )}

          {isPending && (
            <div className="space-y-3 rounded-xl border bg-muted/20 p-5">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-4">
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
            />
          )}

          {result && result.recommendations.length < 2 && (
            <div className="flex min-h-56 items-center justify-center rounded-xl border bg-muted/20">
              <p className="px-4 text-center text-sm text-muted-foreground">
                目前符合這個情境的卡片不到 2 張，暫時無法做差異比較。
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterChip } from '@/components/ui/filter-chip'
import { Input } from '@/components/ui/input'
import { useCards, useRecommendation } from '@/api'
import {
  MERCHANT_SUGGESTIONS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  SUBCATEGORY_LABELS,
  SWITCHING_CARD_STATE_CONFIG,
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
  const cubeTier = planRuntimeByCard.CATHAY_CUBE?.tier ?? 'LEVEL_1'

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
        ...(cubeTier && { benefitPlanTiers: { CATHAY_CUBE: cubeTier } }),
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
  }, [cards, category, subcategory, merchantName, paymentMethod, activePlansByCard, planRuntimeByCard, cubeTier])

  const amountNum = parseInt(amount, 10)
  const amountError =
    amountTouched && (!amountNum || amountNum < 100 || amountNum > 100_000)
      ? '金額需介於 100 到 100,000 之間'
      : undefined

  function clearSwitchingCardState(cardCode: string) {
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
        ...(cubeTier && { benefitPlanTiers: { CATHAY_CUBE: cubeTier } }),
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
            <div className="flex gap-1.5 overflow-x-auto pb-1">
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
              <p className="text-xs leading-relaxed text-amber-700">
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

          <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">切換卡片現況</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                若你要比較 CUBE、Unicard、Richart 這類切換權益卡，先指定目前生效方案，結果才會貼近你手上的真實現況。
              </p>
            </div>

            <div className="space-y-3">
              {SWITCHING_CARD_STATE_CONFIG.map((cardConfig) => {
                const activePlan = activePlansByCard[cardConfig.cardCode] ?? null
                const runtimeState = planRuntimeByCard[cardConfig.cardCode] ?? {}

                return (
                  <div key={cardConfig.cardCode} className="space-y-2 rounded-lg border border-border/70 bg-background px-3 py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{cardConfig.bankLabel} {cardConfig.cardLabel}</p>
                      <p className="text-xs text-muted-foreground">{cardConfig.description}</p>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">目前方案</p>
                      <div className="flex flex-wrap gap-1.5">
                        <FilterChip active={activePlan === null} onClick={() => clearSwitchingCardState(cardConfig.cardCode)}>
                          未指定
                        </FilterChip>
                        {cardConfig.plans.map((plan) => (
                          <FilterChip
                            key={plan.value}
                            active={activePlan === plan.value}
                            onClick={() => {
                              setActivePlansByCard((prev) => ({ ...prev, [cardConfig.cardCode]: plan.value }))
                              if (cardConfig.cardCode === 'CATHAY_CUBE') {
                                setPlanRuntimeByCard((prev) => ({
                                  ...prev,
                                  CATHAY_CUBE: {
                                    ...prev.CATHAY_CUBE,
                                    tier: prev.CATHAY_CUBE?.tier ?? 'LEVEL_1',
                                  },
                                }))
                              }
                            }}
                          >
                            {plan.label}
                          </FilterChip>
                        ))}
                      </div>
                      {activePlan && (
                        <p className="text-xs text-muted-foreground">
                          {cardConfig.plans.find((plan) => plan.value === activePlan)?.description}
                        </p>
                      )}
                    </div>

                    {cardConfig.runtimeFields?.map((field) => {
                      const currentValue = runtimeState[field.key] ?? (field.key === 'tier' ? 'LEVEL_1' : '')
                      return (
                        <div key={field.key} className="space-y-1.5">
                          <p className="text-xs text-muted-foreground">{field.label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {field.options.map((option) => (
                              <FilterChip
                                key={option.value}
                                active={currentValue === option.value}
                                onClick={() =>
                                  setPlanRuntimeByCard((prev) => ({
                                    ...prev,
                                    [cardConfig.cardCode]: {
                                      ...prev[cardConfig.cardCode],
                                      [field.key]: option.value,
                                    },
                                  }))
                                }
                              >
                                {option.label}
                              </FilterChip>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {field.options.find((option) => option.value === currentValue)?.description}
                          </p>
                        </div>
                      )
                    })}

                    {cardConfig.cardCode === 'ESUN_UNICARD' && activePlan === 'ESUN_UNICARD_FLEXIBLE' && (
                      <div className="space-y-1.5">
                        <label htmlFor="calc-unicard-selected-merchants" className="text-xs text-muted-foreground">
                          任意選已選商家
                        </label>
                        <Input
                          id="calc-unicard-selected-merchants"
                          type="text"
                          placeholder="例如 DECATHLON, UNIQLO, NET"
                          value={runtimeState.selected_merchants ?? ''}
                          onChange={(e) =>
                            setPlanRuntimeByCard((prev) => ({
                              ...prev,
                              ESUN_UNICARD: {
                                ...prev.ESUN_UNICARD,
                                selected_merchants: e.target.value,
                              },
                            }))
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          用逗號分隔已自選商家；比較任意選場景時，只有出現在這裡的商家才會納入。
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <CardSelector
            selected={selectedCards}
            onChange={(codes) => {
              setSelectedCards(codes)
              setCardSelectorError(undefined)
            }}
            error={cardSelectorError}
            isUpdating={isAutoSelecting}
          />

          <Button className="min-h-touch w-full gap-2" onClick={handleSubmit} disabled={isPending || isAutoSelecting}>
            <Calculator className="h-4 w-4" />
            {isPending ? '計算中…' : '開始比較回饋'}
          </Button>
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
            <div className="flex min-h-56 items-center justify-center rounded-xl border bg-muted/20">
              <p className="animate-pulse text-sm text-muted-foreground">正在計算中…</p>
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

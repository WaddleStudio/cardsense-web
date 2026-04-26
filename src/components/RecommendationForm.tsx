import { useState, type FormEvent } from 'react'
import { AlertCircle, Loader2, RotateCcw, Search, X } from 'lucide-react'
import { useRecommendation } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterChip } from '@/components/ui/filter-chip'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MerchantPicker } from '@/components/MerchantPicker'
import { PaymentMethodPicker } from '@/components/PaymentMethodPicker'
import { SwitchingCardPanel } from '@/components/SwitchingCardPanel'
import { ExchangeRatesPanel } from '@/components/ExchangeRatesPanel'
import { SubcategoryGrid } from '@/pages/calc/SubcategoryGrid'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CHANNELS,
  CHANNEL_LABELS,
  MERCHANT_SUGGESTIONS,
  POPULAR_MERCHANT_SHORTCUTS,
  SUBCATEGORY_LABELS,
} from '@/types'
import type { Category, Channel, RecommendationResponse } from '@/types'

const QUICK_AMOUNTS = [500, 1000, 3000, 5000]
const PRIMARY_MERCHANT_SHORTCUTS = [
  { value: 'PXMART', label: '全聯' },
  { value: 'CARREFOUR', label: '家樂福' },
  { value: 'MOMO', label: 'momo' },
  { value: 'SHOPEE', label: '蝦皮' },
  { value: 'AGODA', label: 'Agoda' },
  { value: 'STARBUCKS', label: '星巴克' },
  { value: 'UBER_EATS', label: 'Uber Eats' },
] as const
const MERCHANT_SHORTCUT_SCENES = {
  PXMART: { category: 'GROCERY', subcategory: 'SUPERMARKET' },
  CARREFOUR: { category: 'GROCERY', subcategory: 'SUPERMARKET' },
  MOMO: { category: 'ONLINE', subcategory: 'ECOMMERCE' },
  SHOPEE: { category: 'ONLINE', subcategory: 'ECOMMERCE' },
  AGODA: { category: 'ONLINE', subcategory: 'TRAVEL_PLATFORM' },
  STARBUCKS: { category: 'DINING', subcategory: 'CAFE' },
  UBER_EATS: { category: 'DINING', subcategory: 'DELIVERY' },
} as const

interface Props {
  onResult: (result: RecommendationResponse) => void
  prefillCard?: string
}

export function RecommendationForm({ onResult, prefillCard }: Props) {
  const [amount, setAmount] = useState('')
  const [amountTouched, setAmountTouched] = useState(false)
  const [category, setCategory] = useState<Category | ''>('')
  const [subcategory, setSubcategory] = useState<string | null>(null)
  const [channel, setChannel] = useState<Channel | ''>('')
  const [merchantName, setMerchantName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<string | undefined>(prefillCard)
  const [activePlansByCard, setActivePlansByCard] = useState<Record<string, string>>({})
  const [planRuntimeByCard, setPlanRuntimeByCard] = useState<Record<string, Record<string, string>>>({})
  const [customExchangeRates, setCustomExchangeRates] = useState<Record<string, number>>({})

  const mutation = useRecommendation()
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
  const hasSceneSpecificMerchantSuggestions = Boolean(category && subcategory && merchantSuggestions.length > 0)
  const subcategoryLabel = subcategory ? (SUBCATEGORY_LABELS[subcategory] ?? subcategory) : null
  const merchantPlaceholder =
    displayedMerchantSuggestions.length > 0
      ? `例如 ${displayedMerchantSuggestions.slice(0, 3).map((merchant) => merchant.label).join('、')}`
      : '例如 全聯、momo、Agoda、ChatGPT'

  const benefitPlanTiers = Object.fromEntries(
    Object.entries(planRuntimeByCard)
      .map(([cardCode, runtime]) => [cardCode, runtime?.tier])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  )
  const amountNum = Number(amount)
  const amountError = amountTouched && amount !== '' && (Number.isNaN(amountNum) || amountNum <= 0)
  const canSubmit = Boolean(amount && !amountError && category && !mutation.isPending)

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

  function handleMerchantShortcutClick(merchantValue: (typeof PRIMARY_MERCHANT_SHORTCUTS)[number]['value']) {
    setMerchantName(merchantValue)
    const scene = MERCHANT_SHORTCUT_SCENES[merchantValue]
    if (!scene) return
    setCategory(scene.category)
    setSubcategory(scene.subcategory)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setAmountTouched(true)
    if (!canSubmit) return

    mutation.mutate(
      {
        amount: amountNum,
        category: category as Category,
        subcategory: subcategory ?? undefined,
        ...((channel || merchantName.trim() || paymentMethod) && {
          scenario: {
            ...(channel && { channel: channel as Channel }),
            ...(merchantName.trim() && { merchantName: merchantName.trim().toUpperCase() }),
            ...(paymentMethod && { paymentMethod }),
          },
        }),
        ...(Object.keys(activePlansByCard).length > 0 && { activePlansByCard }),
        ...(Object.values(planRuntimeByCard).some((runtime) => Object.keys(runtime).length > 0) && { planRuntimeByCard }),
        ...(Object.keys(benefitPlanTiers).length > 0 && { benefitPlanTiers }),
        ...(selectedCard && { cardCodes: [selectedCard] }),
        ...(Object.keys(customExchangeRates).length > 0 && { customExchangeRates }),
        comparison: {
          includePromotionBreakdown: true,
          includeBreakEvenAnalysis: true,
          maxResults: 10,
        },
      },
      { onSuccess: onResult },
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          推薦條件
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {selectedCard && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="shrink-0 text-muted-foreground">指定卡片</span>
              <span className="flex-1 truncate font-medium">{selectedCard}</span>
              <button
                type="button"
                onClick={() => setSelectedCard(undefined)}
                className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="清除指定卡片"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-1">
              消費金額
              <span className="font-normal text-muted-foreground">(NT$)</span>
              <span className="ml-0.5 text-destructive" aria-hidden>*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              min={0}
              placeholder="例如 1200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => setAmountTouched(true)}
              aria-invalid={amountError || undefined}
              aria-describedby={amountError ? 'amount-error' : undefined}
              required
            />
            {amountError && (
              <p id="amount-error" className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                金額需大於 0
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setAmount(String(v))
                    setAmountTouched(false)
                  }}
                  className="min-h-touch-sm cursor-pointer rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {v.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <Label htmlFor="merchantName" className="text-sm font-semibold text-foreground">
                  先輸入商家也可以
                </Label>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  想直接問「我去全聯刷哪張？」時，先填商家名稱，再搭配金額與類別縮小範圍。
                </p>
              </div>
              {merchantName.trim() && (
                <button
                  type="button"
                  onClick={() => setMerchantName('')}
                  className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  清除
                </button>
              )}
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="space-y-3">
                <Input
                  id="merchantName"
                  type="text"
                  placeholder={merchantPlaceholder}
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                />

                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">熱門商家捷徑</p>
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
                  category &&
                  merchantName.trim().toUpperCase() in MERCHANT_SHORTCUT_SCENES && (
                    <p className="text-xs text-muted-foreground">
                      已帶入 {CATEGORY_LABELS[category]}
                      {subcategoryLabel ? ` / ${subcategoryLabel}` : ''}
                      ，你也可以再手動改成別的消費情境。
                    </p>
                  )}

                {!category && merchantName.trim() && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    已指定商家，接著補上消費類別後，推薦會更精準。
                  </p>
                )}

                {hasSceneSpecificMerchantSuggestions && !merchantName.trim() && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {subcategoryLabel ? `這個${subcategoryLabel}場景` : '這個消費場景'}常有指定商家優惠，補上通路後命中會更準。
                  </p>
                )}

                {merchantSuggestions.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">
                      {subcategoryLabel ? `${subcategoryLabel}常見商家` : '這個類別常見商家'}
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

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              消費類別
              <span className="ml-0.5 text-destructive" aria-hidden>*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(v: string) => {
                setCategory(v as Category)
                setSubcategory(null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="請選擇消費類別" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category && (
            <SubcategoryGrid
              category={category}
              value={subcategory}
              onChange={(value) => {
                setSubcategory(value)
              }}
            />
          )}

          <div className="space-y-2">
            <Label>支付方式</Label>
            <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
          </div>

          <SwitchingCardPanel
            activePlansByCard={activePlansByCard}
            planRuntimeByCard={planRuntimeByCard}
            onActivePlanChange={handleActivePlanChange}
            onRuntimeChange={handleRuntimeChange}
            filterCardCodes={selectedCard ? [selectedCard] : undefined}
            renderCardExtra={(cardCode, activePlan) =>
              cardCode === 'ESUN_UNICARD' && activePlan === 'ESUN_UNICARD_FLEXIBLE' ? (
                <MerchantPicker
                  value={planRuntimeByCard.ESUN_UNICARD?.selected_merchants ?? ''}
                  onChange={(v) => handleRuntimeChange('ESUN_UNICARD', 'selected_merchants', v)}
                />
              ) : null
            }
          />

          <div className="space-y-2">
            <Label>消費通路</Label>
            <Select
              value={channel || '__NONE__'}
              onValueChange={(v: string) => setChannel(v === '__NONE__' ? '' : (v as Channel))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__NONE__">不限通路</SelectItem>
                {CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CHANNEL_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-1">
            <ExchangeRatesPanel onChange={setCustomExchangeRates} />
          </div>

          {mutation.error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p>推薦請求失敗，請稍後再試，或檢查 API 是否已更新。</p>
              </div>
              <button
                type="submit"
                className="flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium hover:underline"
                aria-label="重新送出"
              >
                <RotateCcw className="h-3 w-3" />
                重試
              </button>
            </div>
          )}

          <Button type="submit" className="min-h-touch w-full cursor-pointer font-medium" disabled={!canSubmit}>
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="mr-1.5 h-4 w-4" />
                取得推薦
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

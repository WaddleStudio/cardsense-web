import { useState, useEffect, useRef } from 'react'
import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCards, useRecommendation } from '@/api'
import type { Category } from '@/types'
import { AmountInput } from './calc/AmountInput'
import { CategoryGrid } from './calc/CategoryGrid'
import { CardSelector } from './calc/CardSelector'
import { ResultPanel } from './calc/ResultPanel'

const DEFAULT_AMOUNT = '1200'
const DEFAULT_CATEGORY: Category = 'DINING'
// Amount used purely for auto-selecting popular cards per category
const AUTO_SELECT_AMOUNT = 1200
const AUTO_SELECT_COUNT = 6

export function CalcPage() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT)
  const [amountTouched, setAmountTouched] = useState(false)
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY)
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [cardSelectorError, setCardSelectorError] = useState<string | undefined>()
  const resultRef = useRef<HTMLDivElement>(null)
  const cardsReadyRef = useRef(false)

  const { data: cards } = useCards()
  // Main mutation: user-triggered, result shown on right panel
  const { mutate: getRecommendation, data: result, isPending } = useRecommendation()
  // Secondary mutation: category-change-triggered, only used to update selectedCards
  const { mutate: autoSelectCards, isPending: isAutoSelecting } = useRecommendation()

  // When cards load or category changes: auto-select popular cards via API ranking
  useEffect(() => {
    if (!cards || cards.length === 0) return
    cardsReadyRef.current = true

    autoSelectCards(
      {
        amount: AUTO_SELECT_AMOUNT,
        category,
        cardCodes: cards.map((c) => c.cardCode),
        comparison: {
          mode: 'BEST_SINGLE_PROMOTION',
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
          // Only update if we got results; otherwise keep current selection
          if (topCodes.length >= 2) setSelectedCards(topCodes)
        },
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, category])

  const amountNum = parseInt(amount, 10)
  const amountError =
    amountTouched && (!amountNum || amountNum < 100 || amountNum > 100_000)
      ? '請輸入 100–100,000 的整數'
      : undefined

  const handleSubmit = () => {
    setAmountTouched(true)
    if (!amountNum || amountNum < 100 || amountNum > 100_000) return
    if (selectedCards.length < 2) {
      setCardSelectorError('請至少勾選 2 張卡片才能比較')
      return
    }
    setCardSelectorError(undefined)

    getRecommendation(
      {
        amount: amountNum,
        category,
        cardCodes: selectedCards,
        comparison: {
          mode: 'BEST_SINGLE_PROMOTION',
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
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">刷錯卡，你虧了多少？</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          輸入一筆消費，看看你的卡片回饋差多少。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left column: input form */}
        <div className="rounded-xl border bg-card p-5 space-y-5 shadow-sm h-fit">
          <AmountInput
            value={amount}
            onChange={(v) => {
              setAmount(v)
              setAmountTouched(false)
            }}
            error={amountError}
          />

          <CategoryGrid value={category} onChange={setCategory} />

          <CardSelector
            selected={selectedCards}
            onChange={(codes) => {
              setSelectedCards(codes)
              setCardSelectorError(undefined)
            }}
            error={cardSelectorError}
            isUpdating={isAutoSelecting}
          />

          <Button className="w-full gap-2" onClick={handleSubmit} disabled={isPending || isAutoSelecting}>
            <Calculator className="h-4 w-4" />
            {isPending ? '計算中...' : '算出我的損失'}
          </Button>
        </div>

        {/* Right column: results */}
        <div ref={resultRef}>
          {!result && !isPending && (
            <div className="flex h-full min-h-56 items-center justify-center rounded-xl border border-dashed bg-muted/20">
              <div className="text-center text-muted-foreground">
                <Calculator className="mx-auto h-10 w-10 opacity-25 mb-3" />
                <p className="text-sm">填寫左側條件後</p>
                <p className="text-sm">按下「算出我的損失」</p>
              </div>
            </div>
          )}

          {isPending && (
            <div className="flex h-full min-h-56 items-center justify-center rounded-xl border bg-muted/20">
              <p className="text-sm text-muted-foreground animate-pulse">計算中，請稍候...</p>
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
            <div className="flex h-full min-h-56 items-center justify-center rounded-xl border bg-muted/20">
              <p className="text-sm text-muted-foreground text-center px-4">
                找不到足夠的卡片比較結果，請重新選擇卡片或調整消費類別。
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

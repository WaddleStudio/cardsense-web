import { useState, type FormEvent } from 'react'
import { useRecommendation } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SubcategoryGrid } from '@/pages/calc/SubcategoryGrid'
import { Loader2, Search, X, AlertCircle, RotateCcw } from 'lucide-react'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CHANNELS,
  CHANNEL_LABELS,
} from '@/types'
import type { RecommendationResponse, Category, Channel } from '@/types'

const QUICK_AMOUNTS = [500, 1000, 3000, 5000]

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
  const [selectedCard, setSelectedCard] = useState<string | undefined>(prefillCard)

  const mutation = useRecommendation()

  const amountNum = Number(amount)
  const amountError = amountTouched && amount !== '' && (isNaN(amountNum) || amountNum <= 0)
  const canSubmit = amount && !amountError && category && !mutation.isPending

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setAmountTouched(true)
    if (!canSubmit) return

    mutation.mutate(
      {
        amount: amountNum,
        category: category as Category,
        subcategory: subcategory ?? undefined,
        ...(channel && { scenario: { channel: channel as Channel } }),
        ...(selectedCard && { cardCodes: [selectedCard] }),
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
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          消費情境
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Selected card indicator */}
          {selectedCard && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-muted-foreground shrink-0">指定卡片：</span>
              <span className="font-medium truncate flex-1">{selectedCard}</span>
              <button
                type="button"
                onClick={() => setSelectedCard(undefined)}
                className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                aria-label="清除指定卡片"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-1">
              消費金額
              <span className="text-muted-foreground font-normal">(NT$)</span>
              <span className="text-destructive ml-0.5" aria-hidden>*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              min={0}
              placeholder="例：1200"
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
                  onClick={() => { setAmount(String(v)); setAmountTouched(false) }}
                  className="min-h-[36px] rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary transition-colors cursor-pointer"
                >
                  {v.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              消費類別
              <span className="text-destructive ml-0.5" aria-hidden>*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(v: string) => {
                setCategory(v as Category)
                setSubcategory(null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇消費類別" />
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
              onChange={setSubcategory}
            />
          )}

          {/* Channel */}
          <div className="space-y-2">
            <Label>消費通路</Label>
            <Select
              value={channel || '__NONE__'}
              onValueChange={(v: string) => setChannel(v === '__NONE__' ? '' : v as Channel)}
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

          {/* API error */}
          {mutation.error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p>推薦失敗，請確認 API 是否運行中</p>
              </div>
              <button
                type="submit"
                className="shrink-0 flex items-center gap-1 text-xs font-medium hover:underline cursor-pointer"
                aria-label="重試"
              >
                <RotateCcw className="h-3 w-3" />
                重試
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full min-h-[44px] font-medium cursor-pointer"
            disabled={!canSubmit}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4 mr-1.5" />
                查詢推薦
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

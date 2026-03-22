import { useState } from 'react'
import { useRecommendation } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Loader2, Search, HelpCircle } from 'lucide-react'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CHANNELS,
  CHANNEL_LABELS,
  COMPARISON_MODES,
  COMPARISON_MODE_LABELS,
} from '@/types'
import type { RecommendationResponse, Category, Channel, ComparisonMode } from '@/types'

const QUICK_AMOUNTS = [500, 1000, 3000, 5000]

interface Props {
  onResult: (result: RecommendationResponse) => void
  prefillCard?: string
}

export function RecommendationForm({ onResult, prefillCard }: Props) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [channel, setChannel] = useState<Channel | ''>('')
  const [mode, setMode] = useState<ComparisonMode>('BEST_SINGLE_PROMOTION')
  const [selectedCard, setSelectedCard] = useState<string | undefined>(prefillCard)

  const mutation = useRecommendation()

  const amountNum = Number(amount)
  const amountError = amount !== '' && (isNaN(amountNum) || amountNum <= 0)
  const canSubmit = amount && !amountError && category && !mutation.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    mutation.mutate(
      {
        amount: amountNum,
        category: category as Category,
        ...(channel && { scenario: { channel: channel as Channel } }),
        ...(selectedCard && { cardCodes: [selectedCard] }),
        comparison: {
          mode,
          includePromotionBreakdown: true,
          includeBreakEvenAnalysis: mode === 'STACK_ALL_ELIGIBLE',
          maxResults: 10,
        },
      },
      { onSuccess: onResult },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">消費情境</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected card indicator */}
          {selectedCard && (
            <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm">
              <span className="text-muted-foreground">指定卡片：</span>
              <span className="font-medium">{selectedCard}</span>
              <button
                type="button"
                onClick={() => setSelectedCard(undefined)}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                清除
              </button>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">消費金額 (NT$)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              placeholder="例：1200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={amountError || undefined}
            />
            {amountError && (
              <p className="text-xs text-destructive">金額需大於 0</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_AMOUNTS.map((v) => (
                <Button
                  key={v}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setAmount(String(v))}
                >
                  {v.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>消費類別</Label>
            <Select value={category} onValueChange={(v: string) => setCategory(v as Category)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇類別" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!category && amount && !amountError && (
              <p className="text-xs text-muted-foreground">請選擇消費類別</p>
            )}
          </div>

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
                <SelectItem value="__NONE__">不限</SelectItem>
                {CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CHANNEL_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comparison mode */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label>比較模式</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[260px] text-xs">
                    <p className="font-medium mb-1">最佳單一優惠</p>
                    <p className="mb-2">只考慮單筆最高回饋的優惠方案</p>
                    <p className="font-medium mb-1">所有可疊加優惠</p>
                    <p>計算所有可同時適用的優惠總和回饋</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={mode} onValueChange={(v: string) => setMode(v as ComparisonMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPARISON_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {COMPARISON_MODE_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mutation.error && (
            <p className="text-sm text-destructive">
              推薦失敗，請確認 API 是否運行中。
            </p>
          )}

          <Button type="submit" className="w-full" disabled={!canSubmit}>
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

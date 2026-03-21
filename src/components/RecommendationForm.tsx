import { useState } from 'react'
import { useRecommendation } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search } from 'lucide-react'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CHANNELS,
  CHANNEL_LABELS,
  COMPARISON_MODES,
  COMPARISON_MODE_LABELS,
} from '@/types'
import type { RecommendationResponse, Category, Channel, ComparisonMode } from '@/types'

interface Props {
  onResult: (result: RecommendationResponse) => void
}

export function RecommendationForm({ onResult }: Props) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [channel, setChannel] = useState<Channel | ''>('')
  const [mode, setMode] = useState<ComparisonMode>('BEST_SINGLE_PROMOTION')

  const mutation = useRecommendation()

  const canSubmit = amount && category && !mutation.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    mutation.mutate(
      {
        amount: Number(amount),
        category: category as Category,
        ...(channel && { scenario: { channel: channel as Channel } }),
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
          <div className="space-y-2">
            <Label htmlFor="amount">消費金額 (NT$)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              placeholder="例：1200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

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
          </div>

          <div className="space-y-2">
            <Label>消費通路</Label>
            <Select value={channel} onValueChange={(v: string) => setChannel(v as Channel)}>
              <SelectTrigger>
                <SelectValue placeholder="不限" />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CHANNEL_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>比較模式</Label>
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

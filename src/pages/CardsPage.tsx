import { useState } from 'react'
import { useCards, useBanks } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Loader2 } from 'lucide-react'

export function CardsPage() {
  const [bankFilter, setBankFilter] = useState<string>('')
  const { data: banks } = useBanks()
  const { data: cards, isLoading, error } = useCards(
    bankFilter ? { bank: bankFilter } : undefined,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">卡片目錄</h1>
          <p className="text-muted-foreground text-sm mt-1">
            瀏覽所有已收錄的信用卡
          </p>
        </div>

        <Select value={bankFilter} onValueChange={(v: string) => setBankFilter(v === 'ALL' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="篩選銀行" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">全部銀行</SelectItem>
            {banks?.map((b) => (
              <SelectItem key={b.code} value={b.code}>
                {b.nameZh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          無法載入卡片資料，請確認 API 是否運行中。
        </div>
      )}

      {cards && cards.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          沒有找到符合條件的卡片
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards?.map((card) => (
          <Card key={card.cardCode}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-medium leading-tight">
                    {card.cardName}
                  </CardTitle>
                </div>
                <Badge
                  variant={card.cardStatus === 'ACTIVE' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {card.cardStatus === 'ACTIVE' ? '發行中' : '已停發'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>銀行</span>
                <span className="text-foreground">{card.bankName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>年費</span>
                <span className="text-foreground">
                  {card.annualFee != null
                    ? card.annualFee === 0
                      ? '免年費'
                      : `NT$ ${card.annualFee.toLocaleString()}`
                    : '—'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {card.recommendationScopes.map((scope) => (
                  <Badge key={scope} variant="outline" className="text-xs">
                    {scope}
                  </Badge>
                ))}
              </div>
              {card.applyUrl && (
                <a
                  href={card.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs text-primary hover:underline pt-1"
                >
                  申請連結
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

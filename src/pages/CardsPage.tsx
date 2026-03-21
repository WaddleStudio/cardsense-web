import { useState, useMemo } from 'react'
import { useCards, useBanks } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Loader2, Search, X, ExternalLink } from 'lucide-react'
import type { CardSummary } from '@/types'

const SCOPE_LABELS: Record<string, string> = {
  RECOMMENDABLE: '可推薦',
  CATALOG_ONLY: '僅目錄',
  FUTURE_SCOPE: '未來擴充',
}

export function CardsPage() {
  const [bankFilter, setBankFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const { data: banks } = useBanks()
  const { data: cards, isLoading, error } = useCards()

  const filteredCards = useMemo(() => {
    if (!cards) return []
    let result = cards
    if (bankFilter) {
      result = result.filter((c) => c.bankCode === bankFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.cardName.toLowerCase().includes(q) ||
          c.bankName.toLowerCase().includes(q),
      )
    }
    return result
  }, [cards, bankFilter, search])

  const bankCounts = useMemo(() => {
    if (!cards) return {}
    const counts: Record<string, number> = {}
    for (const c of cards) {
      counts[c.bankCode] = (counts[c.bankCode] || 0) + 1
    }
    return counts
  }, [cards])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">卡片目錄</h1>
        <p className="text-muted-foreground text-sm mt-1">
          瀏覽所有已收錄的信用卡
          {cards && <span className="ml-1">（共 {cards.length} 張）</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋卡片名稱或銀行..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Bank filter chips */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={bankFilter === '' ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-7"
            onClick={() => setBankFilter('')}
          >
            全部{cards ? ` (${cards.length})` : ''}
          </Button>
          {banks?.map((b) => (
            <Button
              key={b.code}
              variant={bankFilter === b.code ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7"
              onClick={() => setBankFilter(bankFilter === b.code ? '' : b.code)}
            >
              {b.nameZh}
              {bankCounts[b.code] ? ` (${bankCounts[b.code]})` : ''}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          無法載入卡片資料，請確認 API 是否運行中。
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && filteredCards.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          沒有找到符合條件的卡片
        </p>
      )}

      {/* Results count */}
      {!isLoading && filteredCards.length > 0 && (bankFilter || search) && (
        <p className="text-xs text-muted-foreground">
          顯示 {filteredCards.length} 張卡片
        </p>
      )}

      {/* Card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCards.map((card) => (
          <CardItem key={card.cardCode} card={card} />
        ))}
      </div>
    </div>
  )
}

function CardItem({ card }: { card: CardSummary }) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CreditCard className="h-4 w-4 text-primary shrink-0" />
            <CardTitle className="text-sm font-medium leading-tight truncate">
              {card.cardName}
            </CardTitle>
          </div>
          <Badge
            variant={card.cardStatus === 'ACTIVE' ? 'default' : 'secondary'}
            className="text-xs shrink-0"
          >
            {card.cardStatus === 'ACTIVE' ? '發行中' : '已停發'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2 flex-1">
        <div className="flex justify-between text-muted-foreground">
          <span>銀行</span>
          <span className="text-foreground">{card.bankName}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>年費</span>
          <span className="text-foreground font-medium">
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
              {SCOPE_LABELS[scope] ?? scope}
            </Badge>
          ))}
        </div>
      </CardContent>
      {card.applyUrl && (
        <div className="px-6 pb-4">
          <a
            href={card.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            申請連結
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </Card>
  )
}

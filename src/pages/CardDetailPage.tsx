import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCard, useCardPromotions } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreditCard, ArrowLeft, ExternalLink, Search, AlertCircle, RotateCcw, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/types'
import type { CardPromotion, Category } from '@/types'

const SCOPE_LABELS: Record<string, string> = {
  RECOMMENDABLE: '可推薦',
  CATALOG_ONLY: '僅目錄',
  FUTURE_SCOPE: '未來擴充',
}

export function CardDetailPage() {
  const { cardCode } = useParams<{ cardCode: string }>()
  const navigate = useNavigate()
  const { data: card, isLoading, error, refetch } = useCard(cardCode!)
  const { data: promotions } = useCardPromotions(cardCode!)

  const groupedPromotions = useMemo(() => {
    if (!promotions) return {}
    const groups: Record<string, CardPromotion[]> = {}
    for (const p of promotions) {
      const cat = p.category || 'OTHER'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(p)
    }
    return groups
  }, [promotions])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="rounded-xl border bg-card p-6 space-y-4 animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted" />
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
              </div>
            </div>
            <div className="h-6 w-14 rounded-full bg-muted" />
          </div>
          <Separator />
          <div className="flex justify-between">
            <div className="h-4 w-8 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">無法載入卡片資料</p>
            <p className="text-xs text-destructive/80 mt-0.5">請確認 API 是否運行中</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 cursor-pointer"
            onClick={() => void refetch()}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            重試
          </Button>
        </div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <CreditCard className="h-7 w-7 opacity-40" />
          </div>
          <p className="text-sm">找不到此卡片</p>
        </div>
      </div>
    )
  }

  const isActive = card.cardStatus === 'ACTIVE'
  const isFree = card.annualFee === 0

  return (
    <div className="space-y-6">
      <BackLink />

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg leading-tight">{card.cardName}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{card.bankName}</p>
              </div>
            </div>
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className="shrink-0 rounded-full"
            >
              {isActive ? '發行中' : '已停發'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Annual fee */}
          <div className="flex justify-between items-center text-sm py-1">
            <span className="text-muted-foreground">年費</span>
            <span className={cn(
              'font-semibold tabular-nums text-base',
              isFree ? 'text-reward' : 'text-foreground',
            )}>
              {card.annualFee != null
                ? isFree
                  ? '免年費'
                  : `NT$ ${card.annualFee.toLocaleString()}`
                : '—'}
            </span>
          </div>

          <Separator />

          {/* Scopes */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              推薦範圍
            </p>
            <div className="flex flex-wrap gap-1.5">
              {card.recommendationScopes.map((scope) => (
                <Badge key={scope} variant="outline" className="rounded-full">
                  {SCOPE_LABELS[scope] ?? scope}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {card.applyUrl && (
              <Button asChild variant="outline" className="cursor-pointer">
                <a href={card.applyUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  前往申辦
                </a>
              </Button>
            )}
            <Button
              className="cursor-pointer"
              onClick={() => navigate('/', { state: { prefillCard: card.cardCode } })}
            >
              <Search className="h-4 w-4 mr-1.5" />
              用這張卡查推薦
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Promotions */}
      {promotions && promotions.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              優惠資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedPromotions).map(([cat, promos]) => (
              <div key={cat}>
                <p className="text-sm font-semibold mb-3">
                  {CATEGORY_LABELS[cat as Category] ?? cat}
                </p>
                <div className="space-y-3">
                  {promos.map((p) => (
                    <PromotionItem key={p.promoVersionId} promotion={p} />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PromotionItem({ promotion }: { promotion: CardPromotion }) {
  const isMutuallyExclusive = promotion.stackability?.relationshipMode === 'MUTUALLY_EXCLUSIVE'
  const cashbackDisplay = promotion.cashbackType === 'FIXED'
    ? `NT$ ${promotion.cashbackValue}`
    : promotion.cashbackType === 'POINTS'
      ? `${promotion.cashbackValue} 點`
      : `${promotion.cashbackValue}%`

  const modeHint = promotion.conditions?.find(
    (c) => c.type === 'TEXT' && c.value?.includes('切換'),
  )

  return (
    <div className="rounded-lg border p-3 space-y-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium leading-tight">{promotion.title ?? cashbackDisplay}</p>
        <span className={cn(
          'shrink-0 font-semibold tabular-nums',
          'text-reward',
        )}>
          {cashbackDisplay}
        </span>
      </div>

      {/* Validity */}
      {(promotion.validFrom || promotion.validUntil) && (
        <p className="text-xs text-muted-foreground">
          {promotion.validFrom ?? '—'} ~ {promotion.validUntil ?? '—'}
        </p>
      )}

      {/* Conditions */}
      <div className="flex flex-wrap gap-1.5">
        {promotion.minAmount != null && promotion.minAmount > 0 && (
          <Badge variant="outline" className="text-xs rounded-full">
            最低消費 {promotion.minAmount} 元
          </Badge>
        )}
        {promotion.maxCashback != null && (
          <Badge variant="outline" className="text-xs rounded-full">
            封頂 {promotion.maxCashback} 元
          </Badge>
        )}
        {promotion.requiresRegistration && (
          <Badge variant="outline" className="text-xs rounded-full">
            需登錄
          </Badge>
        )}
        {promotion.frequencyLimit && promotion.frequencyLimit !== 'NONE' && (
          <Badge variant="outline" className="text-xs rounded-full">
            {promotion.frequencyLimit}
          </Badge>
        )}
        {promotion.conditions?.filter((c) => c.type !== 'TEXT').map((c, i) => (
          <Badge key={i} variant="outline" className="text-xs rounded-full">
            {c.label || `${c.type}: ${c.value}`}
          </Badge>
        ))}
      </div>

      {/* Mutually exclusive warning */}
      {isMutuallyExclusive && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{modeHint?.label || modeHint?.value || '需切換權益模式'}</span>
        </div>
      )}
    </div>
  )
}

function BackLink() {
  return (
    <Link
      to="/cards"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      返回卡片目錄
    </Link>
  )
}

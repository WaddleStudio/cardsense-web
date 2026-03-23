import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCard } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreditCard, ArrowLeft, ExternalLink, Search, AlertCircle, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

const SCOPE_LABELS: Record<string, string> = {
  RECOMMENDABLE: '可推薦',
  CATALOG_ONLY: '僅目錄',
  FUTURE_SCOPE: '未來擴充',
}

export function CardDetailPage() {
  const { cardCode } = useParams<{ cardCode: string }>()
  const navigate = useNavigate()
  const { data: card, isLoading, error, refetch } = useCard(cardCode!)

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
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{card.cardName}</CardTitle>
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

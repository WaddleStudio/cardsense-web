import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCard } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreditCard, ArrowLeft, ExternalLink, Search, Loader2 } from 'lucide-react'

const SCOPE_LABELS: Record<string, string> = {
  RECOMMENDABLE: '可推薦',
  CATALOG_ONLY: '僅目錄',
  FUTURE_SCOPE: '未來擴充',
}

export function CardDetailPage() {
  const { cardCode } = useParams<{ cardCode: string }>()
  const navigate = useNavigate()
  const { data: card, isLoading, error } = useCard(cardCode!)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          無法載入卡片資料，請確認 API 是否運行中。
        </div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <CreditCard className="h-8 w-8 opacity-40" />
          <p className="text-sm">找不到此卡片</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BackLink />

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary shrink-0" />
              <div>
                <CardTitle>{card.cardName}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{card.bankName}</p>
              </div>
            </div>
            <Badge
              variant={card.cardStatus === 'ACTIVE' ? 'default' : 'secondary'}
              className="shrink-0"
            >
              {card.cardStatus === 'ACTIVE' ? '發行中' : '已停發'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Annual fee */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">年費</span>
            <span className="font-medium">
              {card.annualFee != null
                ? card.annualFee === 0
                  ? '免年費'
                  : `NT$ ${card.annualFee.toLocaleString()}`
                : '—'}
            </span>
          </div>

          <Separator />

          {/* Scopes */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">推薦範圍</p>
            <div className="flex flex-wrap gap-1.5">
              {card.recommendationScopes.map((scope) => (
                <Badge key={scope} variant="outline">
                  {SCOPE_LABELS[scope] ?? scope}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {card.applyUrl && (
              <Button asChild variant="outline">
                <a href={card.applyUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  前往申辦
                </a>
              </Button>
            )}
            <Button
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

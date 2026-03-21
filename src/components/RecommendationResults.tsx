import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ChevronDown,
  ChevronUp,
  Trophy,
  Medal,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Info,
} from 'lucide-react'
import type { CardRecommendation, RecommendationResponse } from '@/types'

interface Props {
  result: RecommendationResponse | null
}

export function RecommendationResults({ result }: Props) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-muted-foreground gap-3">
        <Sparkles className="h-8 w-8 opacity-40" />
        <p className="text-sm">填寫左側表單後，推薦結果將顯示在此</p>
      </div>
    )
  }

  const { recommendations, comparison, disclaimer } = result

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-muted-foreground gap-3">
        <Info className="h-8 w-8 opacity-40" />
        <p className="text-sm">沒有找到符合條件的推薦</p>
      </div>
    )
  }

  const topRec = recommendations[0]

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="flex items-center gap-4 rounded-lg bg-muted/50 px-4 py-2.5 text-sm">
        <span className="text-muted-foreground">
          評估 <strong className="text-foreground">{comparison.evaluatedPromotionCount}</strong> 個優惠
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-muted-foreground">
          符合 <strong className="text-foreground">{comparison.eligiblePromotionCount}</strong> 個
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-muted-foreground">
          排名 <strong className="text-foreground">{comparison.rankedCardCount}</strong> 張卡
        </span>
      </div>

      {/* Top pick highlight */}
      <TopPickCard rec={topRec} />

      {/* Runner-ups */}
      {recommendations.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-1">
            其他推薦
          </p>
          {recommendations.slice(1).map((rec, i) => (
            <RunnerUpCard key={rec.cardCode ?? i} rec={rec} rank={i + 2} />
          ))}
        </div>
      )}

      {comparison.notes.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1 pt-1">
          {comparison.notes.map((note, i) => (
            <p key={i}>{note}</p>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground pt-1">{disclaimer}</p>
    </div>
  )
}

/** Hero card for the #1 recommendation */
function TopPickCard({ rec }: { rec: CardRecommendation }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="pt-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary mb-0.5">最佳推薦</p>
              <p className="font-semibold truncate">{rec.cardName}</p>
              <p className="text-sm text-muted-foreground">{rec.bankName}</p>
            </div>
          </div>
          <CashbackDisplay rec={rec} size="lg" />
        </div>

        {/* Reason */}
        <p className="text-sm text-muted-foreground">{rec.reason}</p>

        {/* Conditions & validity */}
        <ConditionBadges rec={rec} />

        {/* Promotion breakdown */}
        <PromotionBreakdown rec={rec} expanded={expanded} onToggle={() => setExpanded(!expanded)} />

        {/* Apply link */}
        <ApplyLink url={rec.applyUrl} />
      </CardContent>
    </Card>
  )
}

/** Compact card for #2+ recommendations */
function RunnerUpCard({ rec, rank }: { rec: CardRecommendation; rank: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
              {rank === 2 ? <Medal className="h-4 w-4" /> : rank}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{rec.cardName}</p>
              <p className="text-xs text-muted-foreground">{rec.bankName}</p>
            </div>
          </div>
          <CashbackDisplay rec={rec} size="sm" />
        </div>

        <p className="text-sm text-muted-foreground">{rec.reason}</p>
        <ConditionBadges rec={rec} />
        <PromotionBreakdown rec={rec} expanded={expanded} onToggle={() => setExpanded(!expanded)} />
        <ApplyLink url={rec.applyUrl} />
      </CardContent>
    </Card>
  )
}

/** Prominent cashback value display */
function CashbackDisplay({ rec, size }: { rec: CardRecommendation; size: 'lg' | 'sm' }) {
  const isLg = size === 'lg'

  return (
    <div className="text-right shrink-0">
      <p className={`font-bold text-primary ${isLg ? 'text-2xl' : 'text-lg'}`}>
        {rec.cashbackType === 'PERCENT'
          ? `${rec.cashbackValue}%`
          : `NT$ ${rec.estimatedReturn}`}
      </p>
      <div className="flex items-center justify-end gap-1 text-muted-foreground">
        <TrendingUp className={isLg ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
        <p className={isLg ? 'text-sm' : 'text-xs'}>
          回饋 NT$ {rec.estimatedReturn}
        </p>
      </div>
    </div>
  )
}

/** Condition tags + validity badge */
function ConditionBadges({ rec }: { rec: CardRecommendation }) {
  if (rec.conditions.length === 0 && !rec.validUntil) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {rec.conditions.map((c, i) => (
        <Badge key={i} variant="outline" className="text-xs">
          {c.label}
        </Badge>
      ))}
      {rec.validUntil && (
        <Badge variant="secondary" className="text-xs">
          有效至 {rec.validUntil}
        </Badge>
      )}
    </div>
  )
}

/** Expandable promotion breakdown */
function PromotionBreakdown({
  rec,
  expanded,
  onToggle,
}: {
  rec: CardRecommendation
  expanded: boolean
  onToggle: () => void
}) {
  if (rec.promotionBreakdown.length === 0) return null

  return (
    <>
      <Separator />
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs"
        onClick={onToggle}
      >
        {expanded ? (
          <>
            <ChevronUp className="h-3 w-3 mr-1" />
            收起優惠明細
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3 mr-1" />
            展開 {rec.promotionBreakdown.length} 個優惠明細
          </>
        )}
      </Button>

      {expanded && (
        <div className="space-y-2">
          {rec.promotionBreakdown.map((promo) => (
            <div
              key={promo.promoVersionId}
              className="rounded-md bg-muted/50 p-3 text-xs space-y-1.5"
            >
              <div className="flex justify-between font-medium gap-2">
                <span className="truncate">{promo.title ?? promo.promotionId}</span>
                <span className="shrink-0 text-primary font-semibold">
                  {promo.cashbackType === 'PERCENT'
                    ? `${promo.cashbackValue}%`
                    : `NT$ ${promo.cappedReturn}`}
                </span>
              </div>
              <p className="text-muted-foreground">{promo.reason}</p>
              {promo.conditions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {promo.conditions.map((c, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {c.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/** Apply link */
function ApplyLink({ url }: { url: string | null }) {
  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
    >
      前往申辦
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}

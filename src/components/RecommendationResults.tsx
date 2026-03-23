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
  Info,
  Check,
  Minus,
  TrendingUp,
  ArrowLeftRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BreakEvenAnalysis, CardRecommendation, RecommendationResponse } from '@/types'

interface Props {
  result: RecommendationResponse | null
}

export function RecommendationResults({ result }: Props) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-muted-foreground gap-3 min-h-[200px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Sparkles className="h-6 w-6 opacity-50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">尚未查詢</p>
          <p className="text-xs mt-0.5">
            <span className="hidden lg:inline">填寫左側表單後，推薦結果將顯示在此</span>
            <span className="lg:hidden">填寫上方表單後，推薦結果將顯示在此</span>
          </p>
        </div>
      </div>
    )
  }

  const { recommendations, comparison, disclaimer } = result

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-muted-foreground gap-3 min-h-[200px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Info className="h-6 w-6 opacity-50" />
        </div>
        <p className="text-sm">沒有找到符合條件的推薦</p>
      </div>
    )
  }

  const topRec = recommendations[0]

  return (
    <div key={result.requestId} className="space-y-3">
      {/* Summary stats bar */}
      <div className="animate-fade-slide-up flex flex-wrap items-center gap-x-1 gap-y-1">
        <StatPill label="評估優惠" value={comparison.evaluatedPromotionCount} />
        <span className="text-border">·</span>
        <StatPill label="符合" value={comparison.eligiblePromotionCount} />
        <span className="text-border">·</span>
        <StatPill label="排名卡片" value={comparison.rankedCardCount} />
      </div>

      {/* Top pick */}
      <div className="animate-fade-slide-up" style={{ animationDelay: '80ms' }}>
        <TopPickCard rec={topRec} />
      </div>

      {/* Runner-ups */}
      {recommendations.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pt-1 px-0.5">
            其他推薦
          </p>
          {recommendations.slice(1).map((rec, i) => (
            <div
              key={rec.cardCode ?? i}
              className="animate-fade-slide-up"
              style={{ animationDelay: `${(i + 2) * 80}ms` }}
            >
              <RunnerUpCard rec={rec} rank={i + 2} />
            </div>
          ))}
        </div>
      )}

      {/* Break-even analysis */}
      {comparison.breakEvenEvaluated && comparison.breakEvenAnalyses.length > 0 && (
        <div className="animate-fade-slide-up space-y-2" style={{ animationDelay: '320ms' }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-0.5">
            損益平衡分析
          </p>
          {comparison.breakEvenAnalyses.map((analysis, i) => (
            <BreakEvenCard key={i} analysis={analysis} />
          ))}
        </div>
      )}

      {comparison.notes.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
          {comparison.notes.map((note, i) => (
            <p key={i} className="flex items-start gap-1.5">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-60" />
              {note}
            </p>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground px-0.5">{disclaimer}</p>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="text-xs text-muted-foreground">
      {label}{' '}
      <strong className="tabular-nums text-foreground font-semibold">{value}</strong>
    </span>
  )
}

/** Hero card for the #1 recommendation */
function TopPickCard({ rec }: { rec: CardRecommendation }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="relative overflow-hidden border-primary/30 shadow-md">
      {/* Accent stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />

      <CardContent className="pt-5 pl-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Trophy className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-0.5">
                最佳推薦
              </p>
              <p className="font-semibold text-sm leading-tight truncate">{rec.cardName}</p>
              <p className="text-xs text-muted-foreground">{rec.bankName}</p>
            </div>
          </div>
          <CashbackDisplay rec={rec} size="lg" />
        </div>

        {/* Reason */}
        <p className="text-sm text-muted-foreground leading-relaxed">{rec.reason}</p>

        {/* Conditions */}
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
    <Card className="overflow-hidden">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold',
              rank === 2
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-muted text-muted-foreground',
            )}>
              {rank === 2 ? <Medal className="h-4 w-4" /> : rank}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight truncate">{rec.cardName}</p>
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

/** Cashback amount — reward green, tabular nums */
function CashbackDisplay({ rec, size }: { rec: CardRecommendation; size: 'lg' | 'sm' }) {
  const isLg = size === 'lg'

  return (
    <div className="text-right shrink-0">
      <div className={cn(
        'tabular-nums font-bold text-reward',
        isLg ? 'text-2xl' : 'text-lg',
      )}>
        <span className="text-[0.6em] font-semibold mr-0.5 opacity-80">NT$</span>
        {rec.estimatedReturn.toLocaleString()}
      </div>
      {rec.cashbackType === 'PERCENT' && (
        <p className={cn(
          'text-muted-foreground tabular-nums',
          isLg ? 'text-xs' : 'text-[10px]',
        )}>
          <TrendingUp className="inline h-3 w-3 mr-0.5 text-reward/70" />
          {rec.cashbackValue}% 回饋
        </p>
      )}
    </div>
  )
}

/** Condition tags + validity badge */
function ConditionBadges({ rec }: { rec: CardRecommendation }) {
  if (rec.conditions.length === 0 && !rec.validUntil) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {rec.conditions.map((c, i) => (
        <Badge key={i} variant="outline" className="text-xs rounded-full">
          {c.label}
        </Badge>
      ))}
      {rec.validUntil && (
        <Badge variant="secondary" className="text-xs rounded-full">
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
        className="w-full text-xs h-8 text-muted-foreground hover:text-foreground cursor-pointer"
        onClick={onToggle}
      >
        {expanded ? (
          <>
            <ChevronUp className="h-3.5 w-3.5 mr-1.5" />
            收起優惠明細
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
            查看 {rec.promotionBreakdown.length} 個優惠明細
          </>
        )}
      </Button>

      {expanded && (
        <div className="space-y-2 pt-1">
          {rec.promotionBreakdown.map((promo) => (
            <div
              key={promo.promoVersionId}
              className={cn(
                'rounded-lg border px-3 py-2.5 text-xs space-y-1.5 transition-opacity',
                promo.contributesToCardTotal
                  ? 'border-reward-border bg-reward-bg/40'
                  : 'border-border bg-muted/30 opacity-55',
              )}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {promo.contributesToCardTotal ? (
                    <Check className="h-3 w-3 text-reward shrink-0" />
                  ) : (
                    <Minus className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  <span className="font-medium truncate">{promo.title ?? promo.promotionId}</span>
                </div>
                <div className="shrink-0 text-right">
                  <span className={cn('font-semibold tabular-nums', promo.contributesToCardTotal ? 'text-reward' : 'text-muted-foreground')}>
                    NT$ {promo.cappedReturn.toLocaleString()}
                  </span>
                  {promo.cashbackType === 'PERCENT' && (
                    <span className="text-muted-foreground ml-1">({promo.cashbackValue}%)</span>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground pl-[18px]">{promo.reason}</p>
              {promo.conditions.length > 0 && (
                <div className="flex flex-wrap gap-1 pl-[18px]">
                  {promo.conditions.map((c, i) => (
                    <Badge key={i} variant="outline" className="text-xs rounded-full">
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

/** Break-even analysis card */
function BreakEvenCard({ analysis }: { analysis: BreakEvenAnalysis }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
            <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-tight truncate">
              {analysis.leftCardCode} vs {analysis.rightCardCode}
            </p>
          </div>
          {analysis.breakEvenAmount > 0 && (
            <div className="ml-auto shrink-0 text-right">
              <p className="text-xs text-muted-foreground">損益平衡點</p>
              <p className="text-sm font-bold tabular-nums text-foreground">
                NT$ {analysis.breakEvenAmount.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Cap amounts */}
        {analysis.variableRewardCapAmount != null && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>回饋上限消費金額</span>
            <span className="tabular-nums font-medium text-foreground">
              NT$ {analysis.variableRewardCapAmount.toLocaleString()}
            </span>
          </div>
        )}

        {(analysis.leftMinAmount != null || analysis.rightMinAmount != null) && (
          <div className="flex gap-3 text-xs">
            {analysis.leftMinAmount != null && (
              <div className="flex-1 rounded-md bg-muted/50 px-2.5 py-2">
                <p className="text-muted-foreground truncate">{analysis.leftCardCode}</p>
                <p className="font-medium tabular-nums mt-0.5">
                  最低 NT$ {analysis.leftMinAmount.toLocaleString()}
                </p>
              </div>
            )}
            {analysis.rightMinAmount != null && (
              <div className="flex-1 rounded-md bg-muted/50 px-2.5 py-2">
                <p className="text-muted-foreground truncate">{analysis.rightCardCode}</p>
                <p className="font-medium tabular-nums mt-0.5">
                  最低 NT$ {analysis.rightMinAmount.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <p className="text-xs text-muted-foreground leading-relaxed">{analysis.summary}</p>
      </CardContent>
    </Card>
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
      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium hover:underline underline-offset-2 transition-colors"
    >
      前往申辦
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}

import { useState } from 'react'
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Medal,
  Minus,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS, CHANNEL_CONDITION_TYPES, MERCHANT_SUGGESTIONS, PAYMENT_METHOD_LABELS, SUBCATEGORY_LABELS } from '@/types'
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
          <p className="text-sm font-medium">等待推薦結果</p>
          <p className="text-xs mt-0.5">輸入消費情境後，這裡會顯示最佳卡片與比較範圍。</p>
        </div>
      </div>
    )
  }

  const { recommendations, comparison, disclaimer } = result
  const category = result.scenario.category
  const subcategory = result.scenario.subcategory
  const merchantName = result.scenario.merchantName
  const hasMerchantScopedScene = Boolean(
    category && subcategory && MERCHANT_SUGGESTIONS[`${category}:${subcategory}`]?.length,
  )

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-muted-foreground gap-3 min-h-[200px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Info className="h-6 w-6 opacity-50" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm">找不到符合這個情境的推薦結果</p>
          {hasMerchantScopedScene && !merchantName && (
            <p className="text-xs">
              這個場景可能還需要指定商家，像 AI 工具可填 `CHATGPT`、旅遊平台可填 `AGODA` 或 `TRIP_COM`，才比較容易命中指定通路優惠。
            </p>
          )}
        </div>
      </div>
    )
  }

  const topRec = recommendations[0]

  return (
    <div key={result.requestId} className="space-y-3">
      <ScenarioSummary result={result} />

      <div className="animate-fade-slide-up flex flex-wrap items-center gap-x-1 gap-y-1">
        <StatPill label="評估優惠" value={comparison.evaluatedPromotionCount} />
        <span className="text-border">·</span>
        <StatPill label="符合條件" value={comparison.eligiblePromotionCount} />
        <span className="text-border">·</span>
        <StatPill label="進榜卡片" value={comparison.rankedCardCount} />
      </div>

      <div className="animate-fade-slide-up" style={{ animationDelay: '80ms' }}>
        <TopPickCard rec={topRec} />
      </div>

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

function ScenarioSummary({ result }: { result: RecommendationResponse }) {
  const category = result.scenario.category
  const subcategory = result.scenario.subcategory
  const merchantName = result.scenario.merchantName
  const paymentMethod = result.scenario.paymentMethod
  const categoryLabel = category ? CATEGORY_LABELS[category] ?? category : null
  const subcategoryLabel = subcategory ? SUBCATEGORY_LABELS[subcategory] ?? subcategory : null
  const paymentMethodLabel = paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod : null
  const assumedBenefitTiers = Array.from(
    new Map(
      result.recommendations
        .map((rec) => {
          const tier = rec.conditions.find((condition) => condition.type === 'ASSUMED_BENEFIT_TIER')?.value
          if (!tier || !rec.cardCode) return null
          const label = rec.cardCode === 'CATHAY_CUBE'
            ? 'CUBE'
            : rec.cardCode === 'TAISHIN_RICHART'
              ? 'Richart'
              : rec.cardName
          return [rec.cardCode, { label, tier }] as const
        })
        .filter((entry): entry is readonly [string, { label: string; tier: string }] => entry !== null),
    ).values(),
  )
  const isGeneralScene = !subcategory || subcategory === 'GENERAL'

  return (
    <div className="animate-fade-slide-up rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="rounded-full">
          {isGeneralScene ? '一般場景比較' : '指定場景比較'}
        </Badge>
        {categoryLabel && (
          <span className="text-sm font-medium text-foreground">{categoryLabel}</span>
        )}
        {subcategoryLabel && (
          <Badge variant="outline" className="rounded-full">
            {subcategoryLabel}
          </Badge>
        )}
        {merchantName && (
          <Badge variant="outline" className="rounded-full">
            商家：{merchantName}
          </Badge>
        )}
        {paymentMethodLabel && (
          <Badge variant="outline" className="rounded-full">
            支付：{paymentMethodLabel}
          </Badge>
        )}
        {assumedBenefitTiers.map(({ label, tier }) => (
          <Badge key={`${label}:${tier}`} variant="outline" className="rounded-full">
            {label}：{tier}
          </Badge>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
        {isGeneralScene
          ? '目前結果只比較這個母類別下的通用優惠，未納入特定子類別場景。'
          : '目前結果只會讓命中這個指定場景的卡片進榜；同卡若有可疊加的一般回饋，仍會一併計入。'}
      </p>
      {merchantName && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          已套用指定商家條件，所以像 ChatGPT、Agoda、全聯、華航這類指定通路優惠會更容易被精準命中。
        </p>
      )}
      {paymentMethodLabel && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          已套用支付方式條件，所以像行動支付或指定支付平台的優惠會一起納入比對。
        </p>
      )}
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

function TopPickCard({ rec }: { rec: CardRecommendation }) {
  const [expanded, setExpanded] = useState(false)
  const subcategoryLabel = rec.subcategory && rec.subcategory !== 'GENERAL'
    ? SUBCATEGORY_LABELS[rec.subcategory] ?? rec.subcategory
    : null

  return (
    <Card className="relative overflow-hidden border-primary/30 shadow-md">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />

      <CardContent className="pt-5 pl-6 space-y-4">
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
              {subcategoryLabel && (
                <Badge variant="outline" className="mt-1 rounded-full text-[10px]">
                  {subcategoryLabel} 場景
                </Badge>
              )}
            </div>
          </div>
          <CashbackDisplay rec={rec} size="lg" />
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{rec.reason}</p>
        {rec.generalRewardOnly && (
          <Badge variant="outline" className="w-fit rounded-full">
            此卡僅有通用回饋
          </Badge>
        )}

        <ConditionBadges rec={rec} />
        <PlanSwitchBadge rec={rec} />
        <PromotionBreakdown rec={rec} expanded={expanded} onToggle={() => setExpanded(!expanded)} />
        <ApplyLink url={rec.applyUrl} />
      </CardContent>
    </Card>
  )
}

function RunnerUpCard({ rec, rank }: { rec: CardRecommendation; rank: number }) {
  const [expanded, setExpanded] = useState(false)
  const subcategoryLabel = rec.subcategory && rec.subcategory !== 'GENERAL'
    ? SUBCATEGORY_LABELS[rec.subcategory] ?? rec.subcategory
    : null

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold',
                rank === 2
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {rank === 2 ? <Medal className="h-4 w-4" /> : rank}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight truncate">{rec.cardName}</p>
              <p className="text-xs text-muted-foreground">{rec.bankName}</p>
              {subcategoryLabel && (
                <Badge variant="outline" className="mt-1 rounded-full text-[10px]">
                  {subcategoryLabel} 場景
                </Badge>
              )}
            </div>
          </div>
          <CashbackDisplay rec={rec} size="sm" />
        </div>

        <p className="text-sm text-muted-foreground">{rec.reason}</p>
        {rec.generalRewardOnly && (
          <Badge variant="outline" className="w-fit rounded-full">
            此卡僅有通用回饋
          </Badge>
        )}
        <ConditionBadges rec={rec} />
        <PlanSwitchBadge rec={rec} />
        <PromotionBreakdown rec={rec} expanded={expanded} onToggle={() => setExpanded(!expanded)} />
        <ApplyLink url={rec.applyUrl} />
      </CardContent>
    </Card>
  )
}

function CashbackDisplay({ rec, size }: { rec: CardRecommendation; size: 'lg' | 'sm' }) {
  const isLg = size === 'lg'

  return (
    <div className="text-right shrink-0">
      <div
        className={cn(
          'tabular-nums font-bold text-reward',
          isLg ? 'text-2xl' : 'text-lg',
        )}
      >
        <span className="text-[0.6em] font-semibold mr-0.5 opacity-80">NT$</span>
        {rec.estimatedReturn.toLocaleString()}
      </div>
      {rec.cashbackType === 'PERCENT' && (
        <p
          className={cn(
            'text-muted-foreground tabular-nums',
            isLg ? 'text-xs' : 'text-[10px]',
          )}
        >
          <TrendingUp className="inline h-3 w-3 mr-0.5 text-reward/70" />
          {rec.cashbackValue}% 回饋
        </p>
      )}
    </div>
  )
}

function ConditionBadges({ rec }: { rec: CardRecommendation }) {
  if (rec.conditions.length === 0 && !rec.validUntil) return null

  const visibleConditions = rec.conditions.filter((condition) => condition.type !== 'TEXT')
  const fallbackConditions = visibleConditions.length > 0 ? visibleConditions : rec.conditions

  return (
    <div className="flex flex-wrap gap-1.5">
      {fallbackConditions.map((c, i) => (
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

function PlanSwitchBadge({ rec }: { rec: CardRecommendation }) {
  if (!rec.activePlan) return null

  return (
    <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
      <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
      <div className="text-xs space-y-0.5">
        <p className="font-medium text-foreground">
          建議切換到「{rec.activePlan.planName}」方案
        </p>
        <p className="text-muted-foreground">
          {rec.activePlan.switchFrequency}
          {rec.activePlan.requiresSubscription && rec.activePlan.subscriptionCost && (
            <span className="ml-1.5 text-amber-600 dark:text-amber-400">
              · 訂閱費 {rec.activePlan.subscriptionCost}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

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
            收合優惠明細
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
            查看 {rec.promotionBreakdown.length} 筆優惠明細
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
                  <span
                    className={cn(
                      'font-semibold tabular-nums',
                      promo.contributesToCardTotal ? 'text-reward' : 'text-muted-foreground',
                    )}
                  >
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
                  {promo.conditions.map((c, i) => {
                    const isChannel = CHANNEL_CONDITION_TYPES.has(c.type)
                    return (
                      <Badge
                        key={i}
                        variant="outline"
                        className={cn(
                          'text-xs rounded-full',
                          isChannel
                            ? 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400'
                            : 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400',
                        )}
                      >
                        {c.label}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function BreakEvenCard({ analysis }: { analysis: BreakEvenAnalysis }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-4 space-y-3">
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

        {analysis.variableRewardCapAmount != null && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>變動回饋封頂消費</span>
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
                  最低門檻 NT$ {analysis.leftMinAmount.toLocaleString()}
                </p>
              </div>
            )}
            {analysis.rightMinAmount != null && (
              <div className="flex-1 rounded-md bg-muted/50 px-2.5 py-2">
                <p className="text-muted-foreground truncate">{analysis.rightCardCode}</p>
                <p className="font-medium tabular-nums mt-0.5">
                  最低門檻 NT$ {analysis.rightMinAmount.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">{analysis.summary}</p>
      </CardContent>
    </Card>
  )
}

function ApplyLink({ url }: { url: string | null }) {
  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium hover:underline underline-offset-2 transition-colors"
    >
      前往辦卡
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}

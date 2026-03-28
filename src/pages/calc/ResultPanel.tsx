import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/types'
import type { CardRecommendation, Category } from '@/types'
import { AnnualLossBox } from './AnnualLossBox'
import { ShareButton } from './ShareButton'
import { CtaStrip } from './CtaStrip'

interface ResultPanelProps {
  recommendations: CardRecommendation[]
  amount: number
  category: Category
}

interface CalcResult {
  ranked: CardRecommendation[]
  best: CardRecommendation
  worst: CardRecommendation
  singleDiff: number
  annualLoss: number
}

function processResult(recommendations: CardRecommendation[]): CalcResult | null {
  if (recommendations.length < 2) return null
  const ranked = [...recommendations].sort((a, b) => b.estimatedReturn - a.estimatedReturn)
  const best = ranked[0]
  const worst = ranked[ranked.length - 1]
  const singleDiff = best.estimatedReturn - worst.estimatedReturn
  return { ranked, best, worst, singleDiff, annualLoss: singleDiff * 12 }
}

export function ResultPanel({ recommendations, amount, category }: ResultPanelProps) {
  const result = useMemo(() => processResult(recommendations), [recommendations])

  if (!result) return null

  const maxReturn = result.ranked[0].estimatedReturn

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {/* Bar chart */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">回饋排名</h3>
        <div className="space-y-2">
          {result.ranked.map((rec, i) => {
            const isFirst = i === 0
            const isLast = i === result.ranked.length - 1
            const pct = maxReturn > 0 ? Math.max(4, (rec.estimatedReturn / maxReturn) * 100) : 4
            const barColor = isFirst
              ? 'bg-reward'
              : isLast
                ? 'bg-destructive'
                : 'bg-muted-foreground/40'

            return (
              <div
                key={rec.cardCode ?? `${rec.cardName}-${i}`}
                className="flex items-center gap-2 text-xs"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-28 shrink-0 truncate text-right text-muted-foreground leading-tight">
                  {rec.cardName}
                </div>
                <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-[width] duration-[600ms] ease-out',
                      barColor,
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div
                  className={cn(
                    'w-16 shrink-0 tabular-nums font-medium text-right',
                    isFirst && 'text-reward',
                    isLast && 'text-destructive',
                  )}
                >
                  NT${rec.estimatedReturn.toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Best vs Worst comparison */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">最佳</p>
            <p className="font-semibold text-sm leading-snug">{result.best.cardName}</p>
            <p className="text-reward font-bold tabular-nums mt-0.5">
              +NT${result.best.estimatedReturn.toLocaleString()}
            </p>
          </div>
          <div className="text-center px-2">
            <p className="text-xs text-muted-foreground mb-0.5">差額</p>
            <p className="text-destructive font-bold text-xl tabular-nums">
              NT${result.singleDiff.toLocaleString()}
            </p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-muted-foreground mb-0.5">最差</p>
            <p className="font-semibold text-sm leading-snug">{result.worst.cardName}</p>
            <p className="text-muted-foreground tabular-nums mt-0.5">
              +NT${result.worst.estimatedReturn.toLocaleString()}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground leading-relaxed border-t pt-3">
          假設每月在「{CATEGORY_LABELS[category]}」消費 NT${amount.toLocaleString()}，
          用{' '}
          <span className="font-medium text-foreground">{result.worst.cardName}</span>
          {' '}代替{' '}
          <span className="font-medium text-foreground">{result.best.cardName}</span>，
          一年少拿 NT$
          <span className="font-medium text-destructive tabular-nums">
            {result.annualLoss.toLocaleString()}
          </span>{' '}
          回饋。
        </p>
      </div>

      {/* Annual loss counter */}
      <AnnualLossBox annualLoss={result.annualLoss} monthlyDiff={result.singleDiff} />

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground leading-relaxed px-1">
        本計算機提供信用卡回饋估算，僅供參考。年度損失基於假設每月消費金額相同的簡化模型，
        實際回饋依各銀行公告為準。CardSense 不構成金融建議，請以銀行官網資訊為最終依據。
      </p>

      {/* Share */}
      <ShareButton
        annualLoss={result.annualLoss}
        bestCardName={result.best.cardName}
        worstCardName={result.worst.cardName}
        category={CATEGORY_LABELS[category]}
        amount={amount}
      />

      {/* CTA */}
      <CtaStrip amount={amount} category={category} />
    </div>
  )
}

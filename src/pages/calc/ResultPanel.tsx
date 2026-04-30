import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS, SUBCATEGORY_LABELS } from '@/types'
import type { CardRecommendation, Category } from '@/types'
import { AnnualLossBox } from './AnnualLossBox'
import { ShareButton } from './ShareButton'
import { CtaStrip } from './CtaStrip'

interface ResultPanelProps {
  recommendations: CardRecommendation[]
  amount: number
  category: Category
  customExchangeRates: Record<string, number>
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

function buildCardLabel(rec: CardRecommendation) {
  const bank = rec.bankName?.trim() || 'Unknown Bank'
  const card = rec.cardName?.trim() || 'Unknown Card'
  return `${bank} ${card}`
}

function truncateCardLabel(label: string, maxLength = 18) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label
}

export function ResultPanel({
  recommendations,
  amount,
  category,
  customExchangeRates,
}: ResultPanelProps) {
  const result = useMemo(() => processResult(recommendations), [recommendations])

  if (!result) return null

  const maxReturn = result.ranked[0].estimatedReturn
  const bestLabel = buildCardLabel(result.best)
  const worstLabel = buildCardLabel(result.worst)
  const hasAnomalousRate = result.ranked.some(
    (rec) => amount > 0 && rec.estimatedReturn / amount > 0.2,
  )

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {hasAnomalousRate && (
        <div className="rounded-xl border border-amber-400/60 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <span className="font-semibold">注意：</span>部分卡片的回饋比例超過 20%，可能包含限時活動或資料異常，建議再到卡片詳情確認條件。
        </div>
      )}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">回饋排名</h3>
        <div className="space-y-2">
          {result.ranked.map((rec, i) => {
            const isFirst = i === 0
            const isLast = i === result.ranked.length - 1
            const isAnomalous = amount > 0 && rec.estimatedReturn / amount > 0.2
            const pct = maxReturn > 0 ? Math.max(4, (rec.estimatedReturn / maxReturn) * 100) : 4
            const fullLabel = buildCardLabel(rec)
            const shortLabel = truncateCardLabel(fullLabel)
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
                <div
                  className="w-24 sm:w-36 shrink-0 text-right text-muted-foreground leading-tight"
                  title={fullLabel}
                >
                  <span className="block truncate font-medium text-foreground">{shortLabel}</span>
                  {rec.subcategory && rec.subcategory !== 'GENERAL' && SUBCATEGORY_LABELS[rec.subcategory] && (
                    <span className="block text-[10px] text-muted-foreground/60">[{SUBCATEGORY_LABELS[rec.subcategory]}優惠]</span>
                  )}
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
                    'w-14 sm:w-16 shrink-0 tabular-nums font-medium text-right',
                    isFirst && 'text-reward',
                    isLast && 'text-destructive',
                  )}
                >
                  NT${rec.estimatedReturn.toLocaleString()}
                  {isAnomalous && (
                    <span className="ml-0.5 text-amber-500" title="回饋比例超過 20%">!</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">最佳</p>
            <p className="font-semibold text-sm leading-snug" title={bestLabel}>{bestLabel}</p>
            <p className="text-reward font-bold tabular-nums mt-0.5">
              +NT${result.best.estimatedReturn.toLocaleString()}
            </p>
          </div>
          <div className="text-center px-2">
            <p className="text-xs text-muted-foreground mb-0.5">差距</p>
            <p className="text-destructive font-bold text-xl tabular-nums">
              NT${result.singleDiff.toLocaleString()}
            </p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-muted-foreground mb-0.5">最差</p>
            <p className="font-semibold text-sm leading-snug" title={worstLabel}>{worstLabel}</p>
            <p className="text-muted-foreground tabular-nums mt-0.5">
              +NT${result.worst.estimatedReturn.toLocaleString()}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground leading-relaxed border-t pt-3">
          以 {CATEGORY_LABELS[category]} 類別、單筆消費 NT${amount.toLocaleString()} 估算，
          <span className="font-medium text-foreground">{worstLabel}</span>
          {' '}與{' '}
          <span className="font-medium text-foreground">{bestLabel}</span>
          之間一年可能相差 NT$
          <span className="font-medium text-destructive tabular-nums">
            {result.annualLoss.toLocaleString()}
          </span>
          的回饋。
        </p>
      </div>

      <AnnualLossBox annualLoss={result.annualLoss} monthlyDiff={result.singleDiff} />

      <TrustLayer rec={result.best} />

      <ShareButton
        annualLoss={result.annualLoss}
        bestCardName={bestLabel}
        worstCardName={worstLabel}
        category={CATEGORY_LABELS[category]}
        amount={amount}
        customExchangeRates={customExchangeRates}
      />

      <CtaStrip amount={amount} category={category} />
    </div>
  )
}

function TrustLayer({ rec }: { rec: CardRecommendation }) {
  const confidencePct =
    typeof rec.confidence === 'number' ? `${Math.round(rec.confidence * 100)}%` : null
  const conditionLabels = rec.conditions.slice(0, 3).map((condition) => condition.label)

  return (
    <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-semibold text-foreground">信任檢查</p>
        {confidencePct && (
          <span className="rounded-full bg-reward/10 px-2 py-0.5 font-medium text-reward">
            信心 {confidencePct}
          </span>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <p>資料驗證：{rec.verifiedAt ? rec.verifiedAt.slice(0, 10) : '尚未提供驗證時間'}</p>
        <p>優惠期限：{rec.validUntil ?? '依銀行公告'}</p>
        <p>命中優惠：{rec.matchedPromotionCount} 筆</p>
        <p>活動代碼：{rec.promoVersionId ?? rec.promotionId ?? '未提供'}</p>
      </div>
      {conditionLabels.length > 0 && (
        <div className="mt-3 border-t pt-3">
          <p className="mb-1 font-medium text-foreground">主要條件</p>
          <ul className="space-y-1">
            {conditionLabels.map((label) => (
              <li key={label}>• {label}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-3 border-t pt-3 leading-relaxed">
        本結果依目前卡片優惠資料估算，實際回饋仍會受到登錄、名額、通路限制與活動期間影響。
        {rec.sourceUrl && (
          <>
            {' '}
            <a className="font-medium text-primary underline-offset-4 hover:underline" href={rec.sourceUrl} target="_blank" rel="noreferrer">
              查看官方來源
            </a>
          </>
        )}
      </p>
    </div>
  )
}

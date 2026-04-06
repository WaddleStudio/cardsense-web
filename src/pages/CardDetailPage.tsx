import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
  CreditCard,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Search,
} from 'lucide-react'
import { useCard, useCardPlans, useCardPromotions } from '@/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS, SUBCATEGORY_LABELS, BANK_COLORS, DEFAULT_BANK_COLOR, CHANNEL_CONDITION_TYPES } from '@/types'
import type { BankCode, BenefitPlan, CardPromotion, Category } from '@/types'

const SCOPE_LABELS: Record<string, string> = {
  RECOMMENDABLE: '可推薦',
  CATALOG_ONLY: '僅目錄展示',
  FUTURE_SCOPE: '未來納入',
}

const SWITCH_FREQ_LABELS: Record<string, string> = {
  DAILY: '每日可切換',
  MONTHLY: '每月可切換',
  UNLIMITED: '不限次數',
}

export function CardDetailPage() {
  const { cardCode } = useParams<{ cardCode: string }>()
  const navigate = useNavigate()
  const { data: card, isLoading, error, refetch } = useCard(cardCode!)
  const { data: promotions } = useCardPromotions(cardCode!)
  const { data: plans } = useCardPlans(cardCode!)

  const groupedPromotions = useMemo(() => {
    if (!promotions) return {}

    const groups: Record<string, CardPromotion[]> = {}
    for (const promotion of promotions) {
      const category = promotion.category || 'OTHER'
      if (!groups[category]) groups[category] = []
      groups[category].push(promotion)
    }

    for (const category of Object.keys(groups)) {
      groups[category].sort((a, b) => {
        const aKey = a.subcategory && a.subcategory !== 'GENERAL' ? a.subcategory : 'ZZZ'
        const bKey = b.subcategory && b.subcategory !== 'GENERAL' ? b.subcategory : 'ZZZ'
        return aKey.localeCompare(bKey)
      })
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
            <p className="text-sm font-medium text-destructive">卡片資料載入失敗</p>
            <p className="text-xs text-destructive/80 mt-0.5">請稍後重試，或檢查 API 是否正常。</p>
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
          <p className="text-sm">找不到這張卡片</p>
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
              {(() => {
                const bankColor = BANK_COLORS[card.bankCode as BankCode] ?? DEFAULT_BANK_COLOR
                return (
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', bankColor.bg, bankColor.text)}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                )
              })()}
              <div className="min-w-0">
                <CardTitle className="text-lg leading-tight">{card.cardName}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{card.bankName}</p>
              </div>
            </div>
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className="shrink-0 rounded-full"
            >
              {isActive ? '有效卡' : '已停發'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex justify-between items-center text-sm py-1">
            <span className="text-muted-foreground">年費</span>
            <span
              className={cn(
                'font-semibold tabular-nums text-base',
                isFree ? 'text-reward' : 'text-foreground',
              )}
            >
              {card.annualFee != null
                ? isFree
                  ? '免年費'
                  : `NT$ ${card.annualFee.toLocaleString()}`
                : '--'}
            </span>
          </div>

          <Separator />

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

          {plans && plans.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                  方案切換
                </p>
                <div className="space-y-2">
                  {plans.map((plan) => (
                    <PlanItem key={plan.planId} plan={plan} />
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            {card.applyUrl && (
              <Button asChild variant="outline" className="cursor-pointer">
                <a href={card.applyUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  前往辦卡
                </a>
              </Button>
            )}
            <Button
              className="cursor-pointer"
              onClick={() => navigate('/recommend', { state: { prefillCard: card.cardCode } })}
            >
              <Search className="h-4 w-4 mr-1.5" />
              用這張卡做推薦
            </Button>
          </div>
        </CardContent>
      </Card>

      {promotions && promotions.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              優惠明細
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedPromotions).map(([category, items]) => (
              <div key={category}>
                <p className="text-sm font-semibold mb-3">
                  {CATEGORY_LABELS[category as Category] ?? category}
                </p>
                <div className="space-y-3">
                  {items.map((promotion) => (
                    <PromotionItem key={promotion.promoVersionId} promotion={promotion} />
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
  const subcategoryLabel = promotion.subcategory && promotion.subcategory !== 'GENERAL'
    ? SUBCATEGORY_LABELS[promotion.subcategory]
    : null
  const modeHint = promotion.conditions?.find(
    (condition) => condition.type === 'TEXT' && condition.value?.includes('方案'),
  )

  return (
    <div className="rounded-lg border p-3 space-y-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="font-medium leading-tight">{promotion.title ?? cashbackDisplay}</p>
          {subcategoryLabel && (
            <Badge variant="secondary" className="w-fit text-[10px] rounded-full">
              {subcategoryLabel}
            </Badge>
          )}
        </div>
        <span className="shrink-0 font-semibold tabular-nums text-reward">
          {cashbackDisplay}
        </span>
      </div>

      {(promotion.validFrom || promotion.validUntil) && (
        <p className="text-xs text-muted-foreground">
          {promotion.validFrom ?? '--'} ~ {promotion.validUntil ?? '--'}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {/* 指定通路 — 藍色系 */}
        {promotion.conditions?.filter((c) => CHANNEL_CONDITION_TYPES.has(c.type)).map((condition, index) => (
          <Badge key={`ch-${index}`} variant="outline" className="text-xs rounded-full border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400">
            {condition.label || `${condition.type}: ${condition.value}`}
          </Badge>
        ))}

        {/* 達成條件 — 琥珀色系 */}
        {promotion.minAmount != null && promotion.minAmount > 0 && (
          <Badge variant="outline" className="text-xs rounded-full border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
            最低消費 NT$ {promotion.minAmount}
          </Badge>
        )}
        {promotion.maxCashback != null && (
          <Badge variant="outline" className="text-xs rounded-full border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
            回饋上限 {promotion.maxCashback}
          </Badge>
        )}
        {promotion.requiresRegistration && (
          <Badge variant="outline" className="text-xs rounded-full border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
            需登錄
          </Badge>
        )}
        {promotion.frequencyLimit && promotion.frequencyLimit !== 'NONE' && (
          <Badge variant="outline" className="text-xs rounded-full border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
            {promotion.frequencyLimit}
          </Badge>
        )}
        {promotion.conditions?.filter((c) => !CHANNEL_CONDITION_TYPES.has(c.type) && c.type !== 'TEXT').map((condition, index) => (
          <Badge key={`cond-${index}`} variant="outline" className="text-xs rounded-full border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
            {condition.label || `${condition.type}: ${condition.value}`}
          </Badge>
        ))}
      </div>

      {isMutuallyExclusive && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{modeHint?.label || modeHint?.value || '此優惠與其他方案互斥'}</span>
        </div>
      )}
    </div>
  )
}

function isTimeLimitedPlan(plan: BenefitPlan): boolean {
  if (!plan.validUntil) return false
  const until = new Date(plan.validUntil)
  const sixMonthsFromNow = new Date()
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
  return until < sixMonthsFromNow
}

function isPlanExpired(plan: BenefitPlan): boolean {
  if (!plan.validUntil) return false
  return new Date(plan.validUntil) < new Date()
}

function PlanItem({ plan }: { plan: BenefitPlan }) {
  const expired = isPlanExpired(plan)
  const timeLimited = isTimeLimitedPlan(plan)

  return (
    <div
      className={cn(
        'rounded-lg border p-3 space-y-1.5 text-sm',
        expired && 'opacity-50',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <p className="font-medium leading-tight">{plan.planName}</p>
          {expired && (
            <Badge variant="secondary" className="text-[10px] rounded-full px-1.5 py-0">
              已過期
            </Badge>
          )}
          {!expired && timeLimited && (
            <Badge className="text-[10px] rounded-full px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
              <Clock className="h-2.5 w-2.5 mr-0.5" />
              即將到期
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <RefreshCw className="h-3 w-3" />
          <span>{SWITCH_FREQ_LABELS[plan.switchFrequency] ?? plan.switchFrequency}</span>
        </div>
      </div>
      {plan.planDescription && (
        <p className="text-xs text-muted-foreground">{plan.planDescription}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {plan.requiresSubscription && plan.subscriptionCost && (
          <Badge
            variant="outline"
            className="text-xs rounded-full text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700"
          >
            訂閱費 {plan.subscriptionCost}
          </Badge>
        )}
        {plan.switchMaxPerMonth != null && (
          <Badge variant="outline" className="text-xs rounded-full">
            每月最多切換 {plan.switchMaxPerMonth} 次
          </Badge>
        )}
        {plan.validFrom && plan.validUntil && (
          <Badge variant="outline" className="text-xs rounded-full">
            {plan.validFrom} ~ {plan.validUntil}
          </Badge>
        )}
      </div>
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
      返回卡片列表
    </Link>
  )
}

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCards, useBanks } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { FilterChip } from '@/components/ui/filter-chip'
import { CreditCard, Search, X, AlertCircle, RotateCcw, SlidersHorizontal, RefreshCw } from 'lucide-react'
import { useDebouncedValue } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  ELIGIBILITY_TYPES,
  ELIGIBILITY_TYPE_LABELS,
  ANNUAL_FEE_RANGES,
  ANNUAL_FEE_RANGE_LABELS,
  RECOMMENDATION_SCOPES,
  BANK_COLORS,
  DEFAULT_BANK_COLOR,
} from '@/types'
import type { CardSummary, Category, EligibilityType, AnnualFeeRange, RecommendationScope } from '@/types'

const SCOPE_LABELS: Record<string, string> = {
  RECOMMENDABLE: '可推薦',
  CATALOG_ONLY: '僅目錄',
  FUTURE_SCOPE: '未來擴充',
}

type SortKey = 'name' | 'annualFee' | 'bank'

export function CardsPage() {
  const [bankFilter, setBankFilter] = useState<string>('')
  const [eligibilityFilter, setEligibilityFilter] = useState<EligibilityType | ''>('')
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('')
  const [feeRangeFilter, setFeeRangeFilter] = useState<AnnualFeeRange | ''>('')
  const [scopeFilter, setScopeFilter] = useState<RecommendationScope | ''>('')
  const [benefitPlanFilter, setBenefitPlanFilter] = useState(false)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('name')
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const { data: banks } = useBanks()
  const { data: cards, isLoading, error, refetch } = useCards()

  const debouncedSearch = useDebouncedValue(search, 300)

  const hasAnyFilter = Boolean(bankFilter || debouncedSearch.trim() || eligibilityFilter || categoryFilter || feeRangeFilter || scopeFilter || benefitPlanFilter)

  const filteredCards = useMemo(() => {
    if (!cards) return []
    let result = cards
    if (bankFilter) {
      result = result.filter((c) => c.bankCode === bankFilter)
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.cardName.toLowerCase().includes(q) ||
          c.bankName.toLowerCase().includes(q),
      )
    }
    if (eligibilityFilter) {
      result = result.filter((c) => (c.eligibilityType || 'GENERAL') === eligibilityFilter)
    }
    if (categoryFilter) {
      result = result.filter((c) => c.availableCategories?.includes(categoryFilter))
    }
    if (feeRangeFilter) {
      result = result.filter((c) => {
        const fee = c.annualFee ?? 0
        switch (feeRangeFilter) {
          case 'FREE': return fee === 0
          case 'LOW': return fee >= 1 && fee <= 999
          case 'HIGH': return fee >= 1000
        }
      })
    }
    if (scopeFilter) {
      result = result.filter((c) => c.recommendationScopes.includes(scopeFilter))
    }
    if (benefitPlanFilter) {
      result = result.filter((c) => c.hasBenefitPlans)
    }
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.cardName.localeCompare(b.cardName, 'zh-Hant')
        case 'annualFee':
          return (a.annualFee ?? Infinity) - (b.annualFee ?? Infinity)
        case 'bank':
          return a.bankName.localeCompare(b.bankName, 'zh-Hant')
      }
    })
    return result
  }, [cards, bankFilter, debouncedSearch, eligibilityFilter, categoryFilter, feeRangeFilter, scopeFilter, benefitPlanFilter, sort])

  const bankCounts = useMemo(() => {
    if (!cards) return {}
    const counts: Record<string, number> = {}
    for (const c of cards) {
      counts[c.bankCode] = (counts[c.bankCode] || 0) + 1
    }
    return counts
  }, [cards])

  const activeAdvancedFilterCount = [eligibilityFilter, categoryFilter, feeRangeFilter, scopeFilter, benefitPlanFilter].filter(Boolean).length

  function clearAllFilters() {
    setBankFilter('')
    setEligibilityFilter('')
    setCategoryFilter('')
    setFeeRangeFilter('')
    setScopeFilter('')
    setBenefitPlanFilter(false)
    setSearch('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">卡片目錄</h1>
        <p className="text-muted-foreground text-sm mt-1">
          瀏覽所有已收錄的信用卡
          {cards && <span className="ml-1 tabular-nums">（共 {cards.length} 張）</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search + Sort */}
        <div className="flex gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="搜尋卡片名稱或銀行..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
              aria-label="搜尋卡片"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                aria-label="清除搜尋"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[120px] sm:w-[140px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">依名稱排序</SelectItem>
              <SelectItem value="annualFee">依年費排序</SelectItem>
              <SelectItem value="bank">依銀行排序</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bank filter chips */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="依銀行篩選"
        >
          <FilterChip size="lg" active={bankFilter === ''} onClick={() => setBankFilter('')}>
            全部{cards ? ` (${cards.length})` : ''}
          </FilterChip>
          {banks?.map((b) => (
            <FilterChip
              key={b.code}
              size="lg"
              active={bankFilter === b.code}
              onClick={() => setBankFilter(bankFilter === b.code ? '' : b.code)}
            >
              {b.nameZh}
              {bankCounts[b.code] ? ` (${bankCounts[b.code]})` : ''}
            </FilterChip>
          ))}
        </div>

        {/* Advanced filters toggle */}
        <button
          type="button"
          aria-expanded={filtersExpanded}
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
            filtersExpanded || activeAdvancedFilterCount > 0
              ? 'border-primary/40 text-primary bg-primary/5'
              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          進階篩選
          {activeAdvancedFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
              {activeAdvancedFilterCount}
            </span>
          )}
        </button>

        {filtersExpanded && <>
        {/* Eligibility type filter */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">資格類型</p>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="依資格類型篩選">
            <FilterChip active={eligibilityFilter === ''} onClick={() => setEligibilityFilter('')}>
              全部
            </FilterChip>
            {ELIGIBILITY_TYPES.map((t) => (
              <FilterChip
                key={t}
                active={eligibilityFilter === t}
                onClick={() => setEligibilityFilter(eligibilityFilter === t ? '' : t)}
              >
                {ELIGIBILITY_TYPE_LABELS[t]}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">優惠類別</p>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="依優惠類別篩選">
            <FilterChip active={categoryFilter === ''} onClick={() => setCategoryFilter('')}>
              全部
            </FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip
                key={c}
                active={categoryFilter === c}
                onClick={() => setCategoryFilter(categoryFilter === c ? '' : c)}
              >
                {CATEGORY_LABELS[c]}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Annual fee range filter */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">年費區間</p>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="依年費區間篩選">
            <FilterChip active={feeRangeFilter === ''} onClick={() => setFeeRangeFilter('')}>
              全部
            </FilterChip>
            {ANNUAL_FEE_RANGES.map((r) => (
              <FilterChip
                key={r}
                active={feeRangeFilter === r}
                onClick={() => setFeeRangeFilter(feeRangeFilter === r ? '' : r)}
              >
                {ANNUAL_FEE_RANGE_LABELS[r]}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Benefit plan filter */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">卡片特性</p>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="依卡片特性篩選">
            <FilterChip active={benefitPlanFilter} onClick={() => setBenefitPlanFilter(!benefitPlanFilter)}>
              可切換權益方案
            </FilterChip>
          </div>
        </div>

        {/* Recommendation scope filter */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">推薦範圍</p>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="依推薦範圍篩選">
            <FilterChip active={scopeFilter === ''} onClick={() => setScopeFilter('')}>
              全部
            </FilterChip>
            {RECOMMENDATION_SCOPES.filter((s) => s !== 'FUTURE_SCOPE').map((s) => (
              <FilterChip
                key={s}
                active={scopeFilter === s}
                onClick={() => setScopeFilter(scopeFilter === s ? '' : s)}
              >
                {SCOPE_LABELS[s] ?? s}
              </FilterChip>
            ))}
          </div>
        </div>
        </>}
      </div>

      <Separator />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="載入中">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-3 animate-pulse">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-muted" />
                  <div className="h-4 w-28 rounded bg-muted" />
                </div>
                <div className="h-5 w-12 rounded-full bg-muted" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-3.5 w-36 rounded bg-muted" />
                <div className="flex justify-between">
                  <div className="h-3.5 w-8 rounded bg-muted" />
                  <div className="h-3.5 w-14 rounded bg-muted" />
                </div>
              </div>
              <div className="flex gap-1.5 pt-1">
                <div className="h-5 w-10 rounded-full bg-muted" />
                <div className="h-5 w-10 rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
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
      )}

      {/* Empty */}
      {!isLoading && !error && filteredCards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <CreditCard className="h-6 w-6 opacity-50" />
          </div>
          <p className="text-sm">沒有找到符合條件的卡片</p>
          {hasAnyFilter && (
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={clearAllFilters}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              清除所有篩選
            </Button>
          )}
        </div>
      )}

      {/* Results count */}
      {!isLoading && filteredCards.length > 0 && hasAnyFilter && (
        <p className="text-xs text-muted-foreground tabular-nums">
          顯示 {filteredCards.length} 張卡片
        </p>
      )}

      {/* Card grid */}
      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => (
            <CardItem key={card.cardCode} card={card} />
          ))}
        </div>
      )}
    </div>
  )
}

function CardItem({ card }: { card: CardSummary }) {
  const isActive = card.cardStatus === 'ACTIVE'
  const isFree = card.annualFee === 0
  const bankColor = BANK_COLORS[card.bankCode] ?? DEFAULT_BANK_COLOR
  const categoryCount = card.availableCategories?.length ?? 0
  const categoryLabels = (card.availableCategories ?? [])
    .slice(0, 3)
    .map((c) => CATEGORY_LABELS[c as Category] ?? c)

  return (
    <Link to={`/cards/${card.cardCode}`} className="block group">
      <Card className="flex flex-col h-full transition-shadow hover:shadow-md hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors',
                bankColor.bg,
                bankColor.text,
                'group-hover:bg-primary group-hover:text-primary-foreground',
              )}>
                {card.bankName.charAt(0)}
              </div>
              <CardTitle className="text-sm font-medium leading-tight truncate">
                {card.cardName}
              </CardTitle>
            </div>
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className="text-xs shrink-0 rounded-full"
            >
              {isActive ? '發行中' : '已停發'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-2.5 flex-1">
          {/* Category highlights */}
          {categoryCount > 0 && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {categoryLabels.join('、')}
              {categoryCount > 3 && ` 等 ${categoryCount} 個類別`}
            </p>
          )}

          <div className="flex justify-between text-muted-foreground">
            <span>年費</span>
            <span className={cn(
              'font-semibold tabular-nums',
              isFree ? 'text-reward' : 'text-foreground',
            )}>
              {card.annualFee != null
                ? isFree
                  ? '免年費'
                  : `NT$ ${card.annualFee.toLocaleString()}`
                : '—'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 pt-0.5">
            {card.hasBenefitPlans && (
              <Badge variant="outline" className="text-xs rounded-full gap-0.5">
                <RefreshCw className="h-2.5 w-2.5" />
                可切換方案
              </Badge>
            )}
            {card.recommendationScopes.includes('RECOMMENDABLE') && (
              <Badge variant="outline" className="text-xs rounded-full text-reward border-reward/30">
                可推薦
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

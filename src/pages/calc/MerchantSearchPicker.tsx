import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { FilterChip } from '@/components/ui/filter-chip'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS, SUBCATEGORY_LABELS, type Category } from '@/types'
import {
  CATEGORY_FACETS,
  buildMerchantSearchOptions,
  filterMerchantSearchOptions,
  getFeaturedMerchantOptions,
  getNoMatchFallbackCategories,
  type MerchantSearchOption,
} from './merchant-search'

interface MerchantSearchPickerProps {
  selectedMerchant: MerchantSearchOption | null
  fallbackCategory: Category | null
  error?: string
  onMerchantSelect: (merchant: MerchantSearchOption) => void
  onMerchantClear: () => void
  onFallbackCategorySelect: (category: Category) => void
}

const MAX_RESULTS = 16

function merchantSceneLabel(merchant: MerchantSearchOption) {
  const categoryLabel = CATEGORY_LABELS[merchant.category]
  const subcategoryLabel = SUBCATEGORY_LABELS[merchant.subcategory] ?? merchant.subcategory
  return `${categoryLabel} / ${subcategoryLabel}`
}

export function MerchantSearchPicker({
  selectedMerchant,
  fallbackCategory,
  error,
  onMerchantSelect,
  onMerchantClear,
  onFallbackCategorySelect,
}: MerchantSearchPickerProps) {
  const [query, setQuery] = useState('')
  const [categoryFacet, setCategoryFacet] = useState<Category | null>(null)
  const options = useMemo(() => buildMerchantSearchOptions(), [])
  const featuredMerchants = useMemo(() => getFeaturedMerchantOptions(options), [options])
  const filteredMerchants = useMemo(
    () => filterMerchantSearchOptions({ options, query, categoryFacet }).slice(0, MAX_RESULTS),
    [options, query, categoryFacet],
  )
  const fallbackCategories = useMemo(() => getNoMatchFallbackCategories(), [])
  const hasQuery = query.trim().length > 0
  const merchantsToRender = hasQuery || categoryFacet ? filteredMerchants : featuredMerchants
  const hasNoMatches = hasQuery && filteredMerchants.length === 0
  const fallbackLabel = fallbackCategory ? CATEGORY_LABELS[fallbackCategory] : null

  function handleSelect(merchant: MerchantSearchOption) {
    onMerchantSelect(merchant)
    setQuery('')
    setCategoryFacet(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label htmlFor="calc-merchant-search" className="text-sm font-medium">
            選擇商家
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            指定店家優惠只會套用在支援清單內的商家。
          </p>
        </div>
        {selectedMerchant && (
          <button
            type="button"
            onClick={onMerchantClear}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            重新選擇
          </button>
        )}
      </div>

      {selectedMerchant ? (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{selectedMerchant.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                系統定位：{merchantSceneLabel(selectedMerchant)}
              </p>
            </div>
            <button
              type="button"
              onClick={onMerchantClear}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              aria-label={`清除 ${selectedMerchant.label}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="calc-merchant-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜尋商家，例如 momo、星巴克、Agoda"
                className={cn('pl-9', error && 'border-destructive focus-visible:ring-destructive')}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_FACETS.map((facet) => (
                <FilterChip
                  key={facet.value ?? 'ALL'}
                  active={categoryFacet === facet.value}
                  onClick={() => setCategoryFacet(facet.value)}
                >
                  {facet.label}
                </FilterChip>
              ))}
            </div>

            {fallbackLabel && (
              <p className="rounded-lg border border-amber-300/60 bg-amber-50 p-2 text-xs leading-relaxed text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-300">
                目前改用 {fallbackLabel} 做一般場景比較，結果不會套用指定店家限制。
              </p>
            )}

            {!hasNoMatches && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  {hasQuery || categoryFacet ? '搜尋結果' : '常用商家'}
                </p>
                <div className="max-h-56 overflow-y-auto rounded-lg border bg-background p-2">
                  <div className="flex flex-wrap gap-1.5">
                    {merchantsToRender.map((merchant) => (
                      <FilterChip
                        key={merchant.value}
                        active={false}
                        onClick={() => handleSelect(merchant)}
                        className="justify-start"
                      >
                        {merchant.label}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {hasNoMatches && (
              <div className="space-y-2 rounded-lg border bg-background p-3">
                <p className="text-sm font-medium">找不到這家店</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  CardSense 只會對支援清單內的商家套用指定店家優惠。你可以改用消費類別做一般比較。
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {fallbackCategories.map((category) => (
                    <FilterChip
                      key={category.value}
                      active={fallbackCategory === category.value}
                      onClick={() => onFallbackCategorySelect(category.value)}
                    >
                      改用{category.label}比較
                    </FilterChip>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

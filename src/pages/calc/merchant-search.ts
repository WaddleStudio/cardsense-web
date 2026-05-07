import rawMerchantRegistry from '@contracts/taxonomy/merchant-registry.json'
import { CATEGORY_LABELS, type Category } from '@/types'

interface RawMerchant {
  code: string
  label: string
  category: Category
  subcategory: string
  aliases?: string[]
}

export interface MerchantSearchOption {
  value: string
  label: string
  category: Category
  subcategory: string
  aliases: string[]
}

export const FEATURED_MERCHANT_CODES = [
  'PXMART',
  'CARREFOUR',
  'MOMO',
  'SHOPEE',
  'AGODA',
  'STARBUCKS',
  'UBER_EATS',
  'MCDONALD',
] as const

export const CATEGORY_FACETS: { value: Category | null; label: string }[] = [
  { value: null, label: '全部' },
  { value: 'DINING', label: CATEGORY_LABELS.DINING },
  { value: 'ONLINE', label: CATEGORY_LABELS.ONLINE },
  { value: 'GROCERY', label: CATEGORY_LABELS.GROCERY },
  { value: 'TRAVEL', label: CATEGORY_LABELS.TRAVEL },
  { value: 'TRANSPORT', label: CATEGORY_LABELS.TRANSPORT },
  { value: 'SHOPPING', label: CATEGORY_LABELS.SHOPPING },
  { value: 'ENTERTAINMENT', label: CATEGORY_LABELS.ENTERTAINMENT },
  { value: 'OVERSEAS', label: CATEGORY_LABELS.OVERSEAS },
]

export function buildMerchantSearchOptions(): MerchantSearchOption[] {
  return (rawMerchantRegistry as RawMerchant[]).map((merchant) => ({
    value: merchant.code,
    label: merchant.label,
    category: merchant.category,
    subcategory: merchant.subcategory,
    aliases: merchant.aliases ?? [],
  }))
}

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase()
}

function matchesQuery(merchant: MerchantSearchOption, query: string) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true
  return [merchant.value, merchant.label, ...merchant.aliases].some((candidate) =>
    normalizeSearchText(candidate).includes(normalizedQuery),
  )
}

export function filterMerchantSearchOptions({
  options,
  query,
  categoryFacet,
}: {
  options: MerchantSearchOption[]
  query: string
  categoryFacet: Category | null
}) {
  return options
    .filter((merchant) => !categoryFacet || merchant.category === categoryFacet)
    .filter((merchant) => matchesQuery(merchant, query))
}

export function getFeaturedMerchantOptions(options: MerchantSearchOption[]) {
  const byCode = new Map(options.map((merchant) => [merchant.value, merchant]))
  return FEATURED_MERCHANT_CODES.map((code) => byCode.get(code)).filter(
    (merchant): merchant is MerchantSearchOption => merchant !== undefined,
  )
}

export function getNoMatchFallbackCategories() {
  return [
    { value: 'DINING' as const, label: CATEGORY_LABELS.DINING },
    { value: 'ONLINE' as const, label: CATEGORY_LABELS.ONLINE },
    { value: 'TRAVEL' as const, label: CATEGORY_LABELS.TRAVEL },
    { value: 'GROCERY' as const, label: CATEGORY_LABELS.GROCERY },
  ]
}

import type { Category } from '@/types'

export type MerchantIntent = 'merchant' | 'general'

interface CategoryStateInput {
  currentCategory: Category | null
  currentSubcategory: string | null
  nextCategory: Category | null
  nextSubcategory?: string | null
}

export function getEffectiveMerchantName(intent: MerchantIntent, merchantName: string) {
  if (intent === 'general') return ''
  return merchantName.trim()
}

export function getNextCategoryState({
  currentCategory,
  currentSubcategory,
  nextCategory,
  nextSubcategory,
}: CategoryStateInput): { category: Category | null; subcategory: string | null } {
  if (!nextCategory) {
    return { category: null, subcategory: null }
  }

  if (nextSubcategory !== undefined) {
    return { category: nextCategory, subcategory: nextSubcategory }
  }

  if (currentCategory === nextCategory) {
    return { category: nextCategory, subcategory: currentSubcategory }
  }

  return { category: nextCategory, subcategory: null }
}

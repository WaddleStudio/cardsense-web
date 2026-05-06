import { describe, expect, it } from 'vitest'
import {
  getEffectiveMerchantName,
  getNextCategoryState,
  type MerchantIntent,
} from './merchant-intent'

describe('merchant intent helpers', () => {
  it('uses trimmed merchant name only for merchant intent', () => {
    expect(getEffectiveMerchantName('merchant', ' pxmart ')).toBe('pxmart')
    expect(getEffectiveMerchantName('general', 'pxmart')).toBe('')
  })

  it('keeps inferred category and subcategory when a shortcut supplies both', () => {
    expect(
      getNextCategoryState({
        currentCategory: null,
        currentSubcategory: null,
        nextCategory: 'GROCERY',
        nextSubcategory: 'SUPERMARKET',
      }),
    ).toEqual({
      category: 'GROCERY',
      subcategory: 'SUPERMARKET',
    })
  })

  it('clears stale subcategory when category is cleared', () => {
    expect(
      getNextCategoryState({
        currentCategory: 'DINING',
        currentSubcategory: 'BUFFET',
        nextCategory: null,
        nextSubcategory: 'BUFFET',
      }),
    ).toEqual({
      category: null,
      subcategory: null,
    })
  })

  it('clears stale subcategory when category changes without an explicit subcategory', () => {
    expect(
      getNextCategoryState({
        currentCategory: 'DINING',
        currentSubcategory: 'BUFFET',
        nextCategory: 'ONLINE',
        nextSubcategory: undefined,
      }),
    ).toEqual({
      category: 'ONLINE',
      subcategory: null,
    })
  })

  it('keeps subcategory when category is unchanged and no explicit subcategory is provided', () => {
    expect(
      getNextCategoryState({
        currentCategory: 'DINING',
        currentSubcategory: 'BUFFET',
        nextCategory: 'DINING',
      }),
    ).toEqual({
      category: 'DINING',
      subcategory: 'BUFFET',
    })
  })

  it('exports the intent type used by UI code', () => {
    const intent: MerchantIntent = 'general'
    expect(intent).toBe('general')
  })
})

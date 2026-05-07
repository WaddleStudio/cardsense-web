import { describe, expect, it } from 'vitest'
import {
  CATEGORY_FACETS,
  FEATURED_MERCHANT_CODES,
  buildMerchantSearchOptions,
  filterMerchantSearchOptions,
  getFeaturedMerchantOptions,
  getNoMatchFallbackCategories,
} from './merchant-search'

describe('merchant search helpers', () => {
  const options = buildMerchantSearchOptions()

  it('keeps featured merchants registry-backed and ordered', () => {
    expect(getFeaturedMerchantOptions(options).map((merchant) => merchant.value)).toEqual(
      FEATURED_MERCHANT_CODES,
    )
  })

  it('searches by label, code, and aliases', () => {
    expect(filterMerchantSearchOptions({ options, query: '星巴克', categoryFacet: null })[0]).toMatchObject({
      value: 'STARBUCKS',
      category: 'DINING',
      subcategory: 'CAFE',
    })

    expect(filterMerchantSearchOptions({ options, query: 'uber eats', categoryFacet: null })[0]).toMatchObject({
      value: 'UBER_EATS',
    })
  })

  it('uses category facet only to narrow results', () => {
    const dining = filterMerchantSearchOptions({ options, query: '', categoryFacet: 'DINING' })
    expect(dining.length).toBeGreaterThan(0)
    expect(dining.every((merchant) => merchant.category === 'DINING')).toBe(true)
    expect(CATEGORY_FACETS.map((facet) => facet.value)).toContain('DINING')
  })

  it('returns explicit fallback categories for no-match search', () => {
    expect(getNoMatchFallbackCategories().map((category) => category.value)).toEqual([
      'DINING',
      'ONLINE',
      'TRAVEL',
      'GROCERY',
    ])
  })
})

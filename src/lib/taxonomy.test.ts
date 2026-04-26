import { describe, expect, it } from 'vitest'
import { POPULAR_MERCHANT_SHORTCUTS } from './taxonomy'

describe('POPULAR_MERCHANT_SHORTCUTS', () => {
  it('keeps the homepage merchant shortcuts aligned with high-signal covered merchants', () => {
    expect(POPULAR_MERCHANT_SHORTCUTS.map((merchant) => merchant.value)).toEqual([
      'PXMART',
      'CARREFOUR',
      'MOMO',
      'SHOPEE',
      'AGODA',
      'STARBUCKS',
      'UBER_EATS',
      'MCDONALD',
    ])
  })

  it('only exposes shortcuts that exist in the shared merchant registry', () => {
    expect(POPULAR_MERCHANT_SHORTCUTS).toHaveLength(8)
    expect(POPULAR_MERCHANT_SHORTCUTS.every((merchant) => merchant.label.length > 0)).toBe(true)
  })
})

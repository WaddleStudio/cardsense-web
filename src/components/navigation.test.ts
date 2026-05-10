import { describe, expect, it } from 'vitest'
import { NAV_ITEMS } from './navigation'

describe('NAV_ITEMS', () => {
  it('does not expose the removed recommendation page', () => {
    expect(NAV_ITEMS.map((item) => item.to)).toEqual(['/', '/cards'])
  })

  it('names the primary calculator surface as a card decision flow', () => {
    expect(NAV_ITEMS[0].label).toBe('刷卡決策')
  })
})

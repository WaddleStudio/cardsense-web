import { describe, expect, it } from 'vitest'
import { NAV_ITEMS } from './navigation'

describe('NAV_ITEMS', () => {
  it('does not expose the removed recommendation page', () => {
    expect(NAV_ITEMS.map((item) => item.to)).toEqual(['/', '/cards'])
  })
})

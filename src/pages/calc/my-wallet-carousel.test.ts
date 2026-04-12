import { describe, expect, it } from 'vitest'
import { buildWalletCarouselCards, clampWalletCarouselIndex } from './my-wallet-carousel'
import type { CardSummary } from '@/types'

const cards = [
  { cardCode: 'CATHAY_CUBE', cardName: 'CUBE Card', bankName: 'Cathay' },
  { cardCode: 'ESUN_UNICARD', cardName: 'Unicard', bankName: 'E.SUN' },
  { cardCode: 'TAISHIN_RICHART', cardName: 'Richart Card', bankName: 'Taishin' },
] as CardSummary[]

describe('buildWalletCarouselCards', () => {
  it('preserves selected card order and skips unavailable cards', () => {
    expect(
      buildWalletCarouselCards(['TAISHIN_RICHART', 'MISSING', 'CATHAY_CUBE'], cards),
    ).toEqual([
      {
        cardCode: 'TAISHIN_RICHART',
        cardName: 'Richart Card',
        bankName: 'Taishin',
      },
      {
        cardCode: 'CATHAY_CUBE',
        cardName: 'CUBE Card',
        bankName: 'Cathay',
      },
    ])
  })
})

describe('clampWalletCarouselIndex', () => {
  it('keeps the active index inside the card list', () => {
    expect(clampWalletCarouselIndex(4, 3)).toBe(2)
    expect(clampWalletCarouselIndex(-1, 3)).toBe(0)
    expect(clampWalletCarouselIndex(2, 0)).toBe(0)
  })
})

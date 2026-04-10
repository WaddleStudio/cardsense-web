import { describe, expect, it } from 'vitest'
import type { RecommendationRequest } from '@/types'
import { buildCalcRecommendationRequest } from './buildCalcRecommendationRequest'

const baseInput = {
  amount: 1200,
  category: 'DINING' as const,
  subcategory: 'BUFFET',
  merchantName: 'Agoda',
  paymentMethod: 'APPLE_PAY',
  activePlansByCard: { CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL' },
  planRuntimeByCard: { CATHAY_CUBE: { tier: 'LEVEL_1' } },
  benefitPlanTiers: { CATHAY_CUBE: 'LEVEL_1' },
}

describe('buildCalcRecommendationRequest', () => {
  it('omits customExchangeRates when no overrides are active', () => {
    expect(
      buildCalcRecommendationRequest({
        ...baseInput,
        cardCodes: ['CARD_A', 'CARD_B'],
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 6,
        },
        customExchangeRates: {},
      }),
    ).toEqual<RecommendationRequest>({
      amount: 1200,
      category: 'DINING',
      subcategory: 'BUFFET',
      scenario: {
        merchantName: 'AGODA',
        paymentMethod: 'APPLE_PAY',
      },
      activePlansByCard: { CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL' },
      planRuntimeByCard: { CATHAY_CUBE: { tier: 'LEVEL_1' } },
      benefitPlanTiers: { CATHAY_CUBE: 'LEVEL_1' },
      cardCodes: ['CARD_A', 'CARD_B'],
      comparison: {
        includePromotionBreakdown: false,
        maxResults: 6,
      },
    })
  })

  it('includes customExchangeRates when overrides are active', () => {
    expect(
      buildCalcRecommendationRequest({
        ...baseInput,
        cardCodes: ['CARD_A', 'CARD_B'],
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 10,
        },
        customExchangeRates: {
          'POINTS.ESUN': 0.8,
          'MILES._DEFAULT': 0.6,
        },
      }),
    ).toEqual<RecommendationRequest>({
      amount: 1200,
      category: 'DINING',
      subcategory: 'BUFFET',
      scenario: {
        merchantName: 'AGODA',
        paymentMethod: 'APPLE_PAY',
      },
      activePlansByCard: { CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL' },
      planRuntimeByCard: { CATHAY_CUBE: { tier: 'LEVEL_1' } },
      benefitPlanTiers: { CATHAY_CUBE: 'LEVEL_1' },
      cardCodes: ['CARD_A', 'CARD_B'],
      comparison: {
        includePromotionBreakdown: false,
        maxResults: 10,
      },
      customExchangeRates: {
        'POINTS.ESUN': 0.8,
        'MILES._DEFAULT': 0.6,
      },
    })
  })
})

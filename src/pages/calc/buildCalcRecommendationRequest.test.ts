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

  it('builds selected merchant requests with registry metadata', () => {
    expect(
      buildCalcRecommendationRequest({
        ...baseInput,
        category: 'DINING',
        subcategory: 'CAFE',
        merchantName: 'STARBUCKS',
        activePlansByCard: {},
        planRuntimeByCard: {},
        benefitPlanTiers: {},
        cardCodes: ['CARD_A', 'CARD_B'],
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 10,
        },
        customExchangeRates: {},
      }),
    ).toEqual<RecommendationRequest>({
      amount: 1200,
      category: 'DINING',
      subcategory: 'CAFE',
      scenario: {
        merchantName: 'STARBUCKS',
        paymentMethod: 'APPLE_PAY',
      },
      cardCodes: ['CARD_A', 'CARD_B'],
      comparison: {
        includePromotionBreakdown: false,
        maxResults: 10,
      },
    })
  })

  it('builds explicit category fallback requests without merchant', () => {
    expect(
      buildCalcRecommendationRequest({
        ...baseInput,
        category: 'DINING',
        subcategory: null,
        merchantName: null,
        activePlansByCard: {},
        planRuntimeByCard: {},
        benefitPlanTiers: {},
        cardCodes: ['CARD_A', 'CARD_B'],
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 10,
        },
        customExchangeRates: {},
      }),
    ).toEqual<RecommendationRequest>({
      amount: 1200,
      category: 'DINING',
      scenario: {
        paymentMethod: 'APPLE_PAY',
      },
      cardCodes: ['CARD_A', 'CARD_B'],
      comparison: {
        includePromotionBreakdown: false,
        maxResults: 10,
      },
    })
  })

  it('omits subcategory when category is null', () => {
    expect(
      buildCalcRecommendationRequest({
        ...baseInput,
        category: null,
        subcategory: 'BUFFET',
        paymentMethod: null,
        activePlansByCard: {},
        planRuntimeByCard: {},
        benefitPlanTiers: {},
        cardCodes: [],
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 1,
        },
        customExchangeRates: {},
      }),
    ).toEqual<RecommendationRequest>({
      amount: 1200,
      scenario: {
        merchantName: 'AGODA',
      },
      cardCodes: [],
      comparison: {
        includePromotionBreakdown: false,
        maxResults: 1,
      },
    })
  })

  it('omits scenario when no scenario fields are selected', () => {
    expect(
      buildCalcRecommendationRequest({
        ...baseInput,
        category: null,
        subcategory: null,
        merchantName: null,
        paymentMethod: null,
        activePlansByCard: {},
        planRuntimeByCard: {},
        benefitPlanTiers: {},
        cardCodes: [],
        comparison: {
          includePromotionBreakdown: false,
          maxResults: 1,
        },
        customExchangeRates: {},
      }),
    ).toEqual<RecommendationRequest>({
      amount: 1200,
      cardCodes: [],
      comparison: {
        includePromotionBreakdown: false,
        maxResults: 1,
      },
    })
  })
})

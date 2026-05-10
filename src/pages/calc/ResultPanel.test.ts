import { describe, expect, it } from 'vitest'
import { processResult } from './result-processing'
import type { CardRecommendation } from '@/types'

function recommendation(overrides: Partial<CardRecommendation>): CardRecommendation {
  return {
    bankName: 'Bank',
    cardName: 'Card',
    cardCode: 'CARD',
    estimatedReturn: 0,
    matchedPromotionCount: 1,
    confidence: 1,
    conditions: [],
    ...overrides,
  } as CardRecommendation
}

describe('processResult', () => {
  it('keeps the headline gap at the transaction level instead of annualizing it', () => {
    const result = processResult([
      recommendation({ cardName: 'Best', estimatedReturn: 54 }),
      recommendation({ cardName: 'Worst', estimatedReturn: 14 }),
    ])

    expect(result?.headlineDiff).toBe(40)
  })
})

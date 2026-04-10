import { describe, expect, it } from 'vitest'
import type { RewardDetail } from '@/types'
import { formatRewardDetailExplainability } from './reward-detail-explainability'

describe('formatRewardDetailExplainability', () => {
  it('formats a system-default reward detail into a readable explanation block', () => {
    const detail: RewardDetail = {
      rawReward: 4000,
      rawUnit: 'Asia Miles',
      exchangeRate: 0.4,
      exchangeRateSource: 'SYSTEM_DEFAULT',
      ntdEquivalent: 1600,
      note: 'Conservative long-haul economy valuation',
    }

    expect(formatRewardDetailExplainability(detail)).toEqual({
      primaryLine: '4,000 Asia Miles × 0.4 TWD = NT$ 1,600',
      sourceLabel: 'System rate',
      noteLine: 'Conservative long-haul economy valuation',
    })
  })

  it('marks user-custom reward detail with the custom source label', () => {
    const detail: RewardDetail = {
      rawReward: 1200,
      rawUnit: 'e point',
      exchangeRate: 0.8,
      exchangeRateSource: 'USER_CUSTOM',
      ntdEquivalent: 960,
      note: null,
    }

    expect(formatRewardDetailExplainability(detail)).toEqual({
      primaryLine: '1,200 e point × 0.8 TWD = NT$ 960',
      sourceLabel: 'Custom rate',
      noteLine: null,
    })
  })
})

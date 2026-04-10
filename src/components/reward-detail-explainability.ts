import type { RewardDetail } from '@/types'

function formatRewardDetailValue(value: number) {
  return Number.isInteger(value)
    ? value.toLocaleString()
    : value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function formatRewardDetailExplainability(detail: RewardDetail) {
  return {
    primaryLine:
      `${formatRewardDetailValue(detail.rawReward)} ${detail.rawUnit} × ` +
      `${formatRewardDetailValue(detail.exchangeRate)} TWD = NT$ ${formatRewardDetailValue(detail.ntdEquivalent)}`,
    sourceLabel: detail.exchangeRateSource === 'USER_CUSTOM' ? 'Custom rate' : 'System rate',
    noteLine: detail.note,
  }
}

import { describe, expect, it } from 'vitest'
import { buildDecisionReadinessSummary } from './decision-readiness'

describe('buildDecisionReadinessSummary', () => {
  it('asks for a merchant scenario before wallet comparison', () => {
    const summary = buildDecisionReadinessSummary({
      hasMerchantScenario: false,
      selectedCardCount: 3,
      amount: 1200,
    })

    expect(summary.state).toBe('needs-merchant')
    expect(summary.steps.find((step) => step.key === 'wallet')?.complete).toBe(true)
  })

  it('requires at least two wallet cards', () => {
    const summary = buildDecisionReadinessSummary({
      hasMerchantScenario: true,
      selectedCardCount: 1,
      amount: 1200,
    })

    expect(summary.state).toBe('needs-wallet')
    expect(summary.steps.find((step) => step.key === 'wallet')?.detail).toBe('再選 1 張卡開始比較')
  })

  it('marks the decision ready when merchant, wallet, and amount are valid', () => {
    const summary = buildDecisionReadinessSummary({
      hasMerchantScenario: true,
      selectedCardCount: 4,
      amount: 3000,
    })

    expect(summary.state).toBe('ready')
    expect(summary.steps.every((step) => step.complete)).toBe(true)
  })
})

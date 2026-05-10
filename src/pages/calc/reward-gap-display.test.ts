import { describe, expect, it } from 'vitest'
import { REWARD_GAP_DISPLAY } from './reward-gap-display'

describe('REWARD_GAP_DISPLAY', () => {
  it('uses checkout-summary wording instead of terminal labels', () => {
    expect(REWARD_GAP_DISPLAY.title).toBe('刷卡回饋差距')
    expect(REWARD_GAP_DISPLAY.eyebrow).toBe('比最佳少拿')
    expect(REWARD_GAP_DISPLAY.receiptLabel).toBe('比較收據')
    expect(REWARD_GAP_DISPLAY.currentLabel).toBe('最低回饋')
    expect(REWARD_GAP_DISPLAY.title).not.toMatch(/pos|reward gap|calc/i)
  })
})

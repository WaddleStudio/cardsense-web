import { describe, expect, it } from 'vitest'
import { shouldRunWalletAutoSelect } from './my-wallet-auto-select'

describe('shouldRunWalletAutoSelect', () => {
  it('returns false when a restored wallet already has at least two cards', () => {
    expect(
      shouldRunWalletAutoSelect({
        hasRestoredWallet: true,
        selectedCardCount: 2,
      }),
    ).toBe(false)
  })

  it('returns true when no wallet was restored', () => {
    expect(
      shouldRunWalletAutoSelect({
        hasRestoredWallet: false,
        selectedCardCount: 0,
      }),
    ).toBe(true)
  })

  it('returns true when the restored wallet has fewer than two cards', () => {
    expect(
      shouldRunWalletAutoSelect({
        hasRestoredWallet: true,
        selectedCardCount: 1,
      }),
    ).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import { shouldRunWalletAutoSelect } from './my-wallet-auto-select'

describe('shouldRunWalletAutoSelect', () => {
  it('returns false when a restored wallet already has at least two cards', () => {
    expect(
      shouldRunWalletAutoSelect({
        hasRestoredWallet: true,
        selectedCardCount: 2,
        selectionMode: 'manual',
      }),
    ).toBe(false)
  })

  it('returns true when no wallet was restored', () => {
    expect(
      shouldRunWalletAutoSelect({
        hasRestoredWallet: false,
        selectedCardCount: 0,
        selectionMode: 'initial',
      }),
    ).toBe(true)
  })

  it('returns true when auto-selected cards can still refresh', () => {
    expect(
      shouldRunWalletAutoSelect({
        hasRestoredWallet: false,
        selectedCardCount: 6,
        selectionMode: 'auto',
      }),
    ).toBe(true)
  })

  it('returns true for restored wallets with fewer than two cards when the state is not manual', () => {
    expect(
      shouldRunWalletAutoSelect({
        hasRestoredWallet: true,
        selectedCardCount: 1,
        selectionMode: 'initial',
      }),
    ).toBe(true)
  })

  it('returns false after an explicit manual clear leaves no cards selected', () => {
    expect(
      shouldRunWalletAutoSelect({
        hasRestoredWallet: false,
        selectedCardCount: 0,
        selectionMode: 'manual',
      }),
    ).toBe(false)
  })

  it('returns false for explicit manual selections even without a restored wallet', () => {
    expect(
      shouldRunWalletAutoSelect({
        hasRestoredWallet: false,
        selectedCardCount: 3,
        selectionMode: 'manual',
      }),
    ).toBe(false)
  })
})

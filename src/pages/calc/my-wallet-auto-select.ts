export type WalletCardSelectionMode = 'initial' | 'auto' | 'manual'

interface ShouldRunWalletAutoSelectInput {
  hasRestoredWallet: boolean
  selectedCardCount: number
  selectionMode: WalletCardSelectionMode
}

export function shouldRunWalletAutoSelect({
  hasRestoredWallet,
  selectedCardCount,
  selectionMode,
}: ShouldRunWalletAutoSelectInput): boolean {
  if (selectionMode === 'manual') {
    return false
  }

  if (!hasRestoredWallet) {
    return true
  }

  return selectedCardCount < 2
}

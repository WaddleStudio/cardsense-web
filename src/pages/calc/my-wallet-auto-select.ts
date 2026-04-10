interface ShouldRunWalletAutoSelectInput {
  hasRestoredWallet: boolean
  selectedCardCount: number
}

export function shouldRunWalletAutoSelect({
  hasRestoredWallet,
  selectedCardCount,
}: ShouldRunWalletAutoSelectInput): boolean {
  if (!hasRestoredWallet) {
    return true
  }

  return selectedCardCount < 2
}

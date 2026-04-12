import type { CardSummary } from '@/types'

export interface WalletCarouselCard {
  cardCode: string
  cardName: string
  bankName: string
}

export function buildWalletCarouselCards(
  selectedCardCodes: string[],
  cards: CardSummary[] | undefined,
): WalletCarouselCard[] {
  if (!cards || cards.length === 0) return []

  const cardsByCode = new Map(cards.map((card) => [card.cardCode, card]))

  return selectedCardCodes
    .map((cardCode) => cardsByCode.get(cardCode))
    .filter((card): card is CardSummary => Boolean(card))
    .map((card) => ({
      cardCode: card.cardCode,
      cardName: card.cardName,
      bankName: card.bankName,
    }))
}

export function clampWalletCarouselIndex(index: number, cardCount: number) {
  if (cardCount <= 0) return 0
  return Math.min(Math.max(index, 0), cardCount - 1)
}

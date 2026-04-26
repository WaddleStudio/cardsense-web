import { useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CardSummary } from '@/types'
import {
  buildWalletCarouselCards,
  clampWalletCarouselIndex,
} from './my-wallet-carousel'

interface MyWalletPanelProps {
  selectedCardCodes: string[]
  cards: CardSummary[] | undefined
  selectedCardCount: number
  activePlanCount: number
  customRateCount: number
  savedAt: string | null
  hasRestoredWallet: boolean
  hasUnsavedChanges: boolean
  canClear: boolean
  statusMessage: string | null
  onSave: () => void
  onClear: () => void
}

function buildSummaryLine(selectedCardCount: number, activePlanCount: number, customRateCount: number) {
  const parts: string[] = []
  parts.push(selectedCardCount === 1 ? '1 selected card' : `${selectedCardCount} selected cards`)
  if (activePlanCount > 0)
    parts.push(activePlanCount === 1 ? '1 active plan' : `${activePlanCount} active plans`)
  if (customRateCount > 0)
    parts.push(customRateCount === 1 ? '1 custom rate' : `${customRateCount} custom rates`)
  return parts.join(', ')
}

function formatSavedAt(savedAt: string) {
  const parsed = new Date(savedAt)
  if (Number.isNaN(parsed.getTime())) return savedAt

  return parsed.toLocaleString()
}

export function MyWalletPanel({
  selectedCardCodes,
  cards,
  selectedCardCount,
  activePlanCount,
  customRateCount,
  savedAt,
  hasRestoredWallet,
  hasUnsavedChanges,
  canClear,
  statusMessage,
  onSave,
  onClear,
}: MyWalletPanelProps) {
  const walletCards = buildWalletCarouselCards(selectedCardCodes, cards)
  const [activeIndex, setActiveIndex] = useState(0)
  const summaryLine = buildSummaryLine(selectedCardCount, activePlanCount, customRateCount)
  const statusLine =
    statusMessage ??
    (hasRestoredWallet
      ? 'Wallet restored from saved data.'
      : 'Save your card selection, benefit-plan state, and exchange-rate preferences so they are ready next time in this browser.')
  const safeActiveIndex = clampWalletCarouselIndex(activeIndex, walletCards.length)
  const activeCard = walletCards[safeActiveIndex]
  const hasMultipleCards = walletCards.length > 1

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">My Wallet</h3>
        <p className="text-xs text-muted-foreground">{summaryLine}</p>
      </div>

      <div className="rounded-lg border bg-background/70 p-3">
        {activeCard ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Card {safeActiveIndex + 1} / {walletCards.length}
                </p>
                <p className="mt-2 truncate text-sm font-semibold">{activeCard.cardName}</p>
                <p className="text-xs text-muted-foreground">{activeCard.bankName}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>

            {hasMultipleCards && (
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="cursor-pointer"
                  aria-label="Previous wallet card"
                  onClick={() =>
                    setActiveIndex((current) =>
                      current === 0 ? walletCards.length - 1 : current - 1,
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex min-w-0 flex-1 justify-center gap-1.5" aria-label="Wallet card position">
                  {walletCards.map((card, index) => (
                    <button
                      key={card.cardCode}
                      type="button"
                      aria-label={`Show ${card.cardName}`}
                      aria-current={index === safeActiveIndex}
                      className={`h-2 rounded-full transition-all ${
                        index === safeActiveIndex
                          ? 'w-6 bg-primary'
                          : 'w-2 cursor-pointer bg-muted-foreground/35 hover:bg-muted-foreground/60'
                      }`}
                      onClick={() => setActiveIndex(index)}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="cursor-pointer"
                  aria-label="Next wallet card"
                  onClick={() =>
                    setActiveIndex((current) =>
                      current >= walletCards.length - 1 ? 0 : current + 1,
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">No wallet cards selected</p>
              <p className="text-xs text-muted-foreground">Choose cards below to build your wallet.</p>
            </div>
          </div>
        )}
      </div>

      {hasUnsavedChanges ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-400/50 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-sm leading-relaxed">{statusLine}</p>
        </div>
      ) : (
        <div className="space-y-2 rounded-lg bg-muted/35 p-3">
          <p className="text-sm leading-relaxed">{statusLine}</p>
          {savedAt && (
            <p className="text-xs text-muted-foreground">
              Last saved at:{' '}
              <span className="font-medium text-foreground">{formatSavedAt(savedAt)}</span>
            </p>
          )}
          <p className="text-xs leading-relaxed text-muted-foreground">
            Clearing removes the saved wallet and resets the current card, plan, and exchange-rate
            setup in this browser.
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" className="flex-1 cursor-pointer" onClick={onSave}>
            Save my wallet
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onClear}
            disabled={!canClear}
          >
            Clear wallet
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Saves cards, benefit plans, and exchange rate settings
        </p>
      </div>
    </section>
  )
}

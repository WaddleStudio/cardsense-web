import { Button } from '@/components/ui/button'

interface MyWalletPanelProps {
  selectedCardCount: number
  customRateCount: number
  savedAt: string | null
  hasRestoredWallet: boolean
  canClear: boolean
  statusMessage: string | null
  onSave: () => void
  onClear: () => void
}

function buildSummaryLine(selectedCardCount: number, customRateCount: number) {
  const cardLabel = selectedCardCount === 1 ? '1 selected card' : `${selectedCardCount} selected cards`
  const rateLabel =
    customRateCount === 1 ? '1 custom rate' : `${customRateCount} custom rates`

  return `${cardLabel}, ${rateLabel}`
}

function formatSavedAt(savedAt: string) {
  const parsed = new Date(savedAt)
  if (Number.isNaN(parsed.getTime())) return savedAt

  return parsed.toLocaleString()
}

export function MyWalletPanel({
  selectedCardCount,
  customRateCount,
  savedAt,
  hasRestoredWallet,
  canClear,
  statusMessage,
  onSave,
  onClear,
}: MyWalletPanelProps) {
  const summaryLine = buildSummaryLine(selectedCardCount, customRateCount)
  const statusLine =
    statusMessage ??
    (hasRestoredWallet
      ? 'Wallet restored from saved data.'
      : 'Save your card selection, benefit-plan state, and exchange-rate preferences so they are ready next time.')

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">My Wallet</h3>
        <p className="text-xs text-muted-foreground">{summaryLine}</p>
      </div>

      <div className="space-y-2 rounded-lg bg-muted/40 p-3">
        <p className="text-sm leading-relaxed">{statusLine}</p>
        {savedAt && (
          <p className="text-xs text-muted-foreground">
            Saved at: <span className="font-medium text-foreground">{formatSavedAt(savedAt)}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="flex-1" onClick={onSave}>
          Save my wallet
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClear}
          disabled={!canClear}
        >
          Clear wallet
        </Button>
      </div>
    </section>
  )
}

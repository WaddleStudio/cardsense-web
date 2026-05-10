import { ReceiptText, RefreshCw } from 'lucide-react'
import { REWARD_GAP_DISPLAY } from './reward-gap-display'

interface RewardGapBoxProps {
  headlineDiff: number
  bestLabel: string
  currentLabel: string
  bestReturn: number
  currentReturn: number
}

export function RewardGapBox({
  headlineDiff,
  bestLabel,
  currentLabel,
  bestReturn,
  currentReturn,
}: RewardGapBoxProps) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/35 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-primary">
            <ReceiptText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-tight">{REWARD_GAP_DISPLAY.title}</h3>
            <p className="text-xs text-muted-foreground">本次差距</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          <RefreshCw className="h-3 w-3" />
          {REWARD_GAP_DISPLAY.compareBadge}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="overflow-hidden rounded-lg border bg-background">
          <div className="flex items-center justify-between gap-3 border-b bg-muted/25 px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              {REWARD_GAP_DISPLAY.receiptLabel}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              NTD
            </span>
          </div>
          <ReceiptRow
            label={REWARD_GAP_DISPLAY.bestLabel}
            name={bestLabel}
            amount={bestReturn}
            tone="reward"
          />
          <ReceiptRow
            label={REWARD_GAP_DISPLAY.currentLabel}
            name={currentLabel}
            amount={currentReturn}
          />
          <div className="border-t border-dashed px-3 py-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{REWARD_GAP_DISPLAY.eyebrow}</span>
              <span>{REWARD_GAP_DISPLAY.diffLabel}</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <span className="text-lg font-semibold text-muted-foreground">
                {REWARD_GAP_DISPLAY.currency}
              </span>
              <span className="text-4xl font-bold tabular-nums tracking-normal text-destructive">
                {headlineDiff.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <p className="px-1 text-xs leading-relaxed text-muted-foreground">
          {REWARD_GAP_DISPLAY.note}
        </p>
      </div>
    </section>
  )
}

function ReceiptRow({
  label,
  name,
  amount,
  tone,
}: {
  label: string
  name: string
  amount: number
  tone?: 'reward'
}) {
  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-x-3 gap-y-1 border-b px-3 py-2.5 text-sm sm:grid-cols-[72px_minmax(0,1fr)_76px]">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="min-w-0 text-right">
        <p className="truncate font-medium" title={name}>
          {name}
        </p>
      </div>
      <span
        className={[
          'col-start-2 text-right font-semibold tabular-nums sm:col-start-auto',
          tone === 'reward' ? 'text-reward' : 'text-muted-foreground',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        +NT${amount.toLocaleString()}
      </span>
    </div>
  )
}

import { CheckCircle2, ReceiptText, RefreshCw } from 'lucide-react'
import { REWARD_GAP_DISPLAY } from './reward-gap-display'

interface RewardGapBoxProps {
  headlineDiff: number
}

export function RewardGapBox({ headlineDiff }: RewardGapBoxProps) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-primary/5 text-primary">
            <ReceiptText className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-tight">{REWARD_GAP_DISPLAY.title}</h3>
            <p className="text-xs text-muted-foreground">Checkout difference</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          <RefreshCw className="h-3 w-3" />
          {REWARD_GAP_DISPLAY.compareBadge}
        </span>
      </div>

      <div className="p-4">
        <div className="rounded-lg border border-primary/25 bg-muted/25 px-4 py-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="text-xs text-muted-foreground">{REWARD_GAP_DISPLAY.eyebrow}</p>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              NTD
            </span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <span className="text-lg font-semibold text-muted-foreground">
              {REWARD_GAP_DISPLAY.currency}
            </span>
            <span className="text-4xl font-bold tabular-nums tracking-normal text-foreground">
              {headlineDiff.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-green-900 dark:border-green-900 dark:bg-green-950/35 dark:text-green-200">
          <p className="text-sm font-semibold">{REWARD_GAP_DISPLAY.noteTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-green-800 dark:text-green-300">
            {REWARD_GAP_DISPLAY.noteBody}
          </p>
          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
            <CheckItem label="商家場景" detail="已套用本次店家條件" />
            <CheckItem label="我的卡包" detail="只比較已選卡片" />
            <CheckItem label="消費金額" detail={`NT$${headlineDiff.toLocaleString()} 差距`} />
          </div>
        </div>
      </div>
    </section>
  )
}

function CheckItem({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex min-w-0 gap-2">
      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="min-w-0">
        <p className="font-medium leading-tight">{label}</p>
        <p className="truncate text-green-700 dark:text-green-300">{detail}</p>
      </div>
    </div>
  )
}

import { CheckCircle2, Circle, Delete, ReceiptText, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DecisionReadinessSummary } from './decision-readiness'

const QUICK_AMOUNTS = [500, 1000, 3000, 5000]

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  merchantLabel: string
  paymentMethodLabel: string
  walletCardCount: number
  readiness: DecisionReadinessSummary
}

function formatQuickAmount(amount: number) {
  return amount >= 1000 ? `${amount / 1000}K` : amount.toLocaleString()
}

function sanitizeAmount(value: string) {
  const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
  if (!digits) return ''

  const next = parseInt(digits, 10)
  return String(Math.min(next, 100_000))
}

export function AmountInput({
  value,
  onChange,
  error,
  merchantLabel,
  paymentMethodLabel,
  walletCardCount,
  readiness,
}: AmountInputProps) {
  const numeric = value === '' ? 0 : parseInt(value, 10)
  const displayValue = numeric === 0 ? '' : numeric.toLocaleString()
  const walletLine = walletCardCount > 0 ? `${walletCardCount} 張卡待比較` : '尚未選卡'
  const isReady = readiness.state === 'ready'

  function handleDirectInput(nextValue: string) {
    onChange(sanitizeAmount(nextValue))
  }

  function handleBackspace() {
    onChange(value.slice(0, -1))
  }

  function handleClear() {
    onChange('')
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/35 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
            <ReceiptText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <label htmlFor="checkout-amount" className="text-sm font-semibold">
              結帳金額
            </label>
            <p className="truncate text-xs text-muted-foreground">Checkout total</p>
          </div>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-[11px] font-medium',
            isReady ? 'text-reward' : 'text-muted-foreground',
          )}
        >
          <ScanLine className="h-3.5 w-3.5" />
          <span>{isReady ? '可比較' : '待決策'}</span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-lg border bg-background">
          <CheckoutRow label="商家" value={merchantLabel} />
          <CheckoutRow label="付款方式" value={paymentMethodLabel} />
          <CheckoutRow label="我的卡包" value={walletLine} />
        </div>

        <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>本次消費</span>
            <span className="font-mono tracking-[0.18em]">NTD</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="pb-1 text-lg font-semibold text-muted-foreground">NT$</span>
            <input
              id="checkout-amount"
              value={displayValue}
              onChange={(event) => handleDirectInput(event.target.value)}
              inputMode="numeric"
              placeholder="0"
              className={cn(
                'min-w-0 flex-1 bg-transparent text-right text-4xl font-bold leading-none tabular-nums outline-none',
                'placeholder:text-muted-foreground/35',
              )}
              aria-invalid={Boolean(error)}
            />
          </div>
          {error && <p className="mt-2 text-right text-xs font-medium text-destructive">{error}</p>}
        </div>

        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto_auto] gap-1.5">
          {QUICK_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => onChange(String(amount))}
              className="min-h-touch-sm rounded-md border bg-background px-2 text-xs font-semibold tabular-nums transition-colors hover:bg-accent"
            >
              {formatQuickAmount(amount)}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="flex min-h-touch-sm w-10 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="刪除最後一位金額"
          >
            <Delete className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="min-h-touch-sm w-10 rounded-md border bg-background text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="清除金額"
          >
            C
          </button>
        </div>

        <div
          className={cn(
            'rounded-lg border p-3',
            isReady ? 'border-reward-border bg-reward-bg/70' : 'border-primary/20 bg-primary/5',
          )}
          aria-live="polite"
        >
          <div className="mb-2">
            <p className="text-sm font-semibold">{readiness.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{readiness.detail}</p>
          </div>
          <div className="grid gap-1.5 sm:grid-cols-3">
            {readiness.steps.map((step) => {
              const Icon = step.complete ? CheckCircle2 : Circle

              return (
                <div key={step.key} className="flex min-w-0 items-start gap-1.5 text-xs">
                  <Icon
                    className={cn(
                      'mt-0.5 h-3.5 w-3.5 shrink-0',
                      step.complete ? 'text-reward' : 'text-muted-foreground',
                    )}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{step.label}</p>
                    <p className="truncate text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function CheckoutRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b px-3 py-2.5 text-sm last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  )
}

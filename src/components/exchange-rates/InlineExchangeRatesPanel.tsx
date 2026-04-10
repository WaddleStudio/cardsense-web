import { ChartNoAxesColumn } from 'lucide-react'
import { ExchangeRatesBoard } from './ExchangeRatesBoard'
import { ExchangeRatesControl } from './ExchangeRatesControl'

interface Props {
  onChange: (customRates: Record<string, number>) => void
}

export function InlineExchangeRatesPanel({ onChange }: Props) {
  return (
    <ExchangeRatesControl onChange={onChange}>
      {({ rows, customRates, activeOverrideKeys, totalRowCount, isLoading, onValueChange }) => {
        if (isLoading || rows.length === 0) {
          return null
        }

        return (
          <section className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ChartNoAxesColumn className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold">Exchange rate tool</h2>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Adjust POINTS and MILES valuation inline before auto-select or compare runs.
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <p>{totalRowCount} rows</p>
                <p>{activeOverrideKeys.size} active</p>
              </div>
            </div>

            <ExchangeRatesBoard
              rows={rows}
              values={customRates}
              activeOverrideKeys={activeOverrideKeys}
              onValueChange={onValueChange}
            />
          </section>
        )
      }}
    </ExchangeRatesControl>
  )
}

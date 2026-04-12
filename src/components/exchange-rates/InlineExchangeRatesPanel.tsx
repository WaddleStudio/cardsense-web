import { useState } from 'react'
import { ChartNoAxesColumn, ChevronDown, Coins, Landmark, Plane } from 'lucide-react'
import { ExchangeRatesBoard } from './ExchangeRatesBoard'
import { ExchangeRatesControl } from './ExchangeRatesControl'
import {
  buildCompactExchangeRateRows,
  getExchangeRateVisual,
} from './exchange-rate-display'
import type { ExchangeRateBoardRow } from './exchange-rate-board.types'

interface Props {
  initialCustomRates?: Record<string, number>
  onChange: (customRates: Record<string, number>) => void
}

export function InlineExchangeRatesPanel({ initialCustomRates, onChange }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <ExchangeRatesControl initialCustomRates={initialCustomRates} onChange={onChange}>
      {({ rows, customRates, activeOverrideKeys, totalRowCount, isLoading, onValueChange }) => {
        if (isLoading || rows.length === 0) {
          return null
        }

        const compactRows = buildCompactExchangeRateRows(rows, activeOverrideKeys)
        const hiddenRowCount = Math.max(0, totalRowCount - compactRows.length)

        return (
          <section className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                  <ChartNoAxesColumn className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold">Exchange rate board</h2>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Adjust reward currency valuation before auto-select or compare runs.
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <p>{totalRowCount} rows</p>
                <p>{activeOverrideKeys.size} active</p>
              </div>
            </div>

            <div className="grid gap-2">
              {compactRows.map((row) => (
                <CompactExchangeRateRow
                  key={row.key}
                  row={row}
                  value={customRates[row.key] ?? ''}
                  isActive={activeOverrideKeys.has(row.key)}
                  onValueChange={onValueChange}
                />
              ))}
            </div>

            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border bg-background/60 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-accent"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((current) => !current)}
            >
              <span>
                {isExpanded ? 'Hide bank-specific rates' : `Show ${hiddenRowCount} bank-specific rates`}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isExpanded && (
              <ExchangeRatesBoard
                rows={rows}
                values={customRates}
                activeOverrideKeys={activeOverrideKeys}
                onValueChange={onValueChange}
              />
            )}
          </section>
        )
      }}
    </ExchangeRatesControl>
  )
}

interface CompactExchangeRateRowProps {
  row: ExchangeRateBoardRow
  value: string
  isActive: boolean
  onValueChange: (key: string, value: string) => void
}

function CompactExchangeRateRow({
  row,
  value,
  isActive,
  onValueChange,
}: CompactExchangeRateRowProps) {
  const visual = getExchangeRateVisual(row.type)
  const Icon = visual.icon === 'coins' ? Coins : visual.icon === 'plane' ? Plane : Landmark

  return (
    <label
      htmlFor={`compact-rate-${row.key}`}
      className="grid gap-3 rounded-lg border bg-card/80 p-3 sm:grid-cols-[auto_minmax(0,1fr)_112px] sm:items-center"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg border ${visual.toneClass}`}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{visual.label}</span>
          <span className="rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {row.bank === '_DEFAULT' ? 'Default' : row.bank.replaceAll('_', ' ')}
          </span>
          {isActive && (
            <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              Active
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">{row.label}</p>
      </div>
      <div className="relative">
        <input
          id={`compact-rate-${row.key}`}
          type="number"
          step="0.01"
          min={0}
          placeholder={String(row.value)}
          value={value}
          onChange={(event) => onValueChange(row.key, event.target.value)}
          className="h-9 w-full rounded-md border bg-background px-3 pr-10 text-right text-sm tabular-nums outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
          TWD
        </span>
      </div>
    </label>
  )
}

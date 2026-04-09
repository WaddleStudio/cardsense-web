import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ExchangeRateBoardRow } from './exchange-rate-board.types'

interface Props {
  rows: ExchangeRateBoardRow[]
  values: Record<string, string>
  activeOverrideKeys: ReadonlySet<string>
  onValueChange: (key: string, value: string) => void
}

const SECTION_ORDER: Array<'POINTS' | 'MILES'> = ['POINTS', 'MILES']

function getSectionRows(rows: ExchangeRateBoardRow[], type: 'POINTS' | 'MILES') {
  return rows.filter((row) => row.type === type)
}

function formatRowBadge(row: ExchangeRateBoardRow) {
  return row.bank === '_DEFAULT' ? 'DEFAULT' : row.bank
}

export function ExchangeRatesBoard({
  rows,
  values,
  activeOverrideKeys,
  onValueChange,
}: Props) {
  const sections = SECTION_ORDER.map((type) => ({
    type,
    rows: getSectionRows(rows, type),
  })).filter((section) => section.rows.length > 0)

  return (
    <div className="space-y-5">
      {sections.map((section, sectionIndex) => (
        <section key={section.type} className="space-y-3">
          {sectionIndex > 0 && <Separator />}

          <div className="flex items-center justify-between gap-3">
            <Badge variant="secondary" className="rounded-full">
              {section.type}
            </Badge>
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              TWD board
            </span>
          </div>

          <div className="space-y-2.5">
            {section.rows.map((row) => {
              const isActive = activeOverrideKeys.has(row.key)

              return (
                <div
                  key={row.key}
                  className={cn(
                    'rounded-xl border border-border bg-card/70 px-3 py-3 shadow-sm transition-colors',
                    isActive && 'border-primary/30 bg-primary/5',
                  )}
                >
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,auto)] md:items-center">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full">
                          {formatRowBadge(row)}
                        </Badge>
                        <p className="text-sm font-medium leading-tight text-foreground">
                          {row.label}
                        </p>
                      </div>
                      {row.note && (
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {row.note}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 md:text-center">
                      <p className="text-lg font-semibold tabular-nums text-foreground">
                        {row.value}
                      </p>
                      <p className="text-xs text-muted-foreground">1 unit = {row.value} TWD</p>
                    </div>

                    <div className="flex items-center gap-2 md:justify-end">
                      <Badge variant={isActive ? 'default' : 'outline'} className="rounded-full">
                        {isActive ? 'Override' : 'Default'}
                      </Badge>
                      <div className="relative w-full max-w-32">
                        <Input
                          id={`rate-${row.key}`}
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder={String(row.value)}
                          value={values[row.key] ?? ''}
                          onChange={(e) => onValueChange(row.key, e.target.value)}
                          aria-label={row.label}
                          className="pr-12 text-right text-sm tabular-nums"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                          TWD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

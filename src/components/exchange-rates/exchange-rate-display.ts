import type { ExchangeRateBoardRow } from './exchange-rate-board.types'

export interface ExchangeRateVisual {
  icon: 'coins' | 'plane' | 'landmark'
  label: string
  toneClass: string
}

export function getExchangeRateVisual(type: string): ExchangeRateVisual {
  if (type === 'POINTS') {
    return {
      icon: 'coins',
      label: 'Points',
      toneClass: 'text-amber-300 bg-amber-400/10 border-amber-300/25',
    }
  }

  if (type === 'MILES') {
    return {
      icon: 'plane',
      label: 'Miles',
      toneClass: 'text-sky-300 bg-sky-400/10 border-sky-300/25',
    }
  }

  return {
    icon: 'landmark',
    label: type,
    toneClass: 'text-emerald-300 bg-emerald-400/10 border-emerald-300/25',
  }
}

export function buildCompactExchangeRateRows(
  rows: ExchangeRateBoardRow[],
  activeOverrideKeys: ReadonlySet<string>,
): ExchangeRateBoardRow[] {
  const activeRows = rows.filter((row) => activeOverrideKeys.has(row.key))
  const defaultRows = rows.filter((row) => row.bank === '_DEFAULT')
  const selectedRows = new Map<string, ExchangeRateBoardRow>()

  ;[...activeRows, ...defaultRows].forEach((row) => selectedRows.set(row.key, row))

  return Array.from(selectedRows.values())
}

import type { ExchangeRateBoardRow } from './exchange-rate-board.types'

const CONTEXT_LABELS: Record<string, string> = {
  'POINTS._DEFAULT': 'Generic points baseline',
  'POINTS.CTBC': 'CTBC / LINE Points',
  'POINTS.CATHAY': 'Cathay / bank points',
  'POINTS.TAISHIN': 'Taishin / DAWHO Points',
  'POINTS.ESUN': 'E.SUN / e point',
  'POINTS.FUBON': 'Fubon / momo & mmo Point',
  'MILES._DEFAULT': 'Generic miles baseline',
  'MILES.ASIA_MILES': 'Cathay Pacific / Asia Miles',
  'MILES.EVA_INFINITY': 'EVA Air / Infinity MileageLands',
  'MILES.JALPAK': 'Japan Airlines / JAL miles',
}

function formatValue(value: number) {
  return Number.isInteger(value)
    ? value.toLocaleString()
    : value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function describeExchangeRateRow(row: ExchangeRateBoardRow) {
  if (row.bank === '_DEFAULT') {
    return {
      sourceLabel: 'System default',
      contextLabel: CONTEXT_LABELS[row.key] ?? 'Baseline valuation',
      detailLine: `1 ${row.unit} = ${formatValue(row.value)} TWD`,
      noteLine:
        row.note ??
        'Used as the fallback valuation when no program-specific rate is selected.',
    }
  }

  if (row.type === 'MILES') {
    return {
      sourceLabel: 'Program profile',
      contextLabel: CONTEXT_LABELS[row.key] ?? 'Airline / loyalty program',
      detailLine: `1 ${row.unit} = ${formatValue(row.value)} TWD`,
      noteLine:
        row.note ??
        'Use this when you value a specific airline or loyalty program above the generic miles baseline.',
    }
  }

  return {
    sourceLabel: 'Bank program',
    contextLabel: CONTEXT_LABELS[row.key] ?? 'Card-linked points',
    detailLine: `1 ${row.unit} = ${formatValue(row.value)} TWD`,
    noteLine: row.note ?? 'Bank-specific point valuation for this rewards program.',
  }
}

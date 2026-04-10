export interface ShareRateSummary {
  title: string
  lines: [string, string]
}

const RATE_LABELS: Record<string, string> = {
  'POINTS._DEFAULT': 'Default points',
  'POINTS.CATHAY': 'Cathay points',
  'POINTS.CTBC': 'CTBC points',
  'POINTS.ESUN': 'ESUN points',
  'POINTS.FUBON': 'Fubon points',
  'POINTS.TAISHIN': 'Taishin points',
  'MILES._DEFAULT': 'Default miles',
  'MILES.ASIA_MILES': 'Asia Miles',
  'MILES.EVA_INFINITY': 'EVA Infinity',
  'MILES.JALPAK': 'JAL miles',
}

function formatRateLabel(key: string) {
  if (key in RATE_LABELS) {
    return RATE_LABELS[key]
  }

  const [type = 'POINTS', rawBank = 'DEFAULT'] = key.split('.')
  const bank = rawBank === '_DEFAULT' ? 'Default' : rawBank.replace(/_/g, ' ')
  const suffix = type === 'MILES' ? 'miles' : 'points'

  return `${bank} ${suffix}`
}

export function buildShareRateSummary(
  customExchangeRates: Record<string, number>,
): ShareRateSummary {
  const overrides = Object.entries(customExchangeRates)

  if (overrides.length === 0) {
    return {
      title: 'Valuation source',
      lines: ['Using system default rates', 'Built-in POINTS / MILES board'],
    }
  }

  const preview = overrides
    .slice(0, 2)
    .map(([key, value]) => `${formatRateLabel(key)} ${value.toFixed(2)}`)
    .join(', ')
  const remainderCount = overrides.length - Math.min(overrides.length, 2)
  const detailLine = remainderCount > 0 ? `${preview}, +${remainderCount} more` : preview

  return {
    title: 'Valuation source',
    lines: [
      `${overrides.length} custom override${overrides.length === 1 ? '' : 's'} active`,
      detailLine,
    ],
  }
}

export interface ShareRateSummary {
  title: string
  lines: [string, string]
}

const RATE_LABELS: Record<string, string> = {
  'POINTS._DEFAULT': '預設點數',
  'POINTS.CATHAY': '國泰點數',
  'POINTS.CTBC': '中信點數',
  'POINTS.ESUN': '玉山點數',
  'POINTS.FUBON': '富邦點數',
  'POINTS.TAISHIN': '台新點數',
  'MILES._DEFAULT': '預設哩程',
  'MILES.ASIA_MILES': '亞洲萬里通',
  'MILES.EVA_INFINITY': '長榮哩程',
  'MILES.JALPAK': '日航哩程',
}

function formatRateLabel(key: string) {
  if (key in RATE_LABELS) {
    return RATE_LABELS[key]
  }

  const [type = 'POINTS', rawBank = 'DEFAULT'] = key.split('.')
  const bank = rawBank === '_DEFAULT' ? '預設' : rawBank.replace(/_/g, ' ')
  const suffix = type === 'MILES' ? '哩程' : '點數'

  return `${bank} ${suffix}`
}

export function buildShareRateSummary(
  customExchangeRates: Record<string, number>,
): ShareRateSummary {
  const overrides = Object.entries(customExchangeRates)

  if (overrides.length === 0) {
    return {
      title: '換算來源',
      lines: ['使用系統預設匯率', '內建點數與哩程換算'],
    }
  }

  const preview = overrides
    .slice(0, 2)
    .map(([key, value]) => `${formatRateLabel(key)} ${value.toFixed(2)}`)
    .join('，')
  const remainderCount = overrides.length - Math.min(overrides.length, 2)
  const detailLine = remainderCount > 0 ? `${preview}，另 ${remainderCount} 筆` : preview

  return {
    title: '換算來源',
    lines: [`已自訂 ${overrides.length} 筆匯率`, detailLine],
  }
}

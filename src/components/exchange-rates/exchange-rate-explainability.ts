import type { ExchangeRateBoardRow } from './exchange-rate-board.types'

const CONTEXT_LABELS: Record<string, string> = {
  'POINTS._DEFAULT': '通用點數',
  'POINTS.CTBC': '中信 / LINE Points',
  'POINTS.CATHAY': '國泰 / 小樹點',
  'POINTS.TAISHIN': '台新 / 台新Point',
  'POINTS.ESUN': '玉山 / e point',
  'POINTS.FUBON': '富邦 / momo幣與momo Point',
  'MILES._DEFAULT': '通用哩程',
  'MILES.ASIA_MILES': '國泰 / 亞洲萬里通',
  'MILES.EVA_INFINITY': '長榮 / 無限萬哩遊',
  'MILES.JALPAK': '日航 / JAL哩程',
}

function formatValue(value: number) {
  return Number.isInteger(value)
    ? value.toLocaleString()
    : value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function describeExchangeRateRow(row: ExchangeRateBoardRow) {
  if (row.bank === '_DEFAULT') {
    return {
      sourceLabel: '系統預設',
      contextLabel: CONTEXT_LABELS[row.key] ?? '基準換算',
      detailLine: `1 ${row.unit} = NT$${formatValue(row.value)}`,
      noteLine:
        row.note ??
        '未指定銀行或方案時使用。',
    }
  }

  if (row.type === 'MILES') {
    return {
      sourceLabel: '哩程方案',
      contextLabel: CONTEXT_LABELS[row.key] ?? '航空方案',
      detailLine: `1 ${row.unit} = NT$${formatValue(row.value)}`,
      noteLine:
        row.note ??
        '適用特定航空或會員方案。',
    }
  }

  return {
    sourceLabel: '銀行方案',
    contextLabel: CONTEXT_LABELS[row.key] ?? '卡片點數',
    detailLine: `1 ${row.unit} = NT$${formatValue(row.value)}`,
    noteLine: row.note ?? '適用該銀行回饋點數。',
  }
}

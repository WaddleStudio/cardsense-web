import type { ExchangeRateEntry, ExchangeRatesResponse } from '@/types'
import type { ExchangeRateBoardRow } from './exchange-rate-board.types'

const TYPE_LABEL_MAP: Record<string, string> = {
  POINTS: '點數價值',
  MILES: '哩程價值',
}

const BANK_LABEL_MAP: Record<string, string> = {
  _DEFAULT: '通用',
  ASIA_MILES: '亞洲萬里通',
  CATHAY: '國泰世華',
  CTBC: '中國信託',
  ESUN: '玉山銀行',
  EVA_INFINITY: '長榮航空',
  FUBON: '富邦銀行',
  JALPAK: 'JAL',
  TAISHIN: '台新銀行',
}

const TYPE_ORDER: Record<string, number> = {
  POINTS: 0,
  MILES: 1,
}

type NormalizedExchangeRateCandidate = Omit<ExchangeRateBoardRow, 'rowOrder'> & {
  sectionKey: string
  sourceOrder: number
}

function getSectionOrder(type: string) {
  return TYPE_ORDER[type] ?? Number.MAX_SAFE_INTEGER
}

function normalizeRatesByArray(rates: readonly ExchangeRateEntry[]): NormalizedExchangeRateCandidate[] {
  return rates.map((entry, sourceOrder) => {
    const value = Number(entry.value)

    return {
      key: `${entry.type}.${entry.bank}`,
      type: entry.type,
      sectionKey: entry.type,
      bank: entry.bank,
      unit: entry.unit,
      value,
      note: entry.note,
      label: formatExchangeRateLabel(entry.type, entry.bank, entry.unit),
      sectionOrder: getSectionOrder(entry.type),
      sourceOrder,
    }
  })
}

function normalizeRatesByRecord(rates: Record<string, number>): NormalizedExchangeRateCandidate[] {
  return Object.entries(rates).map(([key, rawValue], sourceOrder) => {
    const [type = 'POINTS', bank = '_DEFAULT'] = key.split('.')
    const value = Number(rawValue)
    const unit = TYPE_LABEL_MAP[type] ?? type

    return {
      key,
      type,
      sectionKey: type,
      bank,
      unit,
      value,
      note: null,
      label: formatExchangeRateLabel(type, bank, unit),
      sectionOrder: getSectionOrder(type),
      sourceOrder,
    }
  })
}

function sortNormalizedExchangeRates(
  rates: NormalizedExchangeRateCandidate[],
): ExchangeRateBoardRow[] {
  const sortedRates = [...rates].sort((left, right) => {
    if (left.sectionOrder !== right.sectionOrder) {
      return left.sectionOrder - right.sectionOrder
    }

    if (left.bank === '_DEFAULT' && right.bank !== '_DEFAULT') return -1
    if (left.bank !== '_DEFAULT' && right.bank === '_DEFAULT') return 1

    return left.sourceOrder - right.sourceOrder
  })

  const sectionRowOrderByKey = new Map<string, number>()

  return sortedRates.map((rate) => {
    const { sourceOrder, sectionKey, ...normalizedRate } = rate
    void sourceOrder
    const rowOrder = sectionRowOrderByKey.get(sectionKey) ?? 0
    sectionRowOrderByKey.set(sectionKey, rowOrder + 1)

    return {
      ...normalizedRate,
      rowOrder,
    }
  })
}

export function formatExchangeRateLabel(type: string, bank: string, unit: string) {
  const typeLabel = TYPE_LABEL_MAP[type] ?? type
  const bankLabel = BANK_LABEL_MAP[bank] ?? bank

  if (bank === '_DEFAULT') {
    return `${typeLabel} / ${unit || bankLabel}`
  }

  return `${bankLabel} / ${unit || typeLabel}`
}

export function normalizeExchangeRates(
  rates: ExchangeRatesResponse['rates'] | undefined,
): ExchangeRateBoardRow[] {
  if (!rates) return []

  const normalizedRates = Array.isArray(rates)
    ? normalizeRatesByArray(rates)
    : normalizeRatesByRecord(rates)

  return sortNormalizedExchangeRates(normalizedRates.filter((rate) => !Number.isNaN(rate.value)))
}

export function getDefaultRateMap(
  rates: ReadonlyArray<Pick<ExchangeRateBoardRow, 'key' | 'value'>>,
): Record<string, number> {
  return Object.fromEntries(rates.map((rate) => [rate.key, rate.value]))
}

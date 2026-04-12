import { describe, expect, it } from 'vitest'
import {
  buildCompactExchangeRateRows,
  getExchangeRateVisual,
} from './exchange-rate-display'
import type { ExchangeRateBoardRow } from './exchange-rate-board.types'

const rows = [
  {
    key: 'POINTS._DEFAULT',
    type: 'POINTS',
    bank: '_DEFAULT',
    unit: 'POINT',
    value: 1,
    note: null,
    label: 'Default points',
    sectionOrder: 0,
    rowOrder: 0,
  },
  {
    key: 'POINTS.ESUN',
    type: 'POINTS',
    bank: 'ESUN',
    unit: 'POINT',
    value: 0.8,
    note: null,
    label: 'E.SUN points',
    sectionOrder: 0,
    rowOrder: 1,
  },
  {
    key: 'MILES._DEFAULT',
    type: 'MILES',
    bank: '_DEFAULT',
    unit: 'MILE',
    value: 0.35,
    note: null,
    label: 'Default miles',
    sectionOrder: 1,
    rowOrder: 0,
  },
  {
    key: 'MILES.ASIA_MILES',
    type: 'MILES',
    bank: 'ASIA_MILES',
    unit: 'MILE',
    value: 0.45,
    note: null,
    label: 'Asia Miles',
    sectionOrder: 1,
    rowOrder: 1,
  },
] satisfies ExchangeRateBoardRow[]

describe('buildCompactExchangeRateRows', () => {
  it('prioritizes active overrides before default point and mile rows', () => {
    expect(buildCompactExchangeRateRows(rows, new Set(['MILES.ASIA_MILES'])).map((row) => row.key)).toEqual([
      'MILES.ASIA_MILES',
      'POINTS._DEFAULT',
      'MILES._DEFAULT',
    ])
  })
})

describe('getExchangeRateVisual', () => {
  it('uses stable icon metadata for known rate types', () => {
    expect(getExchangeRateVisual('POINTS')).toEqual({
      icon: 'coins',
      label: 'Points',
      toneClass: 'text-amber-300 bg-amber-400/10 border-amber-300/25',
    })
    expect(getExchangeRateVisual('MILES')).toEqual({
      icon: 'plane',
      label: 'Miles',
      toneClass: 'text-sky-300 bg-sky-400/10 border-sky-300/25',
    })
  })
})

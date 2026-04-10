import { describe, expect, it } from 'vitest'
import type { ExchangeRateBoardRow } from './exchange-rate-board.types'
import { describeExchangeRateRow } from './exchange-rate-explainability'

function makeRow(overrides: Partial<ExchangeRateBoardRow>): ExchangeRateBoardRow {
  return {
    key: 'POINTS._DEFAULT',
    type: 'POINTS',
    bank: '_DEFAULT',
    unit: 'Points',
    value: 1,
    note: null,
    label: 'Points / Points',
    sectionOrder: 0,
    rowOrder: 0,
    ...overrides,
  }
}

describe('describeExchangeRateRow', () => {
  it('treats default rows as system defaults', () => {
    expect(
      describeExchangeRateRow(
        makeRow({
          key: 'MILES._DEFAULT',
          type: 'MILES',
          bank: '_DEFAULT',
          unit: 'Miles',
          value: 0.4,
        }),
      ),
    ).toEqual({
      sourceLabel: 'System default',
      contextLabel: 'Generic miles baseline',
      detailLine: '1 Miles = 0.4 TWD',
      noteLine: 'Used as the fallback valuation when no program-specific rate is selected.',
    })
  })

  it('marks points rows as bank programs', () => {
    expect(
      describeExchangeRateRow(
        makeRow({
          key: 'POINTS.ESUN',
          bank: 'ESUN',
          unit: 'e point',
          value: 0.8,
          note: 'Bank note',
        }),
      ),
    ).toEqual({
      sourceLabel: 'Bank program',
      contextLabel: 'E.SUN / e point',
      detailLine: '1 e point = 0.8 TWD',
      noteLine: 'Bank note',
    })
  })

  it('marks non-default miles rows as program profiles', () => {
    expect(
      describeExchangeRateRow(
        makeRow({
          key: 'MILES.ASIA_MILES',
          type: 'MILES',
          bank: 'ASIA_MILES',
          unit: 'Asia Miles',
          value: 0.5,
        }),
      ),
    ).toEqual({
      sourceLabel: 'Program profile',
      contextLabel: 'Cathay Pacific / Asia Miles',
      detailLine: '1 Asia Miles = 0.5 TWD',
      noteLine: 'Use this when you value a specific airline or loyalty program above the generic miles baseline.',
    })
  })
})

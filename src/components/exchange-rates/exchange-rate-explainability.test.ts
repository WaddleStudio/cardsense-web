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
      sourceLabel: '系統預設',
      contextLabel: '通用哩程',
      detailLine: '1 Miles = NT$0.4',
      noteLine: '未指定銀行或方案時使用。',
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
      sourceLabel: '銀行方案',
      contextLabel: '玉山 / e point',
      detailLine: '1 e point = NT$0.8',
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
      sourceLabel: '哩程方案',
      contextLabel: '國泰 / 亞洲萬里通',
      detailLine: '1 Asia Miles = NT$0.5',
      noteLine: '適用特定航空或會員方案。',
    })
  })
})

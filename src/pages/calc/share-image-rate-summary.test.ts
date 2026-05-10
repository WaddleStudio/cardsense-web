import { describe, expect, it } from 'vitest'
import { buildShareRateSummary } from './share-image-rate-summary'

describe('buildShareRateSummary', () => {
  it('returns a system-default summary when no overrides are active', () => {
    expect(buildShareRateSummary({})).toEqual({
      title: '換算來源',
      lines: ['使用系統預設匯率', '內建點數與哩程換算'],
    })
  })

  it('summarizes active custom overrides in a compact label line', () => {
    expect(
      buildShareRateSummary({
        'POINTS.ESUN': 0.8,
        'MILES._DEFAULT': 0.6,
      }),
    ).toEqual({
      title: '換算來源',
      lines: ['已自訂 2 筆匯率', '玉山點數 0.80，預設哩程 0.60'],
    })
  })

  it('caps the detail line and reports additional overrides', () => {
    expect(
      buildShareRateSummary({
        'POINTS.ESUN': 0.8,
        'MILES._DEFAULT': 0.6,
        'MILES.ASIA_MILES': 0.55,
      }),
    ).toEqual({
      title: '換算來源',
      lines: ['已自訂 3 筆匯率', '玉山點數 0.80，預設哩程 0.60，另 1 筆'],
    })
  })
})

import { describe, expect, it } from 'vitest'
import { buildShareRateSummary } from './share-image-rate-summary'

describe('buildShareRateSummary', () => {
  it('returns a system-default summary when no overrides are active', () => {
    expect(buildShareRateSummary({})).toEqual({
      title: 'Valuation source',
      lines: ['Using system default rates', 'Built-in POINTS / MILES board'],
    })
  })

  it('summarizes active custom overrides in a compact label line', () => {
    expect(
      buildShareRateSummary({
        'POINTS.ESUN': 0.8,
        'MILES._DEFAULT': 0.6,
      }),
    ).toEqual({
      title: 'Valuation source',
      lines: ['2 custom overrides active', 'ESUN points 0.80, Default miles 0.60'],
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
      title: 'Valuation source',
      lines: ['3 custom overrides active', 'ESUN points 0.80, Default miles 0.60, +1 more'],
    })
  })
})

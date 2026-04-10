import { describe, expect, it } from 'vitest'
import {
  buildActiveExchangeRateOverrides,
  buildInitialExchangeRateInputs,
} from './exchange-rate-overrides'

describe('buildActiveExchangeRateOverrides', () => {
  it('keeps only non-default numeric overrides', () => {
    expect(
      buildActiveExchangeRateOverrides(
        {
          'POINTS._DEFAULT': '1',
          'POINTS.ESUN': '0.80',
          'MILES._DEFAULT': '0.40',
          'MILES.ASIA_MILES': '0.60',
        },
        {
          'POINTS._DEFAULT': 1,
          'POINTS.ESUN': 1,
          'MILES._DEFAULT': 0.4,
          'MILES.ASIA_MILES': 0.4,
        },
      ),
    ).toEqual({
      'POINTS.ESUN': 0.8,
      'MILES.ASIA_MILES': 0.6,
    })
  })

  it('drops blank, invalid, and negative values', () => {
    expect(
      buildActiveExchangeRateOverrides(
        {
          'POINTS.ESUN': '',
          'POINTS.FUBON': 'abc',
          'MILES._DEFAULT': '-0.1',
          'MILES.EVA_INFINITY': '0.5',
        },
        {
          'POINTS.ESUN': 1,
          'POINTS.FUBON': 1,
          'MILES._DEFAULT': 0.4,
          'MILES.EVA_INFINITY': 0.4,
        },
      ),
    ).toEqual({
      'MILES.EVA_INFINITY': 0.5,
    })
  })

  it('drops stale override keys that are not present in the current default rate map', () => {
    expect(
      buildActiveExchangeRateOverrides(
        {
          'POINTS.ESUN': '0.8',
          'POINTS.RETIRED_BANK': '0.7',
        },
        {
          'POINTS.ESUN': 1,
        },
      ),
    ).toEqual({
      'POINTS.ESUN': 0.8,
    })
  })
})

describe('buildInitialExchangeRateInputs', () => {
  it('converts finite non-negative overrides into input strings', () => {
    expect(
      buildInitialExchangeRateInputs({
        'POINTS.ESUN': 0.8,
        'MILES.ASIA_MILES': 0.6,
      }),
    ).toEqual({
      'POINTS.ESUN': '0.8',
      'MILES.ASIA_MILES': '0.6',
    })
  })

  it('drops invalid numeric values', () => {
    expect(
      buildInitialExchangeRateInputs({
        'POINTS.ESUN': Number.NaN,
        'POINTS.FUBON': Number.POSITIVE_INFINITY,
        'MILES.ASIA_MILES': -1,
        'MILES.EVA_INFINITY': 0.5,
      }),
    ).toEqual({
      'MILES.EVA_INFINITY': '0.5',
    })
  })
})

import { describe, expect, it } from 'vitest'
import {
  MY_WALLET_STORAGE_KEY,
  buildMyWalletSnapshot,
  parseStoredMyWalletSnapshot,
} from './my-wallet-storage'

describe('my wallet storage', () => {
  it('uses the versioned storage key', () => {
    expect(MY_WALLET_STORAGE_KEY).toBe('cardsense.my-wallet.v1')
  })

  it('returns null for invalid JSON', () => {
    expect(parseStoredMyWalletSnapshot('{not-json')).toBeNull()
  })

  it('filters invalid card, runtime, and exchange-rate values when parsing', () => {
    expect(
      parseStoredMyWalletSnapshot(
        JSON.stringify({
          version: 1,
          savedAt: '2026-04-10T00:00:00.000Z',
          selectedCards: ['CATHAY_CUBE', 123, null],
          activePlansByCard: {
            CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL',
            BAD_CARD: 123,
          },
          planRuntimeByCard: {
            CATHAY_CUBE: {
              tier: 'LEVEL_1',
              selected_merchants: ['AGODA'],
              invalid: null,
            },
            BAD_RUNTIME: 'oops',
          },
          customExchangeRates: {
            'POINTS.ESUN': 0.8,
            'POINTS.CTBC': -1,
            'MILES._DEFAULT': Number.POSITIVE_INFINITY,
            'MILES.ASIA_MILES': '0.6',
          },
        }),
      ),
    ).toEqual({
      version: 1,
      savedAt: '2026-04-10T00:00:00.000Z',
      selectedCards: ['CATHAY_CUBE'],
      activePlansByCard: {
        CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL',
      },
      planRuntimeByCard: {
        CATHAY_CUBE: {
          tier: 'LEVEL_1',
        },
      },
      customExchangeRates: {
        'POINTS.ESUN': 0.8,
      },
    })
  })

  it('returns null for corrupted top-level containers', () => {
    expect(
      parseStoredMyWalletSnapshot(
        JSON.stringify({
          version: 1,
          savedAt: '2026-04-10T00:00:00.000Z',
          selectedCards: {},
          activePlansByCard: [],
          planRuntimeByCard: null,
          customExchangeRates: 'oops',
        }),
      ),
    ).toBeNull()
  })

  it('returns null when savedAt is missing or not a string', () => {
    expect(
      parseStoredMyWalletSnapshot(
        JSON.stringify({
          version: 1,
          selectedCards: ['CATHAY_CUBE'],
          activePlansByCard: {},
          planRuntimeByCard: {},
          customExchangeRates: {},
        }),
      ),
    ).toBeNull()

    expect(
      parseStoredMyWalletSnapshot(
        JSON.stringify({
          version: 1,
          savedAt: 123,
          selectedCards: ['CATHAY_CUBE'],
          activePlansByCard: {},
          planRuntimeByCard: {},
          customExchangeRates: {},
        }),
      ),
    ).toBeNull()
  })

  it('drops non-finite exchange rates in the builder', () => {
    expect(
      buildMyWalletSnapshot({
        savedAt: '2026-04-10T00:00:00.000Z',
        selectedCards: ['CATHAY_CUBE'],
        activePlansByCard: {},
        planRuntimeByCard: {},
        customExchangeRates: {
          'POINTS.ESUN': Number.POSITIVE_INFINITY,
          'POINTS.CTBC': 0.8,
        },
      }),
    ).toEqual({
      version: 1,
      savedAt: '2026-04-10T00:00:00.000Z',
      selectedCards: ['CATHAY_CUBE'],
      activePlansByCard: {},
      planRuntimeByCard: {},
      customExchangeRates: {
        'POINTS.CTBC': 0.8,
      },
    })
  })

  it('builds a versioned snapshot from sanitized wallet data', () => {
    expect(
      buildMyWalletSnapshot({
        savedAt: '2026-04-10T00:00:00.000Z',
        selectedCards: ['CATHAY_CUBE', 123, 'ESUN_UNICARD'],
        activePlansByCard: {
          CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL',
          BAD_CARD: 123,
        },
        planRuntimeByCard: {
          CATHAY_CUBE: {
            tier: 'LEVEL_1',
            selected_merchants: 'AGODA',
            invalid: null,
          },
        },
        customExchangeRates: {
          'POINTS.ESUN': 0.8,
          'POINTS.CTBC': -1,
          'MILES.ASIA_MILES': Number.NaN,
        },
      }),
    ).toEqual({
      version: 1,
      savedAt: '2026-04-10T00:00:00.000Z',
      selectedCards: ['CATHAY_CUBE', 'ESUN_UNICARD'],
      activePlansByCard: {
        CATHAY_CUBE: 'CATHAY_CUBE_TRAVEL',
      },
      planRuntimeByCard: {
        CATHAY_CUBE: {
          tier: 'LEVEL_1',
          selected_merchants: 'AGODA',
        },
      },
      customExchangeRates: {
        'POINTS.ESUN': 0.8,
      },
    })
  })
})

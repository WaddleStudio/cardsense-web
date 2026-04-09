import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Tag } from 'lucide-react'
import { useExchangeRates } from '@/api'
import type { ExchangeRateBoardRow } from './exchange-rates/exchange-rate-board.types'
import { ExchangeRatesBoard } from './exchange-rates/ExchangeRatesBoard'
import { getDefaultRateMap, normalizeExchangeRates } from './exchange-rates/normalize-exchange-rates'

interface Props {
  onChange: (customRates: Record<string, number>) => void
}

export function ExchangeRatesPanel({ onChange }: Props) {
  const { data, isLoading } = useExchangeRates()
  const [isOpen, setIsOpen] = useState(false)
  const [customRates, setCustomRates] = useState<Record<string, string>>({})

  const normalizedRates = useMemo<ExchangeRateBoardRow[]>(
    () => normalizeExchangeRates(data?.rates),
    [data?.rates],
  )
  const defaultRateMap = useMemo(() => getDefaultRateMap(normalizedRates), [normalizedRates])
  const activeRates = useMemo<Record<string, number>>(() => {
    const nextActiveRates: Record<string, number> = {}

    Object.entries(customRates).forEach(([key, value]) => {
      const numericValue = Number(value)
      if (value.trim() === '' || Number.isNaN(numericValue) || numericValue < 0) {
        return
      }

      if (!(key in defaultRateMap) || defaultRateMap[key] !== numericValue) {
        nextActiveRates[key] = numericValue
      }
    })

    return nextActiveRates
  }, [customRates, defaultRateMap])
  const activeOverrideKeys = useMemo(() => new Set(Object.keys(activeRates)), [activeRates])

  useEffect(() => {
    onChange(activeRates)
  }, [activeRates, onChange])

  if (isLoading || normalizedRates.length === 0) {
    return null
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 hover:bg-accent/50 focus-visible:outline-none"
      >
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">自訂點數與里程價值</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1">
          <p className="mb-4 text-xs text-muted-foreground">
            可依你的估值覆寫預設換算，只有和系統預設不同的項目才會送到推薦 API。
          </p>
          <ExchangeRatesBoard
            rows={normalizedRates}
            values={customRates}
            activeOverrideKeys={activeOverrideKeys}
            onValueChange={(key, value) =>
              setCustomRates((prev) => ({
                ...prev,
                [key]: value,
              }))
            }
          />
        </div>
      )}
    </div>
  )
}

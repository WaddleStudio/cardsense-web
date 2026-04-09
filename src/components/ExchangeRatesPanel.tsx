import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Tag } from 'lucide-react'
import { useExchangeRates } from '@/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ExchangeRateBoardRow } from './exchange-rates/exchange-rate-board.types'
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

  useEffect(() => {
    const activeRates: Record<string, number> = {}

    Object.entries(customRates).forEach(([key, value]) => {
      const numericValue = Number(value)
      if (value.trim() === '' || Number.isNaN(numericValue) || numericValue < 0) {
        return
      }

      if (!(key in defaultRateMap) || defaultRateMap[key] !== numericValue) {
        activeRates[key] = numericValue
      }
    })

    onChange(activeRates)
  }, [customRates, defaultRateMap, onChange])

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
          <div className="space-y-3">
            {normalizedRates.map((rate) => (
              <div key={rate.key} className="space-y-1.5">
                <Label htmlFor={`rate-${rate.key}`} className="text-xs">
                  {rate.label} (預設: {rate.value})
                </Label>
                {rate.note && <p className="text-[11px] text-muted-foreground">{rate.note}</p>}
                <div className="relative">
                  <Input
                    id={`rate-${rate.key}`}
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder={String(rate.value)}
                    value={customRates[rate.key] ?? ''}
                    onChange={(e) =>
                      setCustomRates((prev) => ({
                        ...prev,
                        [rate.key]: e.target.value,
                      }))
                    }
                    className="pr-12 text-sm"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                    TWD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

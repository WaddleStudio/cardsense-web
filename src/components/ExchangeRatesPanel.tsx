import { useState, useEffect } from 'react'
import { ChevronDown, Tag } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useExchangeRates } from '@/api'

interface Props {
  onChange: (customRates: Record<string, number>) => void
}

const LABEL_MAP: Record<string, string> = {
  POINTS: '點數 (P幣/小樹點等) 價值',
  MILES: '航空哩程價值',
}

export function ExchangeRatesPanel({ onChange }: Props) {
  const { data, isLoading } = useExchangeRates()
  const [isOpen, setIsOpen] = useState(false)
  const [customRates, setCustomRates] = useState<Record<string, string>>({})

  useEffect(() => {
    // Determine the active rates (convert to numbers)
    const activeRates: Record<string, number> = {}
    let hasOverrides = false

    Object.entries(customRates).forEach(([key, value]) => {
      const numValue = Number(value)
      if (value.trim() !== '' && !Number.isNaN(numValue) && numValue >= 0) {
        // If it's different from the default rate, we emit it
        if (!data?.rates || data.rates[key] !== numValue) {
          activeRates[key] = numValue
          hasOverrides = true
        }
      }
    })

    if (hasOverrides) {
      onChange(activeRates)
    } else {
      onChange({})
    }
  }, [customRates, data?.rates, onChange])

  if (isLoading || !data?.rates) {
    return null
  }

  const defaultRates = data.rates

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm mt-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 hover:bg-accent/50 focus-visible:outline-none"
      >
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">自訂點數與哩程價值</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1">
          <p className="text-xs text-muted-foreground mb-4">
            調整以下數值以影響等效現金回饋率的計算（預設由系統提供）。
          </p>
          <div className="space-y-3">
            {Object.entries(defaultRates).map(([key, defaultVal]) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`rate-${key}`} className="text-xs">
                  {LABEL_MAP[key] ?? key} (預設: {defaultVal})
                </Label>
                <div className="relative">
                  <Input
                    id={`rate-${key}`}
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder={String(defaultVal)}
                    value={customRates[key] ?? ''}
                    onChange={(e) =>
                      setCustomRates((prev) => ({
                        ...prev,
                        [key]: e.target.value,
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

import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Tag, X } from 'lucide-react'
import { useExchangeRates } from '@/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  const totalRowCount = normalizedRates.length
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full justify-between border-border bg-card px-4 py-3 text-left shadow-sm hover:bg-accent/40"
        >
          <span className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">匯率牌告</span>
          </span>
          <span className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{totalRowCount} rows</span>
            <span>{activeOverrideKeys.size} overrides</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className="!top-0 !left-auto !right-0 !h-dvh !max-h-dvh !w-[min(100vw,42rem)] !translate-x-0 !translate-y-0 !rounded-none !border-l !p-0 sm:!max-w-none"
        showCloseButton={false}
      >
        <div className="flex h-full flex-col">
          <DialogHeader className="border-b border-border px-4 py-4 !text-left sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle>匯率牌告</DialogTitle>
                <DialogDescription>
                  這裡可以調整匯率覆寫，變更會即時反映在推薦計算中。
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="-mr-2 -mt-2 shrink-0">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close drawer</span>
                </Button>
              </DialogClose>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{totalRowCount} rows</span>
              <span>·</span>
              <span>{activeOverrideKeys.size} active overrides</span>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useExchangeRates } from '@/api'
import type { ExchangeRateBoardRow } from './exchange-rate-board.types'
import {
  buildActiveExchangeRateOverrides,
  buildInitialExchangeRateInputs,
} from './exchange-rate-overrides'
import { getDefaultRateMap, normalizeExchangeRates } from './normalize-exchange-rates'

export interface ExchangeRatesControlRenderProps {
  rows: ExchangeRateBoardRow[]
  customRates: Record<string, string>
  activeRates: Record<string, number>
  activeOverrideKeys: ReadonlySet<string>
  totalRowCount: number
  isLoading: boolean
  onValueChange: (key: string, value: string) => void
}

interface ExchangeRatesControlProps {
  initialCustomRates?: Record<string, number>
  onChange: (customRates: Record<string, number>) => void
  children: (props: ExchangeRatesControlRenderProps) => ReactNode
}

export function ExchangeRatesControl({
  initialCustomRates,
  onChange,
  children,
}: ExchangeRatesControlProps) {
  const { data, isLoading } = useExchangeRates()
  const [customRates, setCustomRates] = useState<Record<string, string>>(() =>
    buildInitialExchangeRateInputs(initialCustomRates),
  )

  const rows = useMemo(() => normalizeExchangeRates(data?.rates), [data?.rates])
  const defaultRateMap = useMemo(() => getDefaultRateMap(rows), [rows])
  const activeRates = useMemo(
    () => buildActiveExchangeRateOverrides(customRates, defaultRateMap),
    [customRates, defaultRateMap],
  )
  const activeOverrideKeys = useMemo(() => new Set(Object.keys(activeRates)), [activeRates])
  const hasLoadedExchangeRates = !isLoading && rows.length > 0

  useEffect(() => {
    if (!hasLoadedExchangeRates) {
      return
    }

    onChange(activeRates)
  }, [activeRates, hasLoadedExchangeRates, onChange])

  return children({
    rows,
    customRates,
    activeRates,
    activeOverrideKeys,
    totalRowCount: rows.length,
    isLoading,
    onValueChange: (key, value) =>
      setCustomRates((prev) => ({
        ...prev,
        [key]: value,
      })),
  })
}

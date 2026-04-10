export function buildActiveExchangeRateOverrides(
  customRates: Record<string, string>,
  defaultRateMap: Record<string, number>,
): Record<string, number> {
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
}

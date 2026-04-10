export function buildActiveExchangeRateOverrides(
  customRates: Record<string, string>,
  defaultRateMap: Record<string, number>,
): Record<string, number> {
  const nextActiveRates: Record<string, number> = {}

  Object.entries(customRates).forEach(([key, value]) => {
    if (!(key in defaultRateMap)) {
      return
    }

    const numericValue = Number(value)

    if (value.trim() === '' || Number.isNaN(numericValue) || numericValue < 0) {
      return
    }

    if (defaultRateMap[key] !== numericValue) {
      nextActiveRates[key] = numericValue
    }
  })

  return nextActiveRates
}

export function buildInitialExchangeRateInputs(
  initialCustomRates?: Record<string, number>,
): Record<string, string> {
  if (!initialCustomRates) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(initialCustomRates).flatMap(([key, value]) =>
      Number.isFinite(value) && value >= 0 ? [[key, String(value)]] : [],
    ),
  )
}

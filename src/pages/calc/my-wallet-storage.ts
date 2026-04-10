export const MY_WALLET_STORAGE_KEY = 'cardsense.my-wallet.v1' as const

export interface MyWalletSnapshot {
  version: 1
  savedAt: string
  selectedCards: string[]
  activePlansByCard: Record<string, string>
  planRuntimeByCard: Record<string, Record<string, string>>
  customExchangeRates: Record<string, number>
}

type MyWalletSnapshotInput = {
  savedAt: string
  selectedCards: unknown
  activePlansByCard: unknown
  planRuntimeByCard: unknown
  customExchangeRates: unknown
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function keepStringValues(value: unknown): Record<string, string> {
  if (!isPlainObject(value)) {
    return {}
  }

  const nextValues: Record<string, string> = {}

  Object.entries(value).forEach(([key, nestedValue]) => {
    if (typeof nestedValue === 'string') {
      nextValues[key] = nestedValue
    }
  })

  return nextValues
}

function keepStringArrayValues(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((entry): entry is string => typeof entry === 'string')
}

function keepNestedStringValues(value: unknown): Record<string, Record<string, string>> {
  if (!isPlainObject(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([cardCode, runtime]) => [cardCode, keepStringValues(runtime)] as const)
      .filter(([, runtime]) => Object.keys(runtime).length > 0),
  )
}

function keepFiniteNonNegativeNumbers(value: unknown): Record<string, number> {
  if (!isPlainObject(value)) {
    return {}
  }

  const nextValues: Record<string, number> = {}

  Object.entries(value).forEach(([key, nestedValue]) => {
    if (typeof nestedValue === 'number' && Number.isFinite(nestedValue) && nestedValue >= 0) {
      nextValues[key] = nestedValue
    }
  })

  return nextValues
}

export function buildMyWalletSnapshot(input: MyWalletSnapshotInput): MyWalletSnapshot {
  return {
    version: 1,
    savedAt: input.savedAt,
    selectedCards: keepStringArrayValues(input.selectedCards),
    activePlansByCard: keepStringValues(input.activePlansByCard),
    planRuntimeByCard: keepNestedStringValues(input.planRuntimeByCard),
    customExchangeRates: keepFiniteNonNegativeNumbers(input.customExchangeRates),
  }
}

export function parseStoredMyWalletSnapshot(raw: string | null): MyWalletSnapshot | null {
  if (raw === null) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (
      !isPlainObject(parsed) ||
      parsed.version !== 1 ||
      typeof parsed.savedAt !== 'string' ||
      !Array.isArray(parsed.selectedCards) ||
      !isPlainObject(parsed.activePlansByCard) ||
      !isPlainObject(parsed.planRuntimeByCard) ||
      !isPlainObject(parsed.customExchangeRates)
    ) {
      return null
    }

    return buildMyWalletSnapshot({
      savedAt: parsed.savedAt,
      selectedCards: parsed.selectedCards,
      activePlansByCard: parsed.activePlansByCard,
      planRuntimeByCard: parsed.planRuntimeByCard,
      customExchangeRates: parsed.customExchangeRates,
    })
  } catch {
    return null
  }
}

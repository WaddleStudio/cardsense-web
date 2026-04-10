import type { Category, RecommendationRequest } from '@/types'

interface BuildCalcRecommendationRequestInput {
  amount: number
  category: Category
  subcategory?: string | null
  merchantName: string
  paymentMethod: string | null
  activePlansByCard: Record<string, string>
  planRuntimeByCard: Record<string, Record<string, string>>
  benefitPlanTiers: Record<string, string>
  cardCodes: string[]
  comparison: NonNullable<RecommendationRequest['comparison']>
  customExchangeRates: Record<string, number>
}

function hasPlanRuntimeValues(planRuntimeByCard: Record<string, Record<string, string>>) {
  return Object.values(planRuntimeByCard).some((runtime) => Object.keys(runtime).length > 0)
}

export function buildCalcRecommendationRequest({
  amount,
  category,
  subcategory,
  merchantName,
  paymentMethod,
  activePlansByCard,
  planRuntimeByCard,
  benefitPlanTiers,
  cardCodes,
  comparison,
  customExchangeRates,
}: BuildCalcRecommendationRequestInput): RecommendationRequest {
  const trimmedMerchantName = merchantName.trim()

  return {
    amount,
    category,
    subcategory: subcategory ?? undefined,
    ...((trimmedMerchantName || paymentMethod) && {
      scenario: {
        ...(trimmedMerchantName && { merchantName: trimmedMerchantName.toUpperCase() }),
        ...(paymentMethod && { paymentMethod }),
      },
    }),
    ...(Object.keys(activePlansByCard).length > 0 && { activePlansByCard }),
    ...(hasPlanRuntimeValues(planRuntimeByCard) && { planRuntimeByCard }),
    ...(Object.keys(benefitPlanTiers).length > 0 && { benefitPlanTiers }),
    cardCodes,
    ...(Object.keys(customExchangeRates).length > 0 && { customExchangeRates }),
    comparison,
  }
}

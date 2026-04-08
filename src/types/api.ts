import type { BankCode, CashbackType, Category, Channel } from './enums'

// --- Bank ---

export interface BankSummary {
  code: BankCode
  nameZh: string
  nameEn: string
}

// --- Card ---

export interface CardSummary {
  cardCode: string
  cardName: string
  cardStatus: 'ACTIVE' | 'DISCONTINUED'
  annualFee: number | null
  applyUrl: string | null
  bankCode: BankCode
  bankName: string
  recommendationScopes: string[]
  eligibilityType: string
  availableCategories: string[]
  hasBenefitPlans: boolean
  totalPromotionCount: number
  recommendablePromotionCount: number
  catalogOnlyPromotionCount: number
  futureScopePromotionCount: number
  generalRewardsOnly: boolean
  sparsePromotionCard: boolean
  coBrandCard: boolean
  catalogReviewHint: string | null
}

// --- Recommendation Request ---

export interface BenefitUsage {
  promoVersionId: string
  consumedAmount: number
}

export interface RecommendationScenario {
  amount?: number
  category?: Category
  subcategory?: string
  date?: string
  location?: string
  channel?: Channel
  merchantName?: string
  merchantId?: string
  paymentMethod?: string
  installmentCount?: number
  newCustomer?: boolean
  customerSegment?: string
  membershipTier?: string
  tags?: string[]
  attributes?: Record<string, string>
}

export interface RecommendationComparisonOptions {
  includePromotionBreakdown?: boolean
  includeBreakEvenAnalysis?: boolean
  maxResults?: number
  compareCardCodes?: string[]
}

export interface ExchangeRatesResponse {
  rates: Record<string, number>
}

export interface RecommendationRequest {
  amount?: number
  category?: Category
  subcategory?: string
  benefitPlanTiers?: Record<string, string>
  activePlansByCard?: Record<string, string>
  planRuntimeByCard?: Record<string, Record<string, string>>
  cardCodes?: string[]
  registeredPromotionIds?: string[]
  benefitUsage?: BenefitUsage[]
  location?: string
  date?: string
  scenario?: RecommendationScenario
  comparison?: RecommendationComparisonOptions
  customExchangeRates?: Record<string, number>
}

// --- Recommendation Response ---

export interface PromotionCondition {
  type: string
  value: string
  label: string
}

export interface ActivePlan {
  planId: string
  planName: string
  switchRequired: boolean
  switchFrequency: string
  requiresSubscription: boolean
  subscriptionCost: string | null
}

export interface RewardDetail {
  rawRewardAmount: number
  rewardUnit: string
  exchangeRate: number
  exchangeRateSource: 'SYSTEM_DEFAULT' | 'USER_CUSTOM'
  note: string | null
}

export interface PromotionRewardBreakdown {
  promotionId: string
  promoVersionId: string
  title: string | null
  cashbackType: CashbackType
  cashbackValue: number
  estimatedReturn: number
  cappedReturn: number
  contributesToCardTotal: boolean
  assumedStackable: boolean
  validUntil: string | null
  conditions: PromotionCondition[]
  reason: string
  rewardDetail?: RewardDetail
}

export interface BreakEvenAnalysis {
  leftCardCode: string
  rightCardCode: string
  leftPromoVersionId: string
  rightPromoVersionId: string
  breakEvenAmount: number
  variableRewardCapAmount: number | null
  leftMinAmount: number | null
  rightMinAmount: number | null
  summary: string
}

export interface RecommendationComparisonSummary {
  mode: string
  evaluatedPromotionCount: number
  eligiblePromotionCount: number
  rankedCardCount: number
  breakEvenEvaluated: boolean
  breakEvenAnalyses: BreakEvenAnalysis[]
  notes: string[]
}

export interface CardRecommendation {
  cardCode: string | null
  cardName: string
  bankCode: BankCode | null
  bankName: string
  subcategory?: string
  cashbackType: CashbackType
  cashbackValue: number
  estimatedReturn: number
  matchedPromotionCount: number
  reason: string
  promotionId: string | null
  promoVersionId: string | null
  validUntil: string | null
  conditions: PromotionCondition[]
  promotionBreakdown: PromotionRewardBreakdown[]
  applyUrl: string | null
  activePlan: ActivePlan | null
  generalRewardOnly: boolean
  rewardDetail?: RewardDetail
}

export interface RecommendationResponse {
  requestId: string
  scenario: RecommendationScenario
  comparison: RecommendationComparisonSummary
  recommendations: CardRecommendation[]
  generatedAt: string
  disclaimer: string
}

// --- Card Promotions ---

export interface CardPromotion {
  promoId: string
  promoVersionId: string
  title: string | null
  category: string
  subcategory?: string
  channel: string | null
  cashbackType: CashbackType
  cashbackValue: number
  minAmount: number | null
  maxCashback: number | null
  validFrom: string | null
  validUntil: string | null
  frequencyLimit: string | null
  requiresRegistration: boolean
  recommendationScope: string
  planId?: string | null
  conditions: PromotionCondition[]
  stackability: {
    relationshipMode: string | null
    groupId: string | null
  } | null
}

// --- BenefitPlan ---

export interface BenefitPlan {
  planId: string
  bankCode: string
  cardCode: string
  planName: string
  planDescription: string
  switchFrequency: string
  switchMaxPerMonth: number | null
  requiresSubscription: boolean
  subscriptionCost: string | null
  exclusiveGroup: string
  status: string
  validFrom: string
  validUntil: string
}

// --- Health ---

export interface HealthResponse {
  status: string
  repository: string
}

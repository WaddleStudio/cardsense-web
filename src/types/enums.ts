export const BANK_CODES = [
  'CTBC', 'ESUN', 'TAISHIN', 'CATHAY', 'MEGA',
  'FUBON', 'FIRST', 'SINOPAC', 'TPBANK', 'UBOT',
] as const
export type BankCode = (typeof BANK_CODES)[number]

export const CATEGORIES = [
  'DINING', 'TRANSPORT', 'ONLINE', 'OVERSEAS',
  'SHOPPING', 'GROCERY', 'ENTERTAINMENT', 'OTHER',
] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  DINING: '餐飲',
  TRANSPORT: '交通',
  ONLINE: '網購',
  OVERSEAS: '海外',
  SHOPPING: '購物',
  GROCERY: '超市',
  ENTERTAINMENT: '娛樂',
  OTHER: '其他',
}

export const CHANNELS = ['ONLINE', 'OFFLINE', 'ALL'] as const
export type Channel = (typeof CHANNELS)[number]

export const CHANNEL_LABELS: Record<Channel, string> = {
  ONLINE: '線上',
  OFFLINE: '線下',
  ALL: '不限',
}

export const CASHBACK_TYPES = ['PERCENT', 'FIXED', 'POINTS'] as const
export type CashbackType = (typeof CASHBACK_TYPES)[number]

export const COMPARISON_MODES = ['BEST_SINGLE_PROMOTION', 'STACK_ALL_ELIGIBLE'] as const
export type ComparisonMode = (typeof COMPARISON_MODES)[number]

export const COMPARISON_MODE_LABELS: Record<ComparisonMode, string> = {
  BEST_SINGLE_PROMOTION: '最佳單一優惠',
  STACK_ALL_ELIGIBLE: '所有可疊加優惠',
}

export const RECOMMENDATION_SCOPES = ['RECOMMENDABLE', 'CATALOG_ONLY', 'FUTURE_SCOPE'] as const
export type RecommendationScope = (typeof RECOMMENDATION_SCOPES)[number]

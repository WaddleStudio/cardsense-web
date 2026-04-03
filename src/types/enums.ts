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

export const SUBCATEGORIES: Partial<Record<Category, { value: string; label: string }[]>> = {
  ENTERTAINMENT: [
    { value: 'MOVIE', label: '電影' },
    { value: 'THEME_PARK', label: '遊樂園' },
    { value: 'VENUE', label: 'KTV/娛樂' },
    { value: 'STREAMING', label: '串流訂閱' },
  ],
  DINING: [
    { value: 'DELIVERY', label: '外送' },
    { value: 'RESTAURANT', label: '指定餐廳' },
    { value: 'CAFE', label: '咖啡/飲料' },
    { value: 'HOTEL_DINING', label: '飯店餐飲' },
  ],
  SHOPPING: [
    { value: 'DEPARTMENT', label: '百貨' },
    { value: 'WAREHOUSE', label: '量販' },
    { value: 'ELECTRONICS', label: '3C家電' },
  ],
  ONLINE: [
    { value: 'ECOMMERCE', label: '電商平台' },
    { value: 'MOBILE_PAY', label: '行動支付' },
    { value: 'SUBSCRIPTION', label: '訂閱服務' },
  ],
}

export const SUBCATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(SUBCATEGORIES).flatMap((subs) => subs?.map((s) => [s.value, s.label]) ?? []),
)

export const CHANNELS = ['ONLINE', 'OFFLINE', 'ALL'] as const
export type Channel = (typeof CHANNELS)[number]

export const CHANNEL_LABELS: Record<Channel, string> = {
  ONLINE: '線上',
  OFFLINE: '線下',
  ALL: '不限',
}

export const CASHBACK_TYPES = ['PERCENT', 'FIXED', 'POINTS'] as const
export type CashbackType = (typeof CASHBACK_TYPES)[number]

export const RECOMMENDATION_SCOPES = ['RECOMMENDABLE', 'CATALOG_ONLY', 'FUTURE_SCOPE'] as const
export type RecommendationScope = (typeof RECOMMENDATION_SCOPES)[number]

export const ELIGIBILITY_TYPES = ['GENERAL', 'PROFESSION_SPECIFIC', 'BUSINESS'] as const
export type EligibilityType = (typeof ELIGIBILITY_TYPES)[number]

export const ELIGIBILITY_TYPE_LABELS: Record<EligibilityType, string> = {
  GENERAL: '一般',
  PROFESSION_SPECIFIC: '職業限定',
  BUSINESS: '商務卡',
}

export const ANNUAL_FEE_RANGES = ['FREE', 'LOW', 'HIGH'] as const
export type AnnualFeeRange = (typeof ANNUAL_FEE_RANGES)[number]

export const ANNUAL_FEE_RANGE_LABELS: Record<AnnualFeeRange, string> = {
  FREE: '免年費',
  LOW: '低年費 (1-999)',
  HIGH: '高年費 (1000+)',
}

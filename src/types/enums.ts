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
  ONLINE: '線上',
  OVERSEAS: '海外',
  SHOPPING: '購物',
  GROCERY: '生活採買',
  ENTERTAINMENT: '娛樂',
  OTHER: '其他',
}

export const SUBCATEGORIES: Partial<Record<Category, { value: string; label: string }[]>> = {
  ENTERTAINMENT: [
    { value: 'MOVIE', label: '電影' },
    { value: 'THEME_PARK', label: '主題樂園' },
    { value: 'VENUE', label: 'KTV / 展演' },
    { value: 'STREAMING', label: '影音串流' },
  ],
  DINING: [
    { value: 'DELIVERY', label: '外送' },
    { value: 'RESTAURANT', label: '餐廳' },
    { value: 'CAFE', label: '咖啡 / 茶飲' },
    { value: 'HOTEL_DINING', label: '飯店餐飲' },
  ],
  SHOPPING: [
    { value: 'DEPARTMENT', label: '百貨' },
    { value: 'WAREHOUSE', label: '量販' },
    { value: 'ELECTRONICS', label: '3C 家電' },
    { value: 'DRUGSTORE', label: '藥妝' },
  ],
  ONLINE: [
    { value: 'ECOMMERCE', label: '電商平台' },
    { value: 'SUBSCRIPTION', label: '訂閱服務' },
    { value: 'AI_TOOL', label: 'AI 工具' },
    { value: 'TRAVEL_PLATFORM', label: '旅遊平台' },
    { value: 'INTERNATIONAL_ECOMMERCE', label: '跨境電商' },
  ],
  TRANSPORT: [
    { value: 'RIDESHARE', label: '叫車 / 共享' },
    { value: 'AIRLINE', label: '航空' },
  ],
  GROCERY: [
    { value: 'SUPERMARKET', label: '超市量販' },
    { value: 'CONVENIENCE_STORE', label: '便利商店' },
  ],
  OVERSEAS: [
    { value: 'OVERSEAS_IN_STORE', label: '海外實體' },
  ],
  OTHER: [
    { value: 'EV_CHARGING', label: '充電' },
    { value: 'PARKING', label: '停車' },
    { value: 'HOME_LIVING', label: '居家生活' },
  ],
}

export const SUBCATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(SUBCATEGORIES).flatMap((subs) => subs?.map((s) => [s.value, s.label]) ?? []),
)

export const PAYMENT_METHODS = [
  { value: 'MOBILE_PAY', label: '行動支付' },
  { value: 'LINE_PAY', label: 'LINE Pay' },
  { value: 'APPLE_PAY', label: 'Apple Pay' },
  { value: 'GOOGLE_PAY', label: 'Google Pay' },
  { value: 'SAMSUNG_PAY', label: 'Samsung Pay' },
  { value: 'JKOPAY', label: '街口支付' },
  { value: 'ESUN_WALLET', label: '玉山 Wallet' },
  { value: '全支付', label: '全支付' },
  { value: '街口支付', label: '街口支付' },
  { value: '悠遊付', label: '悠遊付' },
  { value: '全盈_PAY', label: '全盈+PAY' },
  { value: 'IPASS_MONEY', label: 'iPASS MONEY' },
  { value: 'ICASH_PAY', label: 'icash Pay' },
  { value: 'TWQR', label: 'TWQR' },
] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['value']

export const PAYMENT_METHOD_LABELS: Record<string, string> = Object.fromEntries(
  PAYMENT_METHODS.map((method) => [method.value, method.label]),
)

export const MERCHANT_SUGGESTIONS: Record<string, { value: string; label: string }[]> = {
  ONLINE: [
    { value: 'MOMO', label: 'momo' },
    { value: 'SHOPEE', label: '蝦皮' },
    { value: 'PCHOME_24H', label: 'PChome 24h' },
  ],
  'ONLINE:AI_TOOL': [
    { value: 'CHATGPT', label: 'ChatGPT' },
    { value: 'CLAUDE', label: 'Claude' },
    { value: 'CANVA', label: 'Canva' },
    { value: 'CURSOR', label: 'Cursor' },
    { value: 'NOTION', label: 'Notion' },
  ],
  'ONLINE:ECOMMERCE': [
    { value: 'MOMO', label: 'momo' },
    { value: 'SHOPEE', label: '蝦皮' },
    { value: 'PCHOME_24H', label: 'PChome 24h' },
  ],
  'ONLINE:INTERNATIONAL_ECOMMERCE': [
    { value: 'COUPANG', label: 'Coupang' },
    { value: 'TAOBAO', label: '淘寶' },
    { value: 'TMALL', label: '天貓' },
  ],
  'ONLINE:TRAVEL_PLATFORM': [
    { value: 'AGODA', label: 'Agoda' },
    { value: 'BOOKING', label: 'Booking.com' },
    { value: 'TRIP_COM', label: 'Trip.com' },
    { value: 'KLOOK', label: 'Klook' },
    { value: 'KKDAY', label: 'KKday' },
    { value: 'HOTELS_COM', label: 'Hotels.com' },
    { value: 'ASIAYO', label: 'AsiaYo' },
    { value: 'AIRSIM', label: 'AIRSIM' },
  ],
  'ENTERTAINMENT:STREAMING': [
    { value: 'NETFLIX', label: 'Netflix' },
    { value: 'DISNEY_PLUS', label: 'Disney+' },
    { value: 'SPOTIFY', label: 'Spotify' },
    { value: 'YOUTUBE_PREMIUM', label: 'YouTube Premium' },
  ],
  'DINING:DELIVERY': [
    { value: 'UBER_EATS', label: 'Uber Eats' },
    { value: 'FOODPANDA', label: 'foodpanda' },
  ],
  'SHOPPING:DRUGSTORE': [
    { value: 'COSMED', label: '康是美' },
    { value: 'WATSONS', label: '屈臣氏' },
  ],
  'TRANSPORT:RIDESHARE': [
    { value: 'UBER', label: 'Uber' },
    { value: 'GRAB', label: 'Grab' },
    { value: 'YOXI', label: 'yoxi' },
  ],
  'TRANSPORT:AIRLINE': [
    { value: 'CHINA_AIRLINES', label: '中華航空' },
    { value: 'EVA_AIR', label: '長榮航空' },
    { value: 'STARLUX', label: '星宇航空' },
    { value: 'CATHAY_PACIFIC', label: '國泰航空' },
  ],
  'GROCERY:SUPERMARKET': [
    { value: 'PXMART', label: '全聯' },
    { value: 'CARREFOUR', label: '家樂福' },
    { value: 'LOPIA', label: 'LOPIA' },
  ],
  'OTHER:EV_CHARGING': [
    { value: 'U_POWER', label: 'U-POWER' },
    { value: 'EVOASIS', label: 'EVOASIS' },
    { value: 'ICHARGING', label: 'iCharging' },
  ],
}

export const CUBE_BENEFIT_TIERS = [
  { value: 'LEVEL_1', label: 'Level 1', description: '一般持卡，預設 2%' },
  { value: 'LEVEL_2', label: 'Level 2', description: 'CUBE App 假設為 3%' },
  { value: 'LEVEL_3', label: 'Level 3', description: '高回饋假設為 3.3%' },
] as const

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
  PROFESSION_SPECIFIC: '特定職業',
  BUSINESS: '商務',
}

export const ANNUAL_FEE_RANGES = ['FREE', 'LOW', 'HIGH'] as const
export type AnnualFeeRange = (typeof ANNUAL_FEE_RANGES)[number]

export const ANNUAL_FEE_RANGE_LABELS: Record<AnnualFeeRange, string> = {
  FREE: '免年費',
  LOW: '低年費 (1-999)',
  HIGH: '高年費 (1000+)',
}

export const BANK_CODES = [
  'CTBC', 'ESUN', 'TAISHIN', 'CATHAY', 'MEGA',
  'FUBON', 'FIRST', 'SINOPAC', 'TPBANK', 'UBOT',
] as const
export type BankCode = (typeof BANK_CODES)[number]

/** Bank accent colors — shared across CardsPage & CardDetailPage */
export const BANK_COLORS: Record<BankCode, { bg: string; text: string }> = {
  CATHAY:  { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-400' },
  ESUN:    { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-400' },
  TAISHIN: { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-400' },
  CTBC:    { bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-700 dark:text-sky-400' },
  FUBON:   { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-400' },
  MEGA:    { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-400' },
  FIRST:   { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-400' },
  SINOPAC: { bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-400' },
  TPBANK:  { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-700 dark:text-teal-400' },
  UBOT:    { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-400' },
}

export const DEFAULT_BANK_COLOR = { bg: 'bg-primary/10', text: 'text-primary' }

/** Condition types that represent designated channels/merchants (shown in blue) */
export const CHANNEL_CONDITION_TYPES = new Set([
  'LOCATION_ONLY',
  'LOCATION_EXCLUDE',
  'ECOMMERCE_PLATFORM',
  'RETAIL_CHAIN',
  'PAYMENT_PLATFORM',
  'MERCHANT',
])

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
    { value: 'SPORTING_GOODS', label: '運動用品' },
    { value: 'APPAREL', label: '服飾' },
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
    { value: 'PUBLIC_TRANSIT', label: '大眾運輸' },
    { value: 'GAS_STATION', label: '加油' },
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
    { value: 'CHARITY_DONATION', label: '公益 / 捐款' },
  ],
}

export const SUBCATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(SUBCATEGORIES).flatMap((subs) => subs?.map((s) => [s.value, s.label]) ?? []),
)

const PAYMENT_METHOD_OPTIONS = [
  { value: 'LINE_PAY', label: 'LINE Pay' },
  { value: 'APPLE_PAY', label: 'Apple Pay' },
  { value: 'GOOGLE_PAY', label: 'Google Pay' },
  { value: 'SAMSUNG_PAY', label: 'Samsung Pay' },
  { value: 'JKOPAY', label: '街口支付' },
  { value: 'ESUN_WALLET', label: '玉山 Wallet' },
  { value: '全支付', label: '全支付' },
  { value: '悠遊付', label: '悠遊付' },
  { value: '全盈_PAY', label: '全盈+PAY' },
  { value: 'IPASS_MONEY', label: 'iPASS MONEY' },
  { value: 'ICASH_PAY', label: 'icash Pay' },
  { value: 'TWQR', label: 'TWQR' },
] as const

export const PAYMENT_METHODS = PAYMENT_METHOD_OPTIONS
export type PaymentMethod = typeof PAYMENT_METHOD_OPTIONS[number]['value'] | 'MOBILE_PAY'

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  MOBILE_PAY: '行動支付',
  ...Object.fromEntries(PAYMENT_METHOD_OPTIONS.map((method) => [method.value, method.label])),
  街口支付: '街口支付',
}

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
  'SHOPPING:SPORTING_GOODS': [
    { value: 'DECATHLON', label: '迪卡儂' },
  ],
  'SHOPPING:APPAREL': [
    { value: 'UNIQLO', label: 'UNIQLO' },
    { value: 'NET', label: 'NET' },
  ],
  'TRANSPORT:RIDESHARE': [
    { value: 'UBER', label: 'Uber' },
    { value: 'GRAB', label: 'Grab' },
    { value: 'YOXI', label: 'yoxi' },
  ],
  'TRANSPORT:PUBLIC_TRANSIT': [
    { value: 'TRA', label: '台鐵' },
    { value: 'THSR', label: '高鐵' },
  ],
  'TRANSPORT:GAS_STATION': [
    { value: 'CPC', label: '台灣中油' },
    { value: 'NATIONWIDE_GAS', label: '全國加油' },
    { value: 'FORMOSA_PETROCHEMICAL', label: '台塑石油' },
    { value: 'TAIA', label: '台亞' },
    { value: 'FORMOZA', label: '福懋' },
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
  'OTHER:CHARITY_DONATION': [
    { value: 'ESUN_WALLET_DONATION_SINGLE', label: '玉山 Wallet 單筆捐款' },
    { value: 'ESUN_WALLET_DONATION_RECURRING', label: '玉山 Wallet 定期定額' },
  ],
}

export const CUBE_BENEFIT_TIERS = [
  { value: 'LEVEL_1', label: 'Level 1', description: '一般持卡，預設 2%' },
  { value: 'LEVEL_2', label: 'Level 2', description: 'CUBE App 假設為 3%' },
  { value: 'LEVEL_3', label: 'Level 3', description: '高回饋假設為 3.3%' },
] as const

export const RICHART_BENEFIT_TIERS = [
  { value: 'LEVEL_1', label: 'Level 1', description: '未升級身分，切換方案最高 1.3%' },
  { value: 'LEVEL_2', label: 'Level 2', description: '升級身分後，切換方案最高 3.8% / 3.3% / 2%' },
] as const

export interface SwitchingCardPlanOption {
  value: string
  label: string
  description?: string
}

export interface SwitchingCardRuntimeField {
  key: string
  label: string
  options: { value: string; label: string; description?: string }[]
}

export interface SwitchingCardStateConfig {
  cardCode: string
  cardLabel: string
  bankLabel: string
  description: string
  plans: SwitchingCardPlanOption[]
  runtimeFields?: SwitchingCardRuntimeField[]
}

export const SWITCHING_CARD_STATE_CONFIG: SwitchingCardStateConfig[] = [
  {
    cardCode: 'CATHAY_CUBE',
    cardLabel: 'CUBE 信用卡',
    bankLabel: '國泰世華',
    description: '指定目前生效方案，並補充目前等級假設。',
    plans: [
      { value: 'CATHAY_CUBE_DIGITAL', label: '玩數位', description: '線上、影音、數位服務' },
      { value: 'CATHAY_CUBE_SHOPPING', label: '樂饗購', description: '購物、餐飲、百貨' },
      { value: 'CATHAY_CUBE_TRAVEL', label: '趣旅行', description: '交通、海外、旅遊' },
      { value: 'CATHAY_CUBE_ESSENTIALS', label: '集精選', description: '超市、生活、精選通路' },
      { value: 'CATHAY_CUBE_BIRTHDAY', label: '慶生月', description: '生日檔期限定方案' },
      { value: 'CATHAY_CUBE_KIDS', label: '童樂匯', description: '親子與兒童場景' },
      { value: 'CATHAY_CUBE_JAPAN', label: '日本賞', description: '日本限定檔期方案' },
    ],
    runtimeFields: [
      {
        key: 'tier',
        label: '目前等級',
        options: [...CUBE_BENEFIT_TIERS],
      },
    ],
  },
  {
    cardCode: 'ESUN_UNICARD',
    cardLabel: 'Unicard',
    bankLabel: '玉山銀行',
    description: '指定目前採用的回饋方案，之後可再擴充任意選商家。',
    plans: [
      { value: 'ESUN_UNICARD_SIMPLE', label: '簡單選', description: '固定通路池' },
      { value: 'ESUN_UNICARD_FLEXIBLE', label: '任意選', description: '自選指定通路' },
      { value: 'ESUN_UNICARD_UP', label: 'UP 選', description: '高回饋訂閱方案' },
    ],
  },
  {
    cardCode: 'TAISHIN_RICHART',
    cardLabel: '玫瑰卡 / @GoGo / Richart',
    bankLabel: '台新銀行',
    description: '指定目前切換中的主方案，並補充目前卡友身分等級。',
    plans: [
      { value: 'TAISHIN_RICHART_PAY', label: 'Pay著刷', description: '支付與繳費場景' },
      { value: 'TAISHIN_RICHART_DAILY', label: '天天刷', description: '日常生活' },
      { value: 'TAISHIN_RICHART_BIG', label: '大筆刷', description: '百貨與大額消費' },
      { value: 'TAISHIN_RICHART_DINING', label: '好饗刷', description: '餐飲場景' },
      { value: 'TAISHIN_RICHART_DIGITAL', label: '數趣刷', description: '線上與數位' },
      { value: 'TAISHIN_RICHART_TRAVEL', label: '玩旅刷', description: '旅遊與海外' },
      { value: 'TAISHIN_RICHART_WEEKEND', label: '假日刷', description: '週末檔期場景' },
    ],
    runtimeFields: [
      {
        key: 'tier',
        label: '卡友身分',
        options: [...RICHART_BENEFIT_TIERS],
      },
    ],
  },
] as const

/** UniCard 任意選：百大指定消費商家清單（按類別分組，最多可選 8 家） */
export const UNICARD_FLEXIBLE_MAX_SELECTIONS = 8

export interface UnicardMerchantGroup {
  groupLabel: string
  merchants: { value: string; label: string }[]
}

export const UNICARD_FLEXIBLE_MERCHANT_OPTIONS: UnicardMerchantGroup[] = [
  {
    groupLabel: '行動支付',
    merchants: [
      { value: 'ESUN_WALLET', label: '玉山 Wallet' },
      { value: 'LINE_PAY', label: 'LINE Pay' },
      { value: '全支付', label: '全支付' },
      { value: '街口支付', label: '街口支付' },
    ],
  },
  {
    groupLabel: '電商平台',
    merchants: [
      { value: 'MOMO', label: 'momo' },
      { value: 'SHOPEE', label: '蝦皮' },
      { value: 'PCHOME_24H', label: 'PChome 24h' },
      { value: 'COUPANG', label: 'Coupang' },
    ],
  },
  {
    groupLabel: '餐飲美食',
    merchants: [
      { value: 'UBER_EATS', label: 'Uber Eats' },
      { value: 'FOODPANDA', label: 'foodpanda' },
      { value: 'STARBUCKS', label: '星巴克' },
      { value: 'MCDONALD', label: '麥當勞' },
    ],
  },
  {
    groupLabel: '加油交通',
    merchants: [
      { value: 'CPC', label: '台灣中油' },
      { value: 'NATIONWIDE_GAS', label: '全國加油' },
      { value: 'FORMOSA_PETROCHEMICAL', label: '台塑石油' },
      { value: 'GOSHARE', label: 'GoShare' },
      { value: 'WEMO', label: 'WeMo' },
    ],
  },
  {
    groupLabel: '國內百貨',
    merchants: [
      { value: 'SHIN_KONG_MITSUKOSHI', label: '新光三越' },
      { value: 'SOGO', label: '遠東 SOGO' },
      { value: 'FAR_EAST_DEPARTMENT_STORE', label: '遠東百貨' },
      { value: 'GLOBAL_MALL', label: '環球購物中心' },
    ],
  },
  {
    groupLabel: '生活採買',
    merchants: [
      { value: 'PXMART', label: '全聯' },
      { value: 'CARREFOUR', label: '家樂福' },
      { value: 'LOPIA', label: 'LOPIA' },
      { value: 'COSMED', label: '康是美' },
      { value: 'WATSONS', label: '屈臣氏' },
    ],
  },
  {
    groupLabel: '精選商家',
    merchants: [
      { value: 'UNIQLO', label: 'UNIQLO' },
      { value: 'NET', label: 'NET' },
      { value: 'DECATHLON', label: '迪卡儂' },
      { value: 'IKEA', label: 'IKEA' },
      { value: 'MUJI', label: 'MUJI' },
    ],
  },
  {
    groupLabel: '航空旅遊',
    merchants: [
      { value: 'CHINA_AIRLINES', label: '中華航空' },
      { value: 'EVA_AIR', label: '長榮航空' },
      { value: 'STARLUX', label: '星宇航空' },
      { value: 'AGODA', label: 'Agoda' },
      { value: 'KLOOK', label: 'Klook' },
    ],
  },
  {
    groupLabel: '國外實體',
    merchants: [
      { value: 'JAPAN', label: '日本' },
      { value: 'KOREA', label: '韓國' },
      { value: 'USA', label: '美國' },
    ],
  },
  {
    groupLabel: 'ESG 消費',
    merchants: [
      { value: 'U_POWER', label: 'U-POWER' },
      { value: 'EVOASIS', label: 'EVOASIS' },
      { value: 'ICHARGING', label: 'iCharging' },
    ],
  },
]

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

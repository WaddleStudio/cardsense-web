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

/** Condition types for designated venues/merchants (where you spend) */
export const VENUE_CONDITION_TYPES = new Set([
  'VENUE',
  'LOCATION_ONLY',
  'LOCATION_EXCLUDE',
])

/** Condition types for payment methods (how you pay) */
export const PAYMENT_CONDITION_TYPES = new Set([
  'PAYMENT',
])

/** All channel-related condition types (union of venue + payment) */
export const CHANNEL_CONDITION_TYPES = new Set([
  ...VENUE_CONDITION_TYPES,
  ...PAYMENT_CONDITION_TYPES,
])

export const CATEGORIES = [
  'DINING', 'TRANSPORT', 'ONLINE', 'TRAVEL', 'OVERSEAS',
  'SHOPPING', 'GROCERY', 'ENTERTAINMENT', 'OTHER',
] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  DINING: '餐飲',
  TRANSPORT: '交通',
  ONLINE: '線上',
  TRAVEL: '旅遊',
  OVERSEAS: '海外',
  SHOPPING: '購物',
  GROCERY: '生活採買',
  ENTERTAINMENT: '娛樂',
  OTHER: '其他',
}

export { SUBCATEGORIES, SUBCATEGORY_LABELS } from '@/lib/taxonomy'

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

export interface PaymentMethodGroup {
  groupLabel: string
  defaultExpanded: boolean
  methods: { value: string; label: string }[]
}

export const PAYMENT_METHOD_GROUPS: PaymentMethodGroup[] = [
  {
    groupLabel: '常用行動支付',
    defaultExpanded: true,
    methods: [
      { value: 'LINE_PAY', label: 'LINE Pay' },
      { value: 'JKOPAY', label: '街口支付' },
      { value: '全支付', label: '全支付' },
      { value: 'IPASS_MONEY', label: 'iPASS MONEY' },
    ],
  },
  {
    groupLabel: '其他電子支付',
    defaultExpanded: false,
    methods: [
      { value: '悠遊付', label: '悠遊付' },
      { value: '全盈_PAY', label: '全盈+PAY' },
      { value: 'ICASH_PAY', label: 'icash Pay' },
      { value: 'TWQR', label: 'TWQR' },
    ],
  },
  {
    groupLabel: '手機錢包',
    defaultExpanded: false,
    methods: [
      { value: 'APPLE_PAY', label: 'Apple Pay' },
      { value: 'GOOGLE_PAY', label: 'Google Pay' },
      { value: 'SAMSUNG_PAY', label: 'Samsung Pay' },
      { value: 'ESUN_WALLET', label: '玉山 Wallet' },
    ],
  },
]

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  MOBILE_PAY: '行動支付',
  ...Object.fromEntries(PAYMENT_METHOD_OPTIONS.map((method) => [method.value, method.label])),
  街口支付: '街口支付',
}

export { MERCHANT_SUGGESTIONS } from '@/lib/taxonomy'

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
      { value: 'CHUNGYO', label: '中友百貨' },
      { value: 'METROWALK', label: '大江購物中心' },
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

export const CASHBACK_TYPES = ['PERCENT', 'FIXED', 'POINTS', 'MILES'] as const
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

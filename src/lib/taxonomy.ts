import type { Category } from '@/types/enums'
import rawSubcategoryTaxonomy from '@contracts/taxonomy/subcategory-taxonomy.json'
import rawMerchantRegistry from '@contracts/taxonomy/merchant-registry.json'

// ---------- Types for raw JSON ----------

interface RawSubcategory {
  category: string
  description: string
}

interface RawMerchant {
  code: string
  label: string
  category: string
  subcategory: string
  aliases: string[]
}

const subcategoryTaxonomy = rawSubcategoryTaxonomy as unknown as Record<string, RawSubcategory>
const merchantRegistry = rawMerchantRegistry as unknown as RawMerchant[]
const POPULAR_MERCHANT_CODES = [
  'PXMART',
  'CARREFOUR',
  'MOMO',
  'SHOPEE',
  'AGODA',
  'STARBUCKS',
  'UBER_EATS',
  'MCDONALD',
] as const

// ---------- Chinese label map (presentation concern, maintained here) ----------

const SUBCATEGORY_LABEL_MAP: Record<string, string> = {
  // ENTERTAINMENT
  MOVIE: '電影',
  THEME_PARK: '主題樂園',
  SINGING: 'KTV',
  LIVE_EVENT: '展演 / 演唱會',
  STREAMING: '影音串流',
  // DINING
  DELIVERY: '外送',
  RESTAURANT: '餐廳',
  CAFE: '咖啡 / 茶飲',
  HOTEL_DINING: '飯店餐飲',
  // SHOPPING
  DEPARTMENT: '百貨',
  WAREHOUSE: '量販',
  ELECTRONICS: '3C 家電',
  DRUGSTORE: '藥妝',
  SPORTING_GOODS: '運動用品',
  APPAREL: '服飾',
  HOME_LIVING: '居家生活',
  // ONLINE
  ECOMMERCE: '電商平台',
  SUBSCRIPTION: '訂閱服務',
  AI_TOOL: 'AI 工具',
  MOBILE_PAY: '行動支付',
  INTERNATIONAL_ECOMMERCE: '跨境電商',
  // TRANSPORT
  RIDESHARE: '叫車 / 共享',
  PUBLIC_TRANSIT: '大眾運輸',
  GAS_STATION: '加油',
  AIRLINE: '航空',
  EV_CHARGING: '充電',
  PARKING: '停車',
  // GROCERY
  SUPERMARKET: '超市量販',
  CONVENIENCE_STORE: '便利商店',
  // TRAVEL
  HOTEL: '旅宿',
  TRAVEL_PLATFORM: '旅遊平台',
  TRAVEL_AGENCY: '旅行社',
  // OVERSEAS
  OVERSEAS_IN_STORE: '海外實體',
  // fallback
  GENERAL: '一般',
}

// ---------- Derive SUBCATEGORIES from taxonomy ----------

/** Category overrides: reclassify subcategories in the frontend when needed. */
const FRONTEND_CATEGORY_OVERRIDES: Record<string, Category> = {}

function deriveSubcategories(): Partial<Record<Category, { value: string; label: string }[]>> {
  const grouped: Record<string, { value: string; label: string }[]> = {}

  for (const [subKey, sub] of Object.entries(subcategoryTaxonomy)) {
    if (subKey === 'GENERAL') continue
    const cat = FRONTEND_CATEGORY_OVERRIDES[subKey] ?? sub.category
    if (!grouped[cat]) grouped[cat] = []
    const label = SUBCATEGORY_LABEL_MAP[subKey] ?? subKey
    grouped[cat].push({ value: subKey, label })
  }

  return grouped as Partial<Record<Category, { value: string; label: string }[]>>
}

export const SUBCATEGORIES = deriveSubcategories()

export const SUBCATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(SUBCATEGORIES).flatMap((subs) => subs?.map((s) => [s.value, s.label]) ?? []),
)

// ---------- Derive MERCHANT_SUGGESTIONS from registry ----------

function deriveMerchantSuggestions(): Record<string, { value: string; label: string }[]> {
  const result: Record<string, { value: string; label: string }[]> = {}

  for (const m of merchantRegistry) {
    // Use the frontend-overridden category so lookup keys match the UI state
    const frontendCat = FRONTEND_CATEGORY_OVERRIDES[m.subcategory] ?? m.category
    const subKey = `${frontendCat}:${m.subcategory}`
    if (!result[subKey]) result[subKey] = []
    result[subKey].push({ value: m.code, label: m.label })
  }

  return result
}

export const MERCHANT_SUGGESTIONS = deriveMerchantSuggestions()

export const POPULAR_MERCHANT_SHORTCUTS = POPULAR_MERCHANT_CODES.map((code) => {
  const merchant = merchantRegistry.find((entry) => entry.code === code)
  return merchant ? { value: merchant.code, label: merchant.label } : null
}).filter((merchant): merchant is { value: string; label: string } => merchant !== null)

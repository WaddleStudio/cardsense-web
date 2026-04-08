import { Bus, Globe, Luggage, Package, Popcorn, ShoppingBag, ShoppingCart, Store, Utensils, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

const CALC_CATEGORIES: { value: Category; label: string; icon: LucideIcon }[] = [
  { value: 'DINING', label: '餐飲', icon: Utensils },
  { value: 'ONLINE', label: '網購', icon: ShoppingCart },
  { value: 'GROCERY', label: '超市', icon: Store },
  { value: 'TRANSPORT', label: '交通', icon: Bus },
  { value: 'TRAVEL', label: '旅遊', icon: Luggage },
  { value: 'OVERSEAS', label: '海外', icon: Globe },
  { value: 'SHOPPING', label: '百貨', icon: ShoppingBag },
  { value: 'ENTERTAINMENT', label: '娛樂', icon: Popcorn },
  { value: 'OTHER', label: '其他', icon: Package },
]

interface CategoryGridProps {
  value: Category
  onChange: (value: Category) => void
}

export function CategoryGrid({ value, onChange }: CategoryGridProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">消費類別</label>
      <div className="grid grid-cols-4 gap-1.5">
        {CALC_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onChange(cat.value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border p-2 min-h-touch text-xs font-medium transition-colors cursor-pointer',
                value === cat.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:border-primary/50 hover:bg-accent',
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="leading-none mt-0.5">{cat.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

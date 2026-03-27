import { cn } from '@/lib/utils'
import type { Category } from '@/types'

const CALC_CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'DINING', label: '餐飲', emoji: '🍽️' },
  { value: 'ONLINE', label: '網購', emoji: '🛒' },
  { value: 'GROCERY', label: '超市', emoji: '🏪' },
  { value: 'TRANSPORT', label: '交通', emoji: '🚗' },
  { value: 'OVERSEAS', label: '海外', emoji: '✈️' },
  { value: 'SHOPPING', label: '百貨', emoji: '🏬' },
  { value: 'ENTERTAINMENT', label: '娛樂', emoji: '🎬' },
  { value: 'OTHER', label: '其他', emoji: '📦' },
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
        {CALC_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg border p-2 text-xs font-medium transition-colors cursor-pointer',
              value === cat.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:border-primary/50 hover:bg-accent',
            )}
          >
            <span className="text-base leading-none">{cat.emoji}</span>
            <span className="leading-none mt-0.5">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

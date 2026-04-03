import { cn } from '@/lib/utils'
import { SUBCATEGORIES } from '@/types'
import type { Category } from '@/types'

interface SubcategoryGridProps {
  category: Category
  value: string | null
  onChange: (value: string | null) => void
}

export function SubcategoryGrid({ category, value, onChange }: SubcategoryGridProps) {
  const subcategories = SUBCATEGORIES[category]
  if (!subcategories) return null

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">消費場景（可不選）</label>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
            value === null
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background hover:border-primary/50 hover:bg-accent',
          )}
        >
          全部
        </button>
        {subcategories.map((sub) => (
          <button
            key={sub.value}
            type="button"
            onClick={() => onChange(sub.value)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
              value === sub.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:border-primary/50 hover:bg-accent',
            )}
          >
            {sub.label}
          </button>
        ))}
      </div>
    </div>
  )
}

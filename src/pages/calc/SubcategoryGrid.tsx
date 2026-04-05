import { FilterChip } from '@/components/ui/filter-chip'
import { SUBCATEGORIES } from '@/types'
import type { Category } from '@/types'

interface SubcategoryGridProps {
  category: Category
  value: string | null
  onChange: (value: string | null) => void
}

export function SubcategoryGrid({ category, value, onChange }: SubcategoryGridProps) {
  const subcategories = SUBCATEGORIES[category]?.filter((sub) => sub.value !== 'MOBILE_PAY')
  if (!subcategories) return null

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">消費場景（可不選）</label>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <FilterChip active={value === null} onClick={() => onChange(null)}>
          全部
        </FilterChip>
        {subcategories.map((sub) => (
          <FilterChip
            key={sub.value}
            active={value === sub.value}
            onClick={() => onChange(sub.value)}
          >
            {sub.label}
          </FilterChip>
        ))}
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FilterChip } from '@/components/ui/filter-chip'
import {
  UNICARD_FLEXIBLE_MERCHANT_OPTIONS,
  UNICARD_FLEXIBLE_MAX_SELECTIONS,
} from '@/types'
import { cn } from '@/lib/utils'

interface MerchantPickerProps {
  /** Comma-separated merchant values (API-compatible format) */
  value: string
  onChange: (value: string) => void
}

export function MerchantPicker({ value, onChange }: MerchantPickerProps) {
  const [search, setSearch] = useState('')

  const selected = useMemo(
    () =>
      value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [value],
  )

  const allMerchants = useMemo(
    () =>
      UNICARD_FLEXIBLE_MERCHANT_OPTIONS.flatMap((g) =>
        g.merchants.map((m) => ({ ...m, group: g.groupLabel })),
      ),
    [],
  )

  const selectedLabels = useMemo(() => {
    const map = new Map(allMerchants.map((m) => [m.value, m.label]))
    return selected.map((v) => ({ value: v, label: map.get(v) ?? v }))
  }, [selected, allMerchants])

  const atLimit = selected.length >= UNICARD_FLEXIBLE_MAX_SELECTIONS

  function toggle(merchantValue: string) {
    if (selected.includes(merchantValue)) {
      const next = selected.filter((v) => v !== merchantValue)
      onChange(next.join(','))
    } else if (!atLimit) {
      onChange([...selected, merchantValue].join(','))
    }
  }

  function remove(merchantValue: string) {
    onChange(selected.filter((v) => v !== merchantValue).join(','))
  }

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return UNICARD_FLEXIBLE_MERCHANT_OPTIONS
    const q = search.trim().toLowerCase()
    return UNICARD_FLEXIBLE_MERCHANT_OPTIONS.map((group) => ({
      ...group,
      merchants: group.merchants.filter(
        (m) =>
          m.label.toLowerCase().includes(q) ||
          m.value.toLowerCase().includes(q),
      ),
    })).filter((g) => g.merchants.length > 0)
  }, [search])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          任意選已選商家
        </p>
        <span
          className={cn(
            'text-xs',
            atLimit ? 'font-medium text-amber-700 dark:text-amber-400' : 'text-muted-foreground',
          )}
        >
          {selected.length}/{UNICARD_FLEXIBLE_MAX_SELECTIONS}
        </span>
      </div>

      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedLabels.map((m) => (
            <span
              key={m.value}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {m.label}
              <button
                type="button"
                onClick={() => remove(m.value)}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary/20"
                aria-label={`移除 ${m.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋商家..."
          className="h-8 pl-8 text-xs"
        />
      </div>

      <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-2">
        {filteredGroups.length === 0 && (
          <p className="py-2 text-center text-xs text-muted-foreground">找不到商家</p>
        )}
        {filteredGroups.map((group) => (
          <div key={group.groupLabel}>
            <p className="mb-1 text-xs font-semibold text-muted-foreground">
              {group.groupLabel}
            </p>
            <div className="flex flex-wrap gap-1">
              {group.merchants.map((m) => {
                const isSelected = selected.includes(m.value)
                return (
                  <FilterChip
                    key={m.value}
                    active={isSelected}
                    onClick={() => toggle(m.value)}
                    className={cn(
                      !isSelected && atLimit && 'opacity-40 pointer-events-none',
                    )}
                  >
                    {m.label}
                  </FilterChip>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        從百大指定消費中自選最多 {UNICARD_FLEXIBLE_MAX_SELECTIONS} 家；比較任意選場景時，只有出現在這裡的商家才會納入。
      </p>
    </div>
  )
}

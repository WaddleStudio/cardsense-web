import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FilterChip } from '@/components/ui/filter-chip'
import { cn } from '@/lib/utils'
import { PAYMENT_METHOD_GROUPS, PAYMENT_METHOD_LABELS } from '@/types'

interface PaymentMethodPickerProps {
  value: string | null
  onChange: (value: string | null) => void
}

export function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const group of PAYMENT_METHOD_GROUPS) {
      if (group.defaultExpanded) initial.add(group.groupLabel)
    }
    // If the current value is in a collapsed group, expand it
    if (value) {
      for (const group of PAYMENT_METHOD_GROUPS) {
        if (group.methods.some((m) => m.value === value)) {
          initial.add(group.groupLabel)
        }
      }
    }
    return initial
  })

  function toggleGroup(groupLabel: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupLabel)) next.delete(groupLabel)
      else next.add(groupLabel)
      return next
    })
  }

  return (
    <div className="space-y-2">
      <FilterChip active={value === null} onClick={() => onChange(null)}>
        不限方式
      </FilterChip>

      {PAYMENT_METHOD_GROUPS.map((group) => {
        const isExpanded = expandedGroups.has(group.groupLabel)
        const hasActiveInGroup = value !== null && group.methods.some((m) => m.value === value)

        return (
          <div key={group.groupLabel}>
            <button
              type="button"
              onClick={() => toggleGroup(group.groupLabel)}
              className={cn(
                'flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-xs font-medium transition-colors cursor-pointer',
                hasActiveInGroup
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <ChevronDown
                className={cn(
                  'h-3 w-3 shrink-0 transition-transform',
                  !isExpanded && '-rotate-90',
                )}
              />
              <span>{group.groupLabel}</span>
              {!isExpanded && hasActiveInGroup && (
                <span className="ml-1 text-[10px] text-primary">
                  ({PAYMENT_METHOD_LABELS[value!] ?? value})
                </span>
              )}
            </button>
            {isExpanded && (
              <div className="flex flex-wrap gap-1.5 pl-4 pt-1">
                {group.methods.map((method) => (
                  <FilterChip
                    key={method.value}
                    active={value === method.value}
                    onClick={() => onChange(method.value)}
                  >
                    {method.label}
                  </FilterChip>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {value && (
        <p className="text-xs text-muted-foreground">
          已套用支付方式：{PAYMENT_METHOD_LABELS[value] ?? value}
        </p>
      )}
    </div>
  )
}

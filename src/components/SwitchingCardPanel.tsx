import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Collapsible } from 'radix-ui'
import { FilterChip } from '@/components/ui/filter-chip'
import { SWITCHING_CARD_STATE_CONFIG } from '@/types'
import type { SwitchingCardStateConfig } from '@/types'
import { cn } from '@/lib/utils'

interface SwitchingCardPanelProps {
  activePlansByCard: Record<string, string>
  planRuntimeByCard: Record<string, Record<string, string>>
  onActivePlanChange: (cardCode: string, planValue: string | null) => void
  onRuntimeChange: (cardCode: string, key: string, value: string) => void
  /** Only show these card codes (e.g. when a specific card is pre-selected). Show all if undefined. */
  filterCardCodes?: string[]
  /** Slot rendered after the runtime fields for a specific card (e.g. merchant picker). */
  renderCardExtra?: (cardCode: string, activePlan: string | null) => React.ReactNode
}

export function SwitchingCardPanel({
  activePlansByCard,
  planRuntimeByCard,
  onActivePlanChange,
  onRuntimeChange,
  filterCardCodes,
  renderCardExtra,
}: SwitchingCardPanelProps) {
  const [open, setOpen] = useState(false)

  const configs = filterCardCodes
    ? SWITCHING_CARD_STATE_CONFIG.filter((c) => filterCardCodes.includes(c.cardCode))
    : [...SWITCHING_CARD_STATE_CONFIG]

  const summaryParts = configs.map((c) => {
    const planValue = activePlansByCard[c.cardCode]
    const planLabel = planValue
      ? c.plans.find((p) => p.value === planValue)?.label ?? planValue
      : '未指定'
    return `${c.cardLabel}: ${planLabel}`
  })

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border border-primary/20 bg-primary/5">
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-3 text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">切換卡片現況</p>
              {!open && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {summaryParts.join(' · ')}
                </p>
              )}
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180',
              )}
            />
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
          <div className="space-y-1 px-3 pb-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              若你要比較 CUBE、Unicard、Richart 這類切換權益卡，先指定目前生效方案，結果才會貼近你手上的真實現況。
            </p>

            <div className="space-y-3 pt-1">
              {configs.map((cardConfig) => (
                <SwitchingCardItem
                  key={cardConfig.cardCode}
                  config={cardConfig}
                  activePlan={activePlansByCard[cardConfig.cardCode] ?? null}
                  runtimeState={planRuntimeByCard[cardConfig.cardCode] ?? {}}
                  onActivePlanChange={onActivePlanChange}
                  onRuntimeChange={onRuntimeChange}
                  renderExtra={renderCardExtra}
                />
              ))}
            </div>
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}

function SwitchingCardItem({
  config,
  activePlan,
  runtimeState,
  onActivePlanChange,
  onRuntimeChange,
  renderExtra,
}: {
  config: SwitchingCardStateConfig
  activePlan: string | null
  runtimeState: Record<string, string>
  onActivePlanChange: (cardCode: string, planValue: string | null) => void
  onRuntimeChange: (cardCode: string, key: string, value: string) => void
  renderExtra?: (cardCode: string, activePlan: string | null) => React.ReactNode
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border/70 bg-background px-3 py-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">
          {config.bankLabel} {config.cardLabel}
        </p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">目前方案</p>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={activePlan === null}
            onClick={() => onActivePlanChange(config.cardCode, null)}
          >
            未指定
          </FilterChip>
          {config.plans.map((plan) => (
            <FilterChip
              key={plan.value}
              active={activePlan === plan.value}
              onClick={() => onActivePlanChange(config.cardCode, plan.value)}
            >
              {plan.label}
            </FilterChip>
          ))}
        </div>
        {activePlan && (
          <p className="text-xs text-muted-foreground">
            {config.plans.find((plan) => plan.value === activePlan)?.description}
          </p>
        )}
      </div>

      {config.runtimeFields?.map((field) => {
        const currentValue =
          runtimeState[field.key] ?? (field.key === 'tier' ? 'LEVEL_1' : '')
        return (
          <div key={field.key} className="space-y-1.5">
            <p className="text-xs text-muted-foreground">{field.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {field.options.map((option) => (
                <FilterChip
                  key={option.value}
                  active={currentValue === option.value}
                  onClick={() => onRuntimeChange(config.cardCode, field.key, option.value)}
                >
                  {option.label}
                </FilterChip>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {field.options.find((option) => option.value === currentValue)?.description}
            </p>
          </div>
        )
      })}

      {renderExtra?.(config.cardCode, activePlan)}
    </div>
  )
}

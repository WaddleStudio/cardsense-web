import { cn } from '@/lib/utils'

interface FilterChipProps {
  active: boolean
  onClick: () => void
  size?: 'default' | 'lg'
  children: React.ReactNode
  className?: string
}

export function FilterChip({
  active,
  onClick,
  size = 'default',
  children,
  className,
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 text-xs font-medium transition-colors cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-primary',
        size === 'lg' ? 'min-h-touch' : 'min-h-touch-sm',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
        className,
      )}
    >
      {children}
    </button>
  )
}

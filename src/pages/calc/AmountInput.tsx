import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const QUICK_AMOUNTS = [500, 1000, 3000, 5000]

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function AmountInput({ value, onChange, error }: AmountInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">消費金額</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
          NT$
        </span>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={100}
          max={100000}
          className="pl-12 tabular-nums"
          placeholder="1200"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-1.5 flex-wrap">
        {QUICK_AMOUNTS.map((amt) => (
          <Button
            key={amt}
            variant="outline"
            size="sm"
            type="button"
            className="text-xs h-7 px-2.5"
            onClick={() => onChange(String(amt))}
          >
            {amt >= 1000 ? `${amt / 1000}K` : amt}
          </Button>
        ))}
      </div>
    </div>
  )
}

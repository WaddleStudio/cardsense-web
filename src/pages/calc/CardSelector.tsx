import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useCards } from '@/api'
import { cn } from '@/lib/utils'
import type { CardSummary } from '@/types'

interface CardSelectorProps {
  selected: string[]
  onChange: (codes: string[]) => void
  error?: string
  isUpdating?: boolean
}

export function CardSelector({ selected, onChange, error, isUpdating }: CardSelectorProps) {
  const [search, setSearch] = useState('')
  const { data: cards, isLoading } = useCards()

  const grouped = useMemo(() => {
    if (!cards) return {} as Record<string, CardSummary[]>
    const lower = search.toLowerCase()
    const filtered = search
      ? cards.filter(
          (card) =>
            card.cardName.toLowerCase().includes(lower) ||
            card.bankName.toLowerCase().includes(lower),
        )
      : cards

    return filtered.reduce<Record<string, CardSummary[]>>((acc, card) => {
      if (!acc[card.bankName]) acc[card.bankName] = []
      acc[card.bankName].push(card)
      return acc
    }, {})
  }, [cards, search])

  const toggle = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((cardCode) => cardCode !== code))
      return
    }

    onChange([...selected, code])
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">持有卡片</label>
        <span className="text-xs text-muted-foreground">
          {isUpdating ? (
            <span className="animate-pulse">正在更新推薦卡片...</span>
          ) : (
            `已選 ${selected.length} 張`
          )}
        </span>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="搜尋卡名或銀行..."
          className="h-9 pl-8 text-sm"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="max-h-52 overflow-y-auto rounded-lg border text-xs">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">載入卡片中...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">找不到符合的卡片</div>
        ) : (
          Object.entries(grouped).map(([bank, bankCards]) => (
            <div key={bank} className="border-b last:border-b-0">
              <div className="sticky top-0 bg-muted/80 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur">
                {bank}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {bankCards.map((card) => (
                  <label
                    key={card.cardCode}
                    className={cn(
                      'flex min-h-touch-sm cursor-pointer items-start gap-2 px-3 py-2.5 transition-colors hover:bg-accent',
                      selected.includes(card.cardCode) && 'bg-primary/5',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 shrink-0 accent-primary"
                      checked={selected.includes(card.cardCode)}
                      onChange={() => toggle(card.cardCode)}
                    />
                    <span className="leading-snug">{card.cardName}</span>
                  </label>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

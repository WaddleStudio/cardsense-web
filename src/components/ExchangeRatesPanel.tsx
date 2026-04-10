import { useState } from 'react'
import { ChevronRight, Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ExchangeRatesBoard } from './exchange-rates/ExchangeRatesBoard'
import { ExchangeRatesControl } from './exchange-rates/ExchangeRatesControl'

interface Props {
  onChange: (customRates: Record<string, number>) => void
}

export function ExchangeRatesPanel({ onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ExchangeRatesControl onChange={onChange}>
      {({ rows, customRates, activeOverrideKeys, totalRowCount, isLoading, onValueChange }) => {
        if (isLoading || rows.length === 0) {
          return null
        }

        return (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full justify-between border-border bg-card px-4 py-3 text-left shadow-sm hover:bg-accent/40"
              >
                <span className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Exchange rate board</span>
                </span>
                <span className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{totalRowCount} rows</span>
                  <span>{activeOverrideKeys.size} overrides</span>
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Button>
            </DialogTrigger>

            <DialogContent
              className="!top-0 !left-auto !right-0 !h-dvh !max-h-dvh !w-[min(100vw,42rem)] !max-w-none !translate-x-0 !translate-y-0 !rounded-none !border-l !p-0"
              showCloseButton={false}
            >
              <div className="flex h-full flex-col">
                <DialogHeader className="border-b border-border px-4 py-4 !text-left sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <DialogTitle>Exchange rate board</DialogTitle>
                      <DialogDescription>
                        Adjust valuation assumptions for POINTS and MILES without leaving the recommendation flow.
                      </DialogDescription>
                    </div>
                    <DialogClose asChild>
                      <Button variant="ghost" size="icon" className="-mr-2 -mt-2 shrink-0">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close drawer</span>
                      </Button>
                    </DialogClose>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{totalRowCount} rows</span>
                    <span>|</span>
                    <span>{activeOverrideKeys.size} active overrides</span>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                  <ExchangeRatesBoard
                    rows={rows}
                    values={customRates}
                    activeOverrideKeys={activeOverrideKeys}
                    onValueChange={onValueChange}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      }}
    </ExchangeRatesControl>
  )
}

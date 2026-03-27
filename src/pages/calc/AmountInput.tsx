import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

const QUICK_AMOUNTS = [500, 1000, 3000, 5000]
const DIGIT_ROWS = [[7, 8, 9], [4, 5, 6], [1, 2, 3]]

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function AmountInput({ value, onChange, error }: AmountInputProps) {
  const numeric = value === '' ? 0 : parseInt(value, 10)
  const displayValue = numeric === 0 ? '0' : numeric.toLocaleString()

  const handleDigit = (digit: string) => {
    const current = value === '' ? '0' : value
    if (current === '0') {
      if (digit !== '0') onChange(digit)
    } else {
      const next = current + digit
      if (parseInt(next, 10) <= 100_000) onChange(next)
    }
  }

  const handleBackspace = () => onChange(value.slice(0, -1))
  const handleClear = () => onChange('')

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">消費金額</label>

      {/* Calculator body */}
      <div className="rounded-xl bg-zinc-800 p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">

        {/* LCD display */}
        <div className="rounded-lg bg-[#0b150b] border border-green-950 px-4 py-3 mb-3 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
          <p
            className="text-xs font-mono tracking-[0.25em] text-right mb-0.5"
            style={{ color: '#2d6a2d' }}
          >
            NT$
          </p>
          <p
            className="text-3xl font-mono font-semibold text-right tabular-nums leading-none"
            style={{ color: '#4ade80', textShadow: '0 0 10px #4ade8080, 0 0 20px #4ade8030' }}
          >
            {displayValue}
          </p>
          {error && (
            <p className="text-[10px] text-red-400 text-right mt-1 font-mono">{error}</p>
          )}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-1.5">
          {DIGIT_ROWS.flat().map((n) => (
            <CalcButton key={n} onClick={() => handleDigit(String(n))}>
              {n}
            </CalcButton>
          ))}
          {/* Bottom row */}
          <CalcButton variant="special" onClick={handleBackspace}>
            <Delete className="h-4 w-4 mx-auto" />
          </CalcButton>
          <CalcButton onClick={() => handleDigit('0')}>0</CalcButton>
          <CalcButton variant="clear" onClick={handleClear}>
            C
          </CalcButton>
        </div>

        {/* Quick presets */}
        <div className="grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-zinc-700">
          {QUICK_AMOUNTS.map((amt) => (
            <CalcButton key={amt} variant="preset" onClick={() => onChange(String(amt))}>
              {amt >= 1000 ? `${amt / 1000}K` : amt}
            </CalcButton>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Internal button component ──────────────────────────────────────────────

interface CalcButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'special' | 'clear' | 'preset'
}

function CalcButton({ children, onClick, variant = 'default' }: CalcButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-11 w-full rounded-lg text-sm font-semibold font-mono select-none',
        'border shadow-[0_2px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-px',
        'transition-all duration-75 cursor-pointer',
        variant === 'default' &&
          'bg-zinc-600 hover:bg-zinc-500 active:bg-zinc-700 border-zinc-500 text-zinc-100',
        variant === 'special' &&
          'bg-amber-700/80 hover:bg-amber-600/80 active:bg-amber-800/80 border-amber-600/60 text-amber-100',
        variant === 'clear' &&
          'bg-red-700/80 hover:bg-red-600/80 active:bg-red-800/80 border-red-600/60 text-red-100',
        variant === 'preset' &&
          'bg-indigo-700/70 hover:bg-indigo-600/70 active:bg-indigo-800/70 border-indigo-600/50 text-indigo-100 h-8 text-xs',
      )}
    >
      {children}
    </button>
  )
}

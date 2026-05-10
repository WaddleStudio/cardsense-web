import { useEffect, useState } from 'react'

const ANIMATION_DURATION = 800
const FRAME_INTERVAL = 20

function AnimatedCounter({ target }: { target: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const steps = ANIMATION_DURATION / FRAME_INTERVAL
    const step = Math.max(1, Math.ceil(target / steps))
    const timer = setInterval(() => {
      setCurrent((prev) => {
        const next = Math.min(prev + step, target)
        if (next >= target) clearInterval(timer)
        return next
      })
    }, FRAME_INTERVAL)
    return () => clearInterval(timer)
  }, [target])

  return <>{current.toLocaleString()}</>
}

interface RewardGapBoxProps {
  headlineDiff: number
}

export function RewardGapBox({ headlineDiff }: RewardGapBoxProps) {
  return (
    <div className="rounded-xl bg-zinc-800 p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-zinc-500">
            CardSense POS
          </p>
          <p className="text-xs text-zinc-400">本次刷卡回饋差距</p>
        </div>
        <div className="flex gap-1">
          {['bg-red-500', 'bg-yellow-500', 'bg-green-500'].map((color) => (
            <span key={color} className={`inline-block h-2 w-2 rounded-full ${color} opacity-70`} />
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-[#0b150b] border border-green-950 px-4 py-4 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
        <p
          className="mb-1 text-right text-xs font-mono tracking-[0.25em]"
          style={{ color: '#2d6a2d' }}
        >
          REWARD GAP
        </p>
        <p
          className="text-3xl sm:text-4xl font-mono font-semibold text-right tabular-nums leading-none"
          style={{
            color: '#4ade80',
            textShadow: '0 0 10px #4ade8080, 0 0 20px #4ade8030',
          }}
        >
          NT${' '}
          <AnimatedCounter key={headlineDiff} target={headlineDiff} />
        </p>
        <p className="mt-2 border-t border-green-950 pt-2 text-right text-[10px] font-mono uppercase tracking-[0.16em] text-green-900">
          PER TRANSACTION
        </p>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-zinc-700 pt-2">
        <ReceiptKey label="BEST" tone="reward" />
        <ReceiptKey label="DIFF" tone="primary" />
        <ReceiptKey label="CHECK" tone="muted" />
      </div>
    </div>
  )
}

function ReceiptKey({
  label,
  tone,
}: {
  label: string
  tone: 'reward' | 'primary' | 'muted'
}) {
  return (
    <div
      className={[
        'h-8 rounded-lg border text-center text-[10px] font-mono font-semibold leading-8 shadow-[0_2px_0_rgba(0,0,0,0.4)]',
        tone === 'reward' && 'border-green-700/60 bg-green-800/60 text-green-100',
        tone === 'primary' && 'border-indigo-600/50 bg-indigo-700/70 text-indigo-100',
        tone === 'muted' && 'border-zinc-500 bg-zinc-600 text-zinc-100',
      ].filter(Boolean).join(' ')}
    >
      {label}
    </div>
  )
}

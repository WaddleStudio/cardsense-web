import { useState, useEffect } from 'react'

const ANIMATION_DURATION = 800
const FRAME_INTERVAL = 20

function AnimatedCounter({ target }: { target: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    setCurrent(0)
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

interface AnnualLossBoxProps {
  annualLoss: number
  monthlyDiff: number
}

export function AnnualLossBox({ annualLoss, monthlyDiff }: AnnualLossBoxProps) {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg">
      {/* Top bezel */}
      <div className="bg-zinc-800 px-3 pt-2 pb-1 flex items-center justify-between">
        <span className="text-[9px] font-mono tracking-[0.3em] text-zinc-500 uppercase">
          CardSense Calc
        </span>
        <div className="flex gap-1">
          {['bg-red-500', 'bg-yellow-500', 'bg-green-500'].map((c) => (
            <span key={c} className={`inline-block h-2 w-2 rounded-full ${c} opacity-70`} />
          ))}
        </div>
      </div>

      {/* LCD Screen */}
      <div
        className="bg-[#071007] px-5 py-5"
        style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.7)' }}
      >
        <p
          className="text-[9px] font-mono tracking-[0.4em] uppercase mb-3 text-right"
          style={{ color: '#1a5c1a' }}
        >
          ANNUAL LOSS
        </p>

        {/* Main amount */}
        <p
          className="text-4xl font-mono font-bold text-right tabular-nums leading-none"
          style={{
            color: '#4ade80',
            textShadow: '0 0 12px #4ade8099, 0 0 28px #4ade8033',
          }}
        >
          NT${' '}
          <AnimatedCounter target={annualLoss} />
        </p>

        {/* Sub display */}
        <div
          className="mt-3 pt-3 flex items-center justify-between font-mono text-xs"
          style={{ borderTop: '1px solid #1a3a1a', color: '#2d7a2d' }}
        >
          <span style={{ color: '#1a4a1a' }}>×12</span>
          <span>
            NT${monthlyDiff.toLocaleString()}
            <span style={{ color: '#1a4a1a' }}> /月</span>
          </span>
        </div>
      </div>

      {/* Bottom bezel */}
      <div className="bg-zinc-800 px-3 py-1.5">
        <p className="text-[10px] font-mono text-zinc-500 text-center tracking-wide">
          假設每月消費相同 · 僅供估算參考
        </p>
      </div>
    </div>
  )
}

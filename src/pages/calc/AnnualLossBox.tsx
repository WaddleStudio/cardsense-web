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

  return <span className="tabular-nums">{current.toLocaleString()}</span>
}

interface AnnualLossBoxProps {
  annualLoss: number
  monthlyDiff: number
}

export function AnnualLossBox({ annualLoss, monthlyDiff }: AnnualLossBoxProps) {
  return (
    <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-4 text-center">
      <p className="text-xs font-medium text-muted-foreground mb-1">年度累計損失</p>
      <p className="text-3xl font-bold text-destructive">
        NT$ <AnimatedCounter target={annualLoss} />
      </p>
      <p className="text-xs text-muted-foreground mt-1.5">
        相當於每月少拿 NT${monthlyDiff.toLocaleString()} 回饋
      </p>
    </div>
  )
}

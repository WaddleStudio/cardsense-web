import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { RecommendationForm } from '@/components/RecommendationForm'
import { RecommendationResults } from '@/components/RecommendationResults'
import type { RecommendationResponse } from '@/types'

export function HomePage() {
  const location = useLocation()
  const prefillCard = (location.state as { prefillCard?: string } | null)?.prefillCard
  const [result, setResult] = useState<RecommendationResponse | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">信用卡推薦</h1>
        <p className="text-muted-foreground text-sm mt-1">
          先輸入商家或消費情境，找出最適合的信用卡
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="min-w-0">
          <RecommendationForm onResult={setResult} prefillCard={prefillCard} />
        </div>
        <div className="min-w-0">
          <RecommendationResults result={result} />
        </div>
      </div>
    </div>
  )
}

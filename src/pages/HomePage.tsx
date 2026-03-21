import { useState } from 'react'
import { RecommendationForm } from '@/components/RecommendationForm'
import { RecommendationResults } from '@/components/RecommendationResults'
import type { RecommendationResponse } from '@/types'

export function HomePage() {
  const [result, setResult] = useState<RecommendationResponse | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">信用卡推薦</h1>
        <p className="text-muted-foreground text-sm mt-1">
          輸入消費情境，找出最適合的信用卡
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <RecommendationForm onResult={setResult} />
        <RecommendationResults result={result} />
      </div>
    </div>
  )
}

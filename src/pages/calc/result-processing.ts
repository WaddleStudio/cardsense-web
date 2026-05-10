import type { CardRecommendation } from '@/types'

export interface CalcResult {
  ranked: CardRecommendation[]
  best: CardRecommendation
  worst: CardRecommendation
  singleDiff: number
  headlineDiff: number
}

export function processResult(recommendations: CardRecommendation[]): CalcResult | null {
  if (recommendations.length < 2) return null
  const ranked = [...recommendations].sort((a, b) => b.estimatedReturn - a.estimatedReturn)
  const best = ranked[0]
  const worst = ranked[ranked.length - 1]
  const singleDiff = best.estimatedReturn - worst.estimatedReturn
  return { ranked, best, worst, singleDiff, headlineDiff: singleDiff }
}

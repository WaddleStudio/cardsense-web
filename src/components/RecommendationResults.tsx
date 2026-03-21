import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react'
import type { CardRecommendation, RecommendationResponse } from '@/types'

interface Props {
  result: RecommendationResponse | null
}

export function RecommendationResults({ result }: Props) {
  if (!result) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-sm text-muted-foreground">
        填寫左側表單後，推薦結果將顯示在此
      </div>
    )
  }

  const { recommendations, comparison, disclaimer } = result

  if (recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-sm text-muted-foreground">
        沒有找到符合條件的推薦
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>評估 {comparison.evaluatedPromotionCount} 個優惠</span>
        <span>符合 {comparison.eligiblePromotionCount} 個</span>
        <span>排名 {comparison.rankedCardCount} 張卡</span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={rec.cardCode ?? i} rec={rec} rank={i + 1} />
        ))}
      </div>

      {comparison.notes.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          {comparison.notes.map((note, i) => (
            <p key={i}>{note}</p>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground pt-2">{disclaimer}</p>
    </div>
  )
}

function RecommendationCard({ rec, rank }: { rec: CardRecommendation; rank: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {rank === 1 ? <Trophy className="h-4 w-4" /> : rank}
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{rec.cardName}</CardTitle>
              <p className="text-xs text-muted-foreground">{rec.bankName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-primary">
              {rec.cashbackType === 'PERCENT'
                ? `${rec.cashbackValue}%`
                : `NT$ ${rec.estimatedReturn}`}
            </p>
            <p className="text-xs text-muted-foreground">
              預估回饋 NT$ {rec.estimatedReturn}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{rec.reason}</p>

        <div className="flex flex-wrap gap-1.5">
          {rec.conditions.map((c, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {c.label}
            </Badge>
          ))}
          {rec.validUntil && (
            <Badge variant="secondary" className="text-xs">
              有效至 {rec.validUntil}
            </Badge>
          )}
        </div>

        {rec.promotionBreakdown.length > 0 && (
          <>
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  收起優惠明細
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  展開 {rec.promotionBreakdown.length} 個優惠明細
                </>
              )}
            </Button>

            {expanded && (
              <div className="space-y-2 pt-1">
                {rec.promotionBreakdown.map((promo) => (
                  <div
                    key={promo.promoVersionId}
                    className="rounded-md bg-muted/50 p-3 text-xs space-y-1"
                  >
                    <div className="flex justify-between font-medium">
                      <span>{promo.title ?? promo.promotionId}</span>
                      <span className="text-primary">
                        {promo.cashbackType === 'PERCENT'
                          ? `${promo.cashbackValue}%`
                          : `NT$ ${promo.cappedReturn}`}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{promo.reason}</p>
                    {promo.conditions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {promo.conditions.map((c, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {c.label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {rec.applyUrl && (
          <a
            href={rec.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-primary hover:underline"
          >
            前往申辦
          </a>
        )}
      </CardContent>
    </Card>
  )
}

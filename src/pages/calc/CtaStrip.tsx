import { ArrowRight, LayoutGrid } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { Category } from '@/types'

interface CtaStripProps {
  amount: number
  category: Category | null
}

export function CtaStrip({ amount, category }: CtaStripProps) {
  const navigate = useNavigate()
  const recommendParams = new URLSearchParams({ amount: String(amount) })
  if (category) {
    recommendParams.set('category', category)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        className="flex-1 gap-2"
        onClick={() => navigate(`/recommend?${recommendParams.toString()}`)}
      >
        查看完整推薦細節
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="flex-1 gap-2"
        onClick={() => navigate('/cards')}
      >
        <LayoutGrid className="h-4 w-4" />
        瀏覽 100 張信用卡
      </Button>
    </div>
  )
}

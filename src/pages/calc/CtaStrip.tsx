import { LayoutGrid } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function CtaStrip() {
  const navigate = useNavigate()

  return (
    <div className="flex">
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => navigate('/cards')}
      >
        <LayoutGrid className="h-4 w-4" />
        瀏覽 100 張信用卡
      </Button>
    </div>
  )
}

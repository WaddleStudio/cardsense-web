import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ShareImageData {
  annualLoss: number
  bestCardName: string
  worstCardName: string
  category: string
  amount: number
}

function fitCanvasLabel(label: string, maxLength = 28) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label
}

function generateShareCanvas(data: ShareImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  const ctx = canvas.getContext('2d')!

  const bestLabel = fitCanvasLabel(data.bestCardName)
  const worstLabel = fitCanvasLabel(data.worstCardName)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 1200, 630)

  ctx.fillStyle = '#1e3a5f'
  ctx.fillRect(0, 0, 1200, 90)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif'
  ctx.fillText('CardSense', 60, 58)

  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = '22px system-ui, -apple-system, sans-serif'
  ctx.fillText('信用卡回饋比較', 240, 58)

  ctx.fillStyle = '#111827'
  ctx.font = 'bold 52px system-ui, -apple-system, sans-serif'
  ctx.fillText('刷錯卡，一年可能差很多', 60, 185)

  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(60, 205, 400, 3)

  ctx.fillStyle = '#6b7280'
  ctx.font = '26px system-ui, -apple-system, sans-serif'
  ctx.fillText('估算一年少拿回饋', 60, 260)

  ctx.fillStyle = '#dc2626'
  ctx.font = 'bold 88px system-ui, -apple-system, monospace'
  ctx.fillText(`NT$ ${data.annualLoss.toLocaleString()}`, 60, 370)

  ctx.fillStyle = '#374151'
  ctx.font = '26px system-ui, -apple-system, sans-serif'
  ctx.fillText(
    `類別：${data.category}，單筆消費 NT$ ${data.amount.toLocaleString()}`,
    60,
    435,
  )

  ctx.fillStyle = '#16a34a'
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
  ctx.fillText(`最佳：${bestLabel}`, 60, 490)

  ctx.fillStyle = '#dc2626'
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
  ctx.fillText(`最差：${worstLabel}`, 60, 525)

  ctx.fillStyle = '#2563eb'
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
  ctx.fillText('立即試算你的回饋差距：cardsense-web.vercel.app/calc', 60, 590)

  ctx.fillStyle = '#fef2f2'
  ctx.beginPath()
  ctx.arc(1050, 350, 200, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#dc2626'
  ctx.font = 'bold 44px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('刷卡回饋', 1050, 320)
  ctx.fillText('差很大', 1050, 380)
  ctx.textAlign = 'left'

  return canvas
}

export function ShareButton({
  annualLoss,
  bestCardName,
  worstCardName,
  category,
  amount,
}: ShareImageData) {
  const [state, setState] = useState<'idle' | 'copied'>('idle')

  const handleShare = async () => {
    const canvas = generateShareCanvas({ annualLoss, bestCardName, worstCardName, category, amount })
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/png'),
    )
    const file = new File([blob], 'cardsense-result.png', { type: 'image/png' })
    const shareUrl = 'https://cardsense-web.vercel.app/calc'

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: '刷卡回饋差距試算',
          text: `選對卡一年可能多拿 NT$${annualLoss.toLocaleString()} 回饋，來試算看看。`,
          files: [file],
          url: shareUrl,
        })
        return
      } catch {
        // user cancelled or not supported
      }
    }

    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'cardsense-result.png'
    a.click()
    URL.revokeObjectURL(a.href)

    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      // clipboard not available
    }
    setState('copied')
    setTimeout(() => setState('idle'), 2500)
  }

  return (
    <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
      {state === 'copied' ? (
        <>
          <Check className="h-4 w-4 text-reward" />
          已下載分享圖並複製連結
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          分享這次試算
        </>
      )}
    </Button>
  )
}

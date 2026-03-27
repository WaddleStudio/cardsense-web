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

function generateShareCanvas(data: ShareImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  const ctx = canvas.getContext('2d')!

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 1200, 630)

  // Top bar
  ctx.fillStyle = '#1e3a5f'
  ctx.fillRect(0, 0, 1200, 90)

  // Logo
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif'
  ctx.fillText('CardSense', 60, 58)

  // Subtitle in bar
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = '22px system-ui, -apple-system, sans-serif'
  ctx.fillText('信用卡回饋計算機', 240, 58)

  // Main title
  ctx.fillStyle = '#111827'
  ctx.font = 'bold 52px system-ui, -apple-system, sans-serif'
  ctx.fillText('刷錯卡，你每年虧了多少？', 60, 185)

  // Divider
  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(60, 205, 400, 3)

  // Loss label
  ctx.fillStyle = '#6b7280'
  ctx.font = '26px system-ui, -apple-system, sans-serif'
  ctx.fillText('年度損失金額', 60, 260)

  // Loss amount (large red)
  ctx.fillStyle = '#dc2626'
  ctx.font = 'bold 88px system-ui, -apple-system, monospace'
  ctx.fillText(`NT$ ${data.annualLoss.toLocaleString()}`, 60, 370)

  // Details row
  ctx.fillStyle = '#374151'
  ctx.font = '26px system-ui, -apple-system, sans-serif'
  ctx.fillText(
    `類別：${data.category}　每月消費：NT$ ${data.amount.toLocaleString()}`,
    60,
    435,
  )

  // Card comparison
  ctx.fillStyle = '#16a34a'
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
  ctx.fillText(`最佳：${data.bestCardName}`, 60, 490)

  ctx.fillStyle = '#dc2626'
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
  ctx.fillText(`最差：${data.worstCardName}`, 60, 525)

  // CTA
  ctx.fillStyle = '#2563eb'
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
  ctx.fillText('算算你的損失 → cardsense-web.vercel.app/calc', 60, 590)

  // Right side decoration
  ctx.fillStyle = '#fef2f2'
  ctx.beginPath()
  ctx.arc(1050, 350, 200, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#dc2626'
  ctx.font = 'bold 44px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('刷錯卡', 1050, 320)
  ctx.fillText('虧多少？', 1050, 380)
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
          title: '刷錯卡虧多少？',
          text: `我每年因為刷錯卡少了 NT$${annualLoss.toLocaleString()} 😱 快來算算你的損失！`,
          files: [file],
          url: shareUrl,
        })
        return
      } catch {
        // user cancelled or not supported — fall through to desktop flow
      }
    }

    // Desktop fallback: download image + copy link
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
          已下載圖片並複製連結！
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          分享我的結果
        </>
      )}
    </Button>
  )
}

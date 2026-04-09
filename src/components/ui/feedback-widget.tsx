import React, { useState } from "react"
import { Button } from "./button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"
import { Label } from "./label"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { Textarea } from "./textarea"
import { Input } from "./input"
import { MessageSquare, Bug, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react"

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [feedbackType, setFeedbackType] = useState("BUG")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
      console.log('MODE =', import.meta.env.MODE)
      console.log('ENV =', import.meta.env)
      console.log('VITE_SUPABASE_URL =', import.meta.env.VITE_SUPABASE_URL)
      console.log('VITE_SUPABASE_ANON_KEY exists =', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
      let screenshotUrl = null

      if (SUPABASE_URL && SUPABASE_ANON_KEY && image) {
        // 1. Upload Image to Supabase Storage Bucket
        const fileExt = image.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`
        
        const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/feedback-images/${fileName}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': image.type
          },
          body: image
        })

        if (uploadRes.ok) {
          screenshotUrl = `${SUPABASE_URL}/storage/v1/object/public/feedback-images/${fileName}`
        } else {
          console.error("Image upload failed", await uploadRes.text())
        }
      }

      // Auto capture context
      const payload = {
        type: feedbackType,
        description,
        context: {
          url: window.location.href,
          pathname: window.location.pathname,
          search: window.location.search,
          userAgent: navigator.userAgent,
          screenWidth: window.innerWidth,
          timestamp: new Date().toISOString(),
          screenshot_url: screenshotUrl
        }
      }

      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        // Real submission to Supabase
        await fetch(`${SUPABASE_URL}/rest/v1/feedbacks`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        })
      } else {
        // Fallback or dev mode logging if env variables are missing
        console.warn("⚠️ VITE_SUPABASE_URL is missing. Printing payload only:", payload)
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setDescription("")
        setImage(null)
      }, 2000)
    } catch (err) {
      console.error("Failed to submit feedback", err)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="icon" 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 overflow-hidden group hover:w-32 transition-all duration-300 ease-in-out px-0 data-[state=open]:hidden"
          title="提供回饋"
        >
          <div className="flex h-full w-full items-center justify-center">
             <MessageSquare className="h-6 w-6 absolute shrink-0 group-hover:-translate-x-10 transition-transform duration-300 text-white" />
             <span className="absolute translate-x-10 opacity-0 group-hover:translate-x-3 group-hover:opacity-100 font-medium transition-all duration-300 whitespace-nowrap text-white">
               提供回饋
             </span>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        {success ? (
          <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <DialogTitle>感謝您的回饋！</DialogTitle>
            <DialogDescription>
              您的意見是我們進步的動力，我們已收到您的回報。
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>協助我們變得更好 💡</DialogTitle>
              <DialogDescription>
                請選擇您想回報的類型，我們會在背景自動附上您的當前網址來協助排查問題。
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="grid gap-6 py-4">
              <div className="grid gap-3">
                <Label>回報類型</Label>
                <RadioGroup value={feedbackType} onValueChange={setFeedbackType} className="grid grid-cols-2 gap-4">
                  <div>
                    <RadioGroupItem value="BUG" id="bug" className="peer sr-only" />
                    <Label
                      htmlFor="bug"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Bug className="mb-2 h-6 w-6" />
                      遇到錯誤
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="INCORRECT_DATA" id="incorrect" className="peer sr-only" />
                    <Label
                      htmlFor="incorrect"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <MessageSquare className="mb-2 h-6 w-6" />
                      資料有誤
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="FEATURE_REQUEST" id="feature" className="peer sr-only" />
                    <Label
                      htmlFor="feature"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="mb-2 text-2xl block leading-tight">💡</span>
                      功能許願
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="OTHER" id="other" className="peer sr-only" />
                    <Label
                      htmlFor="other"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="mb-2 text-2xl block leading-tight">💖</span>
                      其他建議
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="description">詳細描述</Label>
                <Textarea
                  id="description"
                  placeholder="請稍微描述一下您遇到什麼問題或是任何建議..."
                  className="min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="screenshot" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> 
                  附上截圖 (選填)
                </Label>
                <Input 
                  id="screenshot" 
                  type="file" 
                  accept="image/*" 
                  className="cursor-pointer"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </div>

              <Button type="submit" className="w-full mt-4" disabled={loading || !description.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                送出回饋
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { CardsPage } from '@/pages/CardsPage'
import { CardDetailPage } from '@/pages/CardDetailPage'
import { CalcPage } from '@/pages/CalcPage'
import { FeedbackWidget } from '@/components/ui/feedback-widget'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<CalcPage />} />
            <Route path="calc" element={<CalcPage />} />
            <Route path="recommend" element={<HomePage />} />
            <Route path="cards" element={<CardsPage />} />
            <Route path="cards/:cardCode" element={<CardDetailPage />} />
          </Route>
        </Routes>
        <FeedbackWidget />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

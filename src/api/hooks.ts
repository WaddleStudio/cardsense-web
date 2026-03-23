import { useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { get, post } from './client'
import type {
  BankSummary,
  CardSummary,
  HealthResponse,
  RecommendationRequest,
  RecommendationResponse,
} from '@/types'

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => get<HealthResponse>('/health'),
    retry: 1,
    refetchInterval: 30_000,
  })
}

export function useBanks() {
  return useQuery({
    queryKey: ['banks'],
    queryFn: () => get<BankSummary[]>('/v1/banks'),
  })
}

export function useCards(params?: { bank?: string; scope?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.bank) searchParams.set('bank', params.bank)
  if (params?.scope) searchParams.set('scope', params.scope)
  const qs = searchParams.toString()

  return useQuery({
    queryKey: ['cards', params],
    queryFn: () => get<CardSummary[]>(`/v1/cards${qs ? `?${qs}` : ''}`),
  })
}

export function useCard(cardCode: string) {
  const { data: cards, isLoading, error, refetch } = useCards()
  const card = useMemo(
    () => cards?.find((c) => c.cardCode === cardCode) ?? null,
    [cards, cardCode],
  )
  return { data: card, isLoading, error, refetch }
}

export function useRecommendation() {
  return useMutation({
    mutationFn: (req: RecommendationRequest) =>
      post<RecommendationResponse>('/v1/recommendations/card', req),
  })
}

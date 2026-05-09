export type DecisionReadinessState = 'ready' | 'needs-merchant' | 'needs-wallet' | 'needs-amount'

export interface DecisionReadinessInput {
  hasMerchantScenario: boolean
  selectedCardCount: number
  amount: number
}

export interface DecisionReadinessStep {
  key: 'merchant' | 'wallet' | 'amount'
  label: string
  complete: boolean
  detail: string
}

export interface DecisionReadinessSummary {
  state: DecisionReadinessState
  title: string
  detail: string
  steps: DecisionReadinessStep[]
}

export function buildDecisionReadinessSummary({
  hasMerchantScenario,
  selectedCardCount,
  amount,
}: DecisionReadinessInput): DecisionReadinessSummary {
  const hasEnoughCards = selectedCardCount >= 2
  const hasValidAmount = amount >= 100 && amount <= 100_000
  const steps: DecisionReadinessStep[] = [
    {
      key: 'merchant',
      label: '消費場景',
      complete: hasMerchantScenario,
      detail: hasMerchantScenario ? '已指定商家或場景' : '先選商家，找不到時可用分類',
    },
    {
      key: 'wallet',
      label: '我的卡包',
      complete: hasEnoughCards,
      detail: hasEnoughCards
        ? `只比較已選的 ${selectedCardCount} 張卡`
        : `再選 ${2 - selectedCardCount} 張卡開始比較`,
    },
    {
      key: 'amount',
      label: '消費金額',
      complete: hasValidAmount,
      detail: hasValidAmount ? `NT$${amount.toLocaleString()}` : '請輸入 NT$100 至 NT$100,000',
    },
  ]

  if (!hasMerchantScenario) {
    return {
      state: 'needs-merchant',
      title: '先指定這筆消費在哪裡發生',
      detail: 'CardSense 會用商家、付款方式與你的卡包，判斷這筆交易該刷哪張卡。',
      steps,
    }
  }

  if (!hasEnoughCards) {
    return {
      state: 'needs-wallet',
      title: '把要比較的卡放進我的卡包',
      detail: '至少選 2 張卡，結果才會是「我的卡包裡哪張最優惠」的比較。',
      steps,
    }
  }

  if (!hasValidAmount) {
    return {
      state: 'needs-amount',
      title: '補上這筆消費金額',
      detail: '金額會影響回饋、上限與最佳卡排序。',
      steps,
    }
  }

  return {
    state: 'ready',
    title: '可以比較我的卡包了',
    detail: `這次會只比較已選的 ${selectedCardCount} 張卡，找出此商家與付款方式下的最高回饋。`,
    steps,
  }
}

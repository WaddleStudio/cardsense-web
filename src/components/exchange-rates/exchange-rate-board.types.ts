export interface ExchangeRateBoardRow {
  key: string
  type: string
  bank: string
  unit: string
  value: number
  note: string | null
  label: string
  sectionOrder: number
  rowOrder: number
}

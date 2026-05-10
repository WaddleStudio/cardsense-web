import { Calculator, LayoutGrid, type LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '刷卡決策', icon: Calculator },
  { to: '/cards', label: '卡片目錄', icon: LayoutGrid },
]

import { Link, Outlet, useLocation } from 'react-router-dom'
import { Calculator, CreditCard, LayoutGrid, Sparkles, Sun, Moon, Wifi, WifiOff } from 'lucide-react'
import { useHealth } from '@/api'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: '計算機', icon: Calculator },
  { to: '/recommend', label: '推薦', icon: Sparkles },
  { to: '/cards', label: '卡片目錄', icon: LayoutGrid },
] as const

export function Layout() {
  const location = useLocation()
  const { data: health } = useHealth()
  const { isDark, toggle: toggleDark } = useDarkMode()
  const isUp = health?.status === 'UP'

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 font-semibold text-base tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <CreditCard className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>
              Card<span className="text-primary">Sense</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Nav */}
            <nav className="flex items-center gap-0.5 mr-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-label={label}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 cursor-pointer"
              onClick={toggleDark}
              aria-label={isDark ? '切換至淺色模式' : '切換至深色模式'}
            >
              {isDark
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />}
            </Button>

            {/* API status */}
            <div
              className={cn(
                'ml-1 hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                isUp
                  ? 'bg-reward-bg text-reward border border-reward-border'
                  : 'bg-destructive/10 text-destructive border border-destructive/20',
              )}
              title={isUp ? 'API 連線正常' : 'API 離線'}
            >
              {isUp
                ? <Wifi className="h-3 w-3" />
                : <WifiOff className="h-3 w-3" />}
              <span>{isUp ? '連線中' : '離線'}</span>
            </div>

            {/* Mobile API status dot */}
            <span
              className={cn(
                'sm:hidden inline-block h-2 w-2 rounded-full ml-1',
                isUp ? 'bg-reward' : 'bg-destructive',
              )}
              aria-label={isUp ? 'API 連線中' : 'API 離線'}
            />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      <footer className="border-t py-5 text-center text-xs text-muted-foreground">
        <p>CardSense — 情境式信用卡回饋推薦平台</p>
        <p className="mt-0.5 opacity-60">資料僅供參考，實際回饋依各銀行規定為準</p>
        <p className="mt-2 opacity-50">Made by WaddleStudio</p>
      </footer>
    </div>
  )
}

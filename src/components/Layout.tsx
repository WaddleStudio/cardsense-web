import { Link, Outlet, useLocation } from 'react-router-dom'
import { CreditCard, Home, Activity, Sun, Moon } from 'lucide-react'
import { useHealth } from '@/api'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: '推薦', icon: Home },
  { to: '/cards', label: '卡片目錄', icon: CreditCard },
] as const

export function Layout() {
  const location = useLocation()
  const { data: health } = useHealth()
  const { isDark, toggle: toggleDark } = useDarkMode()
  const isUp = health?.status === 'UP'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            CardSense
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2 sm:px-3 py-1.5 text-sm transition-colors',
                  location.pathname === to
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}

            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-8 w-8 p-0"
              onClick={toggleDark}
              aria-label={isDark ? '切換至淺色模式' : '切換至深色模式'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <div className="ml-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-3 w-3 hidden sm:block" />
              <span
                className={cn(
                  'inline-block h-2 w-2 rounded-full',
                  isUp ? 'bg-green-500' : 'bg-red-500',
                )}
              />
              <span className="hidden sm:inline">{isUp ? 'API 連線中' : 'API 離線'}</span>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Outlet />
        </div>
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        CardSense — 情境式信用卡推薦平台
      </footer>
    </div>
  )
}

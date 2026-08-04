import { Outlet, Link, useLocation } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CONFIG_SCREENS } from '@/lib/configuracoes-config'
import { Cog, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ConfiguracoesLayout() {
  const location = useLocation()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Cog className="w-5 h-5 text-[#005B2E]" />
          <h1 className="text-2xl font-black text-foreground">Configurações</h1>
        </div>
        <Link to="/admin">
          <Button variant="outline" className="border-[#005B2E] text-[#005B2E] font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="lg:w-64 shrink-0 border-2 border-[#005B2E]/20 h-fit">
          <CardContent className="p-2 space-y-0.5">
            {CONFIG_SCREENS.map((screen) => {
              const isActive = location.pathname === screen.path
              return (
                <Link
                  key={screen.key}
                  to={screen.path}
                  className={cn(
                    'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#005B2E] text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#005B2E]',
                  )}
                >
                  {screen.label}
                </Link>
              )
            })}
          </CardContent>
        </Card>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

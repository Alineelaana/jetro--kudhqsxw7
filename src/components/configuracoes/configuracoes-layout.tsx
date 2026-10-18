import { Outlet, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Cog, ArrowLeft } from 'lucide-react'

export function ConfiguracoesLayout() {
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
      <div className="w-full min-w-0">
        <Outlet />
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  ExternalLink,
  Calendar,
  HeartPulse,
  HardHat,
  GraduationCap,
  FileSpreadsheet,
  Clock,
  UserPlus,
  UserMinus,
  Sparkles,
} from 'lucide-react'

export interface QuickEmployeeLinksProps {
  employeeId?: string
  employeeName?: string
  variant?: 'outline' | 'ghost' | 'default'
  size?: 'default' | 'sm' | 'icon'
  className?: string
}

export function QuickEmployeeLinks({
  employeeId,
  employeeName,
  variant = 'outline',
  size = 'sm',
  className = '',
}: QuickEmployeeLinksProps) {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`h-7 px-2 text-xs gap-1 border-blue-600/30 text-blue-700 hover:bg-blue-50 ${className}`}
          title="Navegação rápida contextual (DP / RH / SST)"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Acessar</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 text-xs">
        <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground truncate">
          {employeeName ? `Colaborador: ${employeeName}` : 'Integração Intermódulos'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => navigate('/admin/dp/ferias-afastamentos')}
          className="cursor-pointer gap-2"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>Férias e Afastamentos</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/admin/dp/jornada-ponto')}
          className="cursor-pointer gap-2"
        >
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Jornada e Ponto</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/admin/dp/folha-beneficios')}
          className="cursor-pointer gap-2"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Folha e Benefícios</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => navigate('/admin/sst/saude-ocupacional')}
          className="cursor-pointer gap-2"
        >
          <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
          <span>ASO e Exames (SST)</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/admin/sst/epis-treinamentos')}
          className="cursor-pointer gap-2"
        >
          <HardHat className="w-3.5 h-3.5 text-amber-600" />
          <span>EPIs e Ficha de Entrega</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate('/admin/sst/epis-treinamentos')}
          className="cursor-pointer gap-2"
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
          <span>Treinamentos e NRs</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => navigate('/admin/rh/jornada-colaborador')}
          className="cursor-pointer gap-2"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#005B2E]" />
          <span>Onboarding / Offboarding (RH)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

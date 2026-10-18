import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  Settings,
  GraduationCap,
  MessageSquare,
  History,
  Sparkles,
  Sliders,
  BarChart3,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const JETRO_ONLINE_MENU_ITEMS = [
  {
    path: '/admin/configuracoes/jetro-online',
    end: true,
    label: 'Configurações Gerais',
    icon: Settings,
    description: 'Textos, saudações, cores e comportamento',
  },
  {
    path: '/admin/configuracoes/jetro-online/universidade',
    label: 'Universidade Jetro',
    icon: GraduationCap,
    description: 'Biblioteca e cadastro de vídeos de treinamento',
  },
  {
    path: '/admin/configuracoes/jetro-online/perguntas',
    label: 'Perguntas dos Usuários',
    icon: MessageSquare,
    description: 'Registro auditado de dúvidas e acurácia',
  },
  {
    path: '/admin/configuracoes/jetro-online/historico',
    label: 'Histórico de Conversas',
    icon: History,
    description: 'Auditoria de atendimentos e privacidade LGPD',
  },
  {
    path: '/admin/configuracoes/jetro-online/sugestoes',
    label: 'Sugestões Inteligentes',
    icon: Sparkles,
    description: 'Cards e pills de perguntas recomendadas',
  },
  {
    path: '/admin/configuracoes/jetro-online/recursos',
    label: 'Recursos do Assistente',
    icon: Sliders,
    description: 'Ativação de botões, anexos e IA',
  },
  {
    path: '/admin/configuracoes/jetro-online/tours',
    label: 'Tours Guiados',
    icon: MapPin,
    description: 'Tutoriais interativos por módulo e tela',
  },
  {
    path: '/admin/configuracoes/jetro-online/relatorios',
    label: 'Relatórios de Utilização',
    icon: BarChart3,
    description: 'Métricas e indicadores com dados reais',
  },
]

export function JetroOnlineLayout() {
  const { pathname } = useLocation()

  return (
    <div className="space-y-6">
      {/* Cabeçalho Oficial da Central */}
      <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#005B2E]">
            <div className="h-8 w-8 rounded-lg bg-[#005B2E] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-[#C9A227]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Central de Configurações do Jetro On-line
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Gestão operacional, treinamento via Universidade Jetro, auditoria e personalização do
            assistente interno do ERP.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-[#005B2E] px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#005B2E]" />
          <span className="font-semibold">Ambiente Auditado & Restrito (Admin/SUP)</span>
        </div>
      </div>

      {/* Estrutura: Submenus na lateral esquerda ou barra horizontal no topo responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Barra Lateral da Central (Submenus dedicados sem duplicar botões dentro das páginas) */}
        <aside className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-3 shadow-2xs space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Módulos de Configuração
          </div>
          <nav className="space-y-1">
            {JETRO_ONLINE_MENU_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = item.end ? pathname === item.path : pathname.startsWith(item.path)

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive: active }) =>
                    cn(
                      'flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-colors group',
                      active
                        ? 'bg-[#005B2E] text-white font-semibold shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    )
                  }
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 mt-0.5 shrink-0 transition-colors',
                      isActive ? 'text-[#C9A227]' : 'text-gray-400 group-hover:text-gray-700',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="leading-tight">{item.label}</p>
                    <p
                      className={cn(
                        'text-[10px] mt-0.5 leading-snug truncate',
                        isActive ? 'text-emerald-100' : 'text-gray-400',
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                </NavLink>
              )
            })}
          </nav>
        </aside>

        {/* Área Principal de Conteúdo */}
        <main className="lg:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

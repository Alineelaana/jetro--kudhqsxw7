import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PackageCheck,
  ArrowDownToDot,
  ListOrdered,
  Truck,
  ScanBarcode,
  ArrowLeftRight,
  Clock,
  History,
  AlertTriangle,
  Play,
  StopCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CollectorShellLayout } from './collector-shell-layout'
import { useAuth } from '@/custom_hooks/useAuth'
import {
  getOpenShiftForOperator,
  getLocalActiveShift,
  getOfflineQueue,
} from '@/services/collector'
import type { CollectorShift } from '@/types/collector'

export const CollectorHubScreen: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeShift, setActiveShift] = useState<CollectorShift | null>(
    getLocalActiveShift(),
  )
  const [offlineCount, setOfflineCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const load = async () => {
      if (user?.id) {
        const shift = await getOpenShiftForOperator(user.id)
        setActiveShift(shift)
      }
      setOfflineCount(getOfflineQueue().length)
      setIsLoading(false)
    }
    load()
  }, [user])

  const menuItems = [
    {
      title: 'Recebimento',
      desc: 'Conferência de NF-e, romaneio e entrada de carga',
      icon: PackageCheck,
      route: '/admin/coletor/recebimento',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      activeColor: 'hover:border-emerald-500 hover:bg-emerald-500/20',
    },
    {
      title: 'Putaway / Endereçamento',
      desc: 'Armazenamento guiado e confirmação de posição física',
      icon: ArrowDownToDot,
      route: '/admin/coletor/enderecamento',
      color: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      activeColor: 'hover:border-teal-500 hover:bg-teal-500/20',
    },
    {
      title: 'Separação de Pedidos',
      desc: 'Separação guiada por endereço e regras FEFO',
      icon: ListOrdered,
      route: '/admin/coletor/separacao',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      activeColor: 'hover:border-blue-500 hover:bg-blue-500/20',
    },
    {
      title: 'Conferência de Expedição',
      desc: 'Validação de volumes e expedição para romaneio',
      icon: Truck,
      route: '/admin/coletor/conferencia',
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      activeColor: 'hover:border-indigo-500 hover:bg-indigo-500/20',
    },
    {
      title: 'Inventário Cego',
      desc: '1ª e 2ª contagem física sem visão de saldo prévio',
      icon: ScanBarcode,
      route: '/admin/coletor/inventario',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      activeColor: 'hover:border-amber-500 hover:bg-amber-500/20',
    },
    {
      title: 'Transferência de Endereço',
      desc: 'Movimentação rápida entre posições do armazém',
      icon: ArrowLeftRight,
      route: '/admin/coletor/transferencia',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      activeColor: 'hover:border-purple-500 hover:bg-purple-500/20',
    },
  ]

  return (
    <CollectorShellLayout
      title="HURAM Coletor"
      subtitle="Terminal de Operações de Armazém e WMS"
      backRoute="/admin/estoque/wms"
    >
      {/* Alerta de Turno não aberto */}
      {!isLoading && !activeShift && (
        <Card className="mb-4 bg-amber-950/40 border-amber-600/50 text-amber-200">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Turno não iniciado</h4>
                <p className="text-xs text-amber-300/80">
                  É necessário abrir o turno para validar operações no armazém.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/admin/coletor/turno')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0"
            >
              <Play className="h-4 w-4" />
              Abrir Turno
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grid de Operações do Coletor - Cartões Grandes Otimizados para Toque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => navigate(item.route)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-150 flex items-start gap-4 active:scale-[0.98] ${item.color} ${item.activeColor} bg-slate-900/80`}
            >
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0">
                <Icon className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-slate-100 flex items-center justify-between">
                  <span>{item.title}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Seção Inferior: Ações do Turno e Histórico */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/coletor/turno')}
          className="h-14 bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 justify-start px-4 text-sm font-semibold rounded-xl flex items-center gap-3"
        >
          {activeShift ? (
            <>
              <StopCircle className="h-5 w-5 text-red-400" />
              <div className="text-left">
                <div>Fechar / Gerenciar Turno</div>
                <div className="text-[11px] text-slate-400 font-normal">
                  Iniciado em{' '}
                  {new Date(activeShift.data_inicio).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 text-emerald-400" />
              <div className="text-left">
                <div>Abrir Turno de Trabalho</div>
                <div className="text-[11px] text-slate-400 font-normal">
                  Dispositivo e operador
                </div>
              </div>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/admin/coletor/operacoes')}
          className="h-14 bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 justify-start px-4 text-sm font-semibold rounded-xl flex items-center gap-3"
        >
          <History className="h-5 w-5 text-cyan-400" />
          <div className="text-left">
            <div>Consultar Operações Realizadas</div>
            <div className="text-[11px] text-slate-400 font-normal">
              {offlineCount > 0
                ? `${offlineCount} registro(s) pendente(s) no aparelho`
                : 'Trilha de auditoria e divergências'}
            </div>
          </div>
        </Button>
      </div>
    </CollectorHubScreenInner>
  )
}

const CollectorHubScreenInner: React.FC<React.ComponentProps<typeof CollectorShellLayout>> = (
  props,
) => <CollectorShellLayout {...props} />

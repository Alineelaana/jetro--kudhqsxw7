import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  chamadosService,
  type Chamado,
  type ChamadoStatus,
  type ChamadoPrioridade,
  STATUS_LABELS,
  PRIORIDADE_LABELS,
} from '@/services/chamados'
import { JetroTable } from '@/components/jetro-table/jetro-table'
import type { JetroColumnDef } from '@/components/jetro-table/types'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Filter,
  Eye,
  RefreshCw,
  Search,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type QuickFilter = 'todos' | 'meus' | 'responsabilidade' | 'aprovacao' | 'finalizados'

export default function MeusChamadosScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [chamados, setChamados] = useState<Chamado[]>([])
  const [loading, setLoading] = useState(true)
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('todos')

  // Filtros avançados
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todos')
  const [filtroComAnexos, setFiltroComAnexos] = useState<boolean>(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await chamadosService.listarMeusChamados({
        perPage: 100,
        sort: '-created',
      })
      setChamados(res.items)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar chamados',
        description: err.message || 'Falha ao buscar chamados cadastrados.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtragem local baseada nos filtros rápidos e detalhados
  const filteredData = useMemo(() => {
    return chamados.filter((ch) => {
      // 1. Filtro rápido
      if (quickFilter === 'meus' && ch.solicitante !== user?.id) return false
      if (quickFilter === 'responsabilidade' && ch.profissional_responsavel !== user?.id)
        return false
      if (quickFilter === 'aprovacao' && ch.status !== 'aprovacao') return false
      if (quickFilter === 'finalizados' && ch.status !== 'finalizado') return false

      // 2. Filtro de status
      if (filtroStatus !== 'todos' && ch.status !== filtroStatus) return false

      // 3. Filtro de prioridade
      if (filtroPrioridade !== 'todos' && ch.prioridade !== filtroPrioridade) return false

      // 4. Com anexos
      if (filtroComAnexos && (!ch.anexos || ch.anexos.length === 0)) return false

      // 5. Busca textual (número, assunto, solicitante, responsável, setor)
      if (filtroTexto.trim()) {
        const q = filtroTexto.toLowerCase()
        const num = (ch.numero || '').toLowerCase()
        const ass = (ch.assunto || '').toLowerCase()
        const sol = (ch.expand?.solicitante?.name || ch.solicitante || '').toLowerCase()
        const resp = (ch.expand?.profissional_responsavel?.name || '').toLowerCase()
        const set = (ch.expand?.setor_responsavel?.name || '').toLowerCase()

        if (
          !num.includes(q) &&
          !ass.includes(q) &&
          !sol.includes(q) &&
          !resp.includes(q) &&
          !set.includes(q)
        ) {
          return false
        }
      }

      return true
    })
  }, [
    chamados,
    quickFilter,
    filtroStatus,
    filtroPrioridade,
    filtroComAnexos,
    filtroTexto,
    user?.id,
  ])

  // Definição de colunas para o JetroTable padrão do ERP
  const columns = useMemo<JetroColumnDef<Chamado>[]>(() => {
    return [
      {
        id: 'numero',
        header: 'Número',
        accessorKey: 'numero',
        cell: (info) => {
          const val = String(info.getValue() || '')
          return (
            <span className="font-mono font-bold text-[#005B2E] dark:text-[#E4C46A]">{val}</span>
          )
        },
      },
      {
        id: 'assunto',
        header: 'Assunto',
        accessorKey: 'assunto',
        cell: (info) => {
          const ch = info.row.original
          return (
            <div className="flex items-center gap-1.5 max-w-[280px]">
              <span
                className="truncate font-semibold text-foreground"
                title={String(info.getValue())}
              >
                {String(info.getValue())}
              </span>
              {ch.anexos && ch.anexos.length > 0 && (
                <Paperclip
                  className="w-3.5 h-3.5 text-muted-foreground shrink-0"
                  title={`${ch.anexos.length} anexo(s)`}
                />
              )}
            </div>
          )
        },
      },
      {
        id: 'solicitante',
        header: 'Solicitante',
        accessorFn: (row) => row.expand?.solicitante?.name || row.solicitante,
        cell: (info) => {
          const name = String(info.getValue() || 'Sistema')
          return (
            <span className="text-xs text-foreground truncate block max-w-[140px]">{name}</span>
          )
        },
      },
      {
        id: 'setor_responsavel',
        header: 'Setor',
        accessorFn: (row) => row.expand?.setor_responsavel?.name || 'Geral',
        cell: (info) => (
          <span className="text-xs text-muted-foreground truncate block max-w-[120px]">
            {String(info.getValue())}
          </span>
        ),
      },
      {
        id: 'profissional_responsavel',
        header: 'Responsável',
        accessorFn: (row) => row.expand?.profissional_responsavel?.name || 'Não atribuído',
        cell: (info) => {
          const name = String(info.getValue())
          return (
            <span className="text-xs text-foreground truncate block max-w-[130px]">{name}</span>
          )
        },
      },
      {
        id: 'prioridade',
        header: 'Prioridade',
        accessorKey: 'prioridade',
        cell: (info) => {
          const p = (info.getValue() as ChamadoPrioridade) || 'normal'
          const cfg = PRIORIDADE_LABELS[p] || {
            label: p,
            badgeClass: 'bg-slate-100 text-slate-800',
          }
          return (
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${cfg.badgeClass}`}
            >
              {cfg.label}
            </span>
          )
        },
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: (info) => {
          const s = (info.getValue() as ChamadoStatus) || 'novo'
          const cfg = STATUS_LABELS[s] || {
            label: s,
            bg: 'bg-slate-100',
            text: 'text-slate-800',
            border: 'border-slate-300',
          }
          return (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.text} ${cfg.border}`}
            >
              {cfg.label}
            </span>
          )
        },
      },
      {
        id: 'created',
        header: 'Abertura',
        accessorKey: 'created',
        cell: (info) => {
          const val = String(info.getValue() || '')
          if (!val) return '—'
          const date = new Date(val)
          return (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {date.toLocaleDateString('pt-BR')}{' '}
              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )
        },
      },
      {
        id: 'updated',
        header: 'Última Atualização',
        accessorKey: 'updated',
        cell: (info) => {
          const val = String(info.getValue() || '')
          if (!val) return '—'
          const date = new Date(val)
          return (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {date.toLocaleDateString('pt-BR')}{' '}
              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )
        },
      },
      {
        id: 'acoes',
        header: 'Ações',
        cell: (info) => {
          const ch = info.row.original
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/admin/chamados/${ch.id}`)}
              className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-[#005B2E]/10 hover:text-[#005B2E]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Detalhes</span>
            </Button>
          )
        },
      },
    ]
  }, [navigate])

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Topo com Título e Ação Nova Demanda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-2xl font-black text-[#002817] dark:text-white tracking-tight flex items-center gap-2">
            Meus Chamados
            <Badge className="bg-[#002817] text-[#E4C46A] border border-[#C9A227]/40 text-xs font-mono">
              {filteredData.length} registros
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gerencie, acompanhe e atenda as solicitações corporativas dentro da Central de Chamados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="text-xs flex items-center gap-1.5"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/admin/chamados/novo')}
            className="bg-[#002817] hover:bg-[#00381C] text-[#E4C46A] border border-[#C9A227]/60 font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Chamado</span>
          </Button>
        </div>
      </div>

      {/* Barra de Filtros Rápidos */}
      <div className="flex flex-wrap items-center gap-1.5 bg-muted/30 p-1.5 rounded-xl border border-border">
        <span className="text-[11px] font-bold uppercase text-muted-foreground px-2">
          Filtros Rápidos:
        </span>
        <button
          type="button"
          onClick={() => setQuickFilter('todos')}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
            quickFilter === 'todos'
              ? 'bg-[#002817] text-[#E4C46A] shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Todos ({chamados.length})
        </button>
        <button
          type="button"
          onClick={() => setQuickFilter('meus')}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
            quickFilter === 'meus'
              ? 'bg-[#002817] text-[#E4C46A] shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Abertos por mim
        </button>
        <button
          type="button"
          onClick={() => setQuickFilter('responsabilidade')}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
            quickFilter === 'responsabilidade'
              ? 'bg-[#002817] text-[#E4C46A] shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sob minha responsabilidade
        </button>
        <button
          type="button"
          onClick={() => setQuickFilter('aprovacao')}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
            quickFilter === 'aprovacao'
              ? 'bg-[#002817] text-[#E4C46A] shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Aguardando aprovação
        </button>
        <button
          type="button"
          onClick={() => setQuickFilter('finalizados')}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
            quickFilter === 'finalizados'
              ? 'bg-[#002817] text-[#E4C46A] shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Finalizados
        </button>
      </div>

      {/* Barra de Filtros Detalhados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-card p-3 rounded-xl border border-border text-xs">
        {/* Busca por texto */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar número, assunto, solicitante..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>

        {/* Status */}
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="text-xs h-8">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="novo">Novo Chamado</SelectItem>
            <SelectItem value="andamento">Em Andamento</SelectItem>
            <SelectItem value="aprovacao">Aguardando Aprovação</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        {/* Prioridade */}
        <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
          <SelectTrigger className="text-xs h-8">
            <SelectValue placeholder="Filtrar por Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Prioridades</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>

        {/* Com anexos */}
        <div className="flex items-center gap-2 px-2">
          <input
            type="checkbox"
            id="chkAnexos"
            checked={filtroComAnexos}
            onChange={(e) => setFiltroComAnexos(e.target.checked)}
            className="rounded border-border text-[#005B2E] focus:ring-[#005B2E] cursor-pointer"
          />
          <label htmlFor="chkAnexos" className="text-xs text-foreground cursor-pointer select-none">
            Apenas com anexos
          </label>
        </div>
      </div>

      {/* Tabela Padrão do ERP Jetro (respeitando preferências de zebrado, linhas por página e customização) */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <JetroTable
          data={filteredData}
          columns={columns}
          tableId="central-chamados-meus"
          defaultPageSize={10}
          isLoading={loading}
          enableExport={true}
          emptyMessage="Nenhum chamado encontrado para os critérios selecionados."
        />
      </div>
    </div>
  )
}

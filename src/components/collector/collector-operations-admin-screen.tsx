import React, { useState, useEffect } from 'react'
import {
  History,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Smartphone,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCollectorOperations } from '@/services/collector'
import type { CollectorOperation } from '@/types/collector'

export const CollectorOperationsAdminScreen: React.FC = () => {
  const [operations, setOperations] = useState<CollectorOperation[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const loadOperations = async () => {
    setLoading(true)
    try {
      const records = await getCollectorOperations(undefined, 100)
      setOperations(records)
    } catch {
      // Sem erro fatal
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOperations()
  }, [])

  // Filtro em memória
  const filtered = operations.filter((op) => {
    if (typeFilter !== 'all' && op.tipo !== typeFilter) return false
    if (
      statusFilter === 'divergente' &&
      op.status !== 'divergente' &&
      (!op.divergencia || op.divergencia === 0)
    )
      return false
    if (statusFilter === 'concluido' && op.status !== 'concluido') return false

    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      const matchOp = op.operador_nome?.toLowerCase().includes(s)
      const matchDoc = op.documento_referencia?.toLowerCase().includes(s)
      const matchProd =
        op.produto_nome?.toLowerCase().includes(s) || op.produto_codigo?.toLowerCase().includes(s)
      const matchDev = op.dispositivo_codigo?.toLowerCase().includes(s)
      if (!matchOp && !matchDoc && !matchProd && !matchDev) return false
    }
    return true
  })

  // Exportação CSV
  const handleExportCSV = () => {
    const headers = [
      'Data/Hora',
      'Tipo',
      'Status',
      'Operador',
      'Dispositivo',
      'Documento',
      'Produto',
      'Origem',
      'Destino',
      'Esperado',
      'Executado',
      'Divergência',
      'Motivo',
    ]

    const rows = filtered.map((op) => [
      op.created ? new Date(op.created).toLocaleString('pt-BR') : '',
      op.tipo,
      op.status,
      `"${op.operador_nome || ''}"`,
      op.dispositivo_codigo || '',
      `"${op.documento_referencia || ''}"`,
      `"${op.produto_nome || op.produto_codigo || ''}"`,
      op.endereco_origem || '',
      op.endereco_destino || '',
      op.quantidade_esperada ?? '',
      op.quantidade_executada,
      op.divergencia ?? 0,
      `"${op.motivo_divergencia || ''}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `operacoes_coletor_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const badgeColorForType = (tipo: string) => {
    switch (tipo) {
      case 'recebimento':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'putaway':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30'
      case 'separacao':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'conferencia_expedicao':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      case 'inventario':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'transferencia':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-slate-800 text-slate-300'
    }
  }

  return (
    <div className="space-y-4 p-4 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-emerald-500" />
            Operações do Coletor
          </h1>
          <p className="text-sm text-muted-foreground">
            Auditoria, rastreabilidade e histórico de operações efetuadas nos coletores PWA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadOperations}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Indicadores Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground uppercase font-semibold">
              Total Operações
            </div>
            <div className="text-2xl font-black mt-1">{operations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground uppercase font-semibold text-emerald-600">
              Concluídas
            </div>
            <div className="text-2xl font-black mt-1 text-emerald-600">
              {operations.filter((o) => o.status === 'concluido').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground uppercase font-semibold text-amber-600">
              Divergências
            </div>
            <div className="text-2xl font-black mt-1 text-amber-600">
              {
                operations.filter(
                  (o) => o.status === 'divergente' || (o.divergencia && o.divergencia !== 0),
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground uppercase font-semibold text-blue-600">
              Operadores Ativos
            </div>
            <div className="text-2xl font-black mt-1 text-blue-600">
              {new Set(operations.map((o) => o.operador_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por operador, documento, produto, dispositivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 px-3 rounded-md border text-sm bg-background"
              >
                <option value="all">Todos os Tipos</option>
                <option value="recebimento">Recebimento</option>
                <option value="putaway">Putaway</option>
                <option value="separacao">Separação</option>
                <option value="conferencia_expedicao">Conferência Expedição</option>
                <option value="inventario">Inventário Cego</option>
                <option value="transferencia">Transferência</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-md border text-sm bg-background"
              >
                <option value="all">Todos os Status</option>
                <option value="concluido">Concluídos</option>
                <option value="divergente">Apenas Divergências</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Operações */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Operador / Disp.</TableHead>
                <TableHead>Doc / Ref</TableHead>
                <TableHead>Produto / Posição</TableHead>
                <TableHead className="text-right">Qtd Exec.</TableHead>
                <TableHead>Status / Divergência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando registros do coletor...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma operação do coletor encontrada para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((op) => {
                  const hasDiv =
                    op.status === 'divergente' || (op.divergencia && op.divergencia !== 0)
                  return (
                    <TableRow key={op.id || op.idempotency_key}>
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {op.created ? new Date(op.created).toLocaleString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs uppercase font-bold ${badgeColorForType(op.tipo)}`}
                        >
                          {op.tipo.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-semibold text-foreground">
                          {op.operador_nome || 'Operador'}
                        </div>
                        <div className="text-muted-foreground font-mono">
                          {op.dispositivo_codigo || 'Coletor'}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold">
                        {op.documento_referencia || '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium text-foreground line-clamp-1">
                          {op.produto_nome || op.produto_codigo || '-'}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 mt-0.5">
                          {op.endereco_origem && (
                            <span>
                              De: <strong>{op.endereco_origem}</strong>
                            </span>
                          )}
                          {op.endereco_destino && (
                            <span>
                              Para: <strong>{op.endereco_destino}</strong>
                            </span>
                          )}
                          {op.lote && <span>Lote: {op.lote}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold">
                        {op.quantidade_executada}
                        {op.quantidade_esperada !== undefined && (
                          <span className="text-muted-foreground font-normal">
                            {' '}
                            / {op.quantidade_esperada}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {hasDiv ? (
                          <div>
                            <Badge className="bg-amber-600 text-white text-[10px]">
                              Divergente ({op.divergencia})
                            </Badge>
                            {op.motivo_divergencia && (
                              <p className="text-[11px] text-amber-600 mt-0.5 line-clamp-1">
                                {op.motivo_divergencia}
                              </p>
                            )}
                          </div>
                        ) : (
                          <Badge className="bg-emerald-600 text-white text-[10px]">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getPriceTablesList, duplicatePriceTable, changeTableStatus } from '@/services/price-tables'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  TABLE_TYPE_OPTIONS,
  STATUS_LABEL,
  STATUS_BADGE,
  formatDate,
  parseItems,
  type EnhancedPriceTable,
} from '@/lib/price-table-types'
import {
  canCreatePriceTable,
  canEditPriceTable,
  canDuplicatePriceTable,
  canActivatePriceTable,
  canCancelPriceTable,
} from '@/lib/price-table-permissions'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { Loader2, Plus, Eye, Pencil, Copy, CheckCircle, XCircle, Ban, Search } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { PriceTableFormDialog } from '@/components/pricing/price-table-form-dialog'

export function PricingTables() {
  const { user } = useAuth()
  const role = user?.role as string
  const [tables, setTables] = useState<EnhancedPriceTable[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editTable, setEditTable] = useState<EnhancedPriceTable | null>(null)
  const [viewTable, setViewTable] = useState<EnhancedPriceTable | null>(null)
  const [dupOpen, setDupOpen] = useState(false)
  const [dupTable, setDupTable] = useState<EnhancedPriceTable | null>(null)
  const [dupName, setDupName] = useState('')
  const [dupStart, setDupStart] = useState('')
  const [dupEnd, setDupEnd] = useState('')
  const [dupLoading, setDupLoading] = useState(false)

  const load = async () => {
    try {
      setTables(await getPriceTablesList())
    } catch {
      setTables([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('price_tables', () => load())

  const filtered = tables.filter((t) => {
    const term = search.toLowerCase().trim()
    const matchSearch =
      !term || t.table_name?.toLowerCase().includes(term) || t.code?.toLowerCase().includes(term)
    const matchType = filterType === 'all' || t.table_type === filterType
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const handleCreate = () => {
    setEditTable(null)
    setFormOpen(true)
  }

  const handleEdit = (t: EnhancedPriceTable) => {
    setEditTable(t)
    setFormOpen(true)
  }

  const handleView = (t: EnhancedPriceTable) => {
    setViewTable(t)
  }

  const openDuplicate = (t: EnhancedPriceTable) => {
    setDupTable(t)
    setDupName(`${t.table_name} (Cópia)`)
    setDupStart('')
    setDupEnd('')
    setDupOpen(true)
  }

  const handleDuplicate = async () => {
    if (!dupTable) return
    setDupLoading(true)
    try {
      await duplicatePriceTable(dupTable.id, dupName, dupStart, dupEnd)
      toast({ title: 'Tabela duplicada com sucesso' })
      setDupOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao duplicar tabela', variant: 'destructive' })
    }
    setDupLoading(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await changeTableStatus(id, status)
      toast({
        title: `Tabela ${status === 'ativa' ? 'ativada' : status === 'inativa' ? 'inativada' : 'cancelada'}`,
      })
      load()
    } catch {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const viewItems = viewTable ? parseItems(viewTable.items) : []

  return (
    <div className="space-y-4">
      {canCreatePriceTable(role) && (
        <div className="flex justify-end">
          <Button
            onClick={handleCreate}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Tabela de Preços
          </Button>
        </div>
      )}

      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-3 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {TABLE_TYPE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-44 focus-visible:ring-[#005B2E]">
              <SelectValue placeholder="Situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Situações</SelectItem>
              {Object.entries(STATUS_LABEL).map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {tables.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-lg font-bold">Nenhuma tabela encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              {canCreatePriceTable(role)
                ? 'Clique em "Nova Tabela de Preços" para criar.'
                : 'Não há tabelas cadastradas.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <JetroTable
          screenId="precificacao.tabelas"
          columns={[
            {
              id: 'code',
              header: 'Código',
              accessorKey: 'code',
              dataType: 'text',
              defaultWidth: 100,
              cell: ({ value }) => (
                <span className="text-xs font-mono">{String(value || '—')}</span>
              ),
            },
            {
              id: 'table_name',
              header: 'Nome',
              accessorKey: 'table_name',
              dataType: 'text',
              defaultWidth: 220,
              cell: ({ value }) => <span className="font-medium">{String(value || '—')}</span>,
            },
            {
              id: 'table_type',
              header: 'Tipo',
              accessorKey: 'table_type',
              dataType: 'text',
              defaultWidth: 130,
              cell: ({ value }) => (
                <span className="text-xs">
                  {TABLE_TYPE_OPTIONS.find((o) => o.value === value)?.label || String(value || '—')}
                </span>
              ),
            },
            {
              id: 'empresa',
              header: 'Empresa',
              accessorKey: 'empresa',
              dataType: 'text',
              defaultWidth: 130,
              cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
            },
            {
              id: 'filial',
              header: 'Filial',
              accessorKey: 'filial',
              dataType: 'text',
              defaultWidth: 120,
              cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
            },
            {
              id: 'vigencia',
              header: 'Vigência',
              dataType: 'text',
              defaultWidth: 180,
              getSortValue: (row) => row.data_inicial || '',
              cell: ({ row }) => (
                <span className="text-xs">
                  {formatDate(row.data_inicial)} → {formatDate(row.data_final)}
                </span>
              ),
            },
            {
              id: 'itens',
              header: 'Itens',
              dataType: 'number',
              align: 'center',
              defaultWidth: 80,
              getSortValue: (row) => parseItems(row.items).length,
              cell: ({ row }) => <span>{parseItems(row.items).length}</span>,
            },
            {
              id: 'prioridade',
              header: 'Prioridade',
              accessorKey: 'prioridade',
              dataType: 'number',
              align: 'center',
              defaultWidth: 90,
              cell: ({ value }) => <span>{String(value ?? 0)}</span>,
            },
            {
              id: 'status',
              header: 'Situação',
              accessorKey: 'status',
              dataType: 'text',
              align: 'center',
              defaultWidth: 120,
              cell: ({ value }) => {
                const s = String(value || '')
                return (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_BADGE[s] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {STATUS_LABEL[s] || s}
                  </span>
                )
              },
            },
            {
              id: 'actions',
              header: 'Ações',
              align: 'center',
              sortable: false,
              hideable: false,
              resizable: false,
              draggable: false,
              defaultWidth: 130,
              cell: ({ row }) => (
                <div className="flex items-center justify-center gap-0.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleView(row)}
                    className="h-7 w-7 p-0"
                    title="Visualizar"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  {canEditPriceTable(role) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(row)}
                      className="h-7 w-7 p-0 text-[#005B2E]"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {canDuplicatePriceTable(role) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDuplicate(row)}
                      className="h-7 w-7 p-0 text-blue-600"
                      title="Duplicar"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {canActivatePriceTable(role) &&
                    row.status !== 'ativa' &&
                    row.status !== 'cancelada' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(row.id, 'ativa')}
                        className="h-7 w-7 p-0 text-emerald-600"
                        title="Ativar"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  {canActivatePriceTable(role) && row.status === 'ativa' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatusChange(row.id, 'inativa')}
                      className="h-7 w-7 p-0 text-gray-500"
                      title="Inativar"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {canCancelPriceTable(role) && row.status !== 'cancelada' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatusChange(row.id, 'cancelada')}
                      className="h-7 w-7 p-0 text-red-600"
                      title="Cancelar"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={filtered}
          emptyMessage="Nenhuma tabela corresponde aos filtros."
          exportTitle="Tabelas de Preços — Central de Preços"
          exportFilename="tabelas-precos-jetro.xlsx"
        />
      )}

      <PriceTableFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        table={editTable}
        onSuccess={load}
      />

      {viewTable && (
        <Dialog open={!!viewTable} onOpenChange={(v) => !v && setViewTable(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#005B2E]">
                {viewTable.table_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <strong>Código:</strong> {viewTable.code || '—'}
                </div>
                <div>
                  <strong>Tipo:</strong>{' '}
                  {TABLE_TYPE_OPTIONS.find((o) => o.value === viewTable.table_type)?.label ||
                    viewTable.table_type}
                </div>
                <div>
                  <strong>Empresa:</strong> {viewTable.empresa || '—'}
                </div>
                <div>
                  <strong>Filial:</strong> {viewTable.filial || '—'}
                </div>
                <div>
                  <strong>Vigência:</strong> {formatDate(viewTable.data_inicial)} →{' '}
                  {formatDate(viewTable.data_final)}
                </div>
                <div>
                  <strong>Prioridade:</strong> {viewTable.prioridade ?? 0}
                </div>
                <div>
                  <strong>Moeda:</strong> {viewTable.moeda || 'BRL'}
                </div>
                <div>
                  <strong>Situação:</strong>{' '}
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_BADGE[viewTable.status]}`}
                  >
                    {STATUS_LABEL[viewTable.status]}
                  </span>
                </div>
              </div>
              {viewTable.description && (
                <div>
                  <strong>Descrição:</strong> {viewTable.description}
                </div>
              )}
              {viewTable.observacoes && (
                <div>
                  <strong>Observações:</strong> {viewTable.observacoes}
                </div>
              )}
              {viewItems.length > 0 && (
                <div className="mt-3">
                  <strong>Produtos ({viewItems.length}):</strong>
                  <div className="mt-1 border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left px-2 py-1">Código</th>
                          <th className="text-left px-2 py-1">Produto</th>
                          <th className="text-right px-2 py-1">Novo Preço</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewItems.map((it, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-2 py-1">{it.code}</td>
                            <td className="px-2 py-1">{it.name}</td>
                            <td className="text-right px-2 py-1">R$ {it.new_price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {dupOpen && dupTable && (
        <Dialog open={dupOpen} onOpenChange={setDupOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#005B2E]">
                Duplicar Tabela
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Será criada uma cópia de <strong>{dupTable.table_name}</strong> com todos os
                produtos, preços, descontos e regras.
              </p>
              <div>
                <Label className="text-xs mb-1 block">Novo Nome *</Label>
                <Input
                  value={dupName}
                  onChange={(e) => setDupName(e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Nova Data Inicial</Label>
                  <Input
                    type="date"
                    value={dupStart}
                    onChange={(e) => setDupStart(e.target.value)}
                    className="focus-visible:ring-[#005B2E]"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Nova Data Final</Label>
                  <Input
                    type="date"
                    value={dupEnd}
                    onChange={(e) => setDupEnd(e.target.value)}
                    className="focus-visible:ring-[#005B2E]"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDupOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleDuplicate}
                disabled={dupLoading || !dupName.trim()}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                {dupLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Duplicar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

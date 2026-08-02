import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getContractsOperations, deleteContractOperation } from '@/services/contracts-operations'
import { useRealtime } from '@/hooks/use-realtime'
import { ContractFormDialog } from '@/components/contract-form-dialog'
import type { ContractOperation } from '@/lib/contract-types'
import { Plus, Search, Pencil, Trash2, Loader2, FileText, Package } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const STATUS_COLORS: Record<string, string> = {
  Rascunho: 'bg-gray-100 text-gray-700',
  Ativo: 'bg-emerald-100 text-emerald-700',
  Concluído: 'bg-blue-100 text-blue-700',
  Cancelado: 'bg-red-100 text-red-700',
}

function parseBR(v: string): number {
  if (!v) return 0
  const s = v.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')
  return parseFloat(s) || 0
}

function formatBRL(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ContractsOperationsPanel() {
  const [contracts, setContracts] = useState<ContractOperation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ContractOperation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContractOperation | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getContractsOperations()
      setContracts(Array.isArray(data) ? data : [])
    } catch {
      setError('Não foi possível carregar os contratos/operações.')
      setContracts([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('contracts_operations', () => load())

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return contracts.filter((c) => {
      const matchText = !term || c?.name?.toLowerCase()?.includes(term)
      const matchStatus = statusFilter === 'all' || c?.status === statusFilter
      return matchText && matchStatus
    })
  }, [contracts, search, statusFilter])

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const handleEdit = (c: ContractOperation) => {
    setEditing(c)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      await deleteContractOperation(deleteTarget.id)
      toast({ title: 'Contrato/Operação excluído' })
      load()
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
    setActionLoading(false)
    setDeleteTarget(null)
  }

  const isEmpty = !loading && !error && contracts.length === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-black text-foreground">Contratos / Operações</h2>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo contrato/operação
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FileText className="w-16 h-16 text-[#005B2E]/30 mb-6" />
          <p className="text-lg font-bold text-foreground mb-6">
            Nenhum contrato/operação cadastrado
          </p>
          <Button
            onClick={handleNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-base h-14 px-8 rounded-xl shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" /> Criar contrato/operação
          </Button>
        </div>
      ) : (
        <>
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pesquisar por nome..."
                    className="pl-10 focus-visible:ring-[#005B2E]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="Rascunho">Rascunho</SelectItem>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                {filtered.length} contrato(s)/operação(ões) encontrado(s)
              </p>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
            </div>
          ) : error ? (
            <Card className="border-2 border-dashed border-destructive/30">
              <CardContent className="py-16 text-center">
                <Package className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-lg font-bold mb-1">{error}</p>
                <Button
                  onClick={load}
                  variant="outline"
                  className="mt-3 border-[#005B2E] text-[#005B2E]"
                >
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="border-2 border-dashed border-border">
              <CardContent className="py-16 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-bold mb-1">Nenhum contrato/operação encontrado.</p>
                <p className="text-sm text-muted-foreground">
                  Ajuste a busca ou crie um novo contrato/operação.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#01361D] text-white">
                      <th className="text-left px-4 py-3 font-bold">Nome</th>
                      <th className="text-center px-4 py-3 font-bold hidden sm:table-cell">
                        Serviços
                      </th>
                      <th className="text-right px-4 py-3 font-bold hidden sm:table-cell">
                        Valor Total
                      </th>
                      <th className="text-left px-4 py-3 font-bold">Status</th>
                      <th className="text-left px-4 py-3 font-bold hidden md:table-cell">
                        Criado em
                      </th>
                      <th className="text-center px-4 py-3 font-bold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => {
                      const services = Array.isArray(c.services) ? c.services : []
                      const total = parseBR(c.total_value || '')
                      return (
                        <tr
                          key={c.id}
                          className="border-b border-border hover:bg-[#005B2E]/5 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium">
                            {c.name || '—'}
                            {services.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {services.map((s) => s.name).join(', ')}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center hidden sm:table-cell">
                            <span className="text-xs font-bold text-[#005B2E]">
                              {services.length}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
                            <span className="font-semibold text-[#005B2E]">{formatBRL(total)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-700'}`}
                            >
                              {c.status || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                            {c.created ? new Date(c.created).toLocaleDateString('pt-BR') : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(c)}
                                className="text-[#005B2E] hover:bg-[#005B2E]/10"
                                title="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteTarget(c)}
                                className="text-red-600 hover:bg-red-50"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      <ContractFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        contract={editing}
        onSuccess={load}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Contrato/Operação</AlertDialogTitle>
            <AlertDialogDescription>
              Excluir &quot;{deleteTarget?.name || '—'}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-[#005B2E] hover:bg-[#01361D]"
            >
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

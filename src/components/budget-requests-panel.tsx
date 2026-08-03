import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getBudgetRequests,
  updateBudgetRequestStatus,
  getNextBudgetNumber,
  saveQuoteData,
} from '@/services/budget-requests'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { BudgetCreateDialog } from '@/components/budget-create-dialog'
import { BudgetRequestActions } from '@/components/budget-request-actions'
import type { BudgetRecord } from '@/lib/types'
import { STATUS_OPTIONS, STATUS_COLORS } from '@/lib/types'
import { Search, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

export function BudgetRequestsPanel() {
  const { user } = useAuth()
  const [records, setRecords] = useState<BudgetRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRecord, setSelectedRecord] = useState<BudgetRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await getBudgetRequests()
      setRecords(Array.isArray(data) ? (data as unknown as BudgetRecord[]) : [])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('budget_requests', () => load())

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return records.filter((r) => {
      const matchText =
        !term ||
        r?.client_name?.toLowerCase()?.includes(term) ||
        r?.client_email?.toLowerCase()?.includes(term) ||
        r?.service?.toLowerCase()?.includes(term)
      const matchStatus = statusFilter === 'all' || r?.status === statusFilter
      return matchText && matchStatus
    })
  }, [records, search, statusFilter])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    records.forEach((r) => {
      const s = r?.status || 'PENDENTE'
      counts[s] = (counts[s] || 0) + 1
    })
    return counts
  }, [records])

  const authorName = user?.name || user?.email || 'Operador'

  const handleRespond = useCallback(
    (record: BudgetRecord) => {
      setSelectedRecord(record)
      setDialogOpen(true)
      if (!record?.quote_created_at) {
        updateBudgetRequestStatus(
          record.id,
          'EM ANDAMENTO',
          'Iniciando resposta ao orçamento',
          authorName,
        ).catch(() => {})
      }
    },
    [authorName],
  )

  const handleReprint = useCallback((record: BudgetRecord) => {
    setSelectedRecord(record)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(
    async (record: BudgetRecord) => {
      if (!record?.id) return
      setSavingId(record.id)
      try {
        if (!record.quote_created_at) {
          const next = await getNextBudgetNumber()
          await saveQuoteData(record.id, {
            budget_number: next.number,
            responsible_email: record.responsible_email || user?.email || '',
            responsible_phone: record.responsible_phone || '',
            quote_created_at: new Date().toISOString(),
          })
          await updateBudgetRequestStatus(record.id, 'EM ANDAMENTO', 'Orçamento salvo', authorName)
          toast.success('Orçamento salvo com sucesso!', { description: `Número: ${next.number}` })
        } else {
          const existingData = (record.data || {}) as Record<string, unknown>
          await saveQuoteData(record.id, {
            budget_number: record.budget_number || '',
            responsible_email: record.responsible_email || user?.email || '',
            responsible_phone: record.responsible_phone || '',
            quote_created_at: record.quote_created_at,
            data: existingData,
          })
          toast.success('Orçamento atualizado com sucesso!')
        }
        await load()
      } catch {
        toast.error('Erro ao salvar orçamento. Tente novamente.')
      } finally {
        setSavingId(null)
      }
    },
    [user, authorName],
  )

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-foreground">Solicitações de Orçamento</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STATUS_OPTIONS.map((status) => (
          <Card key={status} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground font-semibold">{status}</p>
              <p className="text-2xl font-black text-[#005B2E]">{statusCounts[status] || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, e-mail ou serviço..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} solicitação(ões) encontrada(s)
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold mb-1">Nenhuma solicitação encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-4 py-3 font-bold">Cliente</th>
                  <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">Serviço</th>
                  <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Contato</th>
                  <th className="text-left px-4 py-3 font-bold">Status</th>
                  <th className="text-left px-4 py-3 font-bold hidden lg:table-cell">Data</th>
                  <th className="text-left px-4 py-3 font-bold min-w-[280px]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border hover:bg-[#005B2E]/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{r.client_name || '—'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{r.service || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {r.client_email || '—'}
                      <br />
                      {r.client_phone || ''}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded border ${STATUS_COLORS[r.status] || STATUS_COLORS['PENDENTE']}`}
                      >
                        {r.status || 'PENDENTE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <BudgetRequestActions
                        record={r}
                        onRespond={handleRespond}
                        onReprint={handleReprint}
                        onSave={handleSave}
                        savingId={savingId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <BudgetCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={selectedRecord}
        authorName={authorName}
        onSuccess={load}
      />
    </div>
  )
}

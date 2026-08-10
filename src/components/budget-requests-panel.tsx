import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { getFormFields } from '@/services/budget-form-fields'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { AdminRequestRow } from '@/components/admin-request-row'
import { BudgetCreateDialog } from '@/components/budget-create-dialog'
import { StatusHistoryDialog } from '@/components/status-history-dialog'
import { StatusUpdateDialog } from '@/components/status-update-dialog'
import { SendMessageDialog } from '@/components/send-message-dialog'
import { PaginationControls } from '@/components/pagination-controls'
import { ManualBudgetDialog } from '@/components/manual-budget-dialog'
import type { BudgetRecord } from '@/lib/types'
import { STATUS_OPTIONS } from '@/lib/types'
import { DEFAULT_FORM_FIELDS } from '@/lib/constants'
import { buildWhatsAppUrl, normalizePhone } from '@/lib/utils'
import { Search, Loader2, FileText, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { NotificationBell } from '@/components/notification-bell'
import { logBudgetSend } from '@/services/budget-requests'

export function BudgetRequestsPanel() {
  const { user } = useAuth()
  const [records, setRecords] = useState<BudgetRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [labelMap, setLabelMap] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [selectedRecord, setSelectedRecord] = useState<BudgetRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  const [historyRecord, setHistoryRecord] = useState<BudgetRecord | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const [statusRecord, setStatusRecord] = useState<BudgetRecord | null>(null)
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')

  const [messageRecord, setMessageRecord] = useState<BudgetRecord | null>(null)
  const [messageOpen, setMessageOpen] = useState(false)

  const [manualOpen, setManualOpen] = useState(false)

  const authorName = (user?.name as string) || (user?.email as string) || 'Operador'

  const load = useCallback(async () => {
    try {
      const data = await getBudgetRequests()
      setRecords(Array.isArray(data) ? (data as unknown as BudgetRecord[]) : [])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    getFormFields()
      .then((fields) => {
        const map: Record<string, string> = {}
        const allFields = fields && fields.length > 0 ? fields : DEFAULT_FORM_FIELDS
        for (const f of allFields) {
          if (f?.name && f?.label) map[f.name] = f.label
        }
        setLabelMap(map)
      })
      .catch(() => {
        const map: Record<string, string> = {}
        for (const f of DEFAULT_FORM_FIELDS) {
          map[f.name] = f.label
        }
        setLabelMap(map)
      })
  }, [load])

  useRealtime('budget_requests', () => load())

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return records.filter((r) => {
      const matchText =
        !term ||
        r?.client_name?.toLowerCase()?.includes(term) ||
        r?.client_email?.toLowerCase()?.includes(term) ||
        r?.service?.toLowerCase()?.includes(term) ||
        r?.budget_number?.toLowerCase()?.includes(term) ||
        r?.sales_channel?.toLowerCase()?.includes(term) ||
        String(r?.request_number || '').includes(term) ||
        `#${r?.request_number || ''}`.toLowerCase().includes(term)
      const matchDate = (() => {
        if (!term) return true
        if (!r?.created) return true
        const d = new Date(r.created)
        const dateBR = d.toLocaleDateString('pt-BR')
        const iso = r.created.split('T')[0]
        return dateBR.includes(term) || iso.includes(term)
      })()
      const matchStatus = statusFilter === 'all' || r?.status === statusFilter
      return matchText && matchDate && matchStatus
    })
  }, [records, search, statusFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const paginated = useMemo(() => {
    if (pageSize === 0) return filtered
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    records.forEach((r) => {
      const s = r?.status || 'PENDENTE'
      counts[s] = (counts[s] || 0) + 1
    })
    return counts
  }, [records])

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBudgetClick = useCallback(
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

  const handleSendEmailClick = useCallback((record: BudgetRecord) => {
    setMessageRecord(record)
    setMessageOpen(true)
  }, [])

  const handleSendWhatsAppClick = useCallback(
    (record: BudgetRecord) => {
      const phone = normalizePhone(record.client_phone || '')
      if (!phone) {
        toast.error('Cliente não possui telefone cadastrado.')
        return
      }
      const msg = `Olá ${record.client_name}! Conforme sua solicitação de orçamento para ${record.service || 'serviços logísticos'}, estamos retornando o contato.`
      window.open(buildWhatsAppUrl(phone, msg), '_blank')
      logBudgetSend(record.id, 'whatsapp', phone, authorName).catch(() => {})
    },
    [authorName],
  )

  const handleHistoryClick = useCallback((record: BudgetRecord) => {
    setHistoryRecord(record)
    setHistoryOpen(true)
  }, [])

  const handleStatusSelect = useCallback((record: BudgetRecord, status: string) => {
    setStatusRecord(record)
    setSelectedStatus(status)
    setStatusUpdateOpen(true)
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
            responsible_email: record.responsible_email || (user?.email as string) || '',
            responsible_phone: record.responsible_phone || '',
            quote_created_at: new Date().toISOString(),
          })
          await updateBudgetRequestStatus(record.id, 'EM ANDAMENTO', 'Orçamento salvo', authorName)
          toast.success('Orçamento salvo com sucesso!', { description: `Número: ${next.number}` })
        } else {
          const existingData = (record.data || {}) as Record<string, unknown>
          await saveQuoteData(record.id, {
            budget_number: record.budget_number || '',
            responsible_email: record.responsible_email || (user?.email as string) || '',
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
    [user, authorName, load],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-black text-foreground">Solicitações de Orçamento</h2>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Button
            onClick={() => setManualOpen(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Orçamento
          </Button>
        </div>
      </div>

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
                placeholder="Buscar por nome, nº orçamento ou data..."
                className="pl-10 pr-8 focus-visible:ring-[#005B2E]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
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
            <p className="text-lg font-bold mb-1">Nenhuma solicitação de orçamento encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Cliente</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Nº</th>
                  <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Orç.</th>
                  <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Telefone</th>
                  <th className="text-left px-3 py-3 font-bold hidden xl:table-cell">Email</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Serviço</th>
                  <th className="text-left px-3 py-3 font-bold hidden xl:table-cell">Canal</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Tempo</th>
                  <th className="text-left px-3 py-3 font-bold">Data</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r) => (
                  <AdminRequestRow
                    key={r.id}
                    record={r}
                    labelMap={labelMap}
                    isExpanded={expandedRows.has(r.id)}
                    onToggle={() => toggleRow(r.id)}
                    onStatusSelect={handleStatusSelect}
                    onHistoryClick={handleHistoryClick}
                    onBudgetClick={handleBudgetClick}
                    onSendEmailClick={handleSendEmailClick}
                    onSendWhatsAppClick={handleSendWhatsAppClick}
                    onRespond={handleBudgetClick}
                    onReprint={handleReprint}
                    onSave={handleSave}
                    savingId={savingId}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls
            totalRecords={filtered.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
          />
        </Card>
      )}

      <BudgetCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={selectedRecord}
        authorName={authorName}
        onSuccess={load}
      />

      <StatusHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={historyRecord?.status_history || []}
        sendingHistory={historyRecord?.sending_history || []}
      />

      <StatusUpdateDialog
        open={statusUpdateOpen}
        onOpenChange={setStatusUpdateOpen}
        recordId={statusRecord?.id || ''}
        selectedStatus={selectedStatus}
        authorName={authorName}
        onSuccess={load}
      />

      <SendMessageDialog
        open={messageOpen}
        onOpenChange={setMessageOpen}
        requestId={messageRecord?.id || ''}
        clientName={messageRecord?.client_name || ''}
        clientEmail={messageRecord?.client_email || ''}
        authorName={authorName}
        onSuccess={load}
      />

      <ManualBudgetDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        authorName={authorName}
        authorEmail={(user?.email as string) || ''}
        onSuccess={load}
      />
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getBudgetRequests } from '@/services/budget-requests'
import { getFormFields } from '@/services/budget-form-fields'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { DEFAULT_FORM_FIELDS, type DefaultFormField } from '@/lib/constants'
import { AdminRequestRow } from '@/components/admin-request-row'
import { StatusUpdateDialog } from '@/components/status-update-dialog'
import { StatusHistoryDialog } from '@/components/status-history-dialog'
import { StatusDashboard } from '@/components/status-dashboard'
import { BudgetCreateDialog } from '@/components/budget-create-dialog'
import { SendMessageDialog } from '@/components/send-message-dialog'
import { UserManagement } from '@/components/user-management'
import { AdminChatPanel } from '@/components/admin-chat-panel'
import { DashboardsPanel } from '@/components/dashboards/dashboards-panel'
import { type BudgetRecord } from '@/lib/types'
import {
  LogOut,
  Inbox,
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle,
  Clock,
  FileDown,
  FileSpreadsheet,
  Download,
} from 'lucide-react'
import { getAverageResponseTime } from '@/lib/response-time'
import { generateSolicitationsPdf } from '@/lib/report-pdf'
import { generateSolicitationsXls } from '@/lib/report-xls'
import { downloadChartsImage } from '@/lib/charts-export'

export function AdminDashboard() {
  const { signOut, isAdmin, user } = useAuth()
  const [records, setRecords] = useState<BudgetRecord[]>([])
  const [fields, setFields] = useState<DefaultFormField[]>(DEFAULT_FORM_FIELDS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusUpdate, setStatusUpdate] = useState<{
    record: BudgetRecord
    status: string
  } | null>(null)
  const [historyRecord, setHistoryRecord] = useState<BudgetRecord | null>(null)
  const [budgetRecord, setBudgetRecord] = useState<BudgetRecord | null>(null)
  const [sendMessageState, setSendMessageState] = useState<{
    record: BudgetRecord
    mode: 'email' | 'whatsapp'
  } | null>(null)

  const labelMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const f of fields) map[f.name] = f.label
    return map
  }, [fields])

  const loadData = async () => {
    try {
      const data = await getBudgetRequests()
      setRecords(data as unknown as BudgetRecord[])
      setError('')
    } catch (err) {
      const status = (err as { status?: number })?.status
      if (status === 401) {
        signOut()
        return
      }
      setError('Erro ao carregar solicitações. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getFormFields()
      .then((f) => {
        if (f && f.length > 0) setFields(f)
      })
      .catch(() => {})
    loadData()
  }, [])

  useRealtime('budget_requests', () => {
    loadData()
  })

  const authorName = (user?.name as string) || (user?.email as string) || 'Usuário'
  const avgResponseTime = useMemo(() => getAverageResponseTime(records), [records])
  const toggleRow = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Painel de Solicitações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie cotações, envie orçamentos e responda clientes em tempo real
          </p>
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-bold"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>

      <Tabs defaultValue="solicitacoes">
        <TabsList className="mb-6">
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="chat">Chat Online</TabsTrigger>
          {isAdmin && <TabsTrigger value="usuarios">Usuários</TabsTrigger>}
        </TabsList>

        <TabsContent value="solicitacoes" className="space-y-6">
          {!loading && !error && records.length > 0 && <StatusDashboard records={records} />}
          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="border-2 border-[#C89B3C]/30 bg-white flex-1">
              <CardContent className="py-4 px-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#005B2E]/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#005B2E]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{records.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {records.length === 1 ? 'Solicitação recebida' : 'Solicitações recebidas'}
                  </p>
                </div>
              </CardContent>
            </Card>
            {avgResponseTime && (
              <Card className="border-2 border-[#005B2E]/30 bg-white flex-1">
                <CardContent className="py-4 px-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#005B2E]/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#005B2E]" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{avgResponseTime}</p>
                    <p className="text-sm text-muted-foreground">Tempo médio de resposta</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {!loading && !error && records.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-2">
              <Button
                onClick={() => generateSolicitationsPdf(records, authorName)}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button
                onClick={() => generateSolicitationsXls(records, authorName)}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar XLS
              </Button>
              <Button
                onClick={() => downloadChartsImage(records, authorName)}
                className="bg-[#C89B3C] hover:bg-[#b8881f] text-white font-bold"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Gráficos
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
            </div>
          ) : error ? (
            <Card className="border-destructive/30">
              <CardContent className="py-8 text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
                <p className="text-destructive font-medium">{error}</p>
                <Button
                  onClick={loadData}
                  variant="outline"
                  className="border-[#005B2E] text-[#005B2E]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          ) : records.length === 0 ? (
            <Card className="border-2 border-dashed border-border">
              <CardContent className="py-16 text-center">
                <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-bold text-foreground mb-1">
                  Nenhuma solicitação recebida até o momento.
                </p>
                <p className="text-sm text-muted-foreground">
                  As novas cotações enviadas pelo site aparecerão aqui automaticamente.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#01361D] text-white">
                      <th className="text-left px-4 py-3 font-bold whitespace-nowrap">Cliente</th>
                      <th className="text-left px-4 py-3 font-bold whitespace-nowrap hidden md:table-cell">
                        E-mail
                      </th>
                      <th className="text-left px-4 py-3 font-bold whitespace-nowrap hidden lg:table-cell">
                        Telefone
                      </th>
                      <th className="text-left px-4 py-3 font-bold whitespace-nowrap hidden sm:table-cell">
                        Serviço
                      </th>
                      <th className="text-left px-4 py-3 font-bold whitespace-nowrap hidden sm:table-cell">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 font-bold whitespace-nowrap hidden md:table-cell">
                        Tempo
                      </th>
                      <th className="text-left px-4 py-3 font-bold whitespace-nowrap">Data/Hora</th>
                      <th className="text-left px-4 py-3 font-bold whitespace-nowrap">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <AdminRequestRow
                        key={record.id}
                        record={record}
                        labelMap={labelMap}
                        isExpanded={expandedId === record.id}
                        onToggle={() => toggleRow(record.id)}
                        onStatusSelect={(rec, status) => setStatusUpdate({ record: rec, status })}
                        onHistoryClick={(rec) => setHistoryRecord(rec)}
                        onBudgetClick={(rec) => setBudgetRecord(rec)}
                        onSendEmailClick={(rec) =>
                          setSendMessageState({ record: rec, mode: 'email' })
                        }
                        onSendWhatsAppClick={(rec) =>
                          setSendMessageState({ record: rec, mode: 'whatsapp' })
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dashboards">
          <DashboardsPanel />
        </TabsContent>

        <TabsContent value="chat">
          <AdminChatPanel />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="usuarios">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>

      <StatusUpdateDialog
        open={!!statusUpdate}
        onOpenChange={(open) => !open && setStatusUpdate(null)}
        recordId={statusUpdate?.record.id || ''}
        selectedStatus={statusUpdate?.status || ''}
        authorName={authorName}
        onSuccess={loadData}
      />

      <StatusHistoryDialog
        open={!!historyRecord}
        onOpenChange={(open) => !open && setHistoryRecord(null)}
        history={historyRecord?.status_history || []}
      />

      <BudgetCreateDialog
        open={!!budgetRecord}
        onOpenChange={(open) => !open && setBudgetRecord(null)}
        record={budgetRecord}
        authorName={authorName}
        onSuccess={loadData}
      />

      <SendMessageDialog
        open={!!sendMessageState}
        onOpenChange={(open) => !open && setSendMessageState(null)}
        record={sendMessageState?.record || null}
        mode={sendMessageState?.mode || 'email'}
        authorName={authorName}
        onSuccess={loadData}
      />
    </div>
  )
}

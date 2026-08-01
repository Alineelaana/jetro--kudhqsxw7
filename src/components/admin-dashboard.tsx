import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getBudgetRequests } from '@/services/budget-requests'
import { getFormFields } from '@/services/budget-form-fields'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { DEFAULT_FORM_FIELDS, type DefaultFormField } from '@/lib/constants'
import { AdminRequestRow, type BudgetRecord } from '@/components/admin-request-row'
import { LogOut, Inbox, FileText, Loader2, RefreshCw, AlertCircle } from 'lucide-react'

export function AdminDashboard() {
  const { signOut } = useAuth()
  const [records, setRecords] = useState<BudgetRecord[]>([])
  const [fields, setFields] = useState<DefaultFormField[]>(DEFAULT_FORM_FIELDS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
    } catch {
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

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Painel de Solicitações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie todas as cotações recebidas pelo site
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

      <Card className="border-2 border-[#C89B3C]/30 mb-6 bg-white">
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
                  <th className="text-left px-4 py-3 font-bold whitespace-nowrap">Data/Hora</th>
                  <th className="px-4 py-3 font-bold w-10"></th>
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
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

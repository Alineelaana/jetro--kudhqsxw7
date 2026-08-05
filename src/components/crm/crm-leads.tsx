import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getLeads, deleteLead } from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { LEAD_STATUS, LEAD_STATUS_COLORS, TEMPERATURE_COLORS, type CrmLead } from '@/lib/crm-types'
import {
  Plus,
  Search,
  Loader2,
  Pencil,
  Trash2,
  UserPlus,
  ArrowRightLeft,
  XCircle,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { CrmLeadDialog } from '@/components/crm/crm-lead-dialog'
import { cn } from '@/lib/utils'

export function CrmLeads() {
  const { user } = useAuth()
  const [records, setRecords] = useState<CrmLead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CrmLead | null>(null)

  const load = async () => {
    try {
      setRecords(await getLeads())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('crm_leads', () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    const matchSearch =
      !term ||
      (r.name || '').toLowerCase().includes(term) ||
      (r.cpf_cnpj || '').includes(term) ||
      (r.phone || '').includes(term) ||
      (r.email || '').toLowerCase().includes(term) ||
      (r.lead_number || '').toLowerCase().includes(term)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const handleEdit = (r: CrmLead) => {
    setEditing(r)
    setDialogOpen(true)
  }
  const handleDelete = async (r: CrmLead) => {
    try {
      await deleteLead(r.id)
      toast({ title: 'Lead excluído' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }
  const handleConvert = (r: CrmLead) => {
    toast({
      title: 'Conversão',
      description: `Use o botão dentro do lead ${r.lead_number} para converter em oportunidade.`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Lead
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, CPF/CNPJ, telefone, e-mail..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {LEAD_STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">{filtered.length} registro(s)</p>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-lg font-bold">Nenhum lead encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Protocolo</th>
                  <th className="text-left px-3 py-3 font-bold">Nome</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Contato</th>
                  <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Origem</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Temp.</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-mono text-xs font-bold text-[#C89B3C]">
                      {r.lead_number}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {r.name}
                      {r.trade_name && (
                        <span className="text-xs text-muted-foreground block">{r.trade_name}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">
                      {r.phone}
                      <br />
                      {r.email}
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell text-xs">
                      {r.lead_source || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded',
                          LEAD_STATUS_COLORS[r.status] || '',
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      {r.temperature && (
                        <span
                          className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded',
                            TEMPERATURE_COLORS[r.temperature] || '',
                          )}
                        >
                          {r.temperature}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-0.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(r)}
                          className="text-[#005B2E] h-8 w-8 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleConvert(r)}
                          className="text-blue-600 h-8 w-8 p-0"
                          title="Converter"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(r)}
                          className="text-red-600 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <CrmLeadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lead={editing}
        onSuccess={load}
      />
    </div>
  )
}

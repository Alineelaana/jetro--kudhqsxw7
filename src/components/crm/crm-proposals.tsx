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
import { getProposals, deleteProposal, updateProposal } from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'
import { PROPOSAL_STATUS, PROPOSAL_STATUS_COLORS, type CrmProposal } from '@/lib/crm-types'
import { Plus, Search, Loader2, Pencil, Trash2, FileText, Send, Copy } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { CrmProposalDialog } from '@/components/crm/crm-proposal-dialog'
import { cn } from '@/lib/utils'

export function CrmProposals() {
  const [records, setRecords] = useState<CrmProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CrmProposal | null>(null)

  const load = async () => {
    try {
      setRecords(await getProposals())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('crm_proposals', () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    const matchSearch =
      !term ||
      (r.client_name || '').toLowerCase().includes(term) ||
      (r.title || '').toLowerCase().includes(term) ||
      (r.proposal_number || '').toLowerCase().includes(term)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleStatusChange = async (r: CrmProposal, status: string) => {
    try {
      const data: Record<string, unknown> = { status }
      if (status === 'Enviada') data.sent_date = new Date().toISOString().split('T')[0]
      if (status === 'Aprovada Internamente')
        data.approved_date = new Date().toISOString().split('T')[0]
      await updateProposal(r.id, data)
      toast({ title: 'Status atualizado' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleDuplicate = async (r: CrmProposal) => {
    setEditing({ ...r, id: '', proposal_number: '' } as CrmProposal)
    setDialogOpen(true)
  }

  const handleDelete = async (r: CrmProposal) => {
    try {
      await deleteProposal(r.id)
      toast({ title: 'Proposta excluída' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Proposta
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
                placeholder="Buscar por cliente, título, número..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {PROPOSAL_STATUS.map((s) => (
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
            <p className="text-lg font-bold">Nenhuma proposta encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Número</th>
                  <th className="text-left px-3 py-3 font-bold">Cliente</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Título</th>
                  <th className="text-left px-3 py-3 font-bold">Valor</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-mono text-xs font-bold text-[#C89B3C]">
                      {r.proposal_number}
                    </td>
                    <td className="px-3 py-2 font-medium">{r.client_name || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">{r.title}</td>
                    <td className="px-3 py-2 font-bold">
                      R${' '}
                      {(parseFloat(r.total) || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2">
                      <Select value={r.status} onValueChange={(v) => handleStatusChange(r, v)}>
                        <SelectTrigger className="h-7 text-xs focus-visible:ring-[#005B2E]">
                          <span
                            className={cn(
                              'text-xs font-bold px-2 py-0.5 rounded',
                              PROPOSAL_STATUS_COLORS[r.status] || '',
                            )}
                          >
                            {r.status}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {PROPOSAL_STATUS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-0.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditing(r)
                            setDialogOpen(true)
                          }}
                          className="text-[#005B2E] h-8 w-8 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(r)}
                          className="text-blue-600 h-8 w-8 p-0"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
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
      <CrmProposalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        proposal={editing}
        onSuccess={load}
      />
    </div>
  )
}

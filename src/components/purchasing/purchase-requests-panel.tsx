import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getPurchaseRequests,
  createPurchaseRequest,
  updatePurchaseRequest,
  getNextPurchaseNumber,
} from '@/services/purchasing'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  REQUEST_STATUS,
  PRIORITY_OPTIONS,
  STATUS_COLORS,
  type PurchaseRequest,
  type PurchaseRequestItem,
} from '@/lib/purchasing-types'
import { Plus, Search, Pencil, Send, X, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

const emptyItem: PurchaseRequestItem = {
  product: '',
  description: '',
  quantity: '',
  unit: '',
  observation: '',
}

export function PurchaseRequestsPanel() {
  const { user } = useAuth()
  const [records, setRecords] = useState<PurchaseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PurchaseRequest | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    requester: '',
    company: '',
    branch: '',
    cost_center: '',
    department: '',
    priority: 'Normal',
    justification: '',
  })
  const [items, setItems] = useState<PurchaseRequestItem[]>([{ ...emptyItem }])

  const load = async () => {
    try {
      setRecords((await getPurchaseRequests()) as unknown as PurchaseRequest[])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('purchase_requests', () => load())

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return records.filter((r) => {
      const ms =
        !term ||
        r?.requester?.toLowerCase()?.includes(term) ||
        r?.request_number?.toLowerCase()?.includes(term)
      const mf = statusFilter === 'all' || r?.status === statusFilter
      return ms && mf
    })
  }, [records, search, statusFilter])

  const handleNew = () => {
    setEditing(null)
    setForm({
      requester: (user?.name as string) || '',
      company: '',
      branch: '',
      cost_center: '',
      department: '',
      priority: 'Normal',
      justification: '',
    })
    setItems([{ ...emptyItem }])
    setFormOpen(true)
  }
  const handleEdit = (r: PurchaseRequest) => {
    setEditing(r)
    setForm({
      requester: r.requester || '',
      company: r.company || '',
      branch: r.branch || '',
      cost_center: r.cost_center || '',
      department: r.department || '',
      priority: r.priority || 'Normal',
      justification: r.justification || '',
    })
    setItems(r.items?.length ? r.items : [{ ...emptyItem }])
    setFormOpen(true)
  }

  const handleSave = async (sendForApproval: boolean) => {
    setSaving(true)
    try {
      const history = editing?.history || []
      const newEntry = {
        action: sendForApproval ? 'Enviado para Aprovação' : 'Salvo',
        user: (user?.name as string) || 'Sistema',
        date: new Date().toISOString(),
        note: '',
      }
      const data: Record<string, unknown> = {
        ...form,
        requester_id: user?.id as string,
        items: items.filter((i) => i.product || i.description),
        status: sendForApproval ? 'Aguardando Aprovação' : editing?.status || 'Rascunho',
        responsible_user: (user?.name as string) || '',
        history: [...history, newEntry],
      }
      if (editing) {
        await updatePurchaseRequest(editing.id, data)
      } else {
        const { number } = await getNextPurchaseNumber('request')
        data.request_number = number
        await createPurchaseRequest(data)
      }
      toast.success(sendForApproval ? 'Solicitação enviada para aprovação' : 'Solicitação salva')
      setFormOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar solicitação')
    }
    setSaving(false)
  }

  const handleCancel = async (r: PurchaseRequest) => {
    try {
      await updatePurchaseRequest(r.id, {
        status: 'Cancelada',
        history: [
          ...(r.history || []),
          {
            action: 'Cancelada',
            user: (user?.name as string) || '',
            date: new Date().toISOString(),
            note: '',
          },
        ],
      })
      toast.success('Solicitação cancelada')
      load()
    } catch {
      toast.error('Erro ao cancelar')
    }
  }

  const setItem = (i: number, field: keyof PurchaseRequestItem, value: string) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">Solicitações de Compra</h3>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Solicitação
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
                placeholder="Buscar por número ou solicitante..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {REQUEST_STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma solicitação encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nº</th>
                  <th className="text-left px-3 py-3 font-bold">Solicitante</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Empresa</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Prioridade</th>
                  <th className="text-left px-3 py-3 font-bold">Data</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {r.request_number || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium">{r.requester || '—'}</td>
                    <td className="px-3 py-3 hidden md:table-cell">{r.company || '—'}</td>
                    <td className="px-3 py-3 hidden sm:table-cell">{r.priority || '—'}</td>
                    <td className="px-3 py-3 text-xs">
                      {r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {r.status || 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(r)}
                          className="text-[#005B2E] hover:bg-[#005B2E]/10"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {r.status === 'Rascunho' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancel(r)}
                            className="text-red-600 hover:bg-red-50"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar Solicitação' : 'Nova Solicitação de Compra'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Solicitante</Label>
                <Input
                  value={form.requester}
                  onChange={(e) => setForm({ ...form, requester: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-xs">Empresa</Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-xs">Filial</Label>
                <Input
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Centro de Custo</Label>
                <Input
                  value={form.cost_center}
                  onChange={(e) => setForm({ ...form, cost_center: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-xs">Departamento</Label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-xs">Prioridade</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Justificativa</Label>
              <Textarea
                value={form.justification}
                onChange={(e) => setForm({ ...form, justification: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
                rows={2}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-bold">Itens da Solicitação</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setItems([...items, { ...emptyItem }])}
                  className="border-[#005B2E] text-[#005B2E]"
                >
                  <Plus className="w-3 h-3 mr-1" /> Item
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-2">Produto/Serviço</th>
                      <th className="text-left p-2">Descrição</th>
                      <th className="text-left p-2 w-20">Qtd</th>
                      <th className="text-left p-2 w-20">Un.</th>
                      <th className="text-left p-2">Observação</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i}>
                        <td className="p-1">
                          <Input
                            value={item.product}
                            onChange={(e) => setItem(i, 'product', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            value={item.description}
                            onChange={(e) => setItem(i, 'description', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => setItem(i, 'quantity', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            value={item.unit}
                            onChange={(e) => setItem(i, 'unit', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            value={item.observation}
                            onChange={(e) => setItem(i, 'observation', e.target.value)}
                            className="h-8 text-xs focus-visible:ring-[#005B2E]"
                          />
                        </td>
                        <td className="p-1">
                          {items.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                              className="text-red-600 h-8 w-8 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="border-[#005B2E] text-[#005B2E]"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
              <Send className="w-4 h-4 mr-2" /> Enviar para Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

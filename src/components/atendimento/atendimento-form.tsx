import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import {
  getMotivos,
  getSetores,
  createAtendimento,
  searchCustomers,
  searchOrders,
} from '@/services/atendimento'
import { PRIORIDADES, ORIGENS, TIPOS, PROBLEM_TYPES } from '@/lib/atendimento-types'
import { canAssignManual } from '@/lib/atendimento-permissions'
import { Loader2, Save, Search, User } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { MotivoRecord, SetorRecord } from '@/lib/atendimento-types'

export function AtendimentoForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [motivos, setMotivos] = useState<MotivoRecord[]>([])
  const [setores, setSetores] = useState<SetorRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Record<string, unknown> | null>(null)
  const [orderSearch, setOrderSearch] = useState('')
  const [orders, setOrders] = useState<Record<string, unknown>[]>([])
  const [form, setForm] = useState({
    prioridade: 'Normal',
    origem: 'Telefone',
    tipo: 'Reclamação',
    motivo_id: '',
    setor_id: '',
    descricao: '',
    pedido_id: '',
    nf_id: '',
  })

  useEffect(() => {
    Promise.all([getMotivos(), getSetores()]).then(([m, s]) => {
      setMotivos(m.filter((x) => x.active))
      setSetores(s.filter((x) => x.active))
      setLoading(false)
    })
  }, [])

  const handleCustomerSearch = async () => {
    const results = await searchCustomers(searchTerm)
    setCustomers(results)
  }
  const handleOrderSearch = async () => {
    const results = await searchOrders(orderSearch)
    setOrders(results)
  }
  const selectCustomer = (c: Record<string, unknown>) => {
    setSelectedCustomer(c)
    setCustomers([])
    setSearchTerm('')
  }
  const selectOrder = (o: Record<string, unknown>) => {
    setForm((p) => ({ ...p, pedido_id: (o.id as string) || '', nf_id: '' }))
    setOrders([])
    setOrderSearch('')
  }
  const handleMotivoChange = (motivoId: string) => {
    const motivo = motivos.find((m) => m.id === motivoId)
    setForm((p) => ({ ...p, motivo_id: motivoId, setor_id: motivo?.setor_id || '' }))
  }

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast({ title: 'Selecione um cliente', variant: 'destructive' })
      return
    }
    if (!form.motivo_id) {
      toast({ title: 'Selecione um motivo', variant: 'destructive' })
      return
    }
    if (!form.descricao.trim()) {
      toast({ title: 'Descrição é obrigatória', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        client_id: selectedCustomer.id,
        client_name: selectedCustomer.full_name || selectedCustomer.company_name || '',
        client_email: selectedCustomer.email || '',
        client_phone: selectedCustomer.phone || '',
        motivo_id: form.motivo_id,
        setor_id: form.setor_id,
        origem: form.origem,
        tipo: form.tipo,
        prioridade: form.prioridade,
        descricao: form.descricao,
        pedido_id: form.pedido_id,
        nf_id: form.nf_id,
        usuario_abertura: user?.id,
        empresa: (user as Record<string, unknown>)?.empresa_id || '',
        filial: (user as Record<string, unknown>)?.filial_id || '',
        affected_items: [],
        internal_comments: [],
        client_messages: [],
        sla_cumprido: false,
      }
      const rec = await createAtendimento(data)
      toast({ title: `Atendimento ${rec.protocol} criado` })
      navigate(`/admin/atendimento/detalhe/${rec.id}`)
    } catch {
      toast({ title: 'Erro ao criar atendimento', variant: 'destructive' })
    }
    setSaving(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const allowManualSetor = canAssignManual(user?.role as string)

  return (
    <div className="space-y-4 max-w-4xl">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <Label className="text-sm font-bold">Buscar Cliente</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomerSearch()}
                placeholder="Código, nome, CPF, CNPJ ou telefone..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Button
              onClick={handleCustomerSearch}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              Buscar
            </Button>
          </div>
          {customers.length > 0 && (
            <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
              {customers.map((c) => (
                <button
                  key={c.id as string}
                  onClick={() => selectCustomer(c)}
                  className="w-full text-left p-2 hover:bg-[#005B2E]/5 border-b border-border"
                >
                  <span className="font-medium">{c.full_name || c.company_name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{c.email}</span>
                </button>
              ))}
            </div>
          )}
          {selectedCustomer && (
            <div className="bg-[#005B2E]/5 rounded-lg p-3 flex items-center gap-2">
              <User className="w-5 h-5 text-[#005B2E]" />
              <div>
                <p className="font-bold text-sm">
                  {selectedCustomer.full_name || selectedCustomer.company_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedCustomer.email} • {selectedCustomer.phone}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <Label className="text-sm font-bold">Buscar Pedido / NF</Label>
          <div className="flex gap-2">
            <Input
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleOrderSearch()}
              placeholder="Número do pedido, NF ou chave..."
              className="focus-visible:ring-[#005B2E]"
            />
            <Button
              onClick={handleOrderSearch}
              variant="outline"
              className="border-[#005B2E] text-[#005B2E]"
            >
              Buscar
            </Button>
          </div>
          {orders.length > 0 && (
            <div className="border border-border rounded-lg max-h-40 overflow-y-auto">
              {orders.map((o) => (
                <button
                  key={o.id as string}
                  onClick={() => selectOrder(o)}
                  className="w-full text-left p-2 hover:bg-[#005B2E]/5 border-b border-border"
                >
                  <span className="font-mono text-xs font-bold">{o.order_number as string}</span>
                  <span className="text-sm ml-2">{o.client_name as string}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Prioridade *</Label>
              <Select
                value={form.prioridade}
                onValueChange={(v) => setForm((p) => ({ ...p, prioridade: v }))}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Origem *</Label>
              <Select
                value={form.origem}
                onValueChange={(v) => setForm((p) => ({ ...p, origem: v }))}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORIGENS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v }))}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Motivo *</Label>
              <Select value={form.motivo_id} onValueChange={handleMotivoChange}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {motivos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Setor (auto)</Label>
              <Select
                value={form.setor_id}
                onValueChange={(v) => allowManualSetor && setForm((p) => ({ ...p, setor_id: v }))}
                disabled={!allowManualSetor}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Auto" />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Descrição do Atendimento *</Label>
            <Textarea
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              rows={5}
              placeholder="Descreva o atendimento em detalhes..."
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/atendimento')}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}{' '}
              Criar Atendimento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

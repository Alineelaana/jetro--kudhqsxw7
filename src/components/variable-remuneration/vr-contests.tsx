import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { getContests, createContest, updateContest } from '@/services/variable-remuneration'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency } from '@/lib/variable-remuneration-types'
import { CONTEST_REASONS } from '@/lib/variable-remuneration-types'
import { Plus, Loader2, FileText, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

const REASON_LABELS: Record<string, string> = {
  pedido_nao_entrou: 'Pedido não entrou',
  cliente_devolveu: 'Cliente devolveu',
  valor_incorreto: 'Valor incorreto',
  meta_nao_considerada: 'Meta não considerada',
  produto_estrategico_nao_contabilizado: 'Produto estratégico não contabilizado',
  outro: 'Outro',
}

export function VrContests() {
  const [contests, setContests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [responseMap, setResponseMap] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setContests(await getContests())
    } catch {
      setContests([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('commission_contests', () => load())

  const handleCreate = async () => {
    if (!form.description?.trim()) {
      toast.error('Descrição é obrigatória')
      return
    }
    setSaving(true)
    try {
      const protocol = `CNT-${Date.now()}`
      await createContest({ ...form, protocol_number: protocol, status: 'aberta' })
      toast.success(`Contestação aberta: ${protocol}`)
      setDialogOpen(false)
      setForm({})
      load()
    } catch {
      toast.error('Erro ao abrir contestação')
    }
    setSaving(false)
  }

  const handleRespond = async (id: string, field: 'manager_response' | 'finance_response') => {
    try {
      await updateContest(id, {
        [field]: responseMap[id] || '',
        status: field === 'manager_response' ? 'respondida_gestor' : 'respondida_financeiro',
      })
      toast.success('Resposta enviada')
      load()
    } catch {
      toast.error('Erro')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Contestações</h3>
        <Button
          onClick={() => {
            setForm({})
            setDialogOpen(true)
          }}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Contestação
        </Button>
      </div>
      {contests.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma contestação aberta</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {contests.map((c) => (
            <Card key={c.id} className="border-2 border-[#005B2E]/20">
              <CardContent className="py-3 px-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-sm text-[#005B2E]">{c.protocol_number}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {c.vendedor_name || ''}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${c.status === 'aberta' ? 'bg-amber-100 text-amber-700' : c.status === 'resolvida' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-sm">
                  <strong>Motivo:</strong> {REASON_LABELS[c.reason] || c.reason}
                </p>
                <p className="text-sm">{c.description}</p>
                {c.manager_response && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Gestor:</strong> {c.manager_response}
                  </p>
                )}
                {c.finance_response && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Financeiro:</strong> {c.finance_response}
                  </p>
                )}
                {!c.manager_response && (
                  <div className="flex gap-2">
                    <Textarea
                      value={responseMap[c.id] || ''}
                      onChange={(e) => setResponseMap({ ...responseMap, [c.id]: e.target.value })}
                      placeholder="Resposta do gestor..."
                      rows={1}
                      className="focus-visible:ring-[#005B2E]"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleRespond(c.id, 'manager_response')}
                      className="bg-[#005B2E] text-white"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Contestação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Motivo *</Label>
              <Select
                value={form.reason || ''}
                onValueChange={(v) => setForm({ ...form, reason: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CONTEST_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {REASON_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Vendedor</Label>
              <Input
                value={form.vendedor_name || ''}
                onChange={(e) => setForm({ ...form, vendedor_name: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label>Descrição *</Label>
              <Textarea
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Abrir Contestação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

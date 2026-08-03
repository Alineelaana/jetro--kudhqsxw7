import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { AlertCircle, Loader2 } from 'lucide-react'
import { createManualBudget } from '@/services/budget-requests'
import { STATUS_OPTIONS } from '@/lib/types'
import { SERVICE_OPTIONS } from '@/lib/constants'
import { toast } from 'sonner'

const OPERATION_TYPES = [
  'Armazenagem de Produtos em Estoque',
  'Transporte de Cargas',
  'Distribuição Urbana e Last Mile',
  'Logística Portuária',
  'Cross Docking',
  'Gestão de Frota',
  'Operação Logística Completa',
]

const PERIODICITY_OPTIONS = ['Operação Única / Pontual', 'Contrato Recorrente', 'Projeto Urgente']

interface ManualBudgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  authorName: string
  authorEmail: string
  onSuccess?: () => void
}

export function ManualBudgetDialog({
  open,
  onOpenChange,
  authorName,
  authorEmail,
  onSuccess,
}: ManualBudgetDialogProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Record<string, string>>({
    client_name: '',
    client_email: '',
    client_phone: '',
    empresa: '',
    service: '',
    tipo_operacao: '',
    cidade_origem: '',
    cidade_destino: '',
    tipo_mercadoria: '',
    volume_estimado: '',
    periodicidade: '',
    mensagem: '',
    status: 'PENDENTE',
    responsible_email: '',
    responsible_phone: '',
  })

  useEffect(() => {
    if (open) {
      setForm({
        client_name: '',
        client_email: '',
        client_phone: '',
        empresa: '',
        service: '',
        tipo_operacao: '',
        cidade_origem: '',
        cidade_destino: '',
        tipo_mercadoria: '',
        volume_estimado: '',
        periodicidade: '',
        mensagem: '',
        status: 'PENDENTE',
        responsible_email: authorEmail,
        responsible_phone: '',
      })
      setError('')
    }
  }, [open, authorEmail])

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.client_name.trim()) {
      setError('Nome do cliente é obrigatório.')
      return
    }
    if (!form.client_email.trim()) {
      setError('E-mail do cliente é obrigatório.')
      return
    }
    if (!form.client_phone.trim()) {
      setError('Telefone do cliente é obrigatório.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createManualBudget({
        client_name: form.client_name,
        client_email: form.client_email,
        client_phone: form.client_phone,
        service: form.service,
        status: form.status,
        responsible_email: form.responsible_email,
        responsible_phone: form.responsible_phone,
        author_name: authorName,
        data: {
          empresa: form.empresa,
          tipo_operacao: form.tipo_operacao,
          cidade_origem: form.cidade_origem,
          cidade_destino: form.cidade_destino,
          tipo_mercadoria: form.tipo_mercadoria,
          volume_estimado: form.volume_estimado,
          periodicidade: form.periodicidade,
          mensagem: form.mensagem,
        },
      })
      toast.success('Orçamento criado com sucesso!')
      onOpenChange(false)
      onSuccess?.()
    } catch {
      setError('Erro ao criar orçamento. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">
            Criar Orçamento Manual
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente e da solicitação para gerar um novo orçamento.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nome do Cliente *</Label>
              <Input
                value={form.client_name}
                onChange={(e) => set('client_name', e.target.value)}
                placeholder="Nome completo"
                className="h-9 focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Empresa</Label>
              <Input
                value={form.empresa}
                onChange={(e) => set('empresa', e.target.value)}
                placeholder="Nome da empresa"
                className="h-9 focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">E-mail *</Label>
              <Input
                type="email"
                value={form.client_email}
                onChange={(e) => set('client_email', e.target.value)}
                placeholder="cliente@empresa.com.br"
                className="h-9 focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Telefone *</Label>
              <Input
                type="tel"
                value={form.client_phone}
                onChange={(e) => set('client_phone', e.target.value)}
                placeholder="(27) 99999-9999"
                className="h-9 focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Serviço de Interesse</Label>
              <Select value={form.service} onValueChange={(v) => set('service', v)}>
                <SelectTrigger className="h-9 bg-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {SERVICE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tipo de Operação</Label>
              <Select value={form.tipo_operacao} onValueChange={(v) => set('tipo_operacao', v)}>
                <SelectTrigger className="h-9 bg-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {OPERATION_TYPES.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Cidade de Origem</Label>
              <Input
                value={form.cidade_origem}
                onChange={(e) => set('cidade_origem', e.target.value)}
                placeholder="Ex: Vitória"
                className="h-9 focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Cidade de Destino</Label>
              <Input
                value={form.cidade_destino}
                onChange={(e) => set('cidade_destino', e.target.value)}
                placeholder="Ex: São Paulo"
                className="h-9 focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tipo de Mercadoria</Label>
              <Input
                value={form.tipo_mercadoria}
                onChange={(e) => set('tipo_mercadoria', e.target.value)}
                placeholder="Ex: Eletrônicos"
                className="h-9 focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Volume Estimado</Label>
              <Input
                value={form.volume_estimado}
                onChange={(e) => set('volume_estimado', e.target.value)}
                placeholder="Ex: 50 paletes"
                className="h-9 focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Periodicidade</Label>
              <Select value={form.periodicidade} onValueChange={(v) => set('periodicidade', v)}>
                <SelectTrigger className="h-9 bg-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {PERIODICITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger className="h-9 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">E-mail do Responsável</Label>
              <Input
                type="email"
                value={form.responsible_email}
                onChange={(e) => set('responsible_email', e.target.value)}
                placeholder="responsavel@veloralog.com.br"
                className="h-9 focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Telefone do Responsável</Label>
              <Input
                type="tel"
                value={form.responsible_phone}
                onChange={(e) => set('responsible_phone', e.target.value)}
                placeholder="(27) 99999-9999"
                className="h-9 focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Observações</Label>
            <Textarea
              value={form.mensagem}
              onChange={(e) => set('mensagem', e.target.value)}
              placeholder="Observações sobre a operação..."
              rows={2}
              className="resize-none focus-visible:ring-[#005B2E] text-xs"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Criar Orçamento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

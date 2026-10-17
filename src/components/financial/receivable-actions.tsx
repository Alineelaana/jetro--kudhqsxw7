import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Loader2 } from 'lucide-react'
import { updateReceivable, createBoleto, createPix } from '@/services/financial'
import { toast } from 'sonner'

const RECEIPT_FORMS = [
  'Boleto',
  'PIX',
  'Transferência',
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
]

export function ReceiptDialog({
  open,
  onOpenChange,
  record,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  record: any
  onSaved: () => void
}) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const handleConfirm = async () => {
    const valorRecebido = parseFloat(form.valor_recebido || record?.valor_original || '0')
    const valorOriginal = parseFloat(record?.valor_original || '0')
    const isPartial = valorRecebido < valorOriginal
    setSaving(true)
    try {
      await updateReceivable(record.id, {
        status: isPartial ? 'Parcialmente Recebido' : 'Recebido',
        valor_recebido: String(valorRecebido),
        data_recebimento: form.data_recebimento || new Date().toISOString().split('T')[0],
        forma_recebimento: form.forma_recebimento || '',
        conta_bancaria: form.conta_bancaria || '',
      })
      toast.success(isPartial ? 'Recebimento parcial registrado' : 'Recebimento confirmado')
      onOpenChange(false)
      setForm({})
      onSaved()
    } catch {
      toast.error('Erro ao registrar recebimento')
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">Confirmar Recebimento</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm space-y-1">
            <p>
              <strong>Título:</strong> {record?.numero_titulo || '—'}
            </p>
            <p>
              <strong>Cliente:</strong> {record?.cliente || '—'}
            </p>
            <p>
              <strong>Valor Original:</strong> R$ {record?.valor_original || '0,00'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Valor Recebido *</Label>
              <Input
                type="number"
                defaultValue={record?.valor_original || ''}
                onChange={(e) => setForm({ ...form, valor_recebido: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Data Recebimento</Label>
              <Input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm({ ...form, data_recebimento: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Forma de Recebimento</Label>
              <Select
                value={form.forma_recebimento || ''}
                onValueChange={(v) => setForm({ ...form, forma_recebimento: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {RECEIPT_FORMS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Conta Bancária</Label>
              <Input
                value={form.conta_bancaria || ''}
                onChange={(e) => setForm({ ...form, conta_bancaria: e.target.value })}
                placeholder="Ex: BB 12345-6"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export async function generateBoletoFromReceivable(record: any): Promise<void> {
  const nossoNumero = Date.now().toString().substring(0, 10)
  await createBoleto({
    cliente: record.cliente || '',
    titulo_id: record.id,
    nosso_numero: nossoNumero,
    linha_digitavel: `00190.00095 01234.560000 00000.${nossoNumero.substring(0, 6)} 1 9876${(parseFloat(record.valor_original || '0') * 100).toFixed(0).padStart(10, '0')}`,
    valor: record.valor_original || '0',
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: record.data_vencimento || '',
    banco: record.conta_bancaria || 'Banco do Brasil',
    status: 'Registrado',
    empresa: record.empresa || 'Jetro Logística',
    filial: record.filial || 'Matriz',
  })
}

export async function generatePixFromReceivable(record: any): Promise<void> {
  await createPix({
    cliente: record.cliente || '',
    titulo_id: record.id,
    identificador_transacao: `PIX-${Date.now().toString(36).toUpperCase()}`,
    chave_pix: 'jetro@pix.com.br',
    valor: record.valor_original || '0',
    data_geracao: new Date().toISOString().split('T')[0],
    data_vencimento: record.data_vencimento || '',
    status: 'Gerado',
    tipo_pix: 'Dinâmico',
    empresa: record.empresa || 'Jetro Logística',
    filial: record.filial || 'Matriz',
  })
}

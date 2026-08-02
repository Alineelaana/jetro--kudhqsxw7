import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { ServicePicker } from '@/components/service-picker'
import { createContractOperation, updateContractOperation } from '@/services/contracts-operations'
import {
  CONTRACT_STATUS_OPTIONS,
  type ContractOperation,
  type ContractService,
} from '@/lib/contract-types'
import { AlertCircle, Loader2, Save } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  contract: ContractOperation | null
  onSuccess: () => void
}

function parseBR(v: string): number {
  if (!v) return 0
  const s = v.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')
  return parseFloat(s) || 0
}

export function ContractFormDialog({ open, onOpenChange, contract, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [selectedServices, setSelectedServices] = useState<ContractService[]>([])
  const [status, setStatus] = useState<string>('Rascunho')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(contract?.name || '')
      setSelectedServices(contract?.services || [])
      setStatus(contract?.status || 'Rascunho')
      setError('')
    }
  }, [open, contract])

  const totalValue = useMemo(
    () => selectedServices.reduce((sum, s) => sum + parseBR(s.value || ''), 0),
    [selectedServices],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Nome do contrato/operação é obrigatório.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const data = {
        name: name.trim(),
        services: selectedServices,
        total_value: totalValue.toFixed(2).replace('.', ','),
        status,
      }
      if (contract) {
        await updateContractOperation(contract.id, data)
        toast({ title: 'Contrato/Operação atualizado' })
      } else {
        await createContractOperation(data)
        toast({ title: 'Contrato/Operação criado' })
      }
      onSuccess()
      onOpenChange(false)
    } catch {
      setError('Erro ao salvar contrato/operação.')
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">
            {contract ? 'Editar Contrato/Operação' : 'Novo Contrato/Operação'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nome do contrato/operação *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Contrato Logística Vitória 2026"
              className="focus-visible:ring-[#005B2E]"
            />
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Serviços</Label>
            <ServicePicker selectedServices={selectedServices} onChange={setSelectedServices} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Valor total (automático)</Label>
              <div className="h-10 px-3 flex items-center rounded-md border border-input bg-muted/50 text-sm font-bold text-[#005B2E]">
                R$ {totalValue.toFixed(2).replace('.', ',')}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}{' '}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

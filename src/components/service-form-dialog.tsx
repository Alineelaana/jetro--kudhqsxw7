import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Loader2, Save } from 'lucide-react'
import { createServiceOffered, updateServiceOffered } from '@/services/services-offered'
import { type ServiceOffered } from '@/lib/service-types'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ServiceOffered | null
  onSuccess: () => void
}

export function ServiceFormDialog({ open, onOpenChange, service, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')
  const [maxDiscount, setMaxDiscount] = useState('')
  const [observations, setObservations] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(service?.name || '')
      setDescription(service?.description || '')
      setValue(service?.value || '')
      setMaxDiscount(service?.max_discount != null ? String(service.max_discount) : '')
      setObservations(service?.observations || '')
      setErrors({})
    }
  }, [open, service])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Nome do serviço é obrigatório.'
    if (
      maxDiscount &&
      (isNaN(Number(maxDiscount)) || Number(maxDiscount) < 0 || Number(maxDiscount) > 100)
    ) {
      e.max_discount = 'Percentual deve estar entre 0 e 100.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const data = {
        name: name.trim(),
        description: description.trim(),
        value: value.trim(),
        max_discount: maxDiscount ? Number(maxDiscount) : 0,
        observations: observations.trim(),
        active: service ? service.active : true,
      }
      if (service) {
        await updateServiceOffered(service.id, data)
        toast({ title: 'Serviço atualizado' })
      } else {
        await createServiceOffered(data)
        toast({ title: 'Serviço cadastrado' })
      }
      onSuccess()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro ao salvar serviço', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">
            {service ? 'Editar Serviço' : 'Novo Cadastro de Serviço'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nome do serviço *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Transporte de Cargas"
              className="focus-visible:ring-[#005B2E]"
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Descrição detalhada do serviço</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Valor do serviço (R$)</Label>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ex: 1.500,00"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Percentual máximo de desconto (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Ex: 10"
                className="focus-visible:ring-[#005B2E]"
              />
              {errors.max_discount && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.max_discount}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Observações</Label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
              className="focus-visible:ring-[#005B2E]"
            />
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

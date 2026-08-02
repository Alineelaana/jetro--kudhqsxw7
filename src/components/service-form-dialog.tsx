import { useState, useEffect, useMemo } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Loader2, Save, Plus, Hash } from 'lucide-react'
import { createServiceOffered, updateServiceOffered } from '@/services/services-offered'
import { getServiceAreas, createServiceArea, type ServiceArea } from '@/services/service-areas'
import { type ServiceOffered } from '@/lib/service-types'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ServiceOffered | null
  onSuccess: () => void
}

const parseBR = (v: string): number => {
  if (!v) return 0
  const s = v.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')
  return parseFloat(s) || 0
}

export function ServiceFormDialog({ open, onOpenChange, service, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')
  const [taxValue, setTaxValue] = useState('')
  const [maxDiscount, setMaxDiscount] = useState('')
  const [professionalName, setProfessionalName] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [observations, setObservations] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [areas, setAreas] = useState<ServiceArea[]>([])
  const [showNewArea, setShowNewArea] = useState(false)
  const [newAreaName, setNewAreaName] = useState('')
  const [creatingArea, setCreatingArea] = useState(false)

  const totalValue = useMemo(() => {
    const v = parseBR(value)
    const t = parseBR(taxValue)
    return (v + t).toFixed(2).replace('.', ',')
  }, [value, taxValue])

  useEffect(() => {
    if (open) {
      setName(service?.name || '')
      setDescription(service?.description || '')
      setValue(service?.value || '')
      setTaxValue(service?.tax_value || '')
      setMaxDiscount(service?.max_discount != null ? String(service.max_discount) : '')
      setProfessionalName(service?.professional_name || '')
      setSelectedArea(service?.service_area || '')
      setObservations(service?.observations || '')
      setErrors({})
      setShowNewArea(false)
      setNewAreaName('')
      getServiceAreas()
        .then(setAreas)
        .catch(() => {})
    }
  }, [open, service])

  const handleCreateArea = async () => {
    if (!newAreaName.trim()) return
    setCreatingArea(true)
    try {
      const newArea = await createServiceArea(newAreaName.trim())
      setAreas((prev) => [...prev, newArea])
      setSelectedArea(newArea.name)
      setShowNewArea(false)
      setNewAreaName('')
      toast({ title: 'Área cadastrada' })
    } catch {
      toast({ title: 'Erro ao cadastrar área', variant: 'destructive' })
    }
    setCreatingArea(false)
  }

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
        tax_value: taxValue.trim(),
        max_discount: maxDiscount ? Number(maxDiscount) : 0,
        professional_name: professionalName.trim(),
        service_area: selectedArea,
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
              <Label className="text-sm font-semibold">Valor do imposto (R$)</Label>
              <Input
                value={taxValue}
                onChange={(e) => setTaxValue(e.target.value)}
                placeholder="Ex: 285,00"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Valor total (automático)</Label>
              <div className="h-10 px-3 flex items-center rounded-md border border-input bg-muted/50 text-sm font-bold text-[#005B2E]">
                R$ {totalValue}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Desconto máximo (%)</Label>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nome do profissional</Label>
              <Input
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                placeholder="Ex: João Silva"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Área vinculada</Label>
              <Select
                value={selectedArea}
                onValueChange={(v) => {
                  if (v === '__new__') {
                    setShowNewArea(true)
                    setSelectedArea('')
                  } else {
                    setShowNewArea(false)
                    setSelectedArea(v)
                  }
                }}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.name}>
                      {a.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">➕ Cadastrar nova área...</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {showNewArea && (
            <div className="flex gap-2">
              <Input
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                placeholder="Nome da nova área"
                className="focus-visible:ring-[#005B2E]"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateArea())}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCreateArea}
                disabled={creatingArea || !newAreaName.trim()}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                {creatingArea ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Observações</Label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          {service?.service_code ? (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border border-border">
              <Hash className="w-4 h-4 text-[#C89B3C]" />
              <span className="text-sm text-muted-foreground">Código do serviço:</span>
              <span className="text-sm font-bold text-[#005B2E]">{service.service_code}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              O código do serviço será gerado automaticamente após salvar.
            </p>
          )}
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

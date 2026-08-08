import { useState, useEffect } from 'react'
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
import { toast } from 'sonner'
import { getBusinessDaysConfig, saveBusinessDaysConfig } from '@/services/projection'
import { suggestBusinessDays } from '@/lib/projection-utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mes: number
  ano: number
  empresa?: string
  filial?: string
}

export function ProjectionConfigDialog({ open, onOpenChange, mes, ano, empresa, filial }: Props) {
  const [total, setTotal] = useState(22)
  const [configInfo, setConfigInfo] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setTotal(suggestBusinessDays(mes, ano))
    setConfigInfo('')
    getBusinessDaysConfig(mes, ano, empresa, filial).then((cfg) => {
      if (cfg) {
        setTotal(cfg.total_business_days)
        setConfigInfo(
          `Configurado por: ${cfg.responsible_user_name} | Última alteração: ${new Date(cfg.last_change_date).toLocaleString('pt-BR')}`,
        )
      } else {
        setConfigInfo('Nenhuma configuração encontrada. Valor sugerido pelo calendário.')
      }
    })
  }, [open, mes, ano, empresa, filial])

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveBusinessDaysConfig({ mes, ano, total_business_days: total, empresa, filial })
      toast.success('Configuração de dias úteis salva')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao salvar configuração')
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Configurar Dias Úteis — {String(mes).padStart(2, '0')}/{ano}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>Total de Dias Úteis do Mês</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={total}
              onChange={(e) => setTotal(parseInt(e.target.value) || 22)}
            />
          </div>
          <p className="text-xs text-muted-foreground">{configInfo}</p>
          <p className="text-xs text-[#005B2E]">
            Sugestão do calendário: {suggestBusinessDays(mes, ano)} dias (sem feriados)
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D]"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

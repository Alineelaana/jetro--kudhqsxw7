import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { updateFinancialHistory } from '@/services/partners'
import { type FinancialEntry } from '@/lib/partner-types'
import { FINANCIAL_RECORD_TYPES } from '@/lib/partner-constants'
import type { PartnerRecord } from '@/components/partner-shared'
import { Plus, Loader2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  partner: PartnerRecord | null
  responsibleUser: string
  onSuccess: () => void
}

export function PartnerFinancialDialog({
  open,
  onOpenChange,
  partner,
  responsibleUser,
  onSuccess,
}: Props) {
  const [entries, setEntries] = useState<FinancialEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [newEntry, setNewEntry] = useState<Omit<FinancialEntry, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    responsible_user: responsibleUser,
    type: FINANCIAL_RECORD_TYPES[0],
    amount: '',
    description: '',
  })

  useEffect(() => {
    setEntries((partner?.financial_history as unknown as FinancialEntry[]) || [])
    setNewEntry((p) => ({ ...p, responsible_user: responsibleUser }))
  }, [partner, responsibleUser])

  const handleAdd = () => {
    if (!newEntry.description.trim()) return
    setEntries((prev) => [
      { ...newEntry, id: crypto.randomUUID(), responsible_user: responsibleUser },
      ...prev,
    ])
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      responsible_user: responsibleUser,
      type: FINANCIAL_RECORD_TYPES[0],
      amount: '',
      description: '',
    })
  }

  const handleSave = async () => {
    if (!partner) return
    setSaving(true)
    try {
      await updateFinancialHistory(partner.id, entries)
      toast({
        title: 'Financeiro salvo',
        description: 'Histórico financeiro atualizado com sucesso.',
      })
      onSuccess()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' })
    }
    setSaving(false)
  }

  const isNegative = (type: string) => type === 'Pagamento em atraso' || type === 'Restrição'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Financeiro — {partner?.full_name || partner?.company_name || 'Parceiro'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-bold text-[#005B2E]">Adicionar lançamento</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data</Label>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo do registro</Label>
                <Select
                  value={newEntry.type}
                  onValueChange={(v) => setNewEntry({ ...newEntry, type: v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FINANCIAL_RECORD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Valor (quando aplicável)</Label>
                <Input
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                  placeholder="R$ 0,00"
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Usuário responsável</Label>
                <Input value={responsibleUser} disabled className="h-9 bg-muted/50" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Descrição</Label>
                <Input
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  placeholder="Descrição"
                  className="h-9"
                />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </div>
          <div className="space-y-2">
            {entries.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhum lançamento registrado.
              </p>
            ) : (
              entries.map((e) => (
                <div
                  key={e.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${isNegative(e.type) ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isNegative(e.type) ? (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      )}
                      <span className="font-bold text-sm">{e.type}</span>
                      {e.amount && (
                        <span
                          className={`text-sm font-bold ${isNegative(e.type) ? 'text-red-600' : 'text-emerald-600'}`}
                        >
                          {e.amount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/90 mt-1">{e.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {e.date} — {e.responsible_user || 'Sistema'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Os registros financeiros são permanentes e não podem
            ser excluídos.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

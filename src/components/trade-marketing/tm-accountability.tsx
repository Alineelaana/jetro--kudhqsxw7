import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, FileCheck, Loader2 } from 'lucide-react'
import { mkGetList, mkCreate } from '@/services/mk'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

export function TmAccountability() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({
    objective: '',
    supplier: '',
    investment: '',
    status: 'rascunho',
  })

  const load = async () => {
    setLoading(true)
    try {
      setItems(await mkGetList('mk_accountability'))
    } catch (err) {
      setItems([])
      toast.error(getErrorMessage(err))
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSave = async () => {
    if (!form.objective?.trim()) {
      toast.error('Informe o objetivo da prestação')
      return
    }
    setSaving(true)
    try {
      await mkCreate('mk_accountability', form)
      toast.success('Prestação de contas criada')
      setDialogOpen(false)
      setForm({ objective: '', supplier: '', investment: '', status: 'rascunho' })
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-[#005B2E]">Prestação de Contas</h2>
        <Button
          size="sm"
          className="bg-[#005B2E] hover:bg-[#01361D]"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" /> Nova Prestação
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#005B2E] animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="border-2 border-dashed border-[#005B2E]/30">
          <CardContent className="py-12 text-center">
            <FileCheck className="w-10 h-10 text-[#005B2E]/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma prestação de contas cadastrada.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Vincule ações, verbas, evidências e ROI para gerar apresentações profissionais
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[#005B2E]">{item.objective || '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.supplier || '—'} • {item.status || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Investimento</p>
                  <p className="text-sm font-semibold text-[#005B2E]">
                    R$ {item.investment || '0'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Prestação de Contas</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Objetivo *</Label>
              <Input
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                placeholder="Descreva o objetivo"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Input
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="Nome do fornecedor"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Investimento (R$)</Label>
              <Input
                type="number"
                value={form.investment}
                onChange={(e) => setForm({ ...form, investment: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

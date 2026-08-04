import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  FinancialTable,
  FinancialEmptyState,
  FinancialLoading,
  StatusBadge,
} from '@/components/financial/financial-shared'
import { getCashRegisters, getCashMovements, finCreate, finUpdate } from '@/services/financial'
import { useRealtime } from '@/hooks/use-realtime'
import { CASH_REGISTER_STATUS } from '@/lib/financial-types'
import { Plus, Lock, Unlock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function FinancialCashRegister() {
  const [registers, setRegisters] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [regs, movs] = await Promise.all([getCashRegisters(), getCashMovements()])
      setRegisters(regs)
      setMovements(movs)
    } catch {
      setRegisters([])
      setMovements([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('financial_cash_registers', () => load())
  useRealtime('financial_cash_movements', () => load())

  const openNew = () => {
    setForm({ status: 'Fechado', saldo_inicial: '0' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome_caixa) {
      toast.error('Nome do caixa é obrigatório')
      return
    }
    setSaving(true)
    try {
      await finCreate('financial_cash_registers', form)
      toast.success('Caixa criado')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro')
    }
    setSaving(false)
  }

  const handleOpen = async (r: any) => {
    try {
      await finUpdate('financial_cash_registers', r.id, {
        status: 'Aberto',
        data_abertura: new Date().toISOString(),
      })
      toast.success('Caixa aberto')
      load()
    } catch {
      toast.error('Erro')
    }
  }

  const handleClose = async (r: any) => {
    try {
      await finUpdate('financial_cash_registers', r.id, {
        status: 'Em Conferência',
        data_fechamento: new Date().toISOString(),
      })
      toast.success('Caixa em conferência')
      load()
    } catch {
      toast.error('Erro')
    }
  }

  const fmt = (v: string) =>
    v ? parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Caixa</h3>
        <Button onClick={openNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Novo Caixa
        </Button>
      </div>
      {loading ? (
        <FinancialLoading />
      ) : registers.length === 0 ? (
        <FinancialEmptyState message="Nenhum caixa registrado" />
      ) : (
        <>
          <FinancialTable
            headers={['Caixa', 'Operador', 'Saldo Inicial', 'Abertura', 'Status', 'Ações']}
          >
            {registers.map((r) => (
              <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                <td className="px-3 py-3 font-medium">{r.nome_caixa || '—'}</td>
                <td className="px-3 py-3">{r.operador || '—'}</td>
                <td className="px-3 py-3 font-bold">{fmt(r.saldo_inicial)}</td>
                <td className="px-3 py-3 text-xs">
                  {r.data_abertura ? new Date(r.data_abertura).toLocaleString('pt-BR') : '—'}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-3 py-3">
                  {r.status === 'Fechado' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpen(r)}
                      className="text-emerald-600 hover:bg-emerald-50 h-8"
                    >
                      <Unlock className="w-3.5 h-3.5 mr-1" /> Abrir
                    </Button>
                  ) : r.status === 'Aberto' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleClose(r)}
                      className="text-orange-600 hover:bg-orange-50 h-8"
                    >
                      <Lock className="w-3.5 h-3.5 mr-1" /> Fechar
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </FinancialTable>
          {movements.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-bold mb-2">Movimentações de Caixa</h4>
              <FinancialTable
                headers={['Data/Hora', 'Tipo', 'Valor', 'Forma Pagamento', 'Documento']}
              >
                {movements.slice(0, 20).map((m) => (
                  <tr key={m.id} className="border-b border-border">
                    <td className="px-3 py-2 text-xs">{m.data_hora || '—'}</td>
                    <td className="px-3 py-2">{m.tipo_movimento || '—'}</td>
                    <td className="px-3 py-2 font-bold">{fmt(m.valor)}</td>
                    <td className="px-3 py-2 text-xs">{m.forma_pagamento || '—'}</td>
                    <td className="px-3 py-2 text-xs">{m.documento || '—'}</td>
                  </tr>
                ))}
              </FinancialTable>
            </div>
          )}
        </>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Caixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Nome do Caixa *</Label>
              <Input
                value={form.nome_caixa || ''}
                onChange={(e) => setForm({ ...form, nome_caixa: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Empresa</Label>
              <Input
                value={form.empresa || ''}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Filial</Label>
              <Input
                value={form.filial || ''}
                onChange={(e) => setForm({ ...form, filial: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Operador</Label>
              <Input
                value={form.operador || ''}
                onChange={(e) => setForm({ ...form, operador: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Saldo Inicial</Label>
              <Input
                value={form.saldo_inicial || '0'}
                onChange={(e) => setForm({ ...form, saldo_inicial: e.target.value })}
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
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

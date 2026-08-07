import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SA_COLLECTIONS, saGetList, saCreate, estornoMovement } from '@/services/supplier-allowance'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { DIRECTIONS, formatBRL } from '@/lib/supplier-allowance-types'
import { Plus, Search, Loader2, ArrowDownLeft, ArrowUpRight, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

const MANUAL_MOVEMENT_TYPES = [
  { value: 'lancamento', label: 'Lançamento' },
  { value: 'ajuste', label: 'Ajuste' },
]

export function SaMovements() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [estornoTarget, setEstornoTarget] = useState<any | null>(null)
  const [estornoReason, setEstornoReason] = useState('')
  const [estornoLoading, setEstornoLoading] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setRecords(await saGetList(SA_COLLECTIONS.movements))
      setAccounts(await saGetList(SA_COLLECTIONS.accounts))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(SA_COLLECTIONS.movements, () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return (
      !q ||
      (r.document_number || '').toLowerCase().includes(q) ||
      (r.movement_type || '').toLowerCase().includes(q)
    )
  })

  const handleSave = async () => {
    if (!form.account || !form.value) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    try {
      await saCreate(SA_COLLECTIONS.movements, {
        ...form,
        user: user?.name || '',
        timestamp: new Date().toISOString(),
        workflow_state: 'completed',
        source: 'usuario',
      })
      toast.success('Lançamento registrado')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao registrar')
    }
  }

  const handleEstorno = async () => {
    if (!estornoReason.trim()) {
      toast.error('Informe o motivo do estorno')
      return
    }
    setEstornoLoading(true)
    try {
      await estornoMovement(estornoTarget.id, estornoReason)
      toast.success('Estorno registrado')
      setEstornoTarget(null)
      setEstornoReason('')
      load()
    } catch {
      toast.error('Erro ao estornar')
    }
    setEstornoLoading(false)
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
        <h3 className="text-lg font-bold">Movimentações — Corporate Ledger</h3>
        <Button
          onClick={() => {
            setForm({ movement_type: 'lancamento', direction: 'credito', currency: 'BRL' })
            setDialogOpen(true)
          }}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
        </Button>
      </div>
      <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded p-2">
        As movimentações são imutáveis. Estornos e ajustes criam novos lançamentos corretivos,
        preservando o histórico completo.
      </p>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar movimentos..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Tipo</th>
                <th className="text-left px-3 py-3 font-bold">Direção</th>
                <th className="text-left px-3 py-3 font-bold">Valor</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Documento</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
                <th className="text-center px-3 py-3 font-bold">Estorno</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum movimento encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 font-medium capitalize">{r.movement_type || '—'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${r.direction === 'credito' ? 'text-emerald-600' : 'text-red-600'}`}
                      >
                        {r.direction === 'credito' ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {r.direction || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-bold">R$ {formatBRL(r.value)}</td>
                    <td className="px-3 py-3 hidden sm:table-cell text-xs font-mono">
                      {r.document_number || '—'}
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell text-xs">
                      {r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {r.movement_type !== 'estorno' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEstornoTarget(r)
                            setEstornoReason('')
                          }}
                          className="text-amber-600 hover:bg-amber-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Lançamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Conta *</Label>
              <Select
                value={form.account || ''}
                onValueChange={(v) => setForm({ ...form, account: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.id.substring(0, 8)} — R$ {formatBRL(a.current_balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo *</Label>
                <Select
                  value={form.movement_type || ''}
                  onValueChange={(v) => setForm({ ...form, movement_type: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MANUAL_MOVEMENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Direção *</Label>
                <Select
                  value={form.direction || ''}
                  onValueChange={(v) => setForm({ ...form, direction: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                value={form.value || ''}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Observações</Label>
              <Input
                value={form.observations || ''}
                onChange={(e) => setForm({ ...form, observations: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!estornoTarget}
        onOpenChange={(o) => {
          if (!o) setEstornoTarget(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Estornar Movimento</DialogTitle>
          </DialogHeader>
          {estornoTarget && (
            <div className="space-y-3">
              <div className="bg-muted rounded p-3 text-sm space-y-1">
                <p>
                  <strong>Tipo:</strong> {estornoTarget.movement_type}
                </p>
                <p>
                  <strong>Direção:</strong> {estornoTarget.direction}
                </p>
                <p>
                  <strong>Valor:</strong> R$ {formatBRL(estornoTarget.value)}
                </p>
                <p>
                  <strong>Documento:</strong> {estornoTarget.document_number || '—'}
                </p>
              </div>
              <div>
                <Label>Motivo do Estorno *</Label>
                <Input
                  value={estornoReason}
                  onChange={(e) => setEstornoReason(e.target.value)}
                  placeholder="Descreva o motivo..."
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <p className="text-xs text-amber-600">
                Um novo movimento de estorno será criado com direção oposta, preservando o
                histórico.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEstornoTarget(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEstorno}
              disabled={estornoLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {estornoLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Confirmar
              Estorno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

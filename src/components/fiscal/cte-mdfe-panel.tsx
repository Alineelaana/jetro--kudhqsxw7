import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  getCteRecords,
  createCteRecord,
  updateCteRecord,
  getMdfeRecords,
  createMdfeRecord,
  updateMdfeRecord,
  logFiscalAudit,
} from '@/services/fiscal'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { CTE_STATUS, MDFE_STATUS, STATUS_COLORS } from '@/lib/fiscal-types'
import { Loader2, Plus, Truck, FileText, AlertTriangle, Search, Check } from 'lucide-react'
import { toast } from 'sonner'

export function CtePanel() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setRecords(await getCteRecords())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('cte_records', () => load())

  const filtered = records.filter(
    (r) =>
      !search ||
      (r.cte_number as string)?.includes(search) ||
      (r.tomador as string)?.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = async () => {
    if (!form.tomador || !form.valor_prestacao) {
      toast.error('Tomador e Valor são obrigatórios')
      return
    }
    try {
      const userName = (user?.name as string) || 'Sistema'
      await createCteRecord({
        ...form,
        status: 'Autorizada',
        authorization_protocol: String(Date.now()),
        responsible_user: userName,
        company: 'Jetro Logística',
        branch: 'Matriz',
      })
      logFiscalAudit('create', 'cte_records', '', `CT-e emitida para ${form.tomador}`)
      toast.success('CT-e emitida')
      setOpen(false)
      setForm({})
      load()
    } catch {
      toast.error('Erro ao emitir CT-e')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#005B2E]" /> CT-e — Conhecimento de Transporte
        </h3>
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo CT-e
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar CT-e..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
        </CardContent>
      </Card>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum CT-e encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nº CT-e</th>
                  <th className="text-left px-3 py-3 font-bold">Tomador</th>
                  <th className="text-left px-3 py-3 font-bold">Rota</th>
                  <th className="text-left px-3 py-3 font-bold">Valor</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id as string} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {(r.cte_number as string) || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">{(r.tomador as string) || '—'}</td>
                    <td className="px-3 py-3 text-xs">
                      {(r.origem as string) || '—'} → {(r.destino as string) || '—'}
                    </td>
                    <td className="px-3 py-3 font-bold">
                      R$ {(r.valor_prestacao as string) || '0,00'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[r.status as string] || ''}`}
                      >
                        {r.status as string}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo CT-e</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select
                value={form.cte_type || 'normal'}
                onValueChange={(v) => setForm({ ...form, cte_type: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="complementar">Complementar</SelectItem>
                  <SelectItem value="anulacao">Anulação</SelectItem>
                  <SelectItem value="substituicao">Substituição</SelectItem>
                  <SelectItem value="redespacho">Redespacho</SelectItem>
                  <SelectItem value="subcontratacao">Subcontratação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tomador *</Label>
              <Input
                value={form.tomador || ''}
                onChange={(e) => setForm({ ...form, tomador: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Remetente</Label>
              <Input
                value={form.remetente || ''}
                onChange={(e) => setForm({ ...form, remetente: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Destinatário</Label>
              <Input
                value={form.destinatario || ''}
                onChange={(e) => setForm({ ...form, destinatario: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Origem</Label>
              <Input
                value={form.origem || ''}
                onChange={(e) => setForm({ ...form, origem: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Destino</Label>
              <Input
                value={form.destino || ''}
                onChange={(e) => setForm({ ...form, destino: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Valor da Prestação *</Label>
              <Input
                type="number"
                value={form.valor_prestacao || ''}
                onChange={(e) => setForm({ ...form, valor_prestacao: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">CBS (%)</Label>
              <Input
                type="number"
                value={form.cbs || ''}
                onChange={(e) => setForm({ ...form, cbs: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">IBS (%)</Label>
              <Input
                type="number"
                value={form.ibs || ''}
                onChange={(e) => setForm({ ...form, ibs: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Veículo</Label>
              <Input
                value={form.veiculo || ''}
                onChange={(e) => setForm({ ...form, veiculo: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Motorista</Label>
              <Input
                value={form.motorista || ''}
                onChange={(e) => setForm({ ...form, motorista: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Observações</Label>
              <Input
                value={form.observacoes || ''}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              <Check className="w-4 h-4 mr-2" /> Emitir CT-e
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function MdfePanel() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setRecords(await getMdfeRecords())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('mdfe_records', () => load())

  const filtered = records.filter((r) => !search || (r.mdfe_number as string)?.includes(search))
  const unclosed = records.filter((r) => r.status === 'Autorizada' && !r.encerrado)

  const handleSave = async () => {
    if (!form.uf_carregamento || !form.veiculo) {
      toast.error('UF e Veículo são obrigatórios')
      return
    }
    try {
      const userName = (user?.name as string) || 'Sistema'
      await createMdfeRecord({
        ...form,
        status: 'Autorizada',
        authorization_protocol: String(Date.now()),
        encerrado: false,
        responsible_user: userName,
        company: 'Jetro Logística',
        branch: 'Matriz',
      })
      logFiscalAudit('create', 'mdfe_records', '', `MDF-e emitido - ${form.uf_carregamento}`)
      toast.success('MDF-e emitido')
      setOpen(false)
      setForm({})
      load()
    } catch {
      toast.error('Erro ao emitir MDF-e')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#005B2E]" /> MDF-e — Manifesto Eletrônico
        </h3>
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo MDF-e
        </Button>
      </div>
      {unclosed.length > 0 && (
        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardContent className="py-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-bold text-amber-700">
              {unclosed.length} MDF-e autorizado(s) não encerrado(s)!
            </span>
          </CardContent>
        </Card>
      )}
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar MDF-e..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
        </CardContent>
      </Card>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum MDF-e encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nº MDF-e</th>
                  <th className="text-left px-3 py-3 font-bold">UF Carga</th>
                  <th className="text-left px-3 py-3 font-bold">UF Descarga</th>
                  <th className="text-left px-3 py-3 font-bold">Veículo</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-center px-3 py-3 font-bold">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id as string} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {(r.mdfe_number as string) || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">{(r.uf_carregamento as string) || '—'}</td>
                    <td className="px-3 py-3">{(r.uf_descarregamento as string) || '—'}</td>
                    <td className="px-3 py-3 text-xs">{(r.veiculo as string) || '—'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[r.status as string] || ''}`}
                      >
                        {r.status as string}
                        {r.encerrado ? ' ✓' : ''}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {r.status === 'Autorizada' && !r.encerrado && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            await updateMdfeRecord(r.id as string, {
                              encerrado: true,
                              data_encerramento: new Date().toISOString(),
                              status: 'Encerrada',
                            })
                            toast.success('MDF-e encerrado')
                            load()
                          }}
                          className="text-emerald-600"
                        >
                          Encerrar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo MDF-e</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tipo de Emitente</Label>
              <Select
                value={form.tipo_emitente || 'transportadora'}
                onValueChange={(v) => setForm({ ...form, tipo_emitente: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transportadora">Transportadora</SelectItem>
                  <SelectItem value="carga_propria">Carga Própria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">UF Carregamento *</Label>
              <Input
                value={form.uf_carregamento || ''}
                onChange={(e) => setForm({ ...form, uf_carregamento: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">UF Descarregamento</Label>
              <Input
                value={form.uf_descarregamento || ''}
                onChange={(e) => setForm({ ...form, uf_descarregamento: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Veículo *</Label>
              <Input
                value={form.veiculo || ''}
                onChange={(e) => setForm({ ...form, veiculo: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Motoristas</Label>
              <Input
                value={form.motoristas || ''}
                onChange={(e) => setForm({ ...form, motoristas: e.target.value })}
                placeholder="Nomes separados por vírgula"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">NF-e Vinculadas</Label>
              <Input
                value={form.nfe_vinculadas || ''}
                onChange={(e) => setForm({ ...form, nfe_vinculadas: e.target.value })}
                placeholder="Números separados por vírgula"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Romaneio</Label>
              <Input
                value={form.romaneio || ''}
                onChange={(e) => setForm({ ...form, romaneio: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Rota</Label>
              <Input
                value={form.rota || ''}
                onChange={(e) => setForm({ ...form, rota: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Informações Adicionais</Label>
              <Input
                value={form.informacoes_adicionais || ''}
                onChange={(e) => setForm({ ...form, informacoes_adicionais: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              <Check className="w-4 h-4 mr-2" /> Emitir MDF-e
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2, Copy, Power, Trash2 } from 'lucide-react'
import {
  listApiCredentials,
  createConfig,
  updateConfig,
  deleteConfig,
  generateApiKey,
  generateApiSecret,
  maskKey,
} from '@/services/configuracoes'
import { useRealtime } from '@/hooks/use-realtime'
import { API_STATUSES } from '@/lib/configuracoes-config'
import { toast } from '@/hooks/use-toast'

export function ApisScreen() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setRecords(await listApiCredentials())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('api_credentials', () => load())

  const handleNew = () => {
    setForm({
      app_name: '',
      api_key: generateApiKey(),
      api_secret: generateApiSecret(),
      status: 'ativa',
      active: true,
      request_count: 0,
    })
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!form.app_name) {
      toast({ title: 'Informe o nome da aplicação', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await createConfig('api_credentials', form)
      toast({ title: 'API criada' })
      setFormOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleToggle = async (r: any) => {
    try {
      await updateConfig('api_credentials', r.id, { active: !r.active })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleDelete = async (r: any) => {
    try {
      await deleteConfig('api_credentials', r.id)
      toast({ title: 'Excluído' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast({ title: 'Copiado' })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-foreground">Credenciais de API</h2>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova API
        </Button>
      </div>
      {records.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma credencial de API encontrada.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-4 py-3 font-bold">Aplicação</th>
                  <th className="text-left px-4 py-3 font-bold">API Key</th>
                  <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-bold hidden lg:table-cell">Último uso</th>
                  <th className="text-center px-4 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-4 py-3 font-medium">{r.app_name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{maskKey(r.api_key || '')}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-[#005B2E]"
                          onClick={() => copyKey(r.api_key || '')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${r.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {r.status || (r.active !== false ? 'Ativa' : 'Inativa')}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {r.last_used_at ? new Date(r.last_used_at).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-orange-600 h-8 w-8 p-0"
                          onClick={() => handleToggle(r)}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 h-8 w-8 p-0"
                          onClick={() => handleDelete(r)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Credencial de API</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nome da Aplicação *</Label>
              <Input
                value={form.app_name || ''}
                onChange={(e) => setForm((p) => ({ ...p, app_name: e.target.value }))}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">API Key</Label>
              <Input value={form.api_key || ''} readOnly className="font-mono text-xs bg-gray-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">API Secret</Label>
              <Input
                value={form.api_secret || ''}
                readOnly
                className="font-mono text-xs bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Status</Label>
                <Select
                  value={form.status || 'ativa'}
                  onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {API_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Rate Limit (req/h)</Label>
                <Input
                  type="number"
                  value={form.rate_limit || ''}
                  onChange={(e) => setForm((p) => ({ ...p, rate_limit: Number(e.target.value) }))}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
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

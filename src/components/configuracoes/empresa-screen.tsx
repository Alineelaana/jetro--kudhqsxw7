import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { listConfig, updateConfig, createConfig } from '@/services/configuracoes'
import { Loader2, Save, Building2, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const EMPRESA_FIELDS = [
  { name: 'razao_social', label: 'Razão Social' },
  { name: 'nome_fantasia', label: 'Nome Fantasia' },
  { name: 'cnpj', label: 'CNPJ' },
  { name: 'inscricao_estadual', label: 'Inscrição Estadual' },
  { name: 'inscricao_municipal', label: 'Inscrição Municipal' },
  { name: 'regime_tributario', label: 'Regime Tributário' },
  { name: 'address', label: 'Endereço' },
  { name: 'city', label: 'Cidade' },
  { name: 'state', label: 'Estado' },
  { name: 'cep', label: 'CEP' },
  { name: 'phone', label: 'Telefone' },
  { name: 'email', label: 'E-mail' },
  { name: 'site', label: 'Site' },
  { name: 'responsavel_legal', label: 'Responsável Legal' },
  { name: 'contador', label: 'Contador' },
  { name: 'moeda_padrao', label: 'Moeda Padrão' },
  { name: 'fuso_horario', label: 'Fuso Horário' },
  { name: 'formato_data', label: 'Formato de Data' },
]

export function EmpresaScreen() {
  const { user } = useAuth()
  const [empresas, setEmpresas] = useState<any[]>([])
  const [filiais, setFiliais] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState<Record<string, string | boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'empresa' | 'filiais'>('empresa')

  const load = async () => {
    setLoading(true)
    try {
      const emp = await listConfig('empresas', 'name')
      setEmpresas(emp)
      const fil = await listConfig('filiais', 'name')
      setFiliais(fil)
      if (emp.length && !selectedId) setSelectedId(emp[0].id)
    } catch {
      setEmpresas([])
      setFiliais([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('empresas', () => load())
  useRealtime('filiais', () => load())

  useEffect(() => {
    if (selectedId) {
      const emp = empresas.find((e) => e.id === selectedId)
      if (emp) setForm({ ...emp })
    }
  }, [selectedId, empresas])

  const handleSave = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      await updateConfig('empresas', selectedId, form)
      toast({ title: 'Dados da empresa atualizados!' })
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleNewFilial = async () => {
    try {
      await createConfig('filiais', {
        name: 'Nova Filial',
        empresa_name: form.name || '',
        active: true,
        responsible_user: (user?.name as string) || 'Sistema',
      })
      toast({ title: 'Filial criada' })
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
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
      <h2 className="text-xl font-black text-foreground flex items-center gap-2">
        <Building2 className="w-5 h-5 text-[#005B2E]" /> Dados da Empresa
      </h2>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={tab === 'empresa' ? 'default' : 'outline'}
          onClick={() => setTab('empresa')}
          className={
            tab === 'empresa' ? 'bg-[#005B2E] text-white' : 'border-[#005B2E] text-[#005B2E]'
          }
        >
          Empresa
        </Button>
        <Button
          size="sm"
          variant={tab === 'filiais' ? 'default' : 'outline'}
          onClick={() => setTab('filiais')}
          className={
            tab === 'filiais' ? 'bg-[#005B2E] text-white' : 'border-[#005B2E] text-[#005B2E]'
          }
        >
          Filiais
        </Button>
      </div>
      {tab === 'empresa' ? (
        <>
          <Select_placeholder value={selectedId} onChange={setSelectedId} empresas={empresas} />
          {selectedId && (
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {EMPRESA_FIELDS.map((f) => (
                    <div key={f.name} className="space-y-1">
                      <Label className="text-sm font-semibold">{f.label}</Label>
                      <Input
                        value={String(form[f.name] || '')}
                        onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                        className="focus-visible:ring-[#005B2E]"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={form.active !== false}
                      onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
                      className="data-[state=checked]:bg-[#005B2E]"
                    />
                    <Label className="font-semibold">
                      {form.active !== false ? 'Ativo' : 'Inativo'}
                    </Label>
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}{' '}
                  Salvar
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Filiais</h3>
              <Button
                size="sm"
                onClick={handleNewFilial}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                <Plus className="w-4 h-4 mr-1" /> Nova Filial
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#01361D] text-white">
                    <th className="text-left px-3 py-2 font-bold">Nome</th>
                    <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Empresa</th>
                    <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Cidade</th>
                    <th className="text-left px-3 py-2 font-bold">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {filiais.map((f) => (
                    <tr key={f.id} className="border-b hover:bg-[#005B2E]/5">
                      <td className="px-3 py-2 font-medium">{f.name || '—'}</td>
                      <td className="px-3 py-2 hidden md:table-cell">{f.empresa_name || '—'}</td>
                      <td className="px-3 py-2 hidden md:table-cell">{f.city || '—'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded',
                            f.active !== false
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600',
                          )}
                        >
                          {f.active !== false ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Select_placeholder({
  value,
  onChange,
  empresas,
}: {
  value: string
  onChange: (v: string) => void
  empresas: any[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:w-64 h-9 rounded-md border border-gray-200 px-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#005B2E]"
    >
      {empresas.map((e) => (
        <option key={e.id} value={e.id}>
          {e.name || e.razao_social || 'Sem nome'}
        </option>
      ))}
    </select>
  )
}

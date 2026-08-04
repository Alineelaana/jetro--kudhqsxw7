import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { RhTable, RhEmptyState, RhLoading, RhStatusBadge } from '@/components/rh/rh-shared'
import { getEmployees, createEmployee, updateEmployee } from '@/services/rh'
import { useRealtime } from '@/hooks/use-realtime'
import { EMPLOYEE_STATUS, CONTRACT_TYPES } from '@/lib/rh-types'
import { Plus, Search, Loader2, Save, Pencil } from 'lucide-react'
import { toast } from 'sonner'

const TAB_FIELDS: Record<
  string,
  { name: string; label: string; type?: string; required?: boolean; options?: readonly string[] }[]
> = {
  'Dados Pessoais': [
    { name: 'nome_completo', label: 'Nome Completo', required: true },
    { name: 'cpf', label: 'CPF', required: true },
    { name: 'rg', label: 'RG' },
    { name: 'data_nascimento', label: 'Data Nascimento', type: 'date' },
    { name: 'sexo', label: 'Sexo' },
    { name: 'estado_civil', label: 'Estado Civil' },
    { name: 'telefone', label: 'Telefone' },
    { name: 'email_pessoal', label: 'E-mail Pessoal' },
    { name: 'endereco', label: 'Endereço' },
    { name: 'contato_emergencia', label: 'Contato de Emergência' },
  ],
  'Dados Profissionais': [
    { name: 'matricula', label: 'Matrícula' },
    { name: 'empresa', label: 'Empresa' },
    { name: 'filial', label: 'Filial' },
    { name: 'departamento', label: 'Departamento' },
    { name: 'cargo', label: 'Cargo' },
    { name: 'gestor_responsavel', label: 'Gestor Responsável' },
    { name: 'data_admissao', label: 'Data de Admissão', type: 'date' },
    { name: 'tipo_contrato', label: 'Tipo de Contrato', options: CONTRACT_TYPES },
    { name: 'salario', label: 'Salário' },
    { name: 'centro_custo', label: 'Centro de Custo' },
    { name: 'email_corporativo', label: 'E-mail Corporativo' },
    { name: 'telefone_corporativo', label: 'Telefone Corporativo' },
  ],
  'Dados Bancários': [
    { name: 'banco', label: 'Banco' },
    { name: 'agencia', label: 'Agência' },
    { name: 'conta', label: 'Conta' },
    { name: 'tipo_conta', label: 'Tipo de Conta' },
    { name: 'chave_pix', label: 'Chave PIX' },
  ],
}

export function RhEmployees() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setRecords(await getEmployees())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_employees', () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return (
      !q ||
      (r.nome_completo || '').toLowerCase().includes(q) ||
      (r.cargo || '').toLowerCase().includes(q) ||
      (r.matricula || '').toLowerCase().includes(q)
    )
  })

  const openNew = () => {
    setEditing(null)
    setForm({ situacao: 'Ativo', tipo_contrato: 'CLT' })
    setDialogOpen(true)
  }
  const openEdit = (r: any) => {
    setEditing(r)
    setForm({ ...r })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome_completo || !form.cpf) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateEmployee(editing.id, form)
        toast.success('Colaborador atualizado')
      } else {
        await createEmployee(form)
        toast.success('Colaborador criado')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Colaboradores</h3>
        <Button onClick={openNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Novo Colaborador
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, cargo ou matrícula..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {loading ? (
        <RhLoading />
      ) : filtered.length === 0 ? (
        <RhEmptyState message="Nenhum colaborador encontrado" />
      ) : (
        <RhTable headers={['Nome', 'Matrícula', 'Cargo', 'Departamento', 'Situação', 'Ações']}>
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">{r.nome_completo || '—'}</td>
              <td className="px-3 py-3 font-mono text-xs text-[#C89B3C]">{r.matricula || '—'}</td>
              <td className="px-3 py-3">{r.cargo || '—'}</td>
              <td className="px-3 py-3">{r.departamento || '—'}</td>
              <td className="px-3 py-3">
                <RhStatusBadge status={r.situacao} />
              </td>
              <td className="px-3 py-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(r)}
                  className="text-[#005B2E] hover:bg-[#005B2E]/10 h-8"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                </Button>
              </td>
            </tr>
          ))}
        </RhTable>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar' : 'Novo'} Colaborador
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="Dados Pessoais">
            <TabsList className="grid w-full grid-cols-3">
              {Object.keys(TAB_FIELDS).map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(TAB_FIELDS).map(([tab, fields]) => (
              <TabsContent
                key={tab}
                value={tab}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"
              >
                {fields.map((f) => (
                  <div key={f.name} className="space-y-1">
                    <Label className="text-sm font-semibold">
                      {f.label}
                      {f.required ? ' *' : ''}
                    </Label>
                    {f.options ? (
                      <Select
                        value={form[f.name] || ''}
                        onValueChange={(v) => setForm({ ...form, [f.name]: v })}
                      >
                        <SelectTrigger className="focus-visible:ring-[#005B2E]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {f.options.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={f.type === 'date' ? 'date' : 'text'}
                        value={form[f.name] || ''}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                        className="focus-visible:ring-[#005B2E]"
                      />
                    )}
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Situação</Label>
              <Select
                value={form.situacao || 'Ativo'}
                onValueChange={(v) => setForm({ ...form, situacao: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}{' '}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

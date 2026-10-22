import { useState, useEffect, useMemo } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save, Search, CheckCircle2, AlertCircle, Building2 } from 'lucide-react'
import { createCadastroFormData, updateCadastroFormData, listCadastros } from '@/services/cadastros'
import { consultarCNPJPublico, formatarCNPJ, CnpjLookupError } from '@/services/cnpj-service'
import type { CadastroConfig, CadastroRecord, CadastroField } from '@/lib/cadastros-types'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

interface Props {
  config: CadastroConfig
  open: boolean
  onOpenChange: (open: boolean) => void
  record: CadastroRecord | null
  readOnly: boolean
  onSuccess: () => void
}

function FieldInput({
  field,
  value,
  onChange,
  disabled,
  optionsOverride,
}: {
  field: CadastroField
  value: string | boolean
  onChange: (v: string | boolean) => void
  disabled: boolean
  optionsOverride?: Array<{ value: string; label: string }>
}) {
  if (field.type === 'switch') {
    return (
      <div className="flex items-center gap-3">
        <Switch
          checked={!!value}
          onCheckedChange={onChange}
          disabled={disabled}
          className="data-[state=checked]:bg-[#005B2E]"
        />
        <span className="text-sm font-bold">{value ? 'Sim' : 'Não'}</span>
      </div>
    )
  }
  if (field.type === 'textarea') {
    return (
      <Textarea
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        className="focus-visible:ring-[#005B2E]"
      />
    )
  }
  if (field.type === 'select') {
    const opts = optionsOverride || (field.options || []).map((o) => ({ value: o, label: o }))
    return (
      <Select value={String(value || '')} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="focus-visible:ring-[#005B2E]">
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          {opts.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
  if (field.type === 'file') {
    return (
      <input
        type="file"
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0]?.name || '')}
        className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#005B2E] file:text-white hover:file:bg-[#01361D]"
      />
    )
  }
  return (
    <Input
      type={
        field.type === 'number'
          ? 'number'
          : field.type === 'email'
            ? 'email'
            : field.type === 'tel'
              ? 'tel'
              : field.type === 'date'
                ? 'date'
                : 'text'
      }
      value={String(value || '')}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="focus-visible:ring-[#005B2E]"
    />
  )
}

export function CadastroFormDialog({
  config,
  open,
  onOpenChange,
  record,
  readOnly,
  onSuccess,
}: Props) {
  const { user } = useAuth()
  const userName = (user?.name as string) || (user?.email as string) || 'Sistema'
  const [form, setForm] = useState<Record<string, string | boolean>>({})
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [submitting, setSubmitting] = useState(false)
  const [searchingCnpj, setSearchingCnpj] = useState(false)
  const [cnpjFeedback, setCnpjFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [allEmpresas, setAllEmpresas] = useState<CadastroRecord[]>([])

  const isEmpresas = config.collection === 'empresas'

  // Carregar lista de empresas cadastradas quando o modal abre (para seleção da matriz)
  useEffect(() => {
    if (open && isEmpresas) {
      listCadastros('empresas')
        .then((list) => setAllEmpresas(list))
        .catch(() => setAllEmpresas([]))
    }
  }, [open, isEmpresas])

  useEffect(() => {
    if (open) {
      const initial: Record<string, string | boolean> = { active: true }
      if (record) {
        Object.keys(record).forEach((k) => {
          initial[k] = record[k] as string | boolean
        })
      }
      // Se for empresa nova, definir tipo_unidade padrão como Matriz
      if (isEmpresas && !initial.tipo_unidade) {
        initial.tipo_unidade = 'Matriz'
      }
      setForm(initial)
      setFiles({})
      setCnpjFeedback(null)
    }
  }, [open, record, isEmpresas])

  // Opções para a escolha da Matriz:
  // - Apenas empresas do tipo Matriz (ou sem tipo_unidade explicitamente Filial)
  // - Exceto a própria empresa em edição
  // - Exceto outras filiais
  const matrizOptions = useMemo(() => {
    return allEmpresas
      .filter((emp) => {
        if (record && emp.id === record.id) return false
        const tipo = String(emp.tipo_unidade || '')
          .trim()
          .toLowerCase()
        if (tipo === 'filial') return false
        return true
      })
      .map((emp) => {
        const nome = emp.nome_fantasia || emp.razao_social || emp.name || emp.code || emp.id
        const cnpjFmt = emp.cnpj ? ` (${emp.cnpj})` : ''
        return {
          value: emp.id,
          label: `${nome}${cnpjFmt}`,
        }
      })
  }, [allEmpresas, record])

  const setField = (name: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [name]: value }))
  const setFile = (name: string, file: File | null) => setFiles((p) => ({ ...p, [name]: file }))

  const handleConsultarCnpj = async () => {
    const rawCnpj = String(form.cnpj || '').trim()
    const clean = rawCnpj.replace(/\D/g, '')
    if (!clean) {
      toast({
        title: 'Informe o CNPJ',
        description: 'Digite o CNPJ da empresa para realizar a consulta pública.',
        variant: 'destructive',
      })
      return
    }

    if (clean.length !== 14) {
      toast({
        title: 'CNPJ incompleto',
        description: 'O CNPJ deve conter exatamente 14 dígitos.',
        variant: 'destructive',
      })
      return
    }

    setSearchingCnpj(true)
    setCnpjFeedback(null)
    try {
      const data = await consultarCNPJPublico(clean)

      // Monta endereço consolidado: logradouro + número + complemento
      const enderecoPartes = [
        data.logradouro,
        data.numero ? `nº ${data.numero}` : '',
        data.complemento,
      ]
        .filter(Boolean)
        .join(', ')

      setForm((prev) => {
        const next: Record<string, string | boolean> = {
          ...prev,
          cnpj: data.cnpjFormatado,
          razao_social: data.razaoSocial || prev.razao_social || '',
          nome_fantasia: data.nomeFantasia || data.razaoSocial || prev.nome_fantasia || '',
          name: prev.name || data.nomeFantasia || data.razaoSocial || '',
          address: enderecoPartes || prev.address || '',
          city: data.municipio || prev.city || '',
          state: data.uf || prev.state || '',
          cep: data.cep || prev.cep || '',
          phone: data.telefone || prev.phone || '',
          email: data.email || prev.email || '',
        }
        // Se bairro vier e o campo não existir isolado, garante endereço completo
        if (data.bairro && enderecoPartes && !enderecoPartes.includes(data.bairro)) {
          next.address = `${enderecoPartes} - ${data.bairro}`
        }
        return next
      })

      const msg = `Dados obtidos com sucesso via ${data.origem}. Revise as informações antes de salvar.`
      setCnpjFeedback({ type: 'success', message: msg })
      toast({
        title: 'CNPJ consultado com sucesso!',
        description: msg,
      })
    } catch (err: any) {
      const errorMsg =
        err instanceof CnpjLookupError
          ? err.message
          : 'Não foi possível consultar o CNPJ. Você pode preencher os dados manualmente.'
      setCnpjFeedback({ type: 'error', message: errorMsg })
      toast({
        title: 'Consulta de CNPJ',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      setSearchingCnpj(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Se for empresas e a razão social estiver preenchida mas name vazio, espelha
    const resolvedName =
      String(form.name || '').trim() ||
      String(form.razao_social || '').trim() ||
      String(form.nome_fantasia || '').trim()

    if (!resolvedName) {
      toast({ title: 'Nome / Razão Social é obrigatório', variant: 'destructive' })
      return
    }

    // Regra específica de Empresas: Matriz vs Filial
    if (isEmpresas) {
      const tipo = String(form.tipo_unidade || 'Matriz').trim()
      if (tipo.toLowerCase() === 'filial') {
        const matrizId = String(form.matriz_id || '').trim()
        if (!matrizId) {
          toast({
            title: 'Empresa Matriz obrigatória',
            description:
              'Para cadastrar uma Filial, selecione obrigatoriamente a empresa Matriz vinculada.',
            variant: 'destructive',
          })
          return
        }
        if (record && matrizId === record.id) {
          toast({
            title: 'Vínculo inválido',
            description: 'Uma empresa filial não pode ser matriz de si mesma.',
            variant: 'destructive',
          })
          return
        }
      }
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      const code =
        form.code ||
        (isEmpresas && form.razao_social
          ? String(form.nome_fantasia || form.razao_social)
              .replace(/[^a-zA-Z0-9]/g, '-')
              .toUpperCase()
              .slice(0, 20)
          : `${config.collection.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-6)}`)

      fd.append('code', String(code))
      fd.append('name', resolvedName)
      fd.append('active', String(form.active ?? true))
      if (!record) fd.append('responsible_user', userName)

      // Regra de matriz_id para Matriz: limpa se for Matriz
      const tipoUnidade = String(form.tipo_unidade || 'Matriz')
      const matrizIdFinal =
        tipoUnidade.toLowerCase() === 'filial' ? String(form.matriz_id || '') : ''

      for (const field of config.fields) {
        let val = form[field.name]
        if (field.name === 'matriz_id') {
          val = matrizIdFinal
        }
        if (field.name === 'tipo_unidade') {
          val = tipoUnidade
        }
        if (field.name === 'name') {
          val = resolvedName
        }

        if (field.type === 'file' && files[field.name]) {
          fd.append(field.name, files[field.name]!)
        } else if (field.type === 'switch') {
          fd.append(field.name, String(val ?? false))
        } else if (val !== undefined && val !== null) {
          fd.append(field.name, String(val).trim())
        }
      }

      // Garante tipo_unidade e matriz_id mesmo se não estiverem explícitos em fields
      if (isEmpresas) {
        if (!fd.has('tipo_unidade')) fd.append('tipo_unidade', tipoUnidade)
        if (!fd.has('matriz_id')) fd.append('matriz_id', matrizIdFinal)
      }
      if (record) {
        await updateCadastroFormData(config.collection, record.id, fd)
        toast({ title: 'Registro atualizado' })
      } else {
        await createCadastroFormData(config.collection, fd)
        toast({ title: 'Registro criado' })
      }
      onSuccess()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  const nameLabel = config.nameLabel || 'Nome'
  const isFilial =
    String(form.tipo_unidade || '')
      .trim()
      .toLowerCase() === 'filial'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E] flex items-center gap-2">
            {isEmpresas && <Building2 className="w-5 h-5" />}
            {readOnly ? 'Visualizar' : record ? 'Editar' : 'Novo Cadastro'} — {config.label}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bloco de Consulta de CNPJ exclusiva para tela de Empresas */}
          {isEmpresas && (
            <div className="p-3.5 rounded-lg border-2 border-[#005B2E]/30 bg-[#005B2E]/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#005B2E]" />
                  <span className="text-sm font-bold text-[#005B2E]">
                    Consulta Automática de CNPJ (Receita Federal)
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">
                  BrasilAPI + Fallback ReceitaWS
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Informe o CNPJ da empresa e clique em "Consultar CNPJ". Os campos serão preenchidos
                automaticamente e você poderá revisar ou alterar qualquer informação antes de
                salvar.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="00.000.000/0000-00"
                    value={String(form.cnpj || '')}
                    onChange={(e) => {
                      const formatted = formatarCNPJ(e.target.value)
                      setField('cnpj', formatted)
                    }}
                    disabled={readOnly || searchingCnpj}
                    className="font-mono bg-white focus-visible:ring-[#005B2E]"
                  />
                </div>
                <Button
                  type="button"
                  variant="default"
                  onClick={handleConsultarCnpj}
                  disabled={readOnly || searchingCnpj || !form.cnpj}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold shrink-0"
                >
                  {searchingCnpj ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Consultar CNPJ
                    </>
                  )}
                </Button>
              </div>

              {cnpjFeedback && (
                <div
                  className={`flex items-start gap-2 text-xs p-2.5 rounded border ${
                    cnpjFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}
                >
                  {cnpjFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  )}
                  <span>{cnpjFeedback.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Dados Mestres: Código e Nome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Código</Label>
              <Input
                value={String(form.code || '')}
                onChange={(e) => setField('code', e.target.value)}
                disabled={readOnly}
                placeholder="Auto"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">{nameLabel} *</Label>
              <Input
                value={String(form.name || form.razao_social || '')}
                onChange={(e) => setField('name', e.target.value)}
                disabled={readOnly}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>

          {/* Renderização dinâmica dos campos da configuração */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {config.fields.map((field) => {
              // Tratamento especial para tipo_unidade e matriz_id em empresas
              if (isEmpresas && field.name === 'tipo_unidade') {
                return (
                  <div key={field.name} className="space-y-1.5 sm:col-span-1">
                    <Label className="text-sm font-semibold">Tipo de Unidade *</Label>
                    <Select
                      value={String(form.tipo_unidade || 'Matriz')}
                      onValueChange={(val) => {
                        setField('tipo_unidade', val)
                        if (val.toLowerCase() !== 'filial') {
                          setField('matriz_id', '')
                        }
                      }}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="focus-visible:ring-[#005B2E]">
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Matriz">Empresa independente / Matriz</SelectItem>
                        <SelectItem value="Filial">Filial</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      Define se a unidade é matriz independente ou vinculada como filial.
                    </p>
                  </div>
                )
              }

              if (isEmpresas && field.name === 'matriz_id') {
                if (!isFilial) return null // só exibe se for Filial
                return (
                  <div
                    key={field.name}
                    className="space-y-1.5 sm:col-span-1 p-3 rounded-lg border-2 border-amber-300 bg-amber-50/60"
                  >
                    <Label className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-700" />
                      Empresa Matriz Vinculada *
                    </Label>
                    <FieldInput
                      field={field}
                      value={form.matriz_id || ''}
                      onChange={(v) => setField('matriz_id', v)}
                      disabled={readOnly}
                      optionsOverride={matrizOptions}
                    />
                    <p className="text-[11px] text-amber-800">
                      Obrigatório: selecione qual matriz responderá por esta filial.
                    </p>
                  </div>
                )
              }

              // Se for o campo CNPJ em empresas, o input padrão reflete o form.cnpj formatado
              return (
                <div
                  key={field.name}
                  className={`space-y-1.5 ${field.span === 2 ? 'sm:col-span-2' : ''}`}
                >
                  <Label className="text-sm font-semibold">
                    {field.label}
                    {field.required ? ' *' : ''}
                  </Label>
                  <FieldInput
                    field={field}
                    value={form[field.name] ?? (field.type === 'switch' ? false : '')}
                    onChange={(v) => {
                      if (field.type === 'file') setFile(field.name, v as unknown as File | null)
                      else if (field.name === 'cnpj') setField(field.name, formatarCNPJ(String(v)))
                      else setField(field.name, v)
                    }}
                    disabled={readOnly}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-3 bg-muted/40 px-4 py-3 rounded-lg border border-border">
            <span className="text-sm font-bold">Ativo</span>
            <Switch
              checked={!!form.active}
              onCheckedChange={(v) => setField('active', v)}
              disabled={readOnly}
              className="data-[state=checked]:bg-[#005B2E]"
            />
            <span
              className={`text-sm font-bold ${form.active ? 'text-emerald-600' : 'text-red-600'}`}
            >
              {form.active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          {!readOnly && (
            <DialogFooter className="gap-2 sm:gap-0">
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
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

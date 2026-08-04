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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save } from 'lucide-react'
import { createCadastroFormData, updateCadastroFormData } from '@/services/cadastros'
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
}: {
  field: CadastroField
  value: string | boolean
  onChange: (v: string | boolean) => void
  disabled: boolean
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
    return (
      <Select value={String(value || '')} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="focus-visible:ring-[#005B2E]">
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          {(field.options || []).map((o) => (
            <SelectItem key={o} value={o}>
              {o}
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

  useEffect(() => {
    if (open) {
      const initial: Record<string, string | boolean> = { active: true }
      if (record) {
        Object.keys(record).forEach((k) => {
          initial[k] = record[k] as string | boolean
        })
      }
      setForm(initial)
      setFiles({})
    }
  }, [open, record])

  const setField = (name: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [name]: value }))
  const setFile = (name: string, file: File | null) => setFiles((p) => ({ ...p, [name]: file }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !String(form.name).trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      const code =
        form.code ||
        `${config.collection.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-6)}`
      fd.append('code', code)
      fd.append('name', String(form.name || '').trim())
      fd.append('active', String(form.active ?? true))
      if (!record) fd.append('responsible_user', userName)
      for (const field of config.fields) {
        const val = form[field.name]
        if (field.type === 'file' && files[field.name]) {
          fd.append(field.name, files[field.name]!)
        } else if (field.type === 'switch') {
          fd.append(field.name, String(val ?? false))
        } else if (val !== undefined && val !== null) {
          fd.append(field.name, String(val).trim())
        }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">
            {readOnly ? 'Visualizar' : record ? 'Editar' : 'Novo Cadastro'} — {config.label}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={String(form.name || '')}
                onChange={(e) => setField('name', e.target.value)}
                disabled={readOnly}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {config.fields.map((field) => (
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
                    else setField(field.name, v)
                  }}
                  disabled={readOnly}
                />
              </div>
            ))}
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

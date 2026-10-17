import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save, Loader2, Plus, Trash2, ArrowUp, ArrowDown, Copy, Eye, EyeOff } from 'lucide-react'
import { getCmsSection, saveCmsDraft } from '@/services/cms'
import { CMS_DEFAULT_CONTENT } from '@/lib/cms-defaults'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function useCmsSection(sectionKey: string) {
  const { user } = useAuth()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [original, setOriginal] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const content = await getCmsSection(sectionKey)
      const draft =
        (content?.draft_data as Record<string, unknown>) || CMS_DEFAULT_CONTENT[sectionKey] || {}
      setData(draft)
      setOriginal(JSON.stringify(draft))
    } catch {
      setData(CMS_DEFAULT_CONTENT[sectionKey] || {})
      setOriginal(JSON.stringify(CMS_DEFAULT_CONTENT[sectionKey] || {}))
    }
    setLoading(false)
  }, [sectionKey])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    if (!data) return
    setSaving(true)
    try {
      await saveCmsDraft(sectionKey, data, (user?.id as string) || '')
      setOriginal(JSON.stringify(data))
      toast.success('Rascunho salvo com sucesso!')
    } catch {
      toast.error('Erro ao salvar rascunho.')
    }
    setSaving(false)
  }

  const isDirty = data ? JSON.stringify(data) !== original : false
  const update = (patch: Record<string, unknown>) =>
    setData((prev) => ({ ...(prev || {}), ...patch }))

  return { data, update, setData, loading, saving, save, isDirty, reload: load }
}

export function CmsField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-bold text-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function CmsTextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <Input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

export function CmsTextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <Textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
    />
  )
}

export function CmsColorInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-9 rounded-md border border-border cursor-pointer"
      />
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 font-mono text-sm"
      />
    </div>
  )
}

export function CmsToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked || false} onCheckedChange={onChange} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  )
}

export function SaveBar({
  onSave,
  saving,
  isDirty,
  onDiscard,
}: {
  onSave: () => void
  saving: boolean
  isDirty: boolean
  onDiscard?: () => void
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button
        onClick={onSave}
        disabled={saving || !isDirty}
        className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Salvar Rascunho
      </Button>
      {onDiscard && isDirty && (
        <Button
          onClick={onDiscard}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          Descartar
        </Button>
      )}
      {isDirty && (
        <span className="text-xs text-orange-600 font-medium">● Alterações não salvas</span>
      )}
    </div>
  )
}

export function CmsCard({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <Card className="border-2 border-[#005B2E]/20">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
    </div>
  )
}

export function ListActions({
  onUp,
  onDown,
  onDuplicate,
  onToggle,
  onDelete,
  active,
}: {
  onUp?: () => void
  onDown?: () => void
  onDuplicate?: () => void
  onToggle?: () => void
  onDelete?: () => void
  active?: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      {onUp && (
        <Button onClick={onUp} variant="ghost" size="icon" className="h-8 w-8">
          <ArrowUp className="w-4 h-4" />
        </Button>
      )}
      {onDown && (
        <Button onClick={onDown} variant="ghost" size="icon" className="h-8 w-8">
          <ArrowDown className="w-4 h-4" />
        </Button>
      )}
      {onDuplicate && (
        <Button onClick={onDuplicate} variant="ghost" size="icon" className="h-8 w-8">
          <Copy className="w-4 h-4" />
        </Button>
      )}
      {onToggle && (
        <Button onClick={onToggle} variant="ghost" size="icon" className="h-8 w-8">
          {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
      )}
      {onDelete && (
        <Button
          onClick={onDelete}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button onClick={onClick} className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
      <Plus className="w-4 h-4 mr-2" /> {label}
    </Button>
  )
}

import { useState } from 'react'
import { Loader2, Plus, Trash2, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  type ArtifactStatus,
  type ArtifactContent,
  type BuildDef,
  type CertificationArtifact,
  type ReviewChecklistItem,
} from '@/lib/certification-types'

interface Props {
  artifact: CertificationArtifact
  build: BuildDef
  isLocked: boolean
  userName: string
  onSave: (id: string, data: Partial<CertificationArtifact>) => Promise<void>
  onStatusChange: (id: string, updates: Partial<CertificationArtifact>) => Promise<void>
}

export function BuildEditor({
  artifact,
  build,
  isLocked,
  userName,
  onSave,
  onStatusChange,
}: Props) {
  const [content, setContent] = useState<ArtifactContent>(
    artifact.content || { items: [], summary: '' },
  )
  const [checklist, setChecklist] = useState<ReviewChecklistItem[]>(artifact.review_checklist || [])
  const [reviewNotes, setReviewNotes] = useState(artifact.review_notes || '')
  const [saving, setSaving] = useState(false)

  const isConcluido = artifact.status === 'concluido'
  const isReadonly = isConcluido || isLocked
  const allChecked = checklist.length > 0 && checklist.every((i) => i.checked)
  const hasItems = content.items.length > 0
  const hasSummary = content.summary.trim().length > 0
  const canConclude = allChecked && hasItems && hasSummary

  const updateItem = (idx: number, key: string, value: string) =>
    setContent((p) => ({
      ...p,
      items: p.items.map((it, i) => (i === idx ? { ...it, [key]: value } : it)),
    }))
  const addItem = () => setContent((p) => ({ ...p, items: [...p.items, {}] }))
  const removeItem = (idx: number) =>
    setContent((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))
  const setInstNote = (id: string, val: string) =>
    setContent((p) => ({
      ...p,
      institutionalNotes: { ...(p.institutionalNotes || {}), [id]: val },
    }))

  const toggleCheck = (idx: number, checked: boolean) =>
    setChecklist((p) => p.map((it, i) => (i === idx ? { ...it, checked } : it)))
  const updateCheckNotes = (idx: number, notes: string) =>
    setChecklist((p) => p.map((it, i) => (i === idx ? { ...it, notes } : it)))

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(artifact.id, { content, review_checklist: checklist, review_notes: reviewNotes })
      toast.success('Artifact salvo com sucesso')
    } catch {
      toast.error('Erro ao salvar artifact')
    } finally {
      setSaving(false)
    }
  }

  const handleStatus = async (s: ArtifactStatus) => {
    const updates: Partial<CertificationArtifact> = {
      status: s,
      content,
      review_checklist: checklist,
      review_notes: reviewNotes,
    }
    if (s === 'concluido') {
      updates.completed_at = new Date().toISOString()
      updates.reviewer = userName
    }
    try {
      await onStatusChange(artifact.id, updates)
      toast.success(`Status: ${STATUS_LABELS[s]}`)
    } catch {
      toast.error('Erro ao alterar status')
    }
  }

  if (isLocked) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 gap-3">
          <Lock className="w-10 h-10 text-muted-foreground" />
          <p className="text-lg font-bold">Build bloqueada</p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Conclua a Build {String(build.number - 1).padStart(2, '0')} para desbloquear esta etapa.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-lg">
                Build {String(build.number).padStart(2, '0')} — {build.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{build.description}</p>
            </div>
            <Badge className={cn('border', STATUS_COLORS[artifact.status])}>
              {STATUS_LABELS[artifact.status]}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens do Inventário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {content.items.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum item adicionado.</p>
          )}
          {content.items.map((item, idx) => (
            <div
              key={idx}
              className="grid gap-2 p-3 rounded-lg border bg-muted/30"
              style={{ gridTemplateColumns: `1fr ${isReadonly ? 'auto' : 'auto'}` }}
            >
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {build.itemFields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{field.label}</Label>
                    {field.multiline ? (
                      <Textarea
                        value={item[field.key] || ''}
                        disabled={isReadonly}
                        onChange={(e) => updateItem(idx, field.key, e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                    ) : (
                      <Input
                        value={item[field.key] || ''}
                        disabled={isReadonly}
                        onChange={(e) => updateItem(idx, field.key, e.target.value)}
                        className="text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
              {!isReadonly && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(idx)}
                  className="self-start text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          {!isReadonly && (
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> Adicionar Item
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content.summary}
            disabled={isReadonly}
            onChange={(e) => setContent((p) => ({ ...p, summary: e.target.value }))}
            placeholder="Resumo técnico do artifact..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {build.institutionalSections && build.institutionalSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Seções Institucionais e Artefatos Obrigatórios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {build.institutionalSections.map((sec) => (
              <div key={sec.id} className="space-y-1">
                <Label className="text-sm font-semibold">{sec.title}</Label>
                <p className="text-xs text-muted-foreground">{sec.description}</p>
                <Textarea
                  value={content.institutionalNotes?.[sec.id] || ''}
                  disabled={isReadonly}
                  onChange={(e) => setInstNote(sec.id, e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Checklist de Revisão Interna</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {checklist.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30">
              <input
                type="checkbox"
                checked={item.checked}
                disabled={isReadonly}
                onChange={(e) => toggleCheck(idx, e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#005B2E]"
              />
              <div className="flex-1 space-y-1">
                <Label className="text-sm">{item.label}</Label>
                <Input
                  value={item.notes}
                  disabled={isReadonly}
                  onChange={(e) => updateCheckNotes(idx, e.target.value)}
                  placeholder="Notas da revisão..."
                  className="text-xs h-8"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notas de Revisão</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reviewNotes}
            disabled={isReadonly}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Observações gerais da revisão..."
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {!isConcluido && (
        <div className="flex flex-wrap gap-2 sticky bottom-4 bg-background/80 backdrop-blur p-3 rounded-lg border shadow-sm">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null} Salvar
          </Button>
          {artifact.status === 'pendente' && (
            <Button
              onClick={() => handleStatus('em_elaboracao')}
              className="bg-[#005B2E] hover:bg-[#004524]"
            >
              Iniciar Elaboração
            </Button>
          )}
          {artifact.status === 'em_elaboracao' && (
            <Button
              onClick={() => handleStatus('em_revisao')}
              className="bg-[#005B2E] hover:bg-[#004524]"
            >
              Enviar para Revisão
            </Button>
          )}
          {artifact.status === 'em_revisao' && (
            <>
              <Button variant="outline" onClick={() => handleStatus('em_elaboracao')}>
                Voltar para Elaboração
              </Button>
              <Button
                onClick={() => handleStatus('concluido')}
                disabled={!canConclude}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" /> Concluir Build
              </Button>
            </>
          )}
        </div>
      )}
      {isConcluido && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-sm font-semibold text-green-700">
            Build concluída em {new Date(artifact.completed_at).toLocaleDateString('pt-BR')} por{' '}
            {artifact.reviewer || '—'}
          </p>
        </div>
      )}
    </div>
  )
}

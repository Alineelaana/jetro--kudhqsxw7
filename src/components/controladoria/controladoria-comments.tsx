import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Plus, Trash2, MessageSquare } from 'lucide-react'
import { getComments, createComment, deleteComment } from '@/services/controladoria'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { canManageComments } from '@/lib/controladoria-permissions'
import { useOrgFilter } from '@/hooks/use-org-filter'

const ENTITY_TYPES: Record<string, string> = {
  dre_line: 'Linha DRE',
  period: 'Período',
  cost_center: 'Centro de Custo',
  analysis: 'Análise',
}

export function ControladoriaComments() {
  const { user, userRole: authRole } = useAuth()
  const userRole = authRole || (user?.role as string) || undefined
  const { empresaId, filialId, isGlobal } = useOrgFilter()
  const [comments, setComments] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      const filterParts: string[] = []
      if (!isGlobal) {
        if (filialId) filterParts.push(`(company = "${empresaId}" && branch = "${filialId}")`)
        else if (empresaId) filterParts.push(`company = "${empresaId}"`)
      }
      const orgFilter = filterParts.length > 0 ? filterParts.join(' || ') : undefined
      setComments((await getComments(orgFilter)) as Record<string, unknown>[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('controladoria_comments', () => load())

  const handleCreate = async () => {
    await createComment({
      entity_type: form.entity_type || 'analysis',
      entity_id: form.entity_id || '',
      period: form.period || new Date().toISOString().substring(0, 7),
      line_key: form.line_key || '',
      cost_center: form.cost_center || '',
      result_center: form.result_center || '',
      comment: form.comment || '',
      user_name: (user?.name as string) || 'Usuário',
      user_role: (user?.role as string) || '',
      company: empresaId || '',
      branch: filialId || '',
    })
    setOpen(false)
    setForm({})
    load()
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20 bg-[#005B2E]/5">
        <CardContent className="py-2">
          <p className="text-xs text-muted-foreground">
            💬 Comentários da Controladoria — comentários nunca alteram valores, apenas adicionam
            contexto analítico.
          </p>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        {canManageComments(userRole) && (
          <Button
            size="sm"
            className="bg-[#005B2E] hover:bg-[#01361D]"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Novo Comentário
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {comments.map((c) => (
          <Card key={c.id as string} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-3">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#005B2E]" />
                  <Badge variant="outline" className="text-xs">
                    {ENTITY_TYPES[String(c.entity_type || '')] || String(c.entity_type || '')}
                  </Badge>
                  {c.period && (
                    <span className="text-xs text-muted-foreground">{String(c.period)}</span>
                  )}
                </div>
                {canManageComments(userRole) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await deleteComment(c.id as string)
                      load()
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
              <p className="text-sm mt-1">{String(c.comment || '—')}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>Por: {String(c.user_name || '—')}</span>
                {c.cost_center && <span>Centro de Custo: {String(c.cost_center)}</span>}
                {c.line_key && <span>Linha: {String(c.line_key)}</span>}
                {c.created && <span>{new Date(c.created as string).toLocaleString('pt-BR')}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {comments.length === 0 && (
        <p className="text-center py-6 text-muted-foreground">Nenhum comentário.</p>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Comentário</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <select
                value={form.entity_type || ''}
                onChange={(e) => setForm({ ...form, entity_type: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="dre_line">Linha DRE</option>
                <option value="period">Período</option>
                <option value="cost_center">Centro de Custo</option>
                <option value="analysis">Análise</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Período</Label>
              <Input
                value={form.period || ''}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Linha DRE</Label>
              <Input
                value={form.line_key || ''}
                onChange={(e) => setForm({ ...form, line_key: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Centro de Custo</Label>
              <Input
                value={form.cost_center || ''}
                onChange={(e) => setForm({ ...form, cost_center: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Centro de Resultado</Label>
              <Input
                value={form.result_center || ''}
                onChange={(e) => setForm({ ...form, result_center: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Comentário *</Label>
              <textarea
                value={form.comment || ''}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} className="bg-[#005B2E] hover:bg-[#01361D]">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

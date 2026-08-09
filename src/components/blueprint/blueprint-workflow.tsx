import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Workflow, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { getChapters, updateChapter } from '@/services/blueprint'
import type { BlueprintChapter } from '@/lib/blueprint-types'
import { useAuth } from '@/hooks/use-auth'
import { canEditBlueprint, canPublishBlueprint } from '@/lib/blueprint-permissions'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'

const STEPS = [
  { key: 'Rascunho', label: 'Autor', icon: Clock, color: 'text-gray-600' },
  { key: 'Em Revisão', label: 'Revisão Técnica', icon: Clock, color: 'text-blue-600' },
  { key: 'Publicado', label: 'Publicado', icon: CheckCircle, color: 'text-emerald-600' },
]

export function BlueprintWorkflow() {
  const { user } = useAuth()
  const [chapters, setChapters] = useState<BlueprintChapter[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const canEdit = canEditBlueprint(user?.role as string)
  const canPublish = canPublishBlueprint(user?.role as string)

  const load = useCallback(async () => {
    try {
      setChapters(await getChapters())
    } catch {
      /* noop */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('blueprint_chapters', () => load())

  const selected = chapters.find((c) => c.id === selectedId)

  const advance = async (newStatus: string) => {
    if (!selectedId) return
    setActionLoading(true)
    try {
      await updateChapter(selectedId, { editorial_status: newStatus })
      toast.success(`Status alterado para: ${newStatus}`)
      load()
    } catch {
      toast.error('Erro ao alterar status')
    }
    setActionLoading(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Workflow className="w-5 h-5 text-[#005B2E]" />
        <h3 className="text-lg font-bold">Workflow de Publicação</h3>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Selecionar capítulo..." />
          </SelectTrigger>
          <SelectContent>
            {chapters.map((ch) => (
              <SelectItem key={ch.id} value={ch.id}>
                {ch.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selected ? (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold">{selected.title}</p>
                <p className="text-xs text-muted-foreground">
                  {selected.code} · v{selected.version_number}
                </p>
              </div>
              <Badge className="bg-[#005B2E]/10 text-[#005B2E]">{selected.editorial_status}</Badge>
            </div>
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((step, i) => {
                const currentIdx = STEPS.findIndex((s) => s.key === selected.editorial_status)
                const isActive = i === currentIdx
                const isDone = i < currentIdx
                return (
                  <div key={step.key} className="flex items-center gap-2 flex-1">
                    <div
                      className={`flex flex-col items-center gap-1 ${isActive ? '' : 'opacity-50'}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          isActive
                            ? 'border-[#005B2E] bg-[#005B2E]/10'
                            : isDone
                              ? 'border-emerald-500 bg-emerald-100'
                              : 'border-gray-300'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <step.icon className={`w-5 h-5 ${step.color}`} />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-center">{step.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
            {canEdit && (
              <div className="flex gap-2 flex-wrap">
                {selected.editorial_status === 'Rascunho' && (
                  <Button
                    className="bg-[#005B2E] hover:bg-[#01361D] text-white"
                    disabled={actionLoading}
                    onClick={() => advance('Em Revisão')}
                  >
                    Enviar para Revisão
                  </Button>
                )}
                {selected.editorial_status === 'Em Revisão' && canPublish && (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={actionLoading}
                    onClick={() => advance('Publicado')}
                  >
                    Aprovar e Publicar
                  </Button>
                )}
                {selected.editorial_status === 'Em Revisão' && (
                  <Button
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() => advance('Rascunho')}
                  >
                    Voltar para Rascunho
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Workflow className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Selecione um capítulo para gerenciar o workflow</p>
            <p className="text-xs mt-1">Fluxo: Autor → Revisão Técnica → Publicação</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

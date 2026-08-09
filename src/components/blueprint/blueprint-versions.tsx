import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, History, GitCommit } from 'lucide-react'
import { getChapters, getVersions } from '@/services/blueprint'
import type { BlueprintChapter, BlueprintVersion } from '@/lib/blueprint-types'
import { useRealtime } from '@/hooks/use-realtime'

export function BlueprintVersions() {
  const [chapters, setChapters] = useState<BlueprintChapter[]>([])
  const [versions, setVersions] = useState<BlueprintVersion[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getChapters()
      .then((chs) => {
        setChapters(chs)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const loadVersions = async (chapterId: string) => {
    setSelectedId(chapterId)
    if (!chapterId) {
      setVersions([])
      return
    }
    try {
      setVersions(await getVersions(chapterId))
    } catch {
      setVersions([])
    }
  }

  useRealtime('blueprint_versions', () => {
    if (selectedId) loadVersions(selectedId)
  })

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <History className="w-5 h-5 text-[#005B2E]" />
        <h3 className="text-lg font-bold">Versionamento</h3>
        <Select value={selectedId} onValueChange={loadVersions}>
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
      {selectedId ? (
        <div className="space-y-2">
          {versions.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma versão publicada
              </CardContent>
            </Card>
          ) : (
            versions.map((v, i) => (
              <Card key={v.id} className="border-2 border-[#005B2E]/15">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GitCommit className="w-4 h-4 text-[#005B2E]" />
                      <span className="font-bold">v{v.version_number}</span>
                      {v.version_label && (
                        <Badge className="bg-[#005B2E]/10 text-[#005B2E]">{v.version_label}</Badge>
                      )}
                      {i === 0 && <Badge className="bg-emerald-100 text-emerald-700">Atual</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {v.published_at ? new Date(v.published_at).toLocaleString('pt-BR') : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                    {v.author && <span>Autor: {v.author}</span>}
                    {v.approver && <span>Aprovador: {v.approver}</span>}
                    {v.motivo && <span className="col-span-2">Motivo: {v.motivo}</span>}
                  </div>
                  {v.content && (
                    <div className="mt-2 p-3 bg-muted/30 rounded text-sm max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-xs">
                      {v.content.substring(0, 500)}
                      {v.content.length > 500 ? '...' : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Selecione um capítulo para ver o histórico de versões</p>
            <p className="text-xs mt-1">Cada publicação cria um snapshot imutável</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

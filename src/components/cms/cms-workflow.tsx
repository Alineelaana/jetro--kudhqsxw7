import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import {
  getHistory,
  getVersions,
  restoreVersion,
  publishAllSections,
  getPublicationState,
  getPendingChangesCount,
} from '@/services/cms'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { Loader2, Rocket, RotateCcw, Clock } from 'lucide-react'
import type { CmsHistoryEntry, CmsVersion } from '@/lib/cms-types'

export function CmsChangeHistory() {
  const [history, setHistory] = useState<CmsHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sectionFilter, setSectionFilter] = useState('')

  const load = useCallback(async () => {
    try {
      setHistory(await getHistory(sectionFilter || undefined))
    } catch {
      setHistory([])
    }
    setLoading(false)
  }, [sectionFilter])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('cms_history', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  const sections = [...new Set(history.map((h) => h.section_key))]

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <select
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value)
              setLoading(true)
            }}
            className="border border-border rounded-md px-3 py-2 text-sm bg-white mb-4"
          >
            <option value="">Todas as seções</option>
            {sections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {history.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhuma alteração registrada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#01361D] text-white">
                    <th className="text-left px-3 py-2">Seção</th>
                    <th className="text-left px-3 py-2">Campo</th>
                    <th className="text-left px-3 py-2">Valor Anterior</th>
                    <th className="text-left px-3 py-2">Novo Valor</th>
                    <th className="text-left px-3 py-2">Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-border">
                      <td className="px-3 py-2 font-bold">{h.section_key}</td>
                      <td className="px-3 py-2">{h.field_name}</td>
                      <td className="px-3 py-2 max-w-[150px] truncate text-muted-foreground">
                        {h.old_value}
                      </td>
                      <td className="px-3 py-2 max-w-[150px] truncate">{h.new_value}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(h.created).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function CmsPublication() {
  const { user } = useAuth()
  const [pubState, setPubState] = useState<Record<string, unknown> | null>(null)
  const [pending, setPending] = useState(0)
  const [versions, setVersions] = useState<CmsVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')

  const load = useCallback(async () => {
    try {
      const [pub, pend, vers] = await Promise.all([
        getPublicationState(),
        getPendingChangesCount(),
        getVersions('header'),
      ])
      setPubState(pub as Record<string, unknown> | null)
      setPending(pend)
      setVersions(vers)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('cms_publication', () => load())
  useRealtime('cms_content', () => load())

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await publishAllSections((user?.id as string) || '')
      toast.success('Alterações publicadas!')
      await load()
    } catch {
      toast.error('Erro ao publicar.')
    }
    setPublishing(false)
  }
  const handleRestore = async (versionId: string) => {
    if (!confirm('Restaurar esta versão? O rascunho será substituído.')) return
    try {
      await restoreVersion('header', versionId, (user?.id as string) || '')
      toast.success('Versão restaurada!')
      await load()
    } catch {
      toast.error('Erro ao restaurar versão.')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  const status = (pubState?.status as string) || 'published'
  const lastPub = pubState?.last_published_at as string

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-bold capitalize">
                {status === 'published' ? 'Publicado' : status}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Última Publicação</p>
              <p className="text-sm font-bold">
                {lastPub ? new Date(lastPub).toLocaleString('pt-BR') : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
              <p className="text-sm font-bold text-orange-600">{pending}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handlePublish}
              disabled={publishing || pending === 0}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {publishing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4 mr-2" />
              )}{' '}
              Publicar Agora
            </Button>
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="border border-border rounded-md px-3 py-2 text-sm"
              />
              <Button
                variant="outline"
                className="border-[#C89B3C] text-[#C89B3C] font-bold"
                disabled={!scheduleDate}
                onClick={() => toast.info('Publicação agendada para ' + scheduleDate)}
              >
                <Clock className="w-4 h-4 mr-2" /> Agendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <h3 className="text-base font-bold mb-3">Versões Anteriores</h3>
          {versions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              Nenhuma versão publicada.
            </p>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-white"
                >
                  <div>
                    <p className="text-sm font-bold">{v.label || `Versão ${v.version_number}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.published_at ? new Date(v.published_at).toLocaleString('pt-BR') : '—'}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRestore(v.id)}
                    variant="outline"
                    size="sm"
                    className="border-[#C89B3C] text-[#C89B3C] font-bold"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Restaurar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

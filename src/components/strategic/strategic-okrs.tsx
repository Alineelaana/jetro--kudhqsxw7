import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Trash2, Target } from 'lucide-react'
import {
  getStrategicList,
  createStrategicRecord,
  deleteStrategicRecord,
  logStrategicAudit,
} from '@/services/strategic'
import { useRealtime } from '@/hooks/use-realtime'
import { StrategicBiButton } from './strategic-bi-button'
import type { StrategicOkr, StrategicKeyResult } from '@/lib/strategic-types'

export function StrategicOkrs() {
  const [okrs, setOkrs] = useState<StrategicOkr[]>([])
  const [keyResults, setKeyResults] = useState<StrategicKeyResult[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [objective, setObjective] = useState('')

  const load = async () => {
    try {
      const [oks, krs] = await Promise.all([
        getStrategicList('strategic_okrs'),
        getStrategicList('strategic_key_results'),
      ])
      setOkrs(oks as unknown as StrategicOkr[])
      setKeyResults(krs as unknown as StrategicKeyResult[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('strategic_okrs', () => load())
  useRealtime('strategic_key_results', () => load())

  const handleCreate = async () => {
    if (!objective.trim()) return
    try {
      const rec = await createStrategicRecord('strategic_okrs', {
        objective,
        status: 'rascunho',
        quarter: 'Q1',
        period: '2026',
        percent: 0,
      })
      logStrategicAudit(
        'create',
        (rec as Record<string, unknown>).id as string,
        `OKR: ${objective}`,
      )
      setDialogOpen(false)
      setObjective('')
      load()
    } catch {
      /* ignore */
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este OKR?')) return
    await deleteStrategicRecord('strategic_okrs', id)
    logStrategicAudit('delete', id, 'OKR')
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
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{okrs.length} OKR(s) cadastrado(s)</p>
        <div className="flex gap-2">
          <StrategicBiButton area="OKRs" />
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> Novo OKR
          </Button>
        </div>
      </div>
      {okrs.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-lg font-bold">Nenhum OKR cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {okrs.map((okr) => {
            const krs = keyResults.filter((kr) => kr.okr_id === okr.id)
            const avgPercent =
              krs.length > 0 ? krs.reduce((s, kr) => s + (kr.percent || 0), 0) / krs.length : 0
            return (
              <Card key={okr.id} className="border-2 border-[#005B2E]/20">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-[#005B2E]">{okr.objective}</h3>
                      <p className="text-xs text-muted-foreground">
                        {okr.quarter} · {okr.status} · {okr.area || '—'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(okr.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-3">
                    <div
                      className="bg-[#005B2E] h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(avgPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs font-bold mb-2">
                    {avgPercent.toFixed(0)}% concluído · {krs.length} resultado(s)-chave
                  </p>
                  {krs.length > 0 && (
                    <div className="space-y-1">
                      {krs.map((kr) => (
                        <div
                          key={kr.id}
                          className="flex items-center gap-2 text-sm bg-muted/30 rounded px-2 py-1"
                        >
                          <span className="flex-1">{kr.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {kr.current || '0'}/{kr.target || '0'}
                          </span>
                          <span className="text-xs font-bold text-[#005B2E]">
                            {(kr.percent || 0).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDialogOpen(false)}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6 space-y-3">
              <h3 className="font-bold text-lg text-[#005B2E]">Novo OKR</h3>
              <div>
                <Label className="text-xs">Objetivo *</Label>
                <Input
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex: Aumentar faturamento em 30%"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreate}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white"
                >
                  Criar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getConsolidatedHistory } from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'
import { Loader2, Search, Lock } from 'lucide-react'

const CONTACT_TYPES = [
  'Todos',
  'Histórico',
  'Atividade',
  'Proposta',
  'stage_change',
  'create',
  'update',
]

export function CrmHistory() {
  const [records, setRecords] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('Todos')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const load = async () => {
    try {
      setRecords(await getConsolidatedHistory())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('crm_history', () => load())
  useRealtime('crm_activities', () => load())
  useRealtime('crm_proposals', () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    const matchSearch =
      !term ||
      String(r.subject || '')
        .toLowerCase()
        .includes(term) ||
      String(r.responsible || '')
        .toLowerCase()
        .includes(term) ||
      String(r.result || '')
        .toLowerCase()
        .includes(term)
    const matchType = typeFilter === 'Todos' || r.source === typeFilter || r.type === typeFilter
    const dateStr = String(r.date || '')
    const matchStart = !startDate || dateStr >= startDate
    const matchEnd = !endDate || dateStr <= endDate + ' 23:59:59'
    return matchSearch && matchType && matchStart && matchEnd
  })

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por assunto, responsável, resultado..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40 focus-visible:ring-[#005B2E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-40 focus-visible:ring-[#005B2E]"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-40 focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} registro(s)</p>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" /> Registros não podem ser excluídos
            </span>
          </div>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-lg font-bold">Nenhum histórico encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r, i) => (
            <Card key={String(r.id || i)} className="border border-border">
              <CardContent className="py-2 px-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#005B2E] uppercase">
                        {String(r.source || r.type || '—')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.date ? new Date(String(r.date)).toLocaleString('pt-BR') : '—'}
                      </span>
                      {r.responsible && (
                        <span className="text-xs text-muted-foreground">
                          • {String(r.responsible)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1 font-medium">{String(r.subject || '—')}</p>
                    {r.result && (
                      <p className="text-xs text-muted-foreground mt-0.5">{String(r.result)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

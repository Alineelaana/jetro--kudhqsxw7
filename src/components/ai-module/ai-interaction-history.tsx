import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PaginationControls } from '@/components/pagination-controls'
import { getInteractions } from '@/services/ai-module'
import { useRealtime } from '@/hooks/use-realtime'
import { EVALUATION_OPTIONS, INTERACTION_STATUS } from '@/lib/ai-types'
import { MessageSquare, Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const EVAL_COLORS: Record<string, string> = {
  Correta: 'bg-green-100 text-green-700',
  'Parcialmente Correta': 'bg-yellow-100 text-yellow-700',
  Incorreta: 'bg-red-100 text-red-700',
  Inadequada: 'bg-red-100 text-red-700',
  'Precisa de Revisão': 'bg-orange-100 text-orange-700',
  'Não Avaliada': 'bg-gray-100 text-gray-600',
}

export function AiInteractionHistory() {
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [fAgent, setFAgent] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fEval, setFEval] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const parts: string[] = []
      if (fAgent) parts.push(`agent_name ~ "${fAgent}"`)
      if (fStatus) parts.push(`status = "${fStatus}"`)
      if (fEval) parts.push(`evaluation = "${fEval}"`)
      const filter = parts.length > 0 ? parts.join(' && ') : undefined
      const res = await getInteractions(page, perPage, filter)
      setItems(res.items as unknown as Record<string, unknown>[])
      setTotal(res.totalItems)
    } catch {
      setItems([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [page, perPage, fAgent, fStatus, fEval])
  useRealtime('ai_interactions', () => load())

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Agente</Label>
              <Input
                value={fAgent}
                onChange={(e) => {
                  setFAgent(e.target.value)
                  setPage(1)
                }}
                placeholder="Buscar..."
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select
                value={fStatus || 'all'}
                onValueChange={(v) => {
                  setFStatus(v === 'all' ? '' : v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {INTERACTION_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Avaliação</Label>
              <Select
                value={fEval || 'all'}
                onValueChange={(v) => {
                  setFEval(v === 'all' ? '' : v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {EVALUATION_OPTIONS.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma interação registrada.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#01361D] text-white">
                    <th className="text-left px-3 py-3 font-bold">Data</th>
                    <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Usuário</th>
                    <th className="text-left px-3 py-3 font-bold">Agente</th>
                    <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Pergunta</th>
                    <th className="text-left px-3 py-3 font-bold">Status</th>
                    <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">
                      Avaliação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id as string}
                      className="border-b border-border hover:bg-[#005B2E]/5"
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        {new Date(item.created as string).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-3 py-2 hidden sm:table-cell text-xs">
                        {(item.user_name as string) || '—'}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium">
                        {(item.agent_name as string) || '—'}
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell text-xs max-w-[200px] truncate">
                        {(item.question as string) || '—'}
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E]">
                          {item.status as string}
                        </span>
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell">
                        <span
                          className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded',
                            EVAL_COLORS[item.evaluation as string] || '',
                          )}
                        >
                          {(item.evaluation as string) || 'Não Avaliada'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <PaginationControls
            totalRecords={total}
            pageSize={perPage}
            currentPage={page}
            onPageChange={setPage}
            onPageSizeChange={() => {}}
          />
        </>
      )}
    </div>
  )
}

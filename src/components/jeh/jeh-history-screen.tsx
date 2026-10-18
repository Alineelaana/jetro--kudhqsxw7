import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { JetroTable } from '@/components/jetro-table'
import type { JetroColumnDef } from '@/components/jetro-table/types'
import { JehPageHeader } from './jeh-header'
import {
  JehAssistantService,
  type JehTestEvaluationItem,
  type JehEvaluationRating,
} from '@/services/jeh-assistant'
import { Search, ThumbsUp, AlertCircle, ThumbsDown, RotateCcw, Sparkles } from 'lucide-react'

const RATING_CONFIG: Record<JehEvaluationRating, { label: string; color: string; icon: any }> = {
  correta: {
    label: 'Correta',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ThumbsUp,
  },
  parcial: {
    label: 'Parcial',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle,
  },
  incorreta: {
    label: 'Incorreta',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: ThumbsDown,
  },
}

export function JehHistoryScreen() {
  const [items, setItems] = useState<JehTestEvaluationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('todos')

  const { toast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await JehAssistantService.listEvaluations()
      setItems(data)
    } catch {
      toast({
        title: 'Erro ao carregar histórico de testes e avaliações',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.assistant_reply.toLowerCase().includes(search.toLowerCase()) ||
        (item.suggested_answer &&
          item.suggested_answer.toLowerCase().includes(search.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()))
      const matchRating = ratingFilter === 'todos' || item.evaluation === ratingFilter
      return matchSearch && matchRating
    })
  }, [items, search, ratingFilter])

  const columns: JetroColumnDef<JehTestEvaluationItem>[] = useMemo(
    () => [
      {
        id: 'question',
        header: 'Pergunta Testada',
        accessorKey: 'question',
        dataType: 'text',
        defaultWidth: 260,
        render: (row) => (
          <div className="space-y-0.5">
            <span className="font-semibold text-gray-900 line-clamp-2">{row.question}</span>
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="text-[9px] py-0 px-1.5 bg-blue-50 text-blue-700 border-blue-200 font-medium"
              >
                Teste Interno
              </Badge>
            </div>
          </div>
        ),
      },
      {
        id: 'assistant_reply',
        header: 'Resposta Fornecida pela Jeh',
        accessorKey: 'assistant_reply',
        dataType: 'text',
        defaultWidth: 320,
        render: (row) => (
          <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
            {row.assistant_reply}
          </p>
        ),
      },
      {
        id: 'evaluation',
        header: 'Avaliação',
        accessorKey: 'evaluation',
        dataType: 'text',
        align: 'center',
        defaultWidth: 130,
        render: (row) => {
          const cfg = RATING_CONFIG[row.evaluation] || RATING_CONFIG.correta
          const Icon = cfg.icon
          return (
            <Badge variant="outline" className={`text-[11px] font-semibold gap-1 ${cfg.color}`}>
              <Icon className="w-3 h-3" />
              {cfg.label}
            </Badge>
          )
        },
      },
      {
        id: 'suggested_answer',
        header: 'Sugestão de Correção / Notas',
        accessorKey: 'suggested_answer',
        dataType: 'text',
        defaultWidth: 260,
        render: (row) => (
          <div className="text-xs text-gray-600">
            {row.suggested_answer ? (
              <span className="line-clamp-2 text-emerald-800 bg-emerald-50/60 p-1 rounded border border-emerald-100">
                {row.suggested_answer}
              </span>
            ) : row.notes ? (
              <span className="italic text-gray-500 line-clamp-1">{row.notes}</span>
            ) : (
              <span className="text-gray-400 italic">Sem notas adicionais</span>
            )}
          </div>
        ),
      },
      {
        id: 'created',
        header: 'Data / Hora',
        accessorKey: 'created',
        dataType: 'date',
        defaultWidth: 140,
        render: (row) => (
          <span className="text-xs text-gray-500">
            {new Date(row.created).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <JehPageHeader
        title="Histórico de Testes e Avaliações"
        description="Rastreabilidade de conversas de teste, avaliações humanas de acurácia e sugestões de correção registradas."
      />

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card border rounded-lg shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por pergunta, resposta ou notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="h-8 text-xs w-[160px]">
              <SelectValue placeholder="Avaliação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Avaliações</SelectItem>
              <SelectItem value="correta">Apenas Corretas</SelectItem>
              <SelectItem value="parcial">Apenas Parciais</SelectItem>
              <SelectItem value="incorreta">Apenas Incorretas</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-8 w-8 p-0"
            title="Recarregar"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* TABELA JETRO */}
      <JetroTable
        screenId="jeh.history.table"
        columns={columns}
        data={filteredItems}
        loading={loading}
        rowKey="id"
        emptyMessage="Nenhuma avaliação ou conversa de teste registrada ainda."
        exportTitle="Histórico de Testes da Assistente Jeh"
        exportFilename="jeh-historico-testes.xlsx"
      />
    </div>
  )
}

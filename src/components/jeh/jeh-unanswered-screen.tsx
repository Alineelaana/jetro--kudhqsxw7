import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { JetroTable } from '@/components/jetro-table'
import type { JetroColumnDef } from '@/components/jetro-table/types'
import { JehPageHeader } from './jeh-header'
import {
  JehAssistantService,
  type JehUnansweredItem,
  type JehUnansweredStatus,
} from '@/services/jeh-assistant'
import {
  Search,
  CheckCircle,
  Clock,
  RotateCcw,
  MoreVertical,
  PlusCircle,
  XCircle,
  Eye,
} from 'lucide-react'

const STATUS_CONFIG: Record<JehUnansweredStatus, { label: string; color: string; icon: any }> = {
  pendente: {
    label: 'Pendente',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  em_analise: { label: 'Em Análise', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Eye },
  respondido: {
    label: 'Respondido',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  descartado: {
    label: 'Descartado',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: XCircle,
  },
}

export function JehUnansweredScreen() {
  const [items, setItems] = useState<JehUnansweredItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

  // Diálogo para cadastrar resposta oficial e resolver
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<JehUnansweredItem | null>(null)
  const [officialAnswer, setOfficialAnswer] = useState('')
  const [category, setCategory] = useState('')
  const [variations, setVariations] = useState<string[]>([])
  const [variationInput, setVariationInput] = useState('')
  const [resolving, setResolving] = useState(false)

  const { toast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await JehAssistantService.listUnanswered()
      setItems(data)
    } catch {
      toast({
        title: 'Erro ao listar perguntas sem resposta',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenResolve = (item: JehUnansweredItem) => {
    setSelectedItem(item)
    setOfficialAnswer('')
    setCategory(item.subject || 'Geral')
    setVariations([item.question])
    setVariationInput('')
    setResolveDialogOpen(true)
  }

  const handleAddVariation = () => {
    if (!variationInput.trim()) return
    setVariations((prev) => [...prev, variationInput.trim()])
    setVariationInput('')
  }

  const handleSaveResolution = async () => {
    if (!selectedItem || !officialAnswer.trim()) {
      toast({ title: 'Preencha a resposta oficial', variant: 'destructive' })
      return
    }

    setResolving(true)
    try {
      await JehAssistantService.convertUnansweredToQA(selectedItem.id, {
        question: selectedItem.question,
        official_answer: officialAnswer.trim(),
        variations: variations.filter((v) => v !== selectedItem.question),
        category: category || 'Geral',
      })
      toast({
        title: 'Pergunta tratada com sucesso',
        description:
          'A resposta oficial foi incorporada ao Q&A e o status atualizado para "Respondido".',
      })
      setResolveDialogOpen(false)
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao tratar pergunta',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setResolving(false)
    }
  }

  const handleQuickStatusChange = async (id: string, newStatus: JehUnansweredStatus) => {
    try {
      await JehAssistantService.updateUnansweredStatus(id, newStatus)
      toast({ title: 'Status de tratamento atualizado' })
      await loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar status', description: err.message, variant: 'destructive' })
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        (item.subject && item.subject.toLowerCase().includes(search.toLowerCase()))
      const matchStatus = statusFilter === 'todos' || item.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [items, search, statusFilter])

  const columns: JetroColumnDef<JehUnansweredItem>[] = useMemo(
    () => [
      {
        id: 'question',
        header: 'Pergunta Registrada',
        accessorKey: 'question',
        dataType: 'text',
        defaultWidth: 360,
        render: (row) => (
          <div className="space-y-0.5">
            <span className="font-semibold text-gray-900 line-clamp-2">{row.question}</span>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span>
                Assunto: <strong>{row.subject || 'Não classificado'}</strong>
              </span>
            </div>
          </div>
        ),
      },
      {
        id: 'occurrences',
        header: 'Ocorrências',
        accessorKey: 'occurrences',
        dataType: 'number',
        align: 'center',
        defaultWidth: 120,
        render: (row) => (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-xs">
            {row.occurrences}x
          </div>
        ),
      },
      {
        id: 'date',
        header: 'Data do Registro',
        accessorKey: 'date',
        dataType: 'date',
        defaultWidth: 140,
        render: (row) => (
          <span className="text-xs text-gray-500">
            {new Date(row.date).toLocaleDateString('pt-BR')}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status de Tratamento',
        accessorKey: 'status',
        dataType: 'text',
        align: 'center',
        defaultWidth: 150,
        render: (row) => {
          const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.pendente
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
        id: 'actions',
        header: 'Ações',
        sortable: false,
        align: 'right',
        defaultWidth: 140,
        render: (row) => (
          <div className="flex items-center justify-end gap-1.5">
            {row.status !== 'respondido' && (
              <Button
                size="sm"
                onClick={() => handleOpenResolve(row)}
                className="h-7 text-[11px] bg-[#005B2E] hover:bg-[#01361D] text-white px-2.5 font-medium"
              >
                <PlusCircle className="w-3 h-3 mr-1" />
                Cadastrar Resposta
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                {row.status !== 'em_analise' && (
                  <DropdownMenuItem onClick={() => handleQuickStatusChange(row.id, 'em_analise')}>
                    <Eye className="w-3.5 h-3.5 mr-2 text-blue-600" />
                    Marcar Em Análise
                  </DropdownMenuItem>
                )}
                {row.status !== 'descartado' && (
                  <DropdownMenuItem onClick={() => handleQuickStatusChange(row.id, 'descartado')}>
                    <XCircle className="w-3.5 h-3.5 mr-2 text-gray-500" />
                    Descartar Ocorrência
                  </DropdownMenuItem>
                )}
                {row.status !== 'pendente' && (
                  <DropdownMenuItem onClick={() => handleQuickStatusChange(row.id, 'pendente')}>
                    <Clock className="w-3.5 h-3.5 mr-2 text-amber-600" />
                    Retornar para Pendente
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <JehPageHeader
        title="Perguntas sem Resposta da Jeh"
        description="Fila de ocorrências não respondidas pela assistente, volume de repetições e fluxo de oficialização."
      />

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card border rounded-lg shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar pergunta ou assunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="pendente">Apenas Pendentes</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="respondido">Respondidos</SelectItem>
              <SelectItem value="descartado">Descartados</SelectItem>
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
        screenId="jeh.unanswered.table"
        columns={columns}
        data={filteredItems}
        loading={loading}
        rowKey="id"
        emptyMessage="Nenhuma pergunta sem resposta registrada no momento."
        exportTitle="Perguntas sem Resposta — Assistente Jeh"
        exportFilename="jeh-perguntas-sem-resposta.xlsx"
      />

      {/* DIÁLOGO PARA CADASTRAR RESPOSTA OFICIAL */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#005B2E]" />
              Cadastrar Resposta Oficial para a Pergunta
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Esta ação criará um registro em Perguntas & Respostas e marcará a ocorrência como
              respondida.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-2">
            <div className="p-3 bg-gray-50 rounded-lg border text-xs space-y-1">
              <span className="font-semibold text-gray-500 uppercase text-[10px]">
                Pergunta Não Respondida
              </span>
              <p className="font-bold text-gray-900">{selectedItem?.question}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Resposta Oficial Definitiva *</Label>
              <Textarea
                rows={5}
                required
                placeholder="Insira a resposta institucional oficial para atender a essa pergunta..."
                value={officialAnswer}
                onChange={(e) => setOfficialAnswer(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Categoria / Assunto</Label>
                <Input
                  placeholder="Ex: Comercial, Suporte, Diretrizes"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Outra Variação de Pergunta</Label>
                <div className="flex gap-1.5">
                  <Input
                    placeholder="Adicionar formulação..."
                    value={variationInput}
                    onChange={(e) => setVariationInput(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddVariation}
                    className="h-8 text-xs shrink-0"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResolveDialogOpen(false)}
              disabled={resolving}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveResolution}
              disabled={resolving || !officialAnswer.trim()}
              className="text-xs bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {resolving ? 'Salvando...' : 'Oficializar Resposta e Resolver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

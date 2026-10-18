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
  type JehUnansweredClassification,
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
  AlertTriangle,
  FileQuestion,
  HelpCircle,
  Sparkles,
  Info,
  Tag,
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

export const CLASSIFICATION_CONFIG: Record<
  JehUnansweredClassification,
  {
    label: string
    shortLabel: string
    color: string
    description: string
    isCovered: boolean
    icon: any
  }
> = {
  coberta_pela_base: {
    label: 'Coberta pela Base (Falha de Recuperação/Encaminhamento)',
    shortLabel: 'Coberta pela Base',
    color: 'bg-rose-50 text-rose-700 border-rose-300 font-bold',
    description:
      'Esta pergunta JÁ TEM conteúdo oficial na base de conhecimento ou Q&A. Se ela apareceu aqui, houve falha de recuperação pelo modelo ou encaminhamento desnecessário ao invés de responder com a base existente.',
    isCovered: true,
    icon: AlertTriangle,
  },
  sem_conteudo_base: {
    label: 'Sem Conteúdo na Base',
    shortLabel: 'Sem Conteúdo',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Pergunta inédita ou tema ainda não coberto na base de conhecimento da Jeh.',
    isCovered: false,
    icon: FileQuestion,
  },
  resposta_incompleta: {
    label: 'Resposta Incompleta',
    shortLabel: 'Resposta Incompleta',
    color: 'bg-amber-50 text-amber-800 border-amber-300',
    description:
      'A assistente forneceu apenas parte da resposta e precisou encaminhar por falta de detalhe específico.',
    isCovered: false,
    icon: Info,
  },
  encaminhamento_desnecessario: {
    label: 'Encaminhamento Desnecessário ao WhatsApp',
    shortLabel: 'Encam. Desnecessário',
    color: 'bg-orange-50 text-orange-800 border-orange-300',
    description:
      'A assistente direcionou para o WhatsApp sem esgotar o conteúdo institucional disponível.',
    isCovered: false,
    icon: AlertTriangle,
  },
  falha_recuperacao: {
    label: 'Falha ao Recuperar Informação',
    shortLabel: 'Falha Recuperação',
    color: 'bg-purple-50 text-purple-700 border-purple-300',
    description:
      'O conhecimento existia, mas o modelo não associou os termos da pergunta aos documentos.',
    isCovered: false,
    icon: Sparkles,
  },
  pergunta_frequente: {
    label: 'Pergunta Frequente Candidata a Q&A',
    shortLabel: 'Pergunta Frequente',
    color: 'bg-blue-50 text-blue-700 border-blue-300',
    description:
      'Ocorrência com alta frequência de repetição que deve ser oficializada com resposta canônica.',
    isCovered: false,
    icon: HelpCircle,
  },
  geral: {
    label: 'Geral / Não Classificada',
    shortLabel: 'Geral',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    description: 'Ocorrência pendente de triagem específica.',
    isCovered: false,
    icon: Tag,
  },
}

export function JehUnansweredScreen() {
  const [items, setItems] = useState<JehUnansweredItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [classificationFilter, setClassificationFilter] = useState<string>('todos')

  // Diálogo para cadastrar resposta oficial e resolver
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<JehUnansweredItem | null>(null)
  const [officialAnswer, setOfficialAnswer] = useState('')
  const [category, setCategory] = useState('')
  const [resolutionClassification, setResolutionClassification] =
    useState<JehUnansweredClassification>('sem_conteudo_base')
  const [variations, setVariations] = useState<string[]>([])
  const [variationInput, setVariationInput] = useState('')
  const [resolving, setResolving] = useState(false)

  // Diálogo para detalhe/visualização da ocorrência
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<JehUnansweredItem | null>(null)

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
    setOfficialAnswer(item.approved_correction || '')
    setCategory(item.subject || 'Geral')
    setResolutionClassification(item.classification || 'sem_conteudo_base')
    setVariations([item.question])
    setVariationInput('')
    setResolveDialogOpen(true)
  }

  const handleOpenDetail = (item: JehUnansweredItem) => {
    setDetailItem(item)
    setDetailDialogOpen(true)
  }

  const handleChangeClassification = async (
    id: string,
    newClassification: JehUnansweredClassification,
  ) => {
    try {
      await JehAssistantService.updateUnansweredClassification(id, newClassification)
      toast({
        title: 'Classificação atualizada',
        description: `Ocorrência reclassificada para "${CLASSIFICATION_CONFIG[newClassification]?.label}".`,
      })
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao alterar classificação',
        description: err.message,
        variant: 'destructive',
      })
    }
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
        classification: resolutionClassification,
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
        (item.subject && item.subject.toLowerCase().includes(search.toLowerCase())) ||
        (item.provided_answer && item.provided_answer.toLowerCase().includes(search.toLowerCase()))
      const matchStatus = statusFilter === 'todos' || item.status === statusFilter
      const itemClass = item.classification || 'sem_conteudo_base'
      const matchClassification =
        classificationFilter === 'todos' || itemClass === classificationFilter
      return matchSearch && matchStatus && matchClassification
    })
  }, [items, search, statusFilter, classificationFilter])

  const columns: JetroColumnDef<JehUnansweredItem>[] = useMemo(
    () => [
      {
        id: 'question',
        header: 'Pergunta Registrada',
        accessorKey: 'question',
        dataType: 'text',
        defaultWidth: 320,
        render: (row) => {
          const isCovered = row.classification === 'coberta_pela_base'
          return (
            <div className="space-y-1">
              <div className="flex items-start gap-1.5">
                <span className="font-semibold text-gray-900 line-clamp-2">{row.question}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                <span>
                  Assunto: <strong className="text-gray-700">{row.subject || 'Geral'}</strong>
                </span>
                {row.source && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-gray-100 text-gray-600 border">
                    Origem: {row.source === 'publico' ? 'Site Público' : 'Teste Interno'}
                  </span>
                )}
              </div>
              {isCovered && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 border border-rose-200 text-rose-700">
                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                  Pergunta já coberta na base — falha de recuperação ou encaminhamento indevido
                </div>
              )}
            </div>
          )
        },
      },
      {
        id: 'classification',
        header: 'Classificação da Ocorrência',
        accessorKey: 'classification',
        dataType: 'text',
        defaultWidth: 220,
        render: (row) => {
          const key = row.classification || 'sem_conteudo_base'
          const cfg = CLASSIFICATION_CONFIG[key] || CLASSIFICATION_CONFIG.geral
          const Icon = cfg.icon
          return (
            <div className="space-y-1">
              <Badge
                variant="outline"
                className={`text-[11px] font-medium gap-1 max-w-full whitespace-normal text-left py-0.5 ${cfg.color}`}
                title={cfg.description}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{cfg.shortLabel}</span>
              </Badge>
              {cfg.isCovered && (
                <p className="text-[10px] text-rose-600 font-medium leading-tight">
                  Conteúdo existente na base
                </p>
              )}
            </div>
          )
        },
      },
      {
        id: 'occurrences',
        header: 'Repetições',
        accessorKey: 'occurrences',
        dataType: 'number',
        align: 'center',
        defaultWidth: 100,
        render: (row) => (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-xs">
            {row.occurrences}x
          </div>
        ),
      },
      {
        id: 'date',
        header: 'Última Ocorrência',
        accessorKey: 'date',
        dataType: 'date',
        defaultWidth: 130,
        render: (row) => (
          <span className="text-xs text-gray-500">
            {new Date(row.date).toLocaleDateString('pt-BR')}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        dataType: 'text',
        align: 'center',
        defaultWidth: 130,
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
        defaultWidth: 160,
        render: (row) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenDetail(row)}
              className="h-7 text-[11px] px-2 font-medium"
              title="Ver detalhes da ocorrência"
            >
              <Eye className="w-3 h-3 mr-1" />
              Detalhes
            </Button>

            {row.status !== 'respondido' && (
              <Button
                size="sm"
                onClick={() => handleOpenResolve(row)}
                className="h-7 text-[11px] bg-[#005B2E] hover:bg-[#01361D] text-white px-2.5 font-medium"
              >
                <PlusCircle className="w-3 h-3 mr-1" />
                Oficializar
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 text-xs">
                <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase">
                  Classificar Ocorrência
                </div>
                {(Object.keys(CLASSIFICATION_CONFIG) as JehUnansweredClassification[]).map(
                  (classKey) => (
                    <DropdownMenuItem
                      key={classKey}
                      onClick={() => handleChangeClassification(row.id, classKey)}
                      className={row.classification === classKey ? 'bg-gray-100 font-semibold' : ''}
                    >
                      <Tag className="w-3 h-3 mr-2 text-gray-400" />
                      {CLASSIFICATION_CONFIG[classKey].shortLabel}
                    </DropdownMenuItem>
                  ),
                )}

                <div className="border-t my-1" />
                <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase">
                  Status de Tratamento
                </div>
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

  const coveredCount = useMemo(
    () => items.filter((it) => it.classification === 'coberta_pela_base').length,
    [items],
  )

  return (
    <div className="space-y-4">
      <JehPageHeader
        title="Perguntas sem Resposta da Jeh"
        description="Fila de ocorrências não respondidas, classificação da causa, repetições e fluxo de oficialização."
      />

      {/* ALERTA DE PERGUNTAS COBERTAS PELA BASE */}
      {coveredCount > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <strong className="font-semibold">
              Atenção: {coveredCount}{' '}
              {coveredCount === 1 ? 'ocorrência classificada' : 'ocorrências classificadas'} como
              &quot;Coberta pela Base&quot;.
            </strong>
            <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
              Essas perguntas já possuem resposta oficial na base de conhecimento ou Q&A. A presença
              delas indica que a assistente falhou em recuperar a informação ou realizou
              encaminhamento prematuro ao WhatsApp. Revise as variações ou palavras-chave na base
              para reforçar o acoplamento do modelo.
            </p>
          </div>
        </div>
      )}

      {/* FILTROS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-card border rounded-lg shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar pergunta, assunto ou resposta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* FILTRO POR CLASSIFICAÇÃO */}
          <Select value={classificationFilter} onValueChange={setClassificationFilter}>
            <SelectTrigger className="h-8 text-xs w-[200px]">
              <SelectValue placeholder="Classificação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Classificações</SelectItem>
              <SelectItem value="coberta_pela_base">🚨 Coberta pela Base</SelectItem>
              <SelectItem value="sem_conteudo_base">Sem Conteúdo na Base</SelectItem>
              <SelectItem value="resposta_incompleta">Resposta Incompleta</SelectItem>
              <SelectItem value="encaminhamento_desnecessario">
                Encaminhamento Desnecessário
              </SelectItem>
              <SelectItem value="falha_recuperacao">Falha ao Recuperar</SelectItem>
              <SelectItem value="pergunta_frequente">Pergunta Frequente</SelectItem>
              <SelectItem value="geral">Geral / Não Classificada</SelectItem>
            </SelectContent>
          </Select>

          {/* FILTRO POR STATUS */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-[150px]">
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
                Pergunta Registrada
              </span>
              <p className="font-bold text-gray-900">{selectedItem?.question}</p>
              {selectedItem?.classification === 'coberta_pela_base' && (
                <div className="pt-1.5 flex items-start gap-1.5 text-[11px] text-rose-700 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                  <span>
                    Atenção: Esta pergunta foi classificada como já coberta pela base. Certifique-se
                    de adicionar variações e palavras-chave correspondentes para evitar
                    reincidência.
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Classificação de Causa</Label>
                <Select
                  value={resolutionClassification}
                  onValueChange={(val) =>
                    setResolutionClassification(val as JehUnansweredClassification)
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CLASSIFICATION_CONFIG) as JehUnansweredClassification[]).map(
                      (key) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {CLASSIFICATION_CONFIG[key].shortLabel}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Categoria / Assunto</Label>
                <Input
                  placeholder="Ex: Comercial, Suporte, Apresentação Institucional"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
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

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Outra Variação da Pergunta</Label>
              <div className="flex gap-1.5">
                <Input
                  placeholder="Adicionar formulação alternativa..."
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
              {variations.length > 1 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {variations.map((v, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[10px] bg-gray-100 text-gray-700"
                    >
                      {v}
                    </Badge>
                  ))}
                </div>
              )}
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

      {/* DIÁLOGO DE DETALHE DA OCORRÊNCIA */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-700" />
              Detalhe da Ocorrência sem Resposta
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Informações registradas pela assistente no momento do atendimento.
            </DialogDescription>
          </DialogHeader>

          {detailItem && (
            <div className="space-y-3.5 pt-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border space-y-1">
                <span className="font-semibold text-gray-500 uppercase text-[10px]">
                  Pergunta Registrada
                </span>
                <p className="font-bold text-gray-900 text-sm">{detailItem.question}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-500">
                  <span>
                    Ocorrências: <strong>{detailItem.occurrences}x</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Último registro:{' '}
                    <strong>{new Date(detailItem.date).toLocaleString('pt-BR')}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Origem:{' '}
                    <strong>
                      {detailItem.source === 'publico' ? 'Site Público' : 'Teste Interno'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* CARD DE CLASSIFICAÇÃO */}
              <div
                className={`p-3 rounded-lg border space-y-1.5 ${
                  detailItem.classification === 'coberta_pela_base'
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-blue-50/50 border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase text-[10px] text-gray-500">
                    Classificação da Ocorrência
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-semibold ${
                      CLASSIFICATION_CONFIG[detailItem.classification || 'sem_conteudo_base']?.color
                    }`}
                  >
                    {
                      CLASSIFICATION_CONFIG[detailItem.classification || 'sem_conteudo_base']
                        ?.shortLabel
                    }
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-gray-700">
                  {
                    CLASSIFICATION_CONFIG[detailItem.classification || 'sem_conteudo_base']
                      ?.description
                  }
                </p>
                {detailItem.classification === 'coberta_pela_base' && (
                  <div className="pt-1 text-[11px] font-semibold text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    Pergunta coberta pela base oficial: se apareceu aqui, houve falha de recuperação
                    ou encaminhamento desnecessário ao WhatsApp.
                  </div>
                )}
              </div>

              {/* RESPOSTA FORNECIDA PELA ASSISTENTE */}
              {detailItem.provided_answer && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">
                    Resposta Fornecida pela Assistente na Ocasião
                  </Label>
                  <div className="p-3 rounded-lg bg-gray-50 border text-gray-800 text-xs whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {detailItem.provided_answer}
                  </div>
                </div>
              )}

              {/* RESPOSTA CORRIGIDA / OFICIALIZADA */}
              {detailItem.approved_correction && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Resposta Oficial Cadastrada
                  </Label>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs whitespace-pre-wrap leading-relaxed">
                    {detailItem.approved_correction}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDetailDialogOpen(false)}
              className="text-xs"
            >
              Fechar
            </Button>
            {detailItem && detailItem.status !== 'respondido' && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleOpenResolve(detailItem)
                }}
                className="text-xs bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                <PlusCircle className="w-3 h-3 mr-1" />
                Oficializar Resposta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

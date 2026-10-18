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
import { JehAssistantService, type JehQAItem, type JehQAStatus } from '@/services/jeh-assistant'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react'

const STATUS_CONFIG: Record<JehQAStatus, { label: string; color: string; icon: any }> = {
  ativo: {
    label: 'Ativo',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  inativo: { label: 'Inativo', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  rascunho: {
    label: 'Rascunho',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
}

export function JehQAScreen() {
  const [items, setItems] = useState<JehQAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<JehQAItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [question, setQuestion] = useState('')
  const [officialAnswer, setOfficialAnswer] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<JehQAStatus>('ativo')
  const [variations, setVariations] = useState<string[]>([])
  const [variationInput, setVariationInput] = useState('')

  const { toast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await JehAssistantService.listQA()
      setItems(data)
    } catch {
      toast({
        title: 'Erro ao listar Perguntas e Respostas',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setQuestion('')
    setOfficialAnswer('')
    setCategory('Institucional')
    setStatus('ativo')
    setVariations([])
    setVariationInput('')
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: JehQAItem) => {
    setEditingItem(item)
    setQuestion(item.question)
    setOfficialAnswer(item.official_answer)
    setCategory(item.category)
    setStatus(item.status)
    setVariations(item.variations || [])
    setVariationInput('')
    setDialogOpen(true)
  }

  const handleAddVariation = () => {
    if (!variationInput.trim()) return
    if (variations.includes(variationInput.trim())) {
      toast({ title: 'Variação já inserida', variant: 'destructive' })
      return
    }
    setVariations((prev) => [...prev, variationInput.trim()])
    setVariationInput('')
  }

  const handleRemoveVariation = (index: number) => {
    setVariations((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !officialAnswer.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Pergunta e resposta oficial são exigidas.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        await JehAssistantService.updateQA(editingItem.id, {
          question,
          official_answer: officialAnswer,
          variations,
          category,
          status,
        })
        toast({ title: 'Pergunta & Resposta atualizada' })
      } else {
        await JehAssistantService.createQA({
          question,
          official_answer: officialAnswer,
          variations,
          category,
          status,
        })
        toast({ title: 'Pergunta & Resposta cadastrada' })
      }
      setDialogOpen(false)
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta pergunta e resposta oficial?')) return
    try {
      await JehAssistantService.deleteQA(id)
      toast({ title: 'Registro excluído' })
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleQuickStatusChange = async (id: string, newStatus: JehQAStatus) => {
    try {
      await JehAssistantService.updateQA(id, { status: newStatus })
      toast({
        title: 'Status atualizado',
        description: `Q&A alterada para "${STATUS_CONFIG[newStatus]?.label}".`,
      })
      await loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao alterar status', description: err.message, variant: 'destructive' })
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.official_answer.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.variations.some((v) => v.toLowerCase().includes(search.toLowerCase()))
      const matchStatus = statusFilter === 'todos' || item.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [items, search, statusFilter])

  const columns: JetroColumnDef<JehQAItem>[] = useMemo(
    () => [
      {
        id: 'question',
        header: 'Pergunta Canônica & Variações',
        accessorKey: 'question',
        dataType: 'text',
        defaultWidth: 320,
        render: (row) => (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">{row.question}</div>
            {row.variations && row.variations.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {row.variations.slice(0, 3).map((v, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 border border-gray-200"
                  >
                    "{v}"
                  </span>
                ))}
                {row.variations.length > 3 && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    +{row.variations.length - 3} variações
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-gray-400 italic">Sem variações cadastradas</span>
            )}
          </div>
        ),
      },
      {
        id: 'official_answer',
        header: 'Resposta Oficial',
        accessorKey: 'official_answer',
        dataType: 'text',
        defaultWidth: 320,
        render: (row) => (
          <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
            {row.official_answer}
          </p>
        ),
      },
      {
        id: 'category',
        header: 'Categoria',
        accessorKey: 'category',
        dataType: 'text',
        defaultWidth: 140,
        render: (row) => (
          <Badge variant="outline" className="text-[10px] font-semibold bg-gray-50 text-gray-700">
            {row.category}
          </Badge>
        ),
      },
      {
        id: 'access_count',
        header: 'Consultas',
        accessorKey: 'access_count',
        dataType: 'number',
        align: 'center',
        defaultWidth: 100,
        render: (row) => (
          <span className="text-xs font-mono font-bold text-gray-700">{row.access_count || 0}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        dataType: 'text',
        align: 'center',
        defaultWidth: 120,
        render: (row) => {
          const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.ativo
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
        defaultWidth: 80,
        render: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuItem onClick={() => handleOpenEdit(row)}>
                <Edit className="w-3.5 h-3.5 mr-2 text-blue-600" />
                Editar Pergunta & Resposta
              </DropdownMenuItem>

              {row.status !== 'ativo' && (
                <DropdownMenuItem onClick={() => handleQuickStatusChange(row.id, 'ativo')}>
                  <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                  Ativar
                </DropdownMenuItem>
              )}

              {row.status !== 'inativo' && (
                <DropdownMenuItem onClick={() => handleQuickStatusChange(row.id, 'inativo')}>
                  <XCircle className="w-3.5 h-3.5 mr-2 text-gray-500" />
                  Desativar
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => handleDelete(row.id)}
                className="text-red-600 focus:text-red-700"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <JehPageHeader
        title="Perguntas e Respostas da Jeh"
        description="Cadastro de perguntas canônicas, variações de formulação e respostas institucionais padronizadas."
        action={
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-8 text-xs bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Nova Pergunta & Resposta
          </Button>
        }
      />

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card border rounded-lg shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por pergunta, variação ou resposta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
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
        screenId="jeh.qa.table"
        columns={columns}
        data={filteredItems}
        loading={loading}
        rowKey="id"
        emptyMessage="Nenhuma pergunta e resposta cadastrada."
        exportTitle="Perguntas e Respostas — Assistente Jeh"
        exportFilename="jeh-perguntas-respostas.xlsx"
      />

      {/* DIÁLOGO CADASTRO/EDIÇÃO */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">
              {editingItem
                ? 'Editar Pergunta e Resposta'
                : 'Cadastrar Pergunta e Resposta Canônica'}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Associe uma pergunta principal e múltiplas variações de formulação a uma resposta
              oficial inequívoca.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Pergunta Canônica (Forma Principal) *</Label>
              <Input
                required
                placeholder="Ex: O que é o Jetro?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            {/* SEÇÃO DE VARIAÇÕES DE FORMULAÇÃO */}
            <div className="space-y-2 p-3 bg-gray-50/70 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-gray-800">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                  Variações de Formulação (Sinônimos da Pergunta)
                </Label>
                <span className="text-[11px] text-gray-500">{variations.length} adicionada(s)</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Formas alternativas que o usuário pode perguntar, apontando para a mesma resposta
                oficial (ex: "Para que serve o Jetro?", "O Jetro é um ERP?").
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma variação e clique em adicionar..."
                  value={variationInput}
                  onChange={(e) => setVariationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddVariation()
                    }
                  }}
                  className="h-8 text-xs bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariation}
                  className="h-8 text-xs shrink-0"
                >
                  Adicionar
                </Button>
              </div>

              {variations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {variations.map((v, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-xs py-1 px-2 flex items-center gap-1.5 bg-white border border-gray-200 text-gray-800"
                    >
                      <span>"{v}"</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariation(idx)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Resposta Oficial da Assistente *</Label>
              <Textarea
                required
                rows={5}
                placeholder="Insira a resposta oficial exata e objetiva que a Jeh deve fornecer..."
                value={officialAnswer}
                onChange={(e) => setOfficialAnswer(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Categoria / Assunto *</Label>
                <Input
                  required
                  placeholder="Ex: Comercial, Suporte, Institucional"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo (visível e utilizado)</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="text-xs bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                {saving
                  ? 'Salvando...'
                  : editingItem
                    ? 'Salvar Alterações'
                    : 'Salvar Pergunta & Resposta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

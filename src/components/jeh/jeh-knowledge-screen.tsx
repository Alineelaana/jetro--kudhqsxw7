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
import { pb } from '@/lib/pocketbase/client'
import { JetroTable } from '@/components/jetro-table'
import type { JetroColumnDef } from '@/components/jetro-table/types'
import { JehPageHeader } from './jeh-header'
import {
  JehAssistantService,
  type JehKnowledgeItem,
  type JehKnowledgeStatus,
} from '@/services/jeh-assistant'
import {
  Plus,
  Search,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  RotateCcw,
} from 'lucide-react'

const STATUS_CONFIG: Record<JehKnowledgeStatus, { label: string; color: string; icon: any }> = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock },
  aprovado: {
    label: 'Aprovado',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  revisar: { label: 'Revisar', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  inativo: { label: 'Inativo', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
}

export function JehKnowledgeScreen() {
  const [items, setItems] = useState<JehKnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<JehKnowledgeItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [keywords, setKeywords] = useState('')
  const [status, setStatus] = useState<JehKnowledgeStatus>('rascunho')
  const [sourceDoc, setSourceDoc] = useState('')

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importCategory, setImportCategory] = useState('Geral')
  const [importing, setImporting] = useState(false)

  const { toast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await JehAssistantService.listKnowledge()
      setItems(data)
    } catch {
      toast({
        title: 'Erro ao listar conteúdos',
        description: 'Falha ao buscar os registros da base de conhecimento.',
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
    setTitle('')
    setCategory('Institucional')
    setContent('')
    setKeywords('')
    setStatus('rascunho')
    setSourceDoc('')
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: JehKnowledgeItem) => {
    setEditingItem(item)
    setTitle(item.title)
    setCategory(item.category)
    setContent(item.content)
    setKeywords(item.keywords || '')
    setStatus(item.status)
    setSourceDoc(item.source_document || '')
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha título e conteúdo.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        await JehAssistantService.updateKnowledge(editingItem.id, {
          title,
          category,
          content,
          keywords,
          status,
          source_document: sourceDoc,
        })
        toast({ title: 'Conteúdo atualizado', description: 'Registro salvo com sucesso.' })
      } else {
        await JehAssistantService.createKnowledge({
          title,
          category,
          content,
          keywords,
          status,
          responsible: pb.authStore.record?.email || 'Admin',
          source_document: sourceDoc,
        })
        toast({ title: 'Conteúdo cadastrado', description: 'Novo item adicionado à base.' })
      }
      setDialogOpen(false)
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Falha de comunicação com o servidor.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este conteúdo da base?')) return
    try {
      await JehAssistantService.deleteKnowledge(id)
      toast({ title: 'Conteúdo excluído' })
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleQuickStatusChange = async (id: string, newStatus: JehKnowledgeStatus) => {
    try {
      await JehAssistantService.updateKnowledge(id, { status: newStatus })
      toast({
        title: 'Status atualizado',
        description: `Conteúdo alterado para "${STATUS_CONFIG[newStatus]?.label}".`,
      })
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao alterar status',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Importação de arquivo (TXT, Markdown ou leitura básica)
  const handleImportFile = async () => {
    if (!importFile) {
      toast({ title: 'Selecione um arquivo', variant: 'destructive' })
      return
    }

    setImporting(true)
    try {
      const text = await importFile.text()
      const titleFromFile = importFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')

      await JehAssistantService.createKnowledge({
        title: titleFromFile,
        category: importCategory || 'Documentos',
        content: text.slice(0, 15000), // limite seguro
        keywords: importFile.name,
        status: 'rascunho',
        responsible: pb.authStore.record?.email || 'Admin',
        source_document: importFile.name,
      })

      toast({
        title: 'Arquivo importado com sucesso',
        description: `"${importFile.name}" foi registrado como rascunho para aprovação.`,
      })
      setImportDialogOpen(false)
      setImportFile(null)
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Falha na importação',
        description: err.message || 'Não foi possível ler o arquivo enviado.',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase()) ||
        (item.keywords && item.keywords.toLowerCase().includes(search.toLowerCase())) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'todos' || item.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [items, search, statusFilter])

  const columns: JetroColumnDef<JehKnowledgeItem>[] = useMemo(
    () => [
      {
        id: 'title',
        header: 'Título & Categoria',
        accessorKey: 'title',
        dataType: 'text',
        defaultWidth: 280,
        render: (row) => (
          <div className="space-y-0.5">
            <div className="font-semibold text-gray-900 line-clamp-1">{row.title}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-600">
                {row.category}
              </span>
              {row.source_document && (
                <span
                  className="flex items-center gap-1 text-[10px] text-blue-600 truncate max-w-[140px]"
                  title={row.source_document}
                >
                  <FileText className="w-3 h-3 shrink-0" />
                  {row.source_document}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'content',
        header: 'Conteúdo Resumido',
        accessorKey: 'content',
        dataType: 'text',
        defaultWidth: 320,
        render: (row) => (
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{row.content}</p>
        ),
      },
      {
        id: 'status',
        header: 'Status de Aprovação',
        accessorKey: 'status',
        dataType: 'text',
        align: 'center',
        defaultWidth: 150,
        render: (row) => {
          const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.rascunho
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
        id: 'responsible',
        header: 'Responsável',
        accessorKey: 'responsible',
        dataType: 'text',
        defaultWidth: 160,
        render: (row) => (
          <span className="text-xs text-gray-600 truncate block max-w-[150px]">
            {row.responsible || 'Sistema'}
          </span>
        ),
      },
      {
        id: 'updated',
        header: 'Última Atualização',
        accessorKey: 'updated',
        dataType: 'date',
        defaultWidth: 140,
        render: (row) => (
          <span className="text-xs text-gray-500">
            {new Date(row.updated).toLocaleDateString('pt-BR')}
          </span>
        ),
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
                Editar Conteúdo
              </DropdownMenuItem>

              {row.status !== 'aprovado' && (
                <DropdownMenuItem onClick={() => handleQuickStatusChange(row.id, 'aprovado')}>
                  <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                  Aprovar para Base
                </DropdownMenuItem>
              )}

              {row.status !== 'revisar' && (
                <DropdownMenuItem onClick={() => handleQuickStatusChange(row.id, 'revisar')}>
                  <Clock className="w-3.5 h-3.5 mr-2 text-amber-600" />
                  Marcar para Revisão
                </DropdownMenuItem>
              )}

              {row.status !== 'inativo' && (
                <DropdownMenuItem onClick={() => handleQuickStatusChange(row.id, 'inativo')}>
                  <XCircle className="w-3.5 h-3.5 mr-2 text-gray-500" />
                  Desativar Item
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
        title="Base de Conhecimento da Jeh"
        description="Gestão de conteúdos institucionais, políticas, diretrizes e fluxo de aprovação da assistente."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportDialogOpen(true)}
              className="h-8 text-xs border-border"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Importar Documento
            </Button>
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="h-8 text-xs bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Novo Conteúdo
            </Button>
          </div>
        }
      />

      {/* BARRA DE FILTROS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card border rounded-lg shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por título, conteúdo ou tag..."
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
              <SelectItem value="aprovado">Apenas Aprovados</SelectItem>
              <SelectItem value="rascunho">Apenas Rascunhos</SelectItem>
              <SelectItem value="revisar">Apenas Para Revisar</SelectItem>
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
        screenId="jeh.knowledge.table"
        columns={columns}
        data={filteredItems}
        loading={loading}
        rowKey="id"
        emptyMessage="Nenhum conteúdo cadastrado na base de conhecimento."
        exportTitle="Base de Conhecimento — Assistente Jeh"
        exportFilename="jeh-base-conhecimento.xlsx"
      />

      {/* DIÁLOGO CADASTRO/EDIÇÃO */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">
              {editingItem ? 'Editar Conteúdo da Base' : 'Novo Conteúdo Institucional'}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Cadastre informações oficiais e precisas. A Jeh usará esse texto como fonte primária.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Título do Conteúdo *</Label>
                <Input
                  required
                  placeholder="Ex: Política de Suporte Jetro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Categoria / Assunto *</Label>
                <Input
                  required
                  placeholder="Ex: Suporte, Institucional, Governança"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">
                Conteúdo Oficial (Texto da Resposta/Manual) *
              </Label>
              <Textarea
                required
                rows={7}
                placeholder="Insira as diretrizes, procedimentos ou explicações completas..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Palavras-chave / Sinônimos</Label>
                <Input
                  placeholder="suporte, chamado, sla, atendimento"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Documento Fonte (opcional)</Label>
                <Input
                  placeholder="Manual_Usuario_v2.pdf"
                  value={sourceDoc}
                  onChange={(e) => setSourceDoc(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Status de Aprovação</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho (não liberado para resposta)</SelectItem>
                  <SelectItem value="aprovado">Aprovado (ativo na base de conhecimento)</SelectItem>
                  <SelectItem value="revisar">Necessita Revisão</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
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
                {saving ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Cadastrar Conteúdo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO IMPORTAÇÃO DE ARQUIVO */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Importar Documento para Base
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Envie arquivos de texto ou manuais (TXT, MD) para inclusão como rascunho de
              conhecimento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Arquivo Fonte</Label>
              <Input
                type="file"
                accept=".txt,.md,.json,.csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="text-xs cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Categoria de Destino</Label>
              <Input
                placeholder="Ex: Manuais Técnicos"
                value={importCategory}
                onChange={(e) => setImportCategory(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-md text-[11px] text-blue-900">
              O conteúdo importado entrará inicialmente com o status <strong>Rascunho</strong>,
              exigindo validação e aprovação do supervisor antes de ir para o índice da assistente.
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportDialogOpen(false)}
              disabled={importing}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleImportFile}
              disabled={importing || !importFile}
              className="text-xs bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {importing ? 'Processando...' : 'Iniciar Importação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

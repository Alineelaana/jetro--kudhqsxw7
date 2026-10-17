import { useState, useMemo } from 'react'
import {
  Search,
  BookOpen,
  Filter,
  Lock,
  Tag,
  Calendar,
  Layers,
  ArrowUpRight,
  Eye,
  X,
  FileCode,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { KNOWLEDGE_AREAS } from '@/types/segundo-cerebro'
import type { SegundoCerebroDoc, KnowledgeArea } from '@/types/segundo-cerebro'

interface LibraryProps {
  documents: SegundoCerebroDoc[]
  isLoading: boolean
  onRefresh: () => void
  selectedDocModal?: Partial<SegundoCerebroDoc> | null
  onCloseSelectedDocModal?: () => void
}

export function SegundoCerebroLibrary({
  documents,
  isLoading,
  selectedDocModal,
  onCloseSelectedDocModal,
}: LibraryProps) {
  const [search, setSearch] = useState('')
  const [selectedArea, setSelectedArea] = useState<string>('TODAS')
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS')
  const [selectedProject, setSelectedProject] = useState<string>('TODOS')
  const [activeDoc, setActiveDoc] = useState<SegundoCerebroDoc | null>(null)

  // Extrair categorias e projetos únicos
  const categories = useMemo(() => {
    const set = new Set<string>()
    documents.forEach((d) => {
      if (d.category) set.add(d.category)
    })
    return Array.from(set).sort()
  }, [documents])

  const projects = useMemo(() => {
    const set = new Set<string>()
    documents.forEach((d) => {
      if (d.project) set.add(d.project)
    })
    return Array.from(set).sort()
  }, [documents])

  // Filtragem
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (selectedArea !== 'TODAS' && doc.area !== selectedArea) return false
      if (selectedCategory !== 'TODAS' && doc.category !== selectedCategory) return false
      if (selectedProject !== 'TODOS' && doc.project !== selectedProject) return false

      if (search.trim()) {
        const q = search.toLowerCase()
        const titleMatch = doc.title.toLowerCase().includes(q)
        const contentMatch = doc.content.toLowerCase().includes(q)
        const tagMatch = doc.tags?.some((t) => t.toLowerCase().includes(q))
        const projectMatch = doc.project?.toLowerCase().includes(q)
        if (!titleMatch && !contentMatch && !tagMatch && !projectMatch) return false
      }

      return true
    })
  }, [documents, selectedArea, selectedCategory, selectedProject, search])

  const currentModalDoc = activeDoc || (selectedDocModal as SegundoCerebroDoc | null)

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca Semântica / Textual */}
      <Card className="p-4 bg-white border border-gray-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Busca por termo */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, assunto, projeto, tags ou termos…"
              className="pl-9 h-10 text-sm border-gray-300 focus-visible:ring-[#005B2E]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro por Área de Conhecimento */}
          <div>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="h-10 text-xs">
                <SelectValue placeholder="Todas as áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas as Áreas ({documents.length})</SelectItem>
                {KNOWLEDGE_AREAS.map((area) => {
                  const count = documents.filter((d) => d.area === area).length
                  return (
                    <SelectItem key={area} value={area}>
                      {area} ({count})
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Categoria */}
          <div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-10 text-xs">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas as Categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Projeto */}
          <div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="h-10 text-xs">
                <SelectValue placeholder="Projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Projetos</SelectItem>
                {projects.map((proj) => (
                  <SelectItem key={proj} value={proj}>
                    {proj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Nota informativa de busca semântica x textual */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>
              Exibindo <strong>{filteredDocs.length}</strong> de {documents.length} documentos
              indexados
            </span>
          </div>
          <span className="text-[10px] text-gray-400 italic">
            Busca lexical e por chunks ativada · Vetores semânticos completos em fila de
            processamento
          </span>
        </div>
      </Card>

      {/* Grid de Documentos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-700">Nenhum documento encontrado</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Não localizamos nenhum arquivo correspondente aos filtros aplicados. Tente limpar os
            termos ou importe notas Obsidian na aba Configurações.
          </p>
          {(search || selectedArea !== 'TODAS' || selectedCategory !== 'TODAS') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setSelectedArea('TODAS')
                setSelectedCategory('TODAS')
                setSelectedProject('TODOS')
              }}
              className="mt-4 text-xs"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDocs.map((doc) => {
            const isConfidential = doc.confidentiality === 'Confidencial'
            const isStrategic = doc.confidentiality === 'Estrategico'

            return (
              <Card
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className="p-4 bg-white border border-gray-200/90 hover:border-[#005B2E] transition-all hover:shadow-md cursor-pointer flex flex-col justify-between group rounded-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-[#005B2E]/5 border-[#005B2E]/30 text-[#005B2E] font-medium py-0"
                    >
                      {doc.area}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {isConfidential && (
                        <Badge
                          variant="destructive"
                          className="text-[9px] py-0 px-1.5 flex items-center gap-0.5"
                        >
                          <Lock className="w-2.5 h-2.5" /> Confidencial
                        </Badge>
                      )}
                      {isStrategic && (
                        <Badge
                          variant="outline"
                          className="text-[9px] py-0 px-1.5 bg-amber-50 text-amber-700 border-amber-300"
                        >
                          Estratégico
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#005B2E] line-clamp-2 transition-colors">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-3 mt-1.5 leading-relaxed">
                    {doc.summary || doc.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-sm"
                        >
                          <Tag className="w-2.5 h-2.5 mr-0.5 text-stone-500" />
                          {t}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{doc.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Rodapé do Card */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(doc.created).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-1 text-[#005B2E] font-medium group-hover:underline">
                      <Eye className="w-3 h-3" />
                      Visualizar
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de Detalhe e Leitura do Documento */}
      <Dialog
        open={Boolean(currentModalDoc)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDoc(null)
            onCloseSelectedDocModal?.()
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {currentModalDoc && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge className="bg-[#005B2E] text-white text-[10px]">
                    {currentModalDoc.area || 'Documento'}
                  </Badge>
                  {currentModalDoc.confidentiality && (
                    <Badge variant="outline" className="text-[10px]">
                      {currentModalDoc.confidentiality}
                    </Badge>
                  )}
                  {currentModalDoc.project && (
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">
                      Projeto: {currentModalDoc.project}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {currentModalDoc.title}
                </DialogTitle>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  {currentModalDoc.path || 'Caminho não informado'}
                </p>
              </DialogHeader>

              {/* Wikilinks internos */}
              {currentModalDoc.wikilinks && currentModalDoc.wikilinks.length > 0 && (
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#005B2E]" />
                    Conexões e Wikilinks Internos ([[notas vinculadas]]):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentModalDoc.wikilinks.map((link, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-white border border-[#005B2E]/30 text-[#005B2E] px-2 py-0.5 rounded-md font-medium"
                      >
                        [[{link}]]
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conteúdo Markdown */}
              <div className="p-4 bg-stone-50/60 rounded-xl border border-stone-200/80 text-sm leading-relaxed whitespace-pre-wrap text-gray-800 font-sans">
                {currentModalDoc.content}
              </div>

              {/* Metadados Técnicos */}
              <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1 font-mono text-[10px]">
                  <FileCode className="w-3.5 h-3.5 text-gray-400" />
                  Hash: {currentModalDoc.content_hash || 'md5-validado'}
                </span>
                <span>
                  Autor: {currentModalDoc.author_name || 'Equipe Jetro'} · Sincronizado em{' '}
                  {currentModalDoc.sync_date
                    ? new Date(currentModalDoc.sync_date).toLocaleDateString('pt-BR')
                    : 'Recente'}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

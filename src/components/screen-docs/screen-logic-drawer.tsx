import { useState, useEffect, useMemo } from 'react'
import {
  FileText,
  Search,
  History,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getScreenDocByRoute } from '@/lib/screen-docs/registry'
import { getScreenDocHistory, recordScreenDocHistory } from '@/lib/screen-docs/history-service'
import {
  SCREEN_DOC_TOPICS,
  isEntryPendingValidation,
  type ScreenDocHistoryRecord,
} from '@/lib/screen-docs/types'
import { Link } from 'react-router-dom'

interface ScreenLogicDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRoute: string
}

export function ScreenLogicDrawer({ open, onOpenChange, currentRoute }: ScreenLogicDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [history, setHistory] = useState<ScreenDocHistoryRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'documentation' | 'history'>('documentation')

  const doc = useMemo(() => getScreenDocByRoute(currentRoute), [currentRoute])
  const isPending = useMemo(() => isEntryPendingValidation(doc), [doc])

  useEffect(() => {
    if (!open) return
    let isMounted = true
    setLoadingHistory(true)

    getScreenDocHistory(doc.route)
      .then(async (data) => {
        if (!isMounted) return
        if (data.length === 0) {
          // Idempotente: grava primeiro histórico se ainda não existir
          const initialRecord = await recordScreenDocHistory({
            screen_route: doc.route,
            screen_title: doc.title,
            module_group: doc.moduleGroup,
            changed_item: 'Documentação Inicial',
            description: `Publicação da especificação técnica declarativa da tela ${doc.title} (${doc.route}).`,
            previous_version: '',
            current_version: doc.docVersion,
            update_origin: 'Publicação inicial da documentação',
            author: doc.author,
          })
          if (initialRecord && isMounted) {
            setHistory([initialRecord])
            return
          }
        }
        setHistory(data)
      })
      .finally(() => {
        if (isMounted) setLoadingHistory(false)
      })

    return () => {
      isMounted = false
    }
  }, [open, doc])

  // Filtragem interna de tópicos por termo de busca
  const filteredTopics = useMemo(() => {
    if (!searchTerm.trim()) return SCREEN_DOC_TOPICS

    const term = searchTerm.toLowerCase()
    return SCREEN_DOC_TOPICS.filter((topic) => {
      const section = doc[topic.key]
      return (
        topic.label.toLowerCase().includes(term) ||
        section.title.toLowerCase().includes(term) ||
        section.content.toLowerCase().includes(term)
      )
    })
  }, [doc, searchTerm])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col bg-background border-l border-border z-50 shadow-2xl"
      >
        {/* Cabeçalho do Drawer */}
        <SheetHeader className="p-5 pb-4 border-b border-border bg-gradient-to-r from-emerald-50/50 via-background to-background dark:from-emerald-950/20">
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#005B2E]">
              <Layers className="w-4 h-4" />
              <span>{doc.moduleGroup}</span>
            </div>
            {isPending ? (
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Pendente de validação técnica
              </Badge>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Documentação Homologada
              </Badge>
            )}
          </div>

          <SheetTitle className="text-xl font-bold text-foreground flex items-center gap-2 mt-1">
            <FileText className="w-5 h-5 text-[#005B2E]" />
            {doc.title}
          </SheetTitle>

          <SheetDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
            <span className="font-mono text-foreground font-semibold bg-muted/60 px-1.5 py-0.5 rounded">
              {doc.route}
            </span>
            <span>Versão: {doc.docVersion}</span>
            <span>Atualizado: {doc.lastUpdated}</span>
            <span>Autor: {doc.author}</span>
          </SheetDescription>
        </SheetHeader>

        {/* Abas e Filtro */}
        <div className="p-4 border-b border-border bg-muted/20 space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'documentation' | 'history')}
              className="w-full"
            >
              <div className="flex items-center justify-between">
                <TabsList className="bg-muted/80">
                  <TabsTrigger value="documentation" className="text-xs">
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    Especificação Técnica (9 seções)
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">
                    <History className="w-3.5 h-3.5 mr-1.5" />
                    Histórico ({history.length})
                  </TabsTrigger>
                </TabsList>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#005B2E] hover:text-[#004222] hover:bg-emerald-50 hidden sm:flex items-center gap-1"
                >
                  <Link to="/admin/central-documentacao" onClick={() => onOpenChange(false)}>
                    <span>Central Completa</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </Tabs>
          </div>

          {activeTab === 'documentation' && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filtrar por palavra-chave nas seções desta tela..."
                className="pl-9 bg-background text-xs h-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Conteúdo rolável */}
        <ScrollArea className="flex-1 p-5">
          {activeTab === 'documentation' ? (
            <div className="space-y-4 pb-6">
              {filteredTopics.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  Nenhuma seção encontrada com o termo &quot;{searchTerm}&quot;.
                </div>
              ) : (
                filteredTopics.map((topic) => {
                  const section = doc[topic.key]
                  const topicPending =
                    section.pendingValidation ||
                    section.content.includes('Pendente de validação técnica')

                  return (
                    <div
                      key={topic.key}
                      className="border border-border rounded-lg p-4 bg-card shadow-xs transition hover:border-[#005B2E]/40"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-border/60">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#005B2E]" />
                          {topic.label}
                        </h3>
                        {topicPending && (
                          <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-medium">
                            Pendente de validação
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed font-sans">
                        {section.content}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {loadingHistory ? (
                <div className="text-center py-12 text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 animate-spin text-[#005B2E]" />
                  Carregando histórico da tela...
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  Nenhum registro de alteração documental encontrado para esta rota.
                </div>
              ) : (
                history.map((h, idx) => (
                  <div
                    key={h.id || idx}
                    className="border border-border rounded-lg p-3.5 bg-card text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                        Versão {h.current_version}
                        {h.previous_version && ` (anterior: ${h.previous_version})`}
                      </span>
                      <span>
                        {h.created ? new Date(h.created).toLocaleString('pt-BR') : 'Recentemente'}
                      </span>
                    </div>

                    <div className="font-medium text-foreground">{h.changed_item}</div>
                    <p className="text-muted-foreground">{h.description}</p>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40">
                      <span>Origem: {h.update_origin || 'Evolução Técnica'}</span>
                      <span>Por: {h.author || 'Equipe Jetro'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>

        {/* Rodapé informativo do Drawer */}
        <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground shrink-0">
          <span>Modo de leitura técnica exclusivo</span>
          <span className="font-semibold text-[#005B2E]">ERP Jetro • Engenharia</span>
        </div>
      </SheetContent>
    </Sheet>
  )
}

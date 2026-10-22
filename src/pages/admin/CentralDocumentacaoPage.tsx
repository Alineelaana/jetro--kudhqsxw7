import { useState, useMemo, useEffect } from 'react'
import {
  FileText,
  Search,
  Layers,
  CheckCircle2,
  AlertTriangle,
  History,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Code2,
  Workflow,
  Database,
  RefreshCw,
  GitCompare,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAllScreenDocs, getScreenDocByRoute } from '@/lib/screen-docs/registry'
import {
  getAllScreenDocHistory,
  ensureInitialDocHistoryPublished,
} from '@/lib/screen-docs/history-service'
import {
  SCREEN_DOC_TOPICS,
  isEntryPendingValidation,
  type ScreenDocEntry,
  type ScreenDocHistoryRecord,
} from '@/lib/screen-docs/types'

export default function CentralDocumentacaoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'homologated' | 'pending'>('all')
  const [selectedRoute, setSelectedRoute] = useState<string>('/admin')
  const [historyRecords, setHistoryRecords] = useState<ScreenDocHistoryRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const allDocs = useMemo(() => getAllScreenDocs(), [])

  // Inicialização idempotente do histórico
  useEffect(() => {
    ensureInitialDocHistoryPublished(allDocs).catch(() => {})
  }, [allDocs])

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const records = await getAllScreenDocHistory(150)
      setHistoryRecords(records)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  // Módulos disponíveis
  const availableModules = useMemo(() => {
    const set = new Set<string>()
    allDocs.forEach((d) => set.add(d.moduleGroup))
    return Array.from(set).sort()
  }, [allDocs])

  // Filtragem das telas
  const filteredDocs = useMemo(() => {
    return allDocs.filter((doc) => {
      if (moduleFilter !== 'all' && doc.moduleGroup !== moduleFilter) return false

      const isPending = isEntryPendingValidation(doc)
      if (statusFilter === 'homologated' && isPending) return false
      if (statusFilter === 'pending' && !isPending) return false

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const matchTitle = doc.title.toLowerCase().includes(term)
        const matchRoute = doc.route.toLowerCase().includes(term)
        const matchObjective = doc.objective.content.toLowerCase().includes(term)
        const matchFeatures = doc.features.content.toLowerCase().includes(term)
        return matchTitle || matchRoute || matchObjective || matchFeatures
      }

      return true
    })
  }, [allDocs, moduleFilter, statusFilter, searchTerm])

  const selectedDoc: ScreenDocEntry = useMemo(() => {
    return allDocs.find((d) => d.route === selectedRoute) || getScreenDocByRoute(selectedRoute)
  }, [allDocs, selectedRoute])

  const selectedIsPending = useMemo(() => isEntryPendingValidation(selectedDoc), [selectedDoc])

  // Estatísticas do Catálogo
  const stats = useMemo(() => {
    const total = allDocs.length
    const pending = allDocs.filter((d) => isEntryPendingValidation(d)).length
    const homologated = total - pending
    return { total, pending, homologated }
  }, [allDocs])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho da Central */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#005B2E]">
            <Code2 className="w-4 h-4" />
            <span>Administração &gt; Arquitetura e Engenharia de Software</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#005B2E] mt-1 flex items-center gap-2">
            Central de Documentação Técnica
            <Badge className="bg-[#005B2E]/10 text-[#005B2E] border-[#005B2E]/30 text-xs font-medium">
              ERP Jetro
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-3xl">
            Catálogo completo e vivo da especificação funcional, regras de negócio, integrações,
            permissões e tratamento de exceções de todas as telas do sistema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadHistory}
            disabled={loadingHistory}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingHistory ? 'animate-spin' : ''}`} />
            Atualizar Histórico
          </Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-background border border-border rounded-lg shadow-sm">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#005B2E]" /> Telas Mapeadas
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{stats.total}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Abrangendo {availableModules.length} macro-módulos do ERP
          </div>
        </div>

        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg shadow-sm">
          <div className="text-xs text-[#005B2E] dark:text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Documentação Homologada
          </div>
          <div className="text-2xl font-bold text-[#005B2E] dark:text-emerald-300 mt-1">
            {stats.homologated}
          </div>
          <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">
            Especificação validada em código real
          </div>
        </div>

        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg shadow-sm">
          <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Pendente de Validação Técnica
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
            {stats.pending}
          </div>
          <div className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-0.5">
            Sinalizadas para levantamento sem descrições inventadas
          </div>
        </div>
      </div>

      {/* Abas Principais da Central */}
      <Tabs defaultValue="catalog" className="w-full space-y-4">
        <TabsList className="bg-muted/80">
          <TabsTrigger value="catalog" className="text-xs">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Catálogo &amp; Visualizador de Telas
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="text-xs">
            <Workflow className="w-3.5 h-3.5 mr-1.5" />
            Mapa de Integrações &amp; Dependências
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            <History className="w-3.5 h-3.5 mr-1.5" />
            Histórico Consolidado ({historyRecords.length})
          </TabsTrigger>
          <TabsTrigger value="architecture" className="text-xs">
            <Code2 className="w-3.5 h-3.5 mr-1.5" />
            Como Funciona a Documentação
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: CATÁLOGO & VISUALIZADOR */}
        <TabsContent value="catalog" className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-muted/20 border border-border rounded-lg">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome da tela, rota, funcionalidade..."
                className="pl-9 bg-background text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-[160px] bg-background text-xs">
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Módulos</SelectItem>
                  {availableModules.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as 'all' | 'homologated' | 'pending')}
              >
                <SelectTrigger className="w-[170px] bg-background text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="homologated">Homologadas</SelectItem>
                  <SelectItem value="pending">Pendentes de Validação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid: Lista de Telas à esquerda + Detalhe das 9 Seções à direita */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Lista Lateral de Telas */}
            <div className="lg:col-span-4 border border-border rounded-lg bg-background overflow-hidden">
              <div className="p-3 bg-muted/40 border-b border-border text-xs font-bold text-foreground flex items-center justify-between">
                <span>Telas ({filteredDocs.length})</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Selecione para inspecionar
                </span>
              </div>
              <div className="max-h-[680px] overflow-y-auto divide-y divide-border">
                {filteredDocs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Nenhuma tela encontrada com os filtros informados.
                  </div>
                ) : (
                  filteredDocs.map((doc) => {
                    const isSelected = doc.route === selectedRoute
                    const pending = isEntryPendingValidation(doc)

                    return (
                      <button
                        key={doc.route}
                        onClick={() => setSelectedRoute(doc.route)}
                        className={`w-full p-3 text-left transition-colors flex flex-col gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-l-4 border-[#005B2E]'
                            : 'hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {doc.title}
                          </span>
                          {pending ? (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[9px] px-1 py-0">
                              Pendente
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[9px] px-1 py-0">
                              Homologada
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                          <span className="truncate max-w-[200px]">{doc.route}</span>
                          <span className="text-[10px] font-sans text-[#005B2E] font-semibold">
                            {doc.moduleGroup}
                          </span>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Painel de Detalhamento Técnico (9 Seções) */}
            <div className="lg:col-span-8 border border-border rounded-lg bg-background p-6 space-y-6">
              {/* Header da Tela Selecionada */}
              <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#005B2E]">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{selectedDoc.moduleGroup}</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mt-0.5">{selectedDoc.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-foreground font-semibold">
                      {selectedDoc.route}
                    </span>
                    <span>Versão doc: {selectedDoc.docVersion}</span>
                    <span>Atualizado: {selectedDoc.lastUpdated}</span>
                  </div>
                </div>

                <div>
                  {selectedIsPending ? (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Pendente de validação técnica
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Documentação Homologada
                    </Badge>
                  )}
                </div>
              </div>

              {/* As 9 Seções Obrigatórias */}
              <div className="grid grid-cols-1 gap-4">
                {SCREEN_DOC_TOPICS.map((topic) => {
                  const section = selectedDoc[topic.key]
                  const topicPending =
                    section.pendingValidation ||
                    section.content.includes('Pendente de validação técnica')

                  return (
                    <div
                      key={topic.key}
                      className="border border-border rounded-lg p-4 bg-card/60 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-border/60">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#005B2E]" />
                          {topic.label}
                        </h3>
                        {topicPending && (
                          <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                            Pendente de validação técnica
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed font-sans">
                        {section.content}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ABA 2: MAPA DE INTEGRAÇÕES & DEPENDÊNCIAS */}
        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-[#005B2E]">
                <Workflow className="w-4 h-4" />
                Matriz de Integrações e Relações Entre Módulos
              </CardTitle>
              <CardDescription className="text-xs">
                Mapeamento das interações sistêmicas, fluxo de dados e serviços transversais que
                sustentam os módulos do ERP Jetro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4 bg-muted/10 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#005B2E]" />
                    Vendas &rarr; Estoque &rarr; Financeiro
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    A aprovação de um pedido em <code>/admin/vendas/pedidos</code> e sua consulta em{' '}
                    <code>/admin/vendas/consulta-pedidos</code> aciona a reserva de itens no WMS{' '}
                    <code>/admin/estoque</code>, dispara o faturamento fiscal (NF-e) e gera os
                    títulos a receber em <code>/admin/financeiro/contas-receber</code>.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4 bg-muted/10 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#005B2E]" />
                    Automação &rarr; Agendamento de Relatórios
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    A Central de Agendamento em <code>/admin/agendamento-relatorios</code> orquestra
                    a geração de planilhas e PDFs com filtros parametrizados, integrando-se via SMTP
                    com as consultas de Vendas, Estoque, Financeiro e Controladoria.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4 bg-muted/10 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#005B2E]" />
                    Indústria (7 Telas) &rarr; Estoque/WMS &rarr; Qualidade &rarr; Custos
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    A arquitetura unificada de Indústria e Produção (Central Industrial,
                    Planejamento e Ordens, Ordem de Produção com 7 abas, Fichas Técnicas/BOM,
                    Qualidade e Rastreabilidade bidirecional, Custos e Eficiência e Manutenção de
                    Recursos) sincroniza em tempo real a explosão MRP, empenho e baixa de
                    matérias-primas no WMS, controle metrológico de peso líquido/drenado, quarentena
                    de laudos e apuração de CPV na Controladoria.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4 bg-muted/10 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#005B2E]" />
                    Verbas de Fornecedores &rarr; Precificação &rarr; Contas a Receber
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Acordos de verba homologados em <code>/admin/verbas</code> alimentam a conta
                    corrente do fornecedor, subsidiando descontos na precificação comercial e
                    liquidando faturas no contas a receber ou emitindo notas de débito.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4 bg-muted/10 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#005B2E]" />
                    DP (6 Telas) &rarr; SST (8 Telas) &rarr; eSocial Governamental
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    A nova arquitetura unificada de DP (Colaboradores, Ponto, Férias, Folha e
                    Obrigações) sincroniza em tempo real com os módulos de SST (Riscos/PGR, Saúde
                    Ocupacional sob sigilo médico, Prevenção, EPIs e Documentos) para transmissão
                    síncrona dos eventos S-2200, S-2210, S-2220 e S-2240 ao eSocial.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4 bg-muted/10 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#005B2E]" />
                    RH Estratégico (7 Telas) &rarr; DP &rarr; Governança
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Os ciclos de Desempenho (Nine-Box, Calibração e PDI), Clima Organizacional (eNPS
                    anônimo), Estrutura Organizacional e a Jornada do Colaborador culminam na
                    Central de Aprovações RH, refletindo movimentações salariais e contratuais
                    auditadas no Departamento Pessoal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: HISTÓRICO CONSOLIDADO */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2 text-[#005B2E]">
                  <History className="w-4 h-4" />
                  Rastreabilidade de Alterações Documentais (Coleção screen_doc_history)
                </CardTitle>
                <CardDescription className="text-xs">
                  Registro cronológico e imutável de todas as alterações, homologações e criações de
                  versões documentais de telas no ERP Jetro.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  Carregando histórico do banco de dados...
                </div>
              ) : historyRecords.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  Nenhum registro de histórico documental encontrado na coleção.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyRecords.map((h, i) => (
                    <div
                      key={h.id || i}
                      className="border border-border rounded-lg p-3.5 bg-card text-xs space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between text-muted-foreground text-[11px] gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{h.screen_title}</span>
                          <span className="font-mono bg-muted/60 px-1 py-0.2 rounded text-[10px]">
                            {h.screen_route}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {h.module_group}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#005B2E]">v{h.current_version}</span>
                          <span>
                            {h.created
                              ? new Date(h.created).toLocaleString('pt-BR')
                              : 'Recentemente'}
                          </span>
                        </div>
                      </div>

                      <div className="font-medium text-foreground">{h.changed_item}</div>
                      <p className="text-muted-foreground">{h.description}</p>

                      <div className="pt-1 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 gap-2">
                        <span>
                          Origem: {h.update_origin || 'Publicação inicial da documentação'}
                        </span>
                        <span>Autor: {h.author || 'Equipe Jetro'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4: COMO FUNCIONA A DOCUMENTAÇÃO */}
        <TabsContent value="architecture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-[#005B2E]">
                <ShieldCheck className="w-4 h-4" />
                Como Funciona a Documentação Técnica no ERP Jetro
              </CardTitle>
              <CardDescription className="text-xs">
                Princípios de engenharia, governança documental e garantia de integridade das
                especificações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-foreground/90 leading-relaxed">
              <div className="border-l-4 border-[#005B2E] pl-4 py-1 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-r">
                <h4 className="font-bold text-sm text-[#005B2E] mb-1">
                  1. A documentação vive no código (Docs-as-Code)
                </h4>
                <p className="text-muted-foreground">
                  A especificação funcional de cada tela reside em um registro declarativo tipado em
                  TypeScript (<code>src/lib/screen-docs/registry.ts</code>). Dessa forma, a
                  documentação acompanha o ciclo de vida do software: nenhuma funcionalidade é
                  alterada sem que sua especificação técnica seja atualizada no mesmo commit.
                </p>
              </div>

              <div className="border-l-4 border-[#C9A227] pl-4 py-1 bg-amber-50/40 dark:bg-amber-950/20 rounded-r">
                <h4 className="font-bold text-sm text-[#C9A227] mb-1">
                  2. Regra contra informações fictícias ou genéricas
                </h4>
                <p className="text-muted-foreground">
                  Por diretriz estrita da Engenharia Jetro, é proibido criar descrições genéricas ou
                  documentar funcionalidades inexistentes. Quando qualquer informação não puder ser
                  confirmada a partir do código-fonte real, ela é explicitamente sinalizada com o
                  badge <strong>&quot;Pendente de validação técnica&quot;</strong>, assegurando que
                  o time não consulte dados desatualizados como verdadeiros.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4 py-1 bg-blue-50/40 dark:bg-blue-950/20 rounded-r">
                <h4 className="font-bold text-sm text-blue-600 mb-1">
                  3. Rastreabilidade e Auditoria Imutável
                </h4>
                <p className="text-muted-foreground">
                  Toda publicação ou atualização de versão gera um registro na coleção PocketBase{' '}
                  <code>screen_doc_history</code>, identificando rota, versão anterior e nova, item
                  alterado, descrição da evolução e autor.
                </p>
              </div>

              <div className="border-l-4 border-gray-400 pl-4 py-1 bg-gray-50/60 dark:bg-gray-900/40 rounded-r">
                <h4 className="font-bold text-sm text-foreground mb-1">
                  4. Acesso exclusivo e modo somente leitura
                </h4>
                <p className="text-muted-foreground">
                  Tanto o Drawer lateral rápido (&quot;Lógica da Tela&quot;) quanto esta Central de
                  Documentação Técnica operam estritamente em modo de consulta e são visíveis apenas
                  para colaboradores autorizados com perfil de Superusuário (SUP), TI ou Auditoria,
                  preservando a segurança da arquitetura do ERP.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

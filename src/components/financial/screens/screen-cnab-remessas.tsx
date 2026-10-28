import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { JetroTable } from '@/components/jetro-table/jetro-table'
import type { JetroColumnDef } from '@/components/jetro-table/types'
import {
  Send,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Ban,
  FileCheck2,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react'
import { CnabService } from '@/services/cnab'
import type { CnabConfig, CnabRemessaRecord, CnabTituloRemessa } from '@/lib/cnab/types'

export function ScreenCnabRemessas() {
  const { toast } = useToast()
  const [configs, setConfigs] = useState<CnabConfig[]>([])
  const [selectedConfigId, setSelectedConfigId] = useState<string>('')
  const [titulos, setTitulos] = useState<CnabTituloRemessa[]>([])
  const [remessasHistorico, setRemessasHistorico] = useState<CnabRemessaRecord[]>([])
  const [loadingTitulos, setLoadingTitulos] = useState(false)
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Filtros da seleção de títulos
  const [filterCliente, setFilterCliente] = useState('')
  const [filterVencimentoInicio, setFilterVencimentoInicio] = useState('')
  const [filterVencimentoFim, setFilterVencimentoFim] = useState('')

  // Títulos selecionados para o lote atual
  const [selectedTituloIds, setSelectedTituloIds] = useState<Set<string>>(new Set())

  // Modal de Detalhes / Download de Remessa Gerada
  const [modalDetalhes, setModalDetalhes] = useState<CnabRemessaRecord | null>(null)
  const [cancelModalId, setCancelModalId] = useState<string | null>(null)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')

  const loadInitialData = async () => {
    try {
      const confs = await CnabService.listConfigs()
      setConfigs(confs)
      const ativo = confs.find((c) => c.ativo)
      if (ativo) {
        setSelectedConfigId(ativo.id)
      } else if (confs.length > 0) {
        setSelectedConfigId(confs[0].id)
      }
    } catch {
      toast({
        title: 'Erro ao carregar convênios',
        description: 'Não foi possível carregar os convênios configurados.',
        variant: 'destructive',
      })
    }
  }

  const loadTitulos = async () => {
    setLoadingTitulos(true)
    try {
      const data = await CnabService.getTitulosElegiveisParaRemessa()
      setTitulos(data)
      // Limpa seleção ao recarregar
      setSelectedTituloIds(new Set())
    } catch {
      toast({
        title: 'Erro ao carregar títulos',
        description: 'Não foi possível buscar recebíveis abertos para remessa.',
        variant: 'destructive',
      })
    } finally {
      setLoadingTitulos(false)
    }
  }

  const loadHistorico = async () => {
    setLoadingHistorico(true)
    try {
      const hist = await CnabService.listRemessas()
      setRemessasHistorico(hist)
    } catch {
      toast({
        title: 'Erro ao carregar histórico',
        description: 'Não foi possível carregar o histórico de lotes.',
        variant: 'destructive',
      })
    } finally {
      setLoadingHistorico(false)
    }
  }

  useEffect(() => {
    loadInitialData()
    loadTitulos()
    loadHistorico()
  }, [])

  const selectedConfig = useMemo(() => {
    return configs.find((c) => c.id === selectedConfigId)
  }, [configs, selectedConfigId])

  // Filtragem de títulos no cliente
  const filteredTitulos = useMemo(() => {
    return titulos.filter((t) => {
      if (filterCliente) {
        const q = filterCliente.toLowerCase()
        const matchCliente = t.cliente.toLowerCase().includes(q)
        const matchDoc = (t.cpf_cnpj || '').includes(q)
        const matchNum = t.numero_titulo.toLowerCase().includes(q)
        if (!matchCliente && !matchDoc && !matchNum) return false
      }
      if (filterVencimentoInicio && t.data_vencimento < filterVencimentoInicio) {
        return false
      }
      if (filterVencimentoFim && t.data_vencimento > filterVencimentoFim) {
        return false
      }
      return true
    })
  }, [titulos, filterCliente, filterVencimentoInicio, filterVencimentoFim])

  // Alternar seleção de um título
  const toggleSelectTitle = (id: string) => {
    setSelectedTituloIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Selecionar ou desmarcar todos os filtrados
  const toggleSelectAll = () => {
    if (selectedTituloIds.size === filteredTitulos.length && filteredTitulos.length > 0) {
      setSelectedTituloIds(new Set())
    } else {
      const next = new Set<string>()
      filteredTitulos.forEach((t) => next.add(t.id))
      setSelectedTituloIds(next)
    }
  }

  // Títulos atualmente marcados
  const titulosMarcados = useMemo(() => {
    return titulos.filter((t) => selectedTituloIds.has(t.id))
  }, [titulos, selectedTituloIds])

  const totalValorMarcado = useMemo(() => {
    return titulosMarcados.reduce((acc, t) => acc + parseFloat(t.valor_original || '0'), 0)
  }, [titulosMarcados])

  // Download do arquivo gerado
  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Gerar Remessa CNAB
  const handleGerarRemessa = async () => {
    if (!selectedConfig) {
      toast({
        title: 'Selecione um Convênio',
        description: 'É necessário selecionar um convênio bancário configurado.',
        variant: 'destructive',
      })
      return
    }

    if (titulosMarcados.length === 0) {
      toast({
        title: 'Nenhum Título Selecionado',
        description: 'Selecione pelo menos um título em aberto para gerar a remessa.',
        variant: 'destructive',
      })
      return
    }

    setGenerating(true)
    try {
      const { remessaRecord, fileContent, fileName } = await CnabService.gerarRemessa(
        selectedConfig,
        titulosMarcados,
      )

      toast({
        title: 'Remessa Gerada com Sucesso!',
        description: `Arquivo ${fileName} criado com ${titulosMarcados.length} títulos. O download foi iniciado.`,
      })

      // Inicia download automaticamente
      triggerDownload(fileName, fileContent)

      // Atualiza tela
      await loadInitialData()
      await loadTitulos()
      await loadHistorico()
      setModalDetalhes(remessaRecord)
    } catch (err: any) {
      toast({
        title: 'Falha ao Gerar Remessa',
        description: err?.message || 'Erro de validação ou comunicação com o banco de dados.',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  // Cancelar Lote de Remessa
  const handleConfirmarCancelamento = async () => {
    if (!cancelModalId) return
    try {
      await CnabService.cancelarRemessa(
        cancelModalId,
        motivoCancelamento || 'Cancelado pelo operador',
      )
      toast({
        title: 'Remessa Cancelada',
        description: 'O lote foi cancelado e seus títulos foram liberados para nova remessa.',
      })
      setCancelModalId(null)
      setMotivoCancelamento('')
      loadTitulos()
      loadHistorico()
    } catch {
      toast({
        title: 'Erro ao Cancelar',
        description: 'Não foi possível cancelar o lote de remessa.',
        variant: 'destructive',
      })
    }
  }

  // Colunas da JetroTable de Títulos Elegíveis
  const titulosColumns: JetroColumnDef<CnabTituloRemessa>[] = [
    {
      id: 'selection',
      header: 'Sel.',
      sortable: false,
      draggable: false,
      align: 'center',
      defaultWidth: 50,
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => toggleSelectTitle(row.id)}
          className="p-1 hover:text-[var(--brand-primary,#063D30)]"
        >
          {selectedTituloIds.has(row.id) ? (
            <CheckSquare className="w-4 h-4 text-emerald-700" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
        </button>
      ),
    },
    {
      id: 'numero_titulo',
      header: 'Título / Doc',
      accessorKey: 'numero_titulo',
      dataType: 'text',
      cell: ({ row }) => (
        <div className="font-mono text-xs font-semibold text-slate-900">{row.numero_titulo}</div>
      ),
    },
    {
      id: 'cliente',
      header: 'Cliente / Sacado',
      accessorKey: 'cliente',
      dataType: 'text',
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900">{row.cliente}</div>
          <div className="text-muted-foreground">{row.cpf_cnpj || 'Doc não informado'}</div>
        </div>
      ),
    },
    {
      id: 'data_vencimento',
      header: 'Vencimento',
      accessorKey: 'data_vencimento',
      dataType: 'date',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-800">
          {row.data_vencimento
            ? new Date(row.data_vencimento + 'T12:00:00').toLocaleDateString('pt-BR')
            : '-'}
        </span>
      ),
    },
    {
      id: 'valor_original',
      header: 'Valor (R$)',
      accessorKey: 'valor_original',
      dataType: 'number',
      align: 'right',
      cell: ({ row }) => {
        const val = parseFloat(row.valor_original || '0')
        return (
          <span className="font-semibold text-xs text-slate-900">
            R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )
      },
    },
    {
      id: 'nosso_numero',
      header: 'Nosso Número',
      accessorKey: 'nosso_numero',
      dataType: 'text',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.nosso_numero || 'Automático'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status Título',
      accessorKey: 'status',
      dataType: 'text',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200"
        >
          {row.status}
        </Badge>
      ),
    },
  ]

  // Colunas do Histórico de Remessas Geradas
  const historicoColumns: JetroColumnDef<CnabRemessaRecord>[] = [
    {
      id: 'sequencial_arquivo',
      header: 'Lote / Seq',
      accessorKey: 'sequencial_arquivo',
      dataType: 'number',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-slate-900">
          #{String(row.sequencial_arquivo).padStart(4, '0')}
        </span>
      ),
    },
    {
      id: 'nome_arquivo',
      header: 'Arquivo Gerado',
      accessorKey: 'nome_arquivo',
      dataType: 'text',
      cell: ({ row }) => (
        <div>
          <div className="font-mono text-xs font-semibold text-slate-900">{row.nome_arquivo}</div>
          <div className="text-[11px] text-muted-foreground">
            {row.layout} | Banco: {row.banco_codigo}
          </div>
        </div>
      ),
    },
    {
      id: 'data_geracao',
      header: 'Data Geração',
      accessorKey: 'data_geracao',
      dataType: 'date',
      cell: ({ row }) => (
        <div className="text-xs">
          <div>{new Date(row.data_geracao).toLocaleDateString('pt-BR')}</div>
          <div className="text-[11px] text-muted-foreground">
            {new Date(row.data_geracao).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      id: 'quantidade_titulos',
      header: 'Qtd Títulos',
      accessorKey: 'quantidade_titulos',
      dataType: 'number',
      align: 'center',
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono text-xs">
          {row.quantidade_titulos} títulos
        </Badge>
      ),
    },
    {
      id: 'valor_total',
      header: 'Valor Total',
      accessorKey: 'valor_total',
      dataType: 'number',
      align: 'right',
      cell: ({ row }) => {
        const v = parseFloat(row.valor_total || '0')
        return (
          <span className="font-bold text-xs text-slate-900">
            R$ {v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )
      },
    },
    {
      id: 'status',
      header: 'Situação',
      accessorKey: 'status',
      dataType: 'text',
      cell: ({ row }) => {
        if (row.status === 'cancelado') {
          return (
            <Badge variant="destructive" className="text-xs flex items-center gap-1 w-fit">
              <Ban className="w-3 h-3" /> Cancelado
            </Badge>
          )
        }
        if (row.status === 'processado') {
          return (
            <Badge className="bg-emerald-600 text-white text-xs flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-3 h-3" /> Processado
            </Badge>
          )
        }
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-800 border-amber-300 text-xs flex items-center gap-1 w-fit"
          >
            <Clock className="w-3 h-3" /> Gerado / Pronto
          </Badge>
        )
      },
    },
    {
      id: 'acoes',
      header: 'Ações',
      sortable: false,
      draggable: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (row.conteudo_arquivo) {
                triggerDownload(row.nome_arquivo, row.conteudo_arquivo)
              } else {
                toast({
                  title: 'Conteúdo indisponível',
                  description: 'Arquivo de remessa compactado ou arquivado.',
                })
              }
            }}
            className="h-7 text-xs gap-1 text-[var(--brand-primary,#063D30)] hover:bg-[var(--brand-primary,#063D30)]/10"
            title="Baixar arquivo .REM"
          >
            <Download className="w-3.5 h-3.5" /> .REM
          </Button>

          {row.status !== 'cancelado' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCancelModalId(row.id)}
              className="h-7 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Cancelar Remessa"
            >
              <Ban className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Send className="w-6 h-6 text-[var(--brand-primary,#063D30)]" />
              Geração de Remessa CNAB
            </h1>
            <Badge
              variant="outline"
              className="text-xs border-[var(--brand-primary,#063D30)] text-[var(--brand-primary,#063D30)]"
            >
              Contas a Receber
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione títulos em aberto, gere arquivos de remessa CNAB 240 ou 400 e envie para
            registro bancário.
          </p>
        </div>

        {selectedConfig && (
          <div className="flex items-center gap-2 bg-slate-50 border p-2 rounded-lg text-xs">
            <span className="text-muted-foreground">Próximo Sequencial:</span>
            <Badge variant="outline" className="font-mono bg-white font-semibold">
              #{String(selectedConfig.sequencial_remessa || 1).padStart(4, '0')}
            </Badge>
            <span className="text-muted-foreground">Layout:</span>
            <Badge variant="secondary" className="font-semibold">
              {selectedConfig.layout_padrao}
            </Badge>
          </div>
        )}
      </div>

      <Tabs defaultValue="gerar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="gerar" className="gap-2">
            <Send className="w-4 h-4" /> Gerar Remessa
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <Clock className="w-4 h-4" /> Histórico de Lotes ({remessasHistorico.length})
          </TabsTrigger>
        </TabsList>

        {/* ABA: GERAR REMESSA */}
        <TabsContent value="gerar" className="space-y-4">
          {/* Card de Configuração e Parâmetros da Remessa */}
          <Card className="border shadow-sm">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--brand-primary,#063D30)]" />
                Parâmetros e Convênio de Emissão
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">Convênio Bancário *</Label>
                  {configs.length === 0 ? (
                    <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                      Nenhum convênio cadastrado. Acesse a tela "Configuração CNAB" primeiro.
                    </div>
                  ) : (
                    <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o convênio" />
                      </SelectTrigger>
                      <SelectContent>
                        {configs.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome_convenio} ({c.banco_codigo} - {c.layout_padrao})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Filtrar por Cliente / Doc</Label>
                  <Input
                    placeholder="Nome, CNPJ ou Título..."
                    value={filterCliente}
                    onChange={(e) => setFilterCliente(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Venc. De</Label>
                    <Input
                      type="date"
                      value={filterVencimentoInicio}
                      onChange={(e) => setFilterVencimentoInicio(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Venc. Até</Label>
                    <Input
                      type="date"
                      value={filterVencimentoFim}
                      onChange={(e) => setFilterVencimentoFim(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Barra de Ação Rápida e Totais */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t bg-slate-50/70 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="h-8 text-xs gap-1.5 font-medium"
                  >
                    {selectedTituloIds.size === filteredTitulos.length &&
                    filteredTitulos.length > 0 ? (
                      <>
                        <Square className="w-3.5 h-3.5" /> Desmarcar Todos
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-3.5 h-3.5" /> Selecionar Todos (
                        {filteredTitulos.length})
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-slate-700">
                    Selecionados:{' '}
                    <span className="font-bold text-slate-900">{titulosMarcados.length}</span>{' '}
                    título(s)
                  </div>
                  <div className="text-xs text-slate-700">
                    Total do Lote:{' '}
                    <span className="font-bold text-emerald-700">
                      R$ {totalValorMarcado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleGerarRemessa}
                  disabled={titulosMarcados.length === 0 || generating || !selectedConfig}
                  className="bg-[var(--brand-primary,#063D30)] hover:bg-[var(--brand-primary,#063D30)]/90 text-white gap-2 font-semibold h-9"
                >
                  <Send className="w-4 h-4" />
                  {generating
                    ? 'Gerando Arquivo...'
                    : `Gerar Remessa (.REM) (${titulosMarcados.length})`}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Títulos Selecionáveis */}
          <Card className="border shadow-sm">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Títulos Elegíveis para Envio
                </CardTitle>
                <CardDescription className="text-xs">
                  Apenas títulos em aberto e não incluídos em remessas ativas são exibidos.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {filteredTitulos.length} disponíveis
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              <JetroTable
                screenId="cnab.titulos.elegiveis"
                columns={titulosColumns}
                data={filteredTitulos}
                loading={loadingTitulos}
                emptyMessage="Nenhum recebível em aberto disponível para remessa com os filtros selecionados."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: HISTÓRICO DE REMESSAS */}
        <TabsContent value="historico" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Histórico de Arquivos de Remessa
                </CardTitle>
                <CardDescription className="text-xs">
                  Registro de todos os lotes gerados para auditoria, download e controle de
                  unicidade bancária.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadHistorico} className="h-8 text-xs">
                Atualizar Histórico
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <JetroTable
                screenId="cnab.remessas.historico"
                columns={historicoColumns}
                data={remessasHistorico}
                loading={loadingHistorico}
                emptyMessage="Nenhum lote de remessa gerado até o momento."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Sucesso com Dados da Remessa Gerada */}
      <Dialog open={!!modalDetalhes} onOpenChange={(open) => !open && setModalDetalhes(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-800">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              Remessa Criada com Sucesso
            </DialogTitle>
            <DialogDescription>
              O arquivo foi estruturado conforme o padrão bancário e está pronto para transmissão.
            </DialogDescription>
          </DialogHeader>

          {modalDetalhes && (
            <div className="space-y-3 py-2 text-xs">
              <div className="bg-muted/30 p-3 rounded-lg border space-y-1 font-mono">
                <div>
                  <span className="text-muted-foreground">Arquivo:</span>{' '}
                  {modalDetalhes.nome_arquivo}
                </div>
                <div>
                  <span className="text-muted-foreground">Layout:</span> {modalDetalhes.layout}
                </div>
                <div>
                  <span className="text-muted-foreground">Sequencial:</span> #
                  {modalDetalhes.sequencial_arquivo}
                </div>
                <div>
                  <span className="text-muted-foreground">Títulos:</span>{' '}
                  {modalDetalhes.quantidade_titulos}
                </div>
                <div>
                  <span className="text-muted-foreground">Valor Total:</span> R${' '}
                  {parseFloat(modalDetalhes.valor_total).toFixed(2)}
                </div>
                <div>
                  <span className="text-muted-foreground">Checksum:</span>{' '}
                  {modalDetalhes.checksum_conteudo}
                </div>
              </div>
              <p className="text-slate-600">
                Os títulos foram vinculados a este lote e não poderão ser remetidos novamente até
                que o lote seja processado ou cancelado.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                if (modalDetalhes?.conteudo_arquivo) {
                  triggerDownload(modalDetalhes.nome_arquivo, modalDetalhes.conteudo_arquivo)
                }
              }}
              className="bg-[var(--brand-primary,#063D30)] hover:bg-[var(--brand-primary,#063D30)]/90 text-white"
            >
              <Download className="w-4 h-4 mr-1.5" /> Baixar Novamente
            </Button>
            <Button variant="outline" onClick={() => setModalDetalhes(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Cancelamento de Remessa */}
      <Dialog open={!!cancelModalId} onOpenChange={(open) => !open && setCancelModalId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Cancelar Lote de Remessa
            </DialogTitle>
            <DialogDescription>
              O cancelamento deste lote liberará os títulos vinculados para que possam ser incluídos
              em uma nova remessa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label className="text-xs font-semibold">Motivo do Cancelamento *</Label>
            <Input
              placeholder="Ex: Arquivo rejeitado na validação do banco / erro cadastral"
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalId(null)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleConfirmarCancelamento}>
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

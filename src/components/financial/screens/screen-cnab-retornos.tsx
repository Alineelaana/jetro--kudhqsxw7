import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  XCircle,
  FileText,
  DollarSign,
  ArrowRight,
} from 'lucide-react'
import { CnabService } from '@/services/cnab'
import type { CnabEventoRetorno, CnabRetornoRecord } from '@/lib/cnab/types'

export function ScreenCnabRetornos() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [parsing, setParsing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [historicoRetornos, setHistoricoRetornos] = useState<CnabRetornoRecord[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)

  // Dados do arquivo atualmente aberto
  const [currentFileName, setCurrentFileName] = useState<string>('')
  const [currentFileContent, setCurrentFileContent] = useState<string>('')
  const [parsedData, setParsedData] = useState<{
    layout: 'CNAB 240' | 'CNAB 400'
    bancoCodigo: string
    bancoNome: string
    dataGravacao: string
    totalRegistros: number
    eventos: CnabEventoRetorno[]
  } | null>(null)

  // Diálogo com detalhes do evento selecionado
  const [selectedEvento, setSelectedEvento] = useState<CnabEventoRetorno | null>(null)

  const loadHistorico = async () => {
    setLoadingHistorico(true)
    try {
      const records = await CnabService.listRetornos()
      setHistoricoRetornos(records)
    } catch {
      toast({
        title: 'Erro ao carregar histórico',
        description: 'Não foi possível carregar os retornos anteriores.',
        variant: 'destructive',
      })
    } finally {
      setLoadingHistorico(false)
    }
  }

  useEffect(() => {
    loadHistorico()
  }, [])

  // Manipular upload de arquivo .RET ou .TXT
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setParsing(true)
    try {
      const text = await file.text()
      setCurrentFileName(file.name)
      setCurrentFileContent(text)

      const result = await CnabService.parseArquivoRetorno(text, file.name)
      setParsedData(result)

      toast({
        title: 'Arquivo Processado com Sucesso',
        description: `${result.eventos.length} ocorrências identificadas no padrão ${result.layout}.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao Ler Retorno',
        description: err?.message || 'Arquivo corrompido ou formato CNAB não reconhecido.',
        variant: 'destructive',
      })
    } finally {
      setParsing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Estatísticas do retorno em análise
  const stats = useMemo(() => {
    if (!parsedData) {
      return { total: 0, compativeis: 0, divergentes: 0, rejeicoes: 0, baixados: 0, valorTotal: 0 }
    }
    let compativeis = 0
    let divergentes = 0
    let rejeicoes = 0
    let baixados = 0
    let valorTotal = 0

    parsedData.eventos.forEach((ev) => {
      if (ev.status_conferencia === 'compativel' && ev.tipo_evento === 'liquidacao') compativeis++
      if (ev.status_conferencia === 'divergente' || ev.status_conferencia === 'nao_encontrado')
        divergentes++
      if (ev.tipo_evento === 'rejeicao') rejeicoes++
      if (ev.status_conferencia === 'ja_baixado') baixados++
      valorTotal += ev.valor_pago
    })

    return {
      total: parsedData.eventos.length,
      compativeis,
      divergentes,
      rejeicoes,
      baixados,
      valorTotal,
    }
  }, [parsedData])

  // Ação: Baixar compatíveis
  const handleBaixarCompatíveis = async () => {
    if (!parsedData || parsedData.eventos.length === 0) return

    setDownloading(true)
    try {
      const result = await CnabService.aplicarBaixaCompativel(parsedData.eventos, currentFileName)

      // Registra no histórico do banco de dados
      await CnabService.registrarRetorno({
        nome_arquivo: currentFileName,
        layout: parsedData.layout,
        banco_codigo: parsedData.bancoCodigo,
        banco_nome: parsedData.bancoNome,
        data_gravacao_retorno: parsedData.dataGravacao,
        total_registros: parsedData.totalRegistros,
        total_titulos_processados: parsedData.eventos.length,
        total_valor_processado: stats.valorTotal.toFixed(2),
        total_valor_liquidado: stats.valorTotal.toFixed(2),
        total_liquidados: result.baixados,
        total_divergencias: stats.divergentes,
        total_rejeicoes: stats.rejeicoes,
        total_baixas: result.baixados,
        eventos: parsedData.eventos,
        status: stats.divergentes > 0 ? 'processado_com_pendencias' : 'processado_com_sucesso',
        log_processamento: `Baixas efetuadas: ${result.baixados}. Pendentes/Divergentes: ${result.pendentes}.`,
      })

      toast({
        title: 'Baixas Aplicadas com Sucesso!',
        description: `${result.baixados} recebíveis foram liquidados pelo fluxo oficial do sistema.`,
      })

      // Recarrega conferência e histórico
      const refreshed = await CnabService.parseArquivoRetorno(currentFileContent, currentFileName)
      setParsedData(refreshed)
      await loadHistorico()
    } catch (err: any) {
      toast({
        title: 'Falha ao Aplicar Baixas',
        description: err?.message || 'Ocorreu um erro durante a baixa dos recebíveis.',
        variant: 'destructive',
      })
    } finally {
      setDownloading(false)
    }
  }

  // Colunas da Tabela de Eventos do Arquivo de Retorno
  const eventosColumns: JetroColumnDef<CnabEventoRetorno>[] = [
    {
      id: 'numero_titulo_retorno',
      header: 'Título / Nosso Nº',
      accessorKey: 'numero_titulo_retorno',
      dataType: 'text',
      cell: ({ row }) => (
        <div>
          <div className="font-mono font-bold text-xs text-slate-900">
            {row.numero_titulo_retorno || 'S/N'}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            Nosso Nº: {row.nosso_numero || '-'}
          </div>
        </div>
      ),
    },
    {
      id: 'ocorrencia',
      header: 'Ocorrência Bancária',
      dataType: 'text',
      cell: ({ row }) => {
        let badgeColor = 'bg-slate-100 text-slate-800'
        if (row.tipo_evento === 'liquidacao')
          badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300'
        if (row.tipo_evento === 'rejeicao') badgeColor = 'bg-red-100 text-red-800 border-red-300'
        if (row.tipo_evento === 'baixa') badgeColor = 'bg-blue-100 text-blue-800 border-blue-300'
        if (row.tipo_evento === 'cartorio')
          badgeColor = 'bg-purple-100 text-purple-800 border-purple-300'

        return (
          <div>
            <Badge variant="outline" className={`text-xs ${badgeColor}`}>
              {row.codigo_ocorrencia} - {row.descricao_ocorrencia}
            </Badge>
            {row.motivos_rejeicao && row.motivos_rejeicao.length > 0 && (
              <div className="text-[11px] text-red-600 font-mono mt-0.5">
                Motivos: {row.motivos_rejeicao.join(', ')}
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: 'data_ocorrencia',
      header: 'Data Ocorrência / Crédito',
      accessorKey: 'data_ocorrencia',
      dataType: 'date',
      cell: ({ row }) => (
        <div className="text-xs">
          <div>
            Ocorr:{' '}
            {row.data_ocorrencia
              ? new Date(row.data_ocorrencia + 'T12:00:00').toLocaleDateString('pt-BR')
              : '-'}
          </div>
          {row.data_credito && (
            <div className="text-[11px] text-muted-foreground">
              Crédito: {new Date(row.data_credito + 'T12:00:00').toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'valor_titulo',
      header: 'Valor Nominal',
      accessorKey: 'valor_titulo',
      dataType: 'number',
      align: 'right',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-800">
          R${' '}
          {row.valor_titulo.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      id: 'valor_pago',
      header: 'Valor Pago',
      accessorKey: 'valor_pago',
      dataType: 'number',
      align: 'right',
      cell: ({ row }) => (
        <span className="text-xs font-bold text-emerald-700">
          R${' '}
          {row.valor_pago.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      id: 'acrescimos_deducoes',
      header: 'Juros / Descontos',
      dataType: 'text',
      align: 'right',
      cell: ({ row }) => (
        <div className="text-[11px] text-right">
          {row.valor_juros_multa > 0 && (
            <span className="text-amber-700 block">+ R$ {row.valor_juros_multa.toFixed(2)}</span>
          )}
          {row.valor_desconto > 0 && (
            <span className="text-emerald-700 block">- R$ {row.valor_desconto.toFixed(2)}</span>
          )}
          {row.valor_juros_multa === 0 && row.valor_desconto === 0 && (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      id: 'status_conferencia',
      header: 'Conferência ERP',
      accessorKey: 'status_conferencia',
      dataType: 'text',
      cell: ({ row }) => {
        if (row.status_conferencia === 'compativel') {
          return (
            <Badge className="bg-emerald-600 text-white text-xs flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-3 h-3" /> Compatível
            </Badge>
          )
        }
        if (row.status_conferencia === 'ja_baixado') {
          return (
            <Badge
              variant="outline"
              className="bg-slate-100 text-slate-700 border-slate-300 text-xs flex items-center gap-1 w-fit"
            >
              <Clock className="w-3 h-3" /> Já Liquidado
            </Badge>
          )
        }
        if (row.status_conferencia === 'divergente') {
          return (
            <Badge
              variant="destructive"
              className="text-xs flex items-center gap-1 w-fit"
              title={row.divergencia_motivo}
            >
              <AlertTriangle className="w-3 h-3" /> Divergente
            </Badge>
          )
        }
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-900 border-amber-300 text-xs flex items-center gap-1 w-fit"
            title={row.divergencia_motivo}
          >
            <XCircle className="w-3 h-3" /> Não Localizado
          </Badge>
        )
      },
    },
    {
      id: 'acoes',
      header: 'Detalhes',
      sortable: false,
      draggable: false,
      align: 'center',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedEvento(row)}
          className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900"
          title="Ver detalhes da conferência"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ]

  // Colunas do Histórico de Retornos Processados
  const historicoColumns: JetroColumnDef<CnabRetornoRecord>[] = [
    {
      id: 'nome_arquivo',
      header: 'Arquivo de Retorno',
      accessorKey: 'nome_arquivo',
      dataType: 'text',
      cell: ({ row }) => (
        <div>
          <div className="font-mono font-semibold text-xs text-slate-900">{row.nome_arquivo}</div>
          <div className="text-[11px] text-muted-foreground">
            {row.layout} | Banco: {row.banco_codigo}
          </div>
        </div>
      ),
    },
    {
      id: 'data_processamento',
      header: 'Data Processamento',
      accessorKey: 'data_processamento',
      dataType: 'date',
      cell: ({ row }) => (
        <span className="text-xs text-slate-800">
          {new Date(row.data_processamento).toLocaleString('pt-BR')}
        </span>
      ),
    },
    {
      id: 'total_titulos_processados',
      header: 'Total Eventos',
      accessorKey: 'total_titulos_processados',
      dataType: 'number',
      align: 'center',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.total_titulos_processados || 0}</span>
      ),
    },
    {
      id: 'total_liquidados',
      header: 'Baixados',
      accessorKey: 'total_liquidados',
      dataType: 'number',
      align: 'center',
      cell: ({ row }) => (
        <Badge className="bg-emerald-600 text-white text-xs">
          {row.total_liquidados || 0} baixas
        </Badge>
      ),
    },
    {
      id: 'total_divergencias',
      header: 'Pendências',
      accessorKey: 'total_divergencias',
      dataType: 'number',
      align: 'center',
      cell: ({ row }) => (
        <Badge
          variant={row.total_divergencias > 0 ? 'destructive' : 'secondary'}
          className="text-xs"
        >
          {row.total_divergencias || 0} pendentes
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      dataType: 'text',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.status === 'processado_com_sucesso'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }
        >
          {row.status === 'processado_com_sucesso' ? 'Sucesso' : 'Com Pendências'}
        </Badge>
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
              <UploadCloud className="w-6 h-6 text-[var(--brand-primary,#063D30)]" />
              Processamento de Retorno CNAB
            </h1>
            <Badge
              variant="outline"
              className="text-xs border-[var(--brand-primary,#063D30)] text-[var(--brand-primary,#063D30)]"
            >
              Conciliação Bancária
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Faça upload do arquivo de retorno bancário (.RET ou .TXT), confira as liquidações e
            aplique baixa automática nos recebíveis compatíveis.
          </p>
        </div>

        {/* Input Oculto de Arquivo */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".ret,.txt,.RET,.TXT"
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={parsing}
          className="bg-[var(--brand-primary,#063D30)] hover:bg-[var(--brand-primary,#063D30)]/90 text-white gap-2 font-medium"
        >
          <UploadCloud className="w-4 h-4" />
          {parsing ? 'Processando Arquivo...' : 'Carregar Arquivo .RET / .TXT'}
        </Button>
      </div>

      <Tabs defaultValue="atual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="atual" className="gap-2">
            <FileCheck2 className="w-4 h-4" /> Conferência do Retorno
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="w-4 h-4" /> Arquivos Processados ({historicoRetornos.length})
          </TabsTrigger>
        </TabsList>

        {/* ABA: CONFERÊNCIA ATUAL */}
        <TabsContent value="atual" className="space-y-4">
          {/* Card com Metadados e Ação de Baixa */}
          {parsedData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription className="text-xs uppercase font-medium">
                      Arquivo & Banco
                    </CardDescription>
                    <CardTitle className="text-lg font-bold text-slate-900 truncate">
                      {currentFileName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                    Layout {parsedData.layout} | Banco {parsedData.bancoCodigo}
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription className="text-xs uppercase font-medium">
                      Compatíveis p/ Baixa
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold text-emerald-700">
                      {stats.compativeis}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Valores e dados 100% alinhados
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription className="text-xs uppercase font-medium">
                      Divergências / Pendentes
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold text-amber-700">
                      {stats.divergentes}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Exigem conferência manual
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardDescription className="text-xs uppercase font-medium">
                      Total Liquidado (R$)
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-600" />
                    Valor pago informado pelo banco
                  </CardContent>
                </Card>
              </div>

              {/* Barra de Ação de Baixa */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-xs text-emerald-900">
                  <div className="font-semibold text-sm">Pronto para Liquidação Bancária</div>
                  <div>
                    {stats.compativeis} título(s) elegíveis para baixa automática imediata.
                    Divergências não serão baixadas automaticamente.
                  </div>
                </div>

                <Button
                  onClick={handleBaixarCompatíveis}
                  disabled={stats.compativeis === 0 || downloading}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {downloading
                    ? 'Aplicando Baixas...'
                    : `Baixar Compatíveis (${stats.compativeis})`}
                </Button>
              </div>

              {/* Tabela de Eventos */}
              <Card className="border shadow-sm">
                <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Ocorrências do Arquivo de Retorno
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Conferência lado a lado entre o registro bancário e o contas a receber do ERP.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {parsedData.eventos.length} registros analisados
                  </Badge>
                </CardHeader>
                <CardContent className="p-4">
                  <JetroTable
                    screenId="cnab.retorno.eventos"
                    columns={eventosColumns}
                    data={parsedData.eventos}
                    emptyMessage="Nenhuma ocorrência encontrada no arquivo."
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed border-2 p-12 text-center bg-slate-50/50">
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <UploadCloud className="h-8 w-8 text-[var(--brand-primary,#063D30)]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Nenhum retorno carregado
                </h3>
                <p className="mb-4 mt-2 text-xs text-muted-foreground">
                  Selecione um arquivo de retorno CNAB 240 ou 400 fornecido pelo seu banco (.RET ou
                  .TXT) para iniciar a conferência automática.
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[var(--brand-primary,#063D30)] hover:bg-[var(--brand-primary,#063D30)]/90 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" /> Selecionar Arquivo do Banco
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ABA: HISTÓRICO DE RETORNOS */}
        <TabsContent value="historico" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Histórico de Arquivos de Retorno
                </CardTitle>
                <CardDescription className="text-xs">
                  Registro de arquivos de retorno já processados com auditoria de baixas e
                  divergências.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadHistorico} className="h-8 text-xs">
                Atualizar Histórico
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <JetroTable
                screenId="cnab.retornos.historico"
                columns={historicoColumns}
                data={historicoRetornos}
                loading={loadingHistorico}
                emptyMessage="Nenhum arquivo de retorno processado anteriormente."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Detalhes da Ocorrência */}
      <Dialog open={!!selectedEvento} onOpenChange={(open) => !open && setSelectedEvento(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[var(--brand-primary,#063D30)]" />
              Detalhes da Ocorrência Bancária
            </DialogTitle>
            <DialogDescription>
              Dados técnicos transmitidos pelo banco no arquivo de retorno.
            </DialogDescription>
          </DialogHeader>

          {selectedEvento && (
            <div className="space-y-3 py-2 text-xs">
              <div className="bg-muted/30 p-3 rounded-lg border space-y-1.5 font-mono">
                <div>
                  <span className="text-muted-foreground">Título Empresa:</span>{' '}
                  {selectedEvento.numero_titulo_retorno || '-'}
                </div>
                <div>
                  <span className="text-muted-foreground">Nosso Número:</span>{' '}
                  {selectedEvento.nosso_numero || '-'}
                </div>
                <div>
                  <span className="text-muted-foreground">Ocorrência:</span>{' '}
                  {selectedEvento.codigo_ocorrencia} - {selectedEvento.descricao_ocorrencia}
                </div>
                <div>
                  <span className="text-muted-foreground">Data Ocorrência:</span>{' '}
                  {selectedEvento.data_ocorrencia || '-'}
                </div>
                <div>
                  <span className="text-muted-foreground">Data Crédito:</span>{' '}
                  {selectedEvento.data_credito || '-'}
                </div>
                <div>
                  <span className="text-muted-foreground">Valor Nominal:</span> R${' '}
                  {selectedEvento.valor_titulo.toFixed(2)}
                </div>
                <div>
                  <span className="text-muted-foreground">Valor Pago:</span> R${' '}
                  {selectedEvento.valor_pago.toFixed(2)}
                </div>
                <div>
                  <span className="text-muted-foreground">Juros/Multa:</span> R${' '}
                  {selectedEvento.valor_juros_multa.toFixed(2)}
                </div>
                <div>
                  <span className="text-muted-foreground">Desconto:</span> R${' '}
                  {selectedEvento.valor_desconto.toFixed(2)}
                </div>
                <div>
                  <span className="text-muted-foreground">Banco/Agência Recebedora:</span>{' '}
                  {selectedEvento.banco_recebedor || '-'}/{selectedEvento.agencia_recebedora || '-'}
                </div>
              </div>

              {selectedEvento.divergencia_motivo && (
                <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <div className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Motivo da Divergência:
                  </div>
                  <div>{selectedEvento.divergencia_motivo}</div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEvento(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  FileCode,
  Download,
  XCircle,
  Building2,
  Calendar,
  AlertTriangle,
  Loader2,
  Check,
  RefreshCw,
  Trash2,
  HelpCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useBrand } from '@/hooks/use-brand'
import pb from '@/lib/pocketbase/client'
import {
  gerarChaveAcessoFiscal,
  validarChaveAcesso,
  calcularImpostoTransporte,
  sugerirCfopTransporte,
  gerarXmlCteModelo57,
  type CteComponentePrestacao,
  type CteDocumentoVinculado,
} from '@/lib/cte-mdfe-engine'
import { resolveCfopByOperation } from '@/lib/fiscal-cfop-service'

interface PartnerRecord {
  id: string
  name: string
  trade_name?: string
  tax_id?: string
  state_registration?: string
  state?: string
  city?: string
}

interface SalesInvoiceRecord {
  id: string
  invoice_number: string
  access_key?: string
  total_amount?: number
  net_weight_kg?: number
  gross_weight_kg?: number
  client_name?: string
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  rascunho: { label: 'Rascunho', className: 'bg-muted text-muted-foreground' },
  validado: { label: 'Validado', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  autorizado_homologacao: {
    label: 'Homologação Autorizada',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  autorizado_producao: {
    label: 'Autorizado Produção',
    className: 'bg-emerald-600 text-white',
  },
  cancelado: { label: 'Cancelado', className: 'bg-rose-100 text-rose-800 border-rose-300' },
  inutilizado: { label: 'Inutilizado', className: 'bg-neutral-200 text-neutral-800' },
}

export function ScreenCteEmissao() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { brand, empresaAtivaId, empresasDisponiveis } = useBrand()

  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<any[]>([])
  const [partners, setPartners] = useState<PartnerRecord[]>([])
  const [invoices, setInvoices] = useState<SalesInvoiceRecord[]>([])
  const [filterSearch, setFilterSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')

  // Estado do Editor
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('geral')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Campos do formulário de CT-e
  const [tipoCte, setTipoCte] = useState<'normal' | 'complementar' | 'anulacao'>('normal')
  const [tipoServico, setTipoServico] = useState('normal')
  const [numero, setNumero] = useState('')
  const [serie, setSerie] = useState('1')
  const [ambiente, setAmbiente] = useState<'homologacao' | 'producao'>('homologacao')
  const [chaveAcesso, setChaveAcesso] = useState('')

  // Trecho
  const [ufInicio, setUfInicio] = useState('SP')
  const [municipioInicio, setMunicipioInicio] = useState('São Paulo')
  const [ufFim, setUfFim] = useState('RJ')
  const [municipioFim, setMunicipioFim] = useState('Rio de Janeiro')

  // Partes
  const [tomadorTipo, setTomadorTipo] = useState<
    'remetente' | 'expedidor' | 'recebedor' | 'destinatario' | 'outro'
  >('remetente')
  const [tomadorId, setTomadorId] = useState('')
  const [remetenteId, setRemetenteId] = useState('')
  const [destinatarioId, setDestinatarioId] = useState('')
  const [expedidorId, setExpedidorId] = useState('')
  const [recebedorId, setRecebedorId] = useState('')

  // Componentes da prestação
  const [componentes, setComponentes] = useState<CteComponentePrestacao[]>([
    { id: '1', nome: 'Frete Peso', valor: 850.0 },
    { id: '2', nome: 'Pedágio', valor: 120.0 },
  ])
  const [novoCompNome, setNovoCompNome] = useState('')
  const [novoCompValor, setNovoCompValor] = useState<number>(0)

  // Documentos vinculados (NF-e)
  const [docsVinculados, setDocsVinculados] = useState<CteDocumentoVinculado[]>([])
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')

  // Impostos e Fiscal
  const [cfop, setCfop] = useState('5353')
  const [cstCsosn, setCstCsosn] = useState('00')
  const [aliquotaIcms, setAliquotaIcms] = useState<number>(12)
  const [reducaoBc, setReducaoBc] = useState<number>(0)
  const [observacoes, setObservacoes] = useState('')
  const [statusAtual, setStatusAtual] = useState('rascunho')

  // Modais de Ação
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const [actionDocId, setActionDocId] = useState<string | null>(null)
  const [homologModalOpen, setHomologModalOpen] = useState(false)
  const [justificativaHomolog, setJustificativaHomolog] = useState(
    'Emissão de teste em ambiente de homologação SEFAZ',
  )
  const [xmlVisualizar, setXmlVisualizar] = useState<string | null>(null)

  const empresaAtual = useMemo(() => {
    return (empresasDisponiveis as any[])?.find((e: any) => e.id === empresaAtivaId) || null
  }, [empresasDisponiveis, empresaAtivaId])

  const empresaCnpj = (empresaAtual as any)?.cnpj || '00.000.000/0001-91'
  const empresaRazao = empresaAtual?.razao_social || brand?.empresaNome || 'HURAM TRANSPORTES LTDA'
  const empresaUf = (empresaAtual as any)?.estado || 'SP'

  // Cálculos Automáticos
  const totalPrestacao = useMemo(() => {
    return componentes.reduce((acc, c) => acc + (Number(c.valor) || 0), 0)
  }, [componentes])

  const impostoCalculado = useMemo(() => {
    return calcularImpostoTransporte({
      valorPrestacao: totalPrestacao,
      cstCsosn,
      aliquotaIcms,
      percentualReducaoBc: reducaoBc,
      ufInicio,
      ufFim,
    })
  }, [totalPrestacao, cstCsosn, aliquotaIcms, reducaoBc, ufInicio, ufFim])

  const cargaTotais = useMemo(() => {
    const valor = docsVinculados.reduce((acc, d) => acc + (Number(d.valor_carga) || 0), 0)
    const peso = docsVinculados.reduce((acc, d) => acc + (Number(d.peso_bruto_kg) || 0), 0)
    return { valor, peso }
  }, [docsVinculados])

  // Carregar dados do banco
  const carregarDados = async () => {
    setLoading(true)
    try {
      const filterEmpresa = empresaAtivaId ? `empresa_id = "${empresaAtivaId}"` : ''
      const [cteRes, partnersRes, invoicesRes] = await Promise.all([
        pb.collection('cte_documents').getFullList({
          filter: filterEmpresa || undefined,
          sort: '-created',
        }),
        pb.collection('partners').getFullList<PartnerRecord>({
          sort: 'name',
        }),
        pb.collection('sales_invoices').getFullList<SalesInvoiceRecord>({
          sort: '-created',
          perPage: 100,
        }),
      ])

      setDocuments(cteRes)
      setPartners(partnersRes)
      setInvoices(invoicesRes)
    } catch (err) {
      console.error('Erro ao carregar CT-e:', err)
      toast({
        title: 'Aviso de Carregamento',
        description: 'Não foi possível carregar a lista de CT-e ou parceiros vinculados.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [empresaAtivaId])

  // Buscar próximo número sequencial pela API/Hook
  const buscarProximoNumero = async (serieDesejada: string) => {
    try {
      const q = new URLSearchParams()
      if (empresaAtivaId) q.set('empresa_id', empresaAtivaId)
      q.set('serie', serieDesejada)
      const res = await pb.send(`/backend/v1/cte-numbers/next?${q.toString()}`, {
        method: 'GET',
      })
      if (res && res.numero) {
        setNumero(res.numero)
      }
    } catch {
      // Fallback
      const proximo = (documents.length + 1).toString().padStart(9, '0')
      setNumero(proximo)
    }
  }

  // Sugerir CFOP via motor fiscal ou regra de transporte
  useEffect(() => {
    async function resolverCfop() {
      try {
        const out = await resolveCfopByOperation({
          operacao_codigo: 'TRANSPORTE',
          uf_emitente: ufInicio,
          uf_destinatario: ufFim,
          empresa_id: empresaAtivaId || undefined,
          itens: [{ procedencia: 'mercadoria_terceiros' }],
        })
        if (out.itens && out.itens.length > 0 && out.itens[0].cfop) {
          setCfop(out.itens[0].cfop)
          return
        }
      } catch {
        /* intentionally ignored */
      }
      setCfop(sugerirCfopTransporte(ufInicio, ufFim))
    }
    resolverCfop()
  }, [ufInicio, ufFim, empresaAtivaId])

  const abrirNovoEditor = async () => {
    setEditingId(null)
    setStatusAtual('rascunho')
    setTipoCte('normal')
    setTipoServico('normal')
    setSerie('1')
    setAmbiente('homologacao')
    setUfInicio(empresaUf || 'SP')
    setMunicipioInicio((empresaAtual as any)?.cidade || 'São Paulo')
    setUfFim('RJ')
    setMunicipioFim('Rio de Janeiro')
    setTomadorTipo('remetente')
    setTomadorId('')
    setRemetenteId('')
    setDestinatarioId('')
    setExpedidorId('')
    setRecebedorId('')
    setComponentes([
      { id: '1', nome: 'Frete Peso', valor: 750.0 },
      { id: '2', nome: 'Pedágio', valor: 100.0 },
    ])
    setDocsVinculados([])
    setCstCsosn('00')
    setAliquotaIcms(12)
    setReducaoBc(0)
    setObservacoes('')
    setActiveTab('geral')

    await buscarProximoNumero('1')
    setIsEditorOpen(true)
  }

  const abrirEdicao = (doc: any) => {
    setEditingId(doc.id)
    setStatusAtual(doc.status || 'rascunho')
    setNumero(doc.numero || '')
    setSerie(doc.serie || '1')
    setTipoCte(doc.tipo_cte || 'normal')
    setTipoServico(doc.tipo_servico || 'normal')
    setAmbiente(doc.ambiente || 'homologacao')
    setChaveAcesso(doc.chave_acesso || '')
    setUfInicio(doc.uf_inicio || 'SP')
    setMunicipioInicio(doc.municipio_inicio || '')
    setUfFim(doc.uf_fim || 'RJ')
    setMunicipioFim(doc.municipio_fim || '')
    setTomadorTipo(doc.tomador_tipo || 'remetente')
    setTomadorId(doc.tomador_id || '')
    setRemetenteId(doc.remetente_id || '')
    setDestinatarioId(doc.destinatario_id || '')
    setExpedidorId(doc.expedidor_id || '')
    setRecebedorId(doc.recebedor_id || '')
    setComponentes(doc.componentes_prestacao || [])
    setDocsVinculados(doc.documentos_vinculados || [])
    setCfop(doc.cfop || '5353')
    setCstCsosn(doc.cst_csosn || '00')
    setAliquotaIcms(doc.aliquota_icms || 12)
    setReducaoBc(doc.percentual_reducao_bc || 0)
    setObservacoes(doc.observacoes_contribuinte || '')
    setActiveTab('geral')
    setIsEditorOpen(true)
  }

  // Adicionar componente da prestação
  const adicionarComponente = () => {
    if (!novoCompNome.trim() || novoCompValor <= 0) {
      toast({
        title: 'Componente Inválido',
        description: 'Informe a descrição e um valor maior que zero.',
        variant: 'destructive',
      })
      return
    }
    setComponentes([
      ...componentes,
      { id: String(Date.now()), nome: novoCompNome.trim(), valor: Number(novoCompValor) },
    ])
    setNovoCompNome('')
    setNovoCompValor(0)
  }

  const removerComponente = (index: number) => {
    setComponentes(componentes.filter((_, i) => i !== index))
  }

  // Vincular NF-e
  const adicionarNotaVinculada = () => {
    const inv = invoices.find((i) => i.id === selectedInvoiceId)
    if (!inv) return
    const jaExiste = docsVinculados.some((d) => d.id === inv.id || d.numero === inv.invoice_number)
    if (jaExiste) {
      toast({ title: 'Nota já vinculada', description: 'Esta NF-e já está na lista.' })
      return
    }
    const novoDoc: CteDocumentoVinculado = {
      id: inv.id,
      tipo_documento: 'nfe',
      chave_acesso: inv.access_key,
      numero: inv.invoice_number || '000000',
      valor_carga: inv.total_amount || 0,
      peso_bruto_kg: inv.gross_weight_kg || inv.net_weight_kg || 100,
    }
    setDocsVinculados([...docsVinculados, novoDoc])
    setSelectedInvoiceId('')
  }

  const removerNotaVinculada = (index: number) => {
    setDocsVinculados(docsVinculados.filter((_, i) => i !== index))
  }

  // Resolver Tomador efetivo
  const resolverTomadorInfo = () => {
    let partnerId = tomadorId
    if (tomadorTipo === 'remetente') partnerId = remetenteId
    if (tomadorTipo === 'destinatario') partnerId = destinatarioId
    if (tomadorTipo === 'expedidor') partnerId = expedidorId
    if (tomadorTipo === 'recebedor') partnerId = recebedorId

    const p = partners.find((item) => item.id === partnerId)
    return {
      id: partnerId,
      nome: p?.name || 'Não identificado',
      documento: p?.tax_id || '',
    }
  }

  // Gerar chave de 44 dígitos
  const obterOuGerarChaveAcesso = () => {
    if (chaveAcesso && validarChaveAcesso(chaveAcesso)) return chaveAcesso
    const novaChave = gerarChaveAcessoFiscal({
      uf: ufInicio || empresaUf || 'SP',
      dataEmissao: new Date(),
      cnpjEmitente: empresaCnpj,
      modelo: '57',
      serie: serie || '1',
      numero: numero || '1',
    })
    setChaveAcesso(novaChave)
    return novaChave
  }

  // Validação das regras fiscais
  const validarFormularioCte = (): { valido: boolean; erros: string[] } => {
    const erros: string[] = []
    if (!numero) erros.push('Número do CT-e é obrigatório.')
    if (!serie) erros.push('Série do CT-e é obrigatória.')
    if (!ufInicio || !municipioInicio) erros.push('Indique o início da prestação (UF e Cidade).')
    if (!ufFim || !municipioFim) erros.push('Indique o término da prestação (UF e Cidade).')
    if (tipoCte === 'normal') {
      if (!remetenteId) erros.push('Remetente é obrigatório para CT-e Normal.')
      if (!destinatarioId) erros.push('Destinatário é obrigatório para CT-e Normal.')
      if (componentes.length === 0)
        erros.push('Adicione ao menos 1 componente de prestação de serviço.')
      if (docsVinculados.length === 0)
        erros.push('Vincule ao menos 1 documento transportado (NF-e).')
    }
    if (totalPrestacao <= 0) erros.push('Valor total da prestação deve ser maior que zero.')
    return { valido: erros.length === 0, erros }
  }

  // Salvar Rascunho / Salvar Validado
  const salvarDocumentoCte = async (novoStatus: string = 'rascunho') => {
    const { valido, erros } = validarFormularioCte()
    if (novoStatus === 'validado' && !valido) {
      toast({
        title: 'Erros de Validação',
        description: erros.join(' | '),
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const chaveFinal = obterOuGerarChaveAcesso()
      const rem = partners.find((p) => p.id === remetenteId)
      const dest = partners.find((p) => p.id === destinatarioId)
      const exp = partners.find((p) => p.id === expedidorId)
      const rec = partners.find((p) => p.id === recebedorId)
      const tomaInfo = resolverTomadorInfo()

      // Geração prévia do XML textual modelo 57
      const xml = gerarXmlCteModelo57({
        chaveAcesso: chaveFinal,
        numero,
        serie,
        dataEmissao: new Date().toISOString(),
        ambiente,
        tipoCte,
        cfop,
        valorPrestacao: totalPrestacao,
        valorReceber: totalPrestacao,
        componentes,
        impostos: impostoCalculado,
        ufInicio,
        municipioInicio,
        ufFim,
        municipioFim,
        emitente: {
          cnpj: empresaCnpj,
          razaoSocial: empresaRazao,
          uf: empresaUf,
          municipio: (empresaAtual as any)?.cidade || 'São Paulo',
          ie: (empresaAtual as any)?.inscricao_estadual || 'ISENTO',
        },
        tomador: {
          tipo: tomadorTipo,
          nome: tomaInfo.nome,
          cnpjCpf: tomaInfo.documento,
        },
        remetente: {
          nome: rem?.name || '',
          cnpjCpf: rem?.tax_id || '',
          ie: rem?.state_registration || 'ISENTO',
          uf: rem?.state || ufInicio,
          municipio: rem?.city || municipioInicio,
        },
        destinatario: {
          nome: dest?.name || '',
          cnpjCpf: dest?.tax_id || '',
          ie: dest?.state_registration || 'ISENTO',
          uf: dest?.state || ufFim,
          municipio: dest?.city || municipioFim,
        },
        documentosVinculados: docsVinculados,
        observacoes,
      })

      const payload = {
        empresa_id: empresaAtivaId || '',
        numero,
        serie,
        chave_acesso: chaveFinal,
        tipo_cte: tipoCte,
        tipo_servico: tipoServico,
        modal: 'rodoviario',
        tomador_tipo: tomadorTipo,
        tomador_id: tomaInfo.id,
        tomador_nome: tomaInfo.nome,
        tomador_documento: tomaInfo.documento,
        remetente_id: remetenteId,
        remetente_nome: rem?.name || '',
        remetente_cnpj_cpf: rem?.tax_id || '',
        remetente_ie: rem?.state_registration || '',
        remetente_uf: rem?.state || ufInicio,
        remetente_municipio: rem?.city || municipioInicio,
        destinatario_id: destinatarioId,
        destinatario_nome: dest?.name || '',
        destinatario_cnpj_cpf: dest?.tax_id || '',
        destinatario_ie: dest?.state_registration || '',
        destinatario_uf: dest?.state || ufFim,
        destinatario_municipio: dest?.city || municipioFim,
        expedidor_id: expedidorId,
        expedidor_nome: exp?.name || '',
        recebedor_id: recebedorId,
        recebedor_nome: rec?.name || '',
        uf_inicio: ufInicio,
        municipio_inicio: municipioInicio,
        uf_fim: ufFim,
        municipio_fim: municipioFim,
        valor_total_prestacao: totalPrestacao,
        valor_receber: totalPrestacao,
        componentes_prestacao: componentes,
        valor_total_carga: cargaTotais.valor,
        produto_predominante: 'CARGA GERAL',
        peso_bruto_kg: cargaTotais.peso,
        quantidade_volumes: docsVinculados.length,
        documentos_vinculados: docsVinculados,
        cfop,
        cst_csosn: cstCsosn,
        base_calculo_icms: impostoCalculado.baseCalculo,
        aliquota_icms: impostoCalculado.aliquota,
        valor_icms: impostoCalculado.valorIcms,
        percentual_reducao_bc: reducaoBc,
        ambiente,
        status: novoStatus,
        xml_gerado: xml,
        observacoes_contribuinte: observacoes,
        created_by_user_id: user?.id || '',
      }

      if (editingId) {
        await pb.collection('cte_documents').update(editingId, payload)
        toast({ title: 'CT-e Atualizado', description: `Status alterado para ${novoStatus}.` })
      } else {
        const criado = await pb.collection('cte_documents').create(payload)
        setEditingId(criado.id)
        toast({ title: 'CT-e Criado', description: `Número ${numero} salvo com sucesso.` })
      }

      setIsEditorOpen(false)
      carregarDados()
    } catch (err: any) {
      console.error('Erro ao salvar CT-e:', err)
      toast({
        title: 'Erro ao Salvar CT-e',
        description: err?.message || 'Falha na validação do servidor.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Autorização Homologada
  const confirmarAutorizacaoHomolog = async () => {
    if (!actionDocId) return
    try {
      const doc = documents.find((d) => d.id === actionDocId)
      const protocolo = `HOM-${Date.now()}`
      await pb.collection('cte_documents').update(actionDocId, {
        status: 'autorizado_homologacao',
        protocolo_autorizacao: protocolo,
        data_autorizacao: new Date().toISOString(),
        justificativa_homologacao: justificativaHomolog,
      })
      toast({
        title: 'CT-e Autorizado em Homologação',
        description: `Protocolo gerado: ${protocolo}`,
      })
      setHomologModalOpen(false)
      setActionDocId(null)
      carregarDados()
    } catch (err: any) {
      toast({
        title: 'Falha na autorização',
        description: err?.message || 'Erro ao autorizar CT-e.',
        variant: 'destructive',
      })
    }
  }

  // Cancelamento
  const confirmarCancelamento = async () => {
    if (!actionDocId) return
    if (motivoCancelamento.trim().length < 15) {
      toast({
        title: 'Motivo Insuficiente',
        description: 'O cancelamento exige motivo detalhado com no mínimo 15 caracteres.',
        variant: 'destructive',
      })
      return
    }
    try {
      await pb.collection('cte_documents').update(actionDocId, {
        status: 'cancelado',
        motivo_cancelamento: motivoCancelamento.trim(),
        data_cancelamento: new Date().toISOString(),
      })
      toast({ title: 'CT-e Cancelado', description: 'O documento foi cancelado com sucesso.' })
      setCancelModalOpen(false)
      setActionDocId(null)
      setMotivoCancelamento('')
      carregarDados()
    } catch (err: any) {
      toast({
        title: 'Erro ao cancelar',
        description: err?.message || 'Falha ao cancelar CT-e.',
        variant: 'destructive',
      })
    }
  }

  // Download do XML
  const baixarXml = (doc: any) => {
    const conteudo = doc.xml_gerado || '<!-- XML não gerado -->'
    const blob = new Blob([conteudo], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `CTE_${doc.chave_acesso || doc.numero}.xml`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Filtragem da Listagem
  const documentosFiltrados = useMemo(() => {
    return documents.filter((d) => {
      const matchBusca =
        !filterSearch ||
        d.numero?.includes(filterSearch) ||
        d.tomador_nome?.toLowerCase().includes(filterSearch.toLowerCase()) ||
        d.chave_acesso?.includes(filterSearch)
      const matchStatus = filterStatus === 'todos' || d.status === filterStatus
      return matchBusca && matchStatus
    })
  }, [documents, filterSearch, filterStatus])

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Emissão de CT-e
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Modelo 57 • Cargas Rodoviárias
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaRazao}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Conhecimento de Transporte Eletrônico para acobertamento de serviços de frete
              rodoviário, cálculo fiscal de ICMS e geração de XML oficial.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={carregarDados} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={abrirNovoEditor}
            className="bg-[#005B2E] hover:bg-[#004724] text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo CT-e
          </Button>
        </div>
      </div>

      {/* PAINEL DE FILTROS E TOTALIZADORES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total de Conhecimentos</p>
              <p className="text-2xl font-black text-foreground">{documents.length}</p>
            </div>
            <Truck className="w-8 h-8 text-[#005B2E]/40" />
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                Homologados / Autorizados
              </p>
              <p className="text-2xl font-black text-emerald-700">
                {
                  documents.filter(
                    (d) =>
                      d.status === 'autorizado_homologacao' || d.status === 'autorizado_producao',
                  ).length
                }
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Rascunhos / Em Edição</p>
              <p className="text-2xl font-black text-amber-600">
                {documents.filter((d) => d.status === 'rascunho' || d.status === 'validado').length}
              </p>
            </div>
            <FileCode className="w-8 h-8 text-amber-500/40" />
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total da Prestação (R$)</p>
              <p className="text-xl font-black text-foreground">
                R${' '}
                {documents
                  .filter((d) => d.status !== 'cancelado')
                  .reduce((acc, d) => acc + (Number(d.valor_total_prestacao) || 0), 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">BRL</span>
          </CardContent>
        </Card>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Buscar por número do CT-e, chave de acesso ou tomador..."
            className="pl-9 text-xs"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[220px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="validado">Validado</SelectItem>
            <SelectItem value="autorizado_homologacao">Homologação Autorizada</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABELA DE CT-E */}
      <Card className="border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/60 border-b font-bold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Número / Série</th>
                <th className="py-3 px-4">Emissão</th>
                <th className="py-3 px-4">Tomador do Serviço</th>
                <th className="py-3 px-4">Trecho (Origem → Destino)</th>
                <th className="py-3 px-4 text-right">Prestação</th>
                <th className="py-3 px-4 text-right">ICMS</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#005B2E]" />
                    Carregando conhecimentos de transporte...
                  </td>
                </tr>
              ) : documentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Nenhum CT-e encontrado para os critérios selecionados.
                  </td>
                </tr>
              ) : (
                documentosFiltrados.map((doc) => {
                  const badge = STATUS_BADGE[doc.status] || {
                    label: doc.status,
                    className: 'bg-muted text-muted-foreground',
                  }
                  const podeEditar = doc.status === 'rascunho' || doc.status === 'validado'
                  const podeAutorizar =
                    doc.status === 'rascunho' ||
                    doc.status === 'validado' ||
                    doc.status === 'autorizado_homologacao'
                  const podeCancelar =
                    doc.status === 'autorizado_homologacao' || doc.status === 'validado'

                  return (
                    <tr key={doc.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground">
                          CT-e {doc.numero} • Série {doc.serie}
                        </div>
                        <div
                          className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]"
                          title={doc.chave_acesso}
                        >
                          {doc.chave_acesso || 'Chave não gerada'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {doc.created ? new Date(doc.created).toLocaleDateString('pt-BR') : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">
                          {doc.tomador_nome || '—'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {doc.tomador_documento || ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">
                          {doc.uf_inicio} ({doc.municipio_inicio}) → {doc.uf_fim} (
                          {doc.municipio_fim})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-foreground">
                        R$ {(doc.valor_total_prestacao || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        R$ {(doc.valor_icms || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-bold ${badge.className}`}
                        >
                          {badge.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {podeEditar && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => abrirEdicao(doc)}
                            >
                              Editar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            title="Baixar XML textual Modelo 57"
                            onClick={() => baixarXml(doc)}
                          >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                          </Button>
                          {doc.status !== 'autorizado_homologacao' &&
                            doc.status !== 'cancelado' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                onClick={() => {
                                  setActionDocId(doc.id)
                                  setHomologModalOpen(true)
                                }}
                              >
                                Homologar
                              </Button>
                            )}
                          {podeCancelar && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-rose-600 hover:bg-rose-50"
                              onClick={() => {
                                setActionDocId(doc.id)
                                setCancelModalOpen(true)
                              }}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DIÁLOGO EDITOR EM CABEÇALHO + ABAS COM RESUMO FIXO */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-muted/40">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#005B2E]" />
                  {editingId ? `Editando CT-e ${numero}` : 'Novo Conhecimento de Transporte (CT-e)'}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ambiente: <strong>{ambiente.toUpperCase()}</strong> • Status:{' '}
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {statusAtual.toUpperCase()}
                  </Badge>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={obterOuGerarChaveAcesso}
              >
                Gerar Chave de Acesso
              </Button>
            </div>
          </DialogHeader>

          {/* PAINEL FIXO RESUMO FINANCEIRO E DE CARGA */}
          <div className="bg-[#005B2E]/5 border-b px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-muted-foreground block text-[10px]">VALOR PRESTAÇÃO</span>
                <span className="text-sm font-black text-[#005B2E]">
                  R$ {totalPrestacao.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">ICMS APURADO</span>
                <span className="text-sm font-bold text-foreground">
                  R$ {impostoCalculado.valorIcms.toFixed(2)} ({impostoCalculado.aliquota}%)
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">TOTAL DA CARGA</span>
                <span className="text-sm font-bold text-foreground">
                  R$ {cargaTotais.valor.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">PESO BRUTO</span>
                <span className="text-sm font-bold text-foreground">
                  {cargaTotais.peso.toFixed(2)} kg
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background text-[11px] font-mono">
                CFOP {cfop} • CST {cstCsosn}
              </Badge>
            </div>
          </div>

          {/* CONTEÚDO COM ABAS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-5 text-xs font-semibold bg-muted/60 p-1">
                <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
                <TabsTrigger value="partes">Partes & Tomador</TabsTrigger>
                <TabsTrigger value="componentes">Componentes</TabsTrigger>
                <TabsTrigger value="documentos">Carga & NF-e</TabsTrigger>
                <TabsTrigger value="impostos">Impostos & CFOP</TabsTrigger>
              </TabsList>

              {/* ABA 1: DADOS GERAIS */}
              <TabsContent value="geral" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Número do CT-e *</Label>
                    <Input
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Série *</Label>
                    <Input
                      value={serie}
                      onChange={(e) => setSerie(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Ambiente</Label>
                    <Select
                      value={ambiente}
                      onValueChange={(v: 'homologacao' | 'producao') => setAmbiente(v)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homologacao">Homologação (Testes SEFAZ)</SelectItem>
                        <SelectItem value="producao">Produção Oficial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Tipo de CT-e</Label>
                    <Select value={tipoCte} onValueChange={(v: any) => setTipoCte(v)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">0 - Normal</SelectItem>
                        <SelectItem value="complementar">1 - Complementar de Valores</SelectItem>
                        <SelectItem value="anulacao">2 - CT-e de Anulação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Tipo de Serviço</Label>
                    <Select value={tipoServico} onValueChange={setTipoServico}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">0 - Normal</SelectItem>
                        <SelectItem value="subcontratacao">1 - Subcontratação</SelectItem>
                        <SelectItem value="redespacho">2 - Redespacho</SelectItem>
                        <SelectItem value="redespacho_intermediario">
                          3 - Redespacho Intermediário
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20 space-y-3">
                  <h4 className="text-xs font-bold text-foreground">
                    Percurso da Prestação do Serviço
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">UF Origem *</Label>
                      <Input
                        value={ufInicio}
                        onChange={(e) => setUfInicio(e.target.value.toUpperCase())}
                        maxLength={2}
                        className="text-xs uppercase"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Município Início *</Label>
                      <Input
                        value={municipioInicio}
                        onChange={(e) => setMunicipioInicio(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">UF Término *</Label>
                      <Input
                        value={ufFim}
                        onChange={(e) => setUfFim(e.target.value.toUpperCase())}
                        maxLength={2}
                        className="text-xs uppercase"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Município Término *</Label>
                      <Input
                        value={municipioFim}
                        onChange={(e) => setMunicipioFim(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Chave de Acesso (44 Dígitos)</Label>
                  <Input
                    value={chaveAcesso}
                    onChange={(e) => setChaveAcesso(e.target.value)}
                    placeholder="Deixe em branco para geração automática pelo sistema"
                    className="text-xs font-mono"
                  />
                  {chaveAcesso && (
                    <p className="text-[11px] mt-1 text-muted-foreground flex items-center gap-1">
                      {validarChaveAcesso(chaveAcesso) ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Chave Válida (Módulo 11 SEFAZ)
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Chave inválida ou incompleta
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* ABA 2: PARTES & TOMADOR */}
              <TabsContent value="partes" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-bold text-[#005B2E]">
                      Quem é o Tomador do Serviço? *
                    </Label>
                    <Select value={tomadorTipo} onValueChange={(v: any) => setTomadorTipo(v)}>
                      <SelectTrigger className="text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remetente">Remetente (Frete CIF/Responsável)</SelectItem>
                        <SelectItem value="destinatario">Destinatário (Frete FOB)</SelectItem>
                        <SelectItem value="expedidor">Expedidor</SelectItem>
                        <SelectItem value="recebedor">Recebedor</SelectItem>
                        <SelectItem value="outro">Outro Tomador Parceiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {tomadorTipo === 'outro' && (
                    <div>
                      <Label className="text-xs">Selecione o Tomador (Parceiro)</Label>
                      <Select value={tomadorId} onValueChange={setTomadorId}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Escolha a empresa pagadora..." />
                        </SelectTrigger>
                        <SelectContent>
                          {partners.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} {p.tax_id ? `(${p.tax_id})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="border rounded-lg p-3 bg-muted/20 space-y-2">
                    <Label className="text-xs font-bold text-foreground">Remetente *</Label>
                    <Select value={remetenteId} onValueChange={setRemetenteId}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Selecione o Remetente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.state || 'UF'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {remetenteId && (
                      <p className="text-[11px] text-muted-foreground">
                        {partners.find((p) => p.id === remetenteId)?.tax_id} •{' '}
                        {partners.find((p) => p.id === remetenteId)?.city} -{' '}
                        {partners.find((p) => p.id === remetenteId)?.state}
                      </p>
                    )}
                  </div>

                  <div className="border rounded-lg p-3 bg-muted/20 space-y-2">
                    <Label className="text-xs font-bold text-foreground">Destinatário *</Label>
                    <Select value={destinatarioId} onValueChange={setDestinatarioId}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Selecione o Destinatário..." />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.state || 'UF'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {destinatarioId && (
                      <p className="text-[11px] text-muted-foreground">
                        {partners.find((p) => p.id === destinatarioId)?.tax_id} •{' '}
                        {partners.find((p) => p.id === destinatarioId)?.city} -{' '}
                        {partners.find((p) => p.id === destinatarioId)?.state}
                      </p>
                    )}
                  </div>

                  <div className="border rounded-lg p-3 bg-muted/20 space-y-2">
                    <Label className="text-xs font-medium text-foreground">
                      Expedidor (Opcional)
                    </Label>
                    <Select value={expedidorId} onValueChange={setExpedidorId}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Nenhum expedidor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {partners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border rounded-lg p-3 bg-muted/20 space-y-2">
                    <Label className="text-xs font-medium text-foreground">
                      Recebedor (Opcional)
                    </Label>
                    <Select value={recebedorId} onValueChange={setRecebedorId}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Nenhum recebedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {partners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* ABA 3: COMPONENTES DA PRESTAÇÃO */}
              <TabsContent value="componentes" className="space-y-4">
                <div className="flex flex-col sm:flex-row items-end gap-2 bg-muted/30 p-3 rounded-lg border">
                  <div className="flex-1 w-full">
                    <Label className="text-xs">Nome do Componente</Label>
                    <Input
                      value={novoCompNome}
                      onChange={(e) => setNovoCompNome(e.target.value)}
                      placeholder="Ex: Frete Valor, GRIS, Taxa Despacho..."
                      className="text-xs"
                    />
                  </div>
                  <div className="w-full sm:w-36">
                    <Label className="text-xs">Valor (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={novoCompValor || ''}
                      onChange={(e) => setNovoCompValor(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={adicionarComponente}
                    className="bg-[#005B2E] text-white text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Componente / Trecho</th>
                        <th className="py-2.5 px-3 text-right">Valor (R$)</th>
                        <th className="py-2.5 px-3 text-right w-16">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {componentes.map((c, idx) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="py-2 px-3 font-semibold">{c.nome}</td>
                          <td className="py-2 px-3 text-right font-bold text-foreground">
                            R$ {Number(c.valor).toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-rose-600"
                              onClick={() => removerComponente(idx)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/60 font-bold border-t">
                      <tr>
                        <td className="py-2 px-3 text-foreground">TOTAL DA PRESTAÇÃO DO SERVIÇO</td>
                        <td className="py-2 px-3 text-right text-base text-[#005B2E]">
                          R$ {totalPrestacao.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </TabsContent>

              {/* ABA 4: DOCUMENTOS TRANSPORTADOS (NF-e) */}
              <TabsContent value="documentos" className="space-y-4">
                <div className="flex flex-col sm:flex-row items-end gap-2 bg-muted/30 p-3 rounded-lg border">
                  <div className="flex-1 w-full">
                    <Label className="text-xs">Importar NF-e Existente de Saída</Label>
                    <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Selecione uma nota de vendas faturada..." />
                      </SelectTrigger>
                      <SelectContent>
                        {invoices.map((inv) => (
                          <SelectItem key={inv.id} value={inv.id}>
                            NF-e {inv.invoice_number} • {inv.client_name || 'Cliente'} • R${' '}
                            {(inv.total_amount || 0).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    onClick={adicionarNotaVinculada}
                    className="bg-[#005B2E] text-white text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Vincular à Carga
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Tipo / Número</th>
                        <th className="py-2.5 px-3">Chave de Acesso NF-e</th>
                        <th className="py-2.5 px-3 text-right">Valor Carga (R$)</th>
                        <th className="py-2.5 px-3 text-right">Peso (kg)</th>
                        <th className="py-2.5 px-3 text-right w-16">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {docsVinculados.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-muted-foreground">
                            Nenhum documento de carga transportada vinculado até o momento.
                          </td>
                        </tr>
                      ) : (
                        docsVinculados.map((d, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="py-2 px-3 font-semibold">NF-e {d.numero}</td>
                            <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground truncate max-w-[220px]">
                              {d.chave_acesso || 'Sem chave registrada'}
                            </td>
                            <td className="py-2 px-3 text-right font-bold">
                              R$ {(d.valor_carga || 0).toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {(d.peso_bruto_kg || 0).toFixed(2)} kg
                            </td>
                            <td className="py-2 px-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-rose-600"
                                onClick={() => removerNotaVinculada(idx)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-muted/60 font-bold border-t">
                      <tr>
                        <td colSpan={2} className="py-2 px-3 text-foreground">
                          TOTAL DA CARGA TRANSPORTADA
                        </td>
                        <td className="py-2 px-3 text-right text-foreground">
                          R$ {cargaTotais.valor.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right text-foreground">
                          {cargaTotais.peso.toFixed(2)} kg
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </TabsContent>

              {/* ABA 5: IMPOSTOS & CFOP */}
              <TabsContent value="impostos" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs font-bold text-[#005B2E]">CFOP do Transporte *</Label>
                    <Input
                      value={cfop}
                      onChange={(e) => setCfop(e.target.value)}
                      className="text-xs font-mono font-bold"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Determinado automaticamente pelo motor fiscal: {ufInicio} → {ufFim}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs font-bold">CST / CSOSN *</Label>
                    <Select value={cstCsosn} onValueChange={setCstCsosn}>
                      <SelectTrigger className="text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00">00 - Tributação Integral</SelectItem>
                        <SelectItem value="20">20 - Com Redução de Base</SelectItem>
                        <SelectItem value="40">40 - Isenta</SelectItem>
                        <SelectItem value="41">41 - Não Tributada</SelectItem>
                        <SelectItem value="90">90 - Outras</SelectItem>
                        <SelectItem value="101">101 - Simples Nacional (com crédito)</SelectItem>
                        <SelectItem value="102">102 - Simples Nacional (sem crédito)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Alíquota ICMS (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={aliquotaIcms || ''}
                      onChange={(e) => setAliquotaIcms(parseFloat(e.target.value) || 0)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20 space-y-2">
                  <h4 className="text-xs font-bold text-foreground">
                    Demonstrativo da Memória de Cálculo do ICMS
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        BASE DE CÁLCULO
                      </span>
                      <span className="font-bold">
                        R$ {impostoCalculado.baseCalculo.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        ALÍQUOTA APLICADA
                      </span>
                      <span className="font-bold">{impostoCalculado.aliquota}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">VALOR DO ICMS</span>
                      <span className="font-black text-[#005B2E]">
                        R$ {impostoCalculado.valorIcms.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    {impostoCalculado.detalhes}
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Observações do Contribuinte / Fisco</Label>
                  <Input
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Instruções de trânsito, dados do tomador ou isenção legal..."
                    className="text-xs"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* RODAPÉ DO EDITOR COM AÇÕES */}
          <DialogFooter className="p-3 border-t bg-muted/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Geração de XML modelo 57 pronta para transmissão no emissor do contador.</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditorOpen(false)}
                disabled={saving}
              >
                Fechar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => salvarDocumentoCte('rascunho')}
                disabled={saving}
              >
                Salvar Rascunho
              </Button>
              <Button
                size="sm"
                className="bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
                onClick={() => salvarDocumentoCte('validado')}
                disabled={saving}
              >
                {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Validar e Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE HOMOLOGAÇÃO */}
      <Dialog open={homologModalOpen} onOpenChange={setHomologModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              Marcar CT-e Autorizado em Homologação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Esta ação registra o CT-e como validado e autorizado no ambiente de testes da SEFAZ,
              gerando número de protocolo interno para auditoria e tornando os dados fiscais
              imutáveis.
            </p>
            <div>
              <Label className="text-xs font-semibold">Justificativa / Protocolo</Label>
              <Input
                value={justificativaHomolog}
                onChange={(e) => setJustificativaHomolog(e.target.value)}
                className="text-xs mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setHomologModalOpen(false)}>
              Voltar
            </Button>
            <Button
              size="sm"
              className="bg-emerald-700 text-white font-bold hover:bg-emerald-800"
              onClick={confirmarAutorizacaoHomolog}
            >
              Confirmar Homologação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE CANCELAMENTO */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-700">
              <XCircle className="w-5 h-5" />
              Cancelamento de CT-e
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              O cancelamento de documento fiscal é irreversível e exige justificativa clara perante
              o Fisco (mínimo de 15 caracteres).
            </p>
            <div>
              <Label className="text-xs font-semibold">Motivo do Cancelamento *</Label>
              <Input
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Ex: Cancelamento por erro no tomador ou valor da prestação contratada..."
                className="text-xs mt-1"
              />
              <span className="text-[10px] text-muted-foreground">
                Caracteres: {motivoCancelamento.length}/15
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Voltar
            </Button>
            <Button
              size="sm"
              className="bg-rose-700 text-white font-bold hover:bg-rose-800"
              onClick={confirmarCancelamento}
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

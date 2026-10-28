import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  Flag,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useBrand } from '@/hooks/use-brand'
import pb from '@/lib/pocketbase/client'
import {
  gerarChaveAcessoFiscal,
  validarChaveAcesso,
  gerarXmlMdfeModelo58,
  type MdfeCondutor,
  type MdfeReboque,
  type MdfeValePedagio,
  type MdfeCteVinculado,
} from '@/lib/cte-mdfe-engine'

const MDFE_STATUS_BADGE: Record<string, { label: string; className: string }> = {
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
  em_transito: {
    label: 'Em Trânsito',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  encerrado: {
    label: 'Encerrado',
    className: 'bg-neutral-800 text-white',
  },
  cancelado: { label: 'Cancelado', className: 'bg-rose-100 text-rose-800 border-rose-300' },
}

export function ScreenMdfeEmissao() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { brand, empresaAtivaId, empresasDisponiveis } = useBrand()

  const [loading, setLoading] = useState(true)
  const [manifests, setManifests] = useState<any[]>([])
  const [ctesDisponiveis, setCtesDisponiveis] = useState<any[]>([])
  const [filterSearch, setFilterSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')

  // Estado do Editor
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('geral')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Campos do formulário de MDF-e
  const [numero, setNumero] = useState('')
  const [serie, setSerie] = useState('1')
  const [ambiente, setAmbiente] = useState<'homologacao' | 'producao'>('homologacao')
  const [chaveAcesso, setChaveAcesso] = useState('')
  const [statusAtual, setStatusAtual] = useState('rascunho')

  // Percurso
  const [ufCarregamento, setUfCarregamento] = useState('SP')
  const [municipioCarregamento, setMunicipioCarregamento] = useState('São Paulo')
  const [ufDescarregamento, setUfDescarregamento] = useState('RJ')
  const [municipioDescarregamento, setMunicipioDescarregamento] = useState('Rio de Janeiro')

  // Veículo e Condutores
  const [placaVeiculo, setPlacaVeiculo] = useState('ABC1D23')
  const [ufVeiculo, setUfVeiculo] = useState('SP')
  const [rntrc, setRntrc] = useState('12345678')
  const [condutores, setCondutores] = useState<MdfeCondutor[]>([
    { nome: 'Carlos Silva', cpf: '123.456.789-00' },
  ])
  const [novoCondutorNome, setNovoCondutorNome] = useState('')
  const [novoCondutorCpf, setNovoCondutorCpf] = useState('')

  // Reboques
  const [reboques, setReboques] = useState<MdfeReboque[]>([])
  const [novoReboquePlaca, setNovoReboquePlaca] = useState('')
  const [novoReboqueCapacidade, setNovoReboqueCapacidade] = useState<number>(0)

  // Vales-Pedágio
  const [valesPedagio, setValesPedagio] = useState<MdfeValePedagio[]>([])
  const [novoValeEmpresa, setNovoValeEmpresa] = useState('')
  const [novoValeValor, setNovoValeValor] = useState<number>(0)

  // CT-e Vinculados
  const [ctesVinculados, setCtesVinculados] = useState<MdfeCteVinculado[]>([])
  const [selectedCteId, setSelectedCteId] = useState('')

  const [observacoes, setObservacoes] = useState('')

  // Modais de Ação (Encerramento, Cancelamento, Homologação)
  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [actionDocId, setActionDocId] = useState<string | null>(null)
  const [ufEncerramento, setUfEncerramento] = useState('RJ')
  const [municipioEncerramento, setMunicipioEncerramento] = useState('Rio de Janeiro')

  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')

  const [homologModalOpen, setHomologModalOpen] = useState(false)
  const [justificativaHomolog, setJustificativaHomolog] = useState(
    'Homologação de Manifesto Eletrônico para acobertamento de transporte',
  )

  const empresaAtual = useMemo(() => {
    return (empresasDisponiveis as any[])?.find((e: any) => e.id === empresaAtivaId) || null
  }, [empresasDisponiveis, empresaAtivaId])

  const empresaCnpj = (empresaAtual as any)?.cnpj || '00.000.000/0001-91'
  const empresaRazao = empresaAtual?.razao_social || brand?.empresaNome || 'HURAM LOGÍSTICA LTDA'
  const empresaUf = (empresaAtual as any)?.estado || 'SP'

  // Cálculos Automáticos de Totais da Carga
  const totaisCarga = useMemo(() => {
    const valor = ctesVinculados.reduce((acc, c) => acc + (Number(c.valor_carga) || 0), 0)
    const peso = ctesVinculados.reduce((acc, c) => acc + (Number(c.peso_bruto_kg) || 0), 0)
    return {
      valor,
      peso,
      quantidadeCte: ctesVinculados.length,
    }
  }, [ctesVinculados])

  // Carregar MDF-e e CT-e autorizados
  const carregarDados = async () => {
    setLoading(true)
    try {
      const filterEmpresa = empresaAtivaId ? `empresa_id = "${empresaAtivaId}"` : ''
      const [mdfeRes, cteRes] = await Promise.all([
        pb.collection('mdfe_documents').getFullList({
          filter: filterEmpresa || undefined,
          sort: '-created',
        }),
        pb.collection('cte_documents').getFullList({
          filter: filterEmpresa || undefined,
          sort: '-created',
        }),
      ])

      setManifests(mdfeRes)
      setCtesDisponiveis(cteRes)
    } catch (err) {
      console.error('Erro ao carregar MDF-e:', err)
      toast({
        title: 'Aviso de Carregamento',
        description: 'Não foi possível carregar a lista de manifestos ou CT-e.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [empresaAtivaId])

  // Obter próximo sequencial via endpoint ou fallback
  const buscarProximoNumero = async (serieDesejada: string) => {
    try {
      const q = new URLSearchParams()
      if (empresaAtivaId) q.set('empresa_id', empresaAtivaId)
      q.set('serie', serieDesejada)
      const res = await pb.send(`/backend/v1/mdfe-numbers/next?${q.toString()}`, {
        method: 'GET',
      })
      if (res && res.numero) {
        setNumero(res.numero)
      }
    } catch {
      const proximo = (manifests.length + 1).toString().padStart(9, '0')
      setNumero(proximo)
    }
  }

  const abrirNovoEditor = async () => {
    setEditingId(null)
    setStatusAtual('rascunho')
    setSerie('1')
    setAmbiente('homologacao')
    setUfCarregamento(empresaUf || 'SP')
    setMunicipioCarregamento((empresaAtual as any)?.cidade || 'São Paulo')
    setUfDescarregamento('RJ')
    setMunicipioDescarregamento('Rio de Janeiro')
    setPlacaVeiculo('ABC1D23')
    setUfVeiculo(empresaUf || 'SP')
    setRntrc('12345678')
    setCondutores([{ nome: 'Carlos Silva', cpf: '123.456.789-00' }])
    setReboques([])
    setValesPedagio([])
    setCtesVinculados([])
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
    setAmbiente(doc.ambiente || 'homologacao')
    setChaveAcesso(doc.chave_acesso || '')
    setUfCarregamento(doc.uf_carregamento || 'SP')
    setMunicipioCarregamento(doc.municipio_carregamento || '')
    setUfDescarregamento(doc.uf_descarregamento || 'RJ')
    setMunicipioDescarregamento(doc.municipio_descarregamento || '')
    setPlacaVeiculo(doc.placa_veiculo || '')
    setUfVeiculo(doc.uf_veiculo || 'SP')
    setRntrc(doc.rntrc || '')
    setCondutores(doc.condutores || [])
    setReboques(doc.reboques || [])
    setValesPedagio(doc.vale_pedagio || [])
    setCtesVinculados(doc.cte_vinculados || [])
    setObservacoes(doc.observacoes || '')
    setActiveTab('geral')
    setIsEditorOpen(true)
  }

  // Gerar chave de 44 dígitos para MDF-e (Modelo 58)
  const obterOuGerarChaveAcesso = () => {
    if (chaveAcesso && validarChaveAcesso(chaveAcesso)) return chaveAcesso
    const nova = gerarChaveAcessoFiscal({
      uf: ufCarregamento || empresaUf || 'SP',
      dataEmissao: new Date(),
      cnpjEmitente: empresaCnpj,
      modelo: '58',
      serie: serie || '1',
      numero: numero || '1',
    })
    setChaveAcesso(nova)
    return nova
  }

  // Adicionar Condutor
  const adicionarCondutor = () => {
    if (!novoCondutorNome.trim() || !novoCondutorCpf.trim()) {
      toast({
        title: 'Condutor Incompleto',
        description: 'Informe o Nome e CPF do condutor.',
        variant: 'destructive',
      })
      return
    }
    setCondutores([...condutores, { nome: novoCondutorNome.trim(), cpf: novoCondutorCpf.trim() }])
    setNovoCondutorNome('')
    setNovoCondutorCpf('')
  }

  // Adicionar Reboque
  const adicionarReboque = () => {
    if (!novoReboquePlaca.trim()) return
    setReboques([
      ...reboques,
      {
        placa: novoReboquePlaca.toUpperCase().trim(),
        capacidade_kg: novoReboqueCapacidade || 15000,
        tipo_carroceria: 'Fechada/Baú',
      },
    ])
    setNovoReboquePlaca('')
    setNovoReboqueCapacidade(0)
  }

  // Adicionar Vale-Pedágio
  const adicionarValePedagio = () => {
    if (!novoValeEmpresa.trim() || novoValeValor <= 0) return
    setValesPedagio([
      ...valesPedagio,
      {
        empresa_fornecedora: novoValeEmpresa.trim(),
        valor: novoValeValor,
        numero_comprovante: String(Date.now()).slice(-8),
      },
    ])
    setNovoValeEmpresa('')
    setNovoValeValor(0)
  }

  // Vincular CT-e ao MDF-e
  const adicionarCteAoManifesto = () => {
    const cte = ctesDisponiveis.find((c) => c.id === selectedCteId)
    if (!cte) return
    const jaExiste = ctesVinculados.some((c) => c.cte_id === cte.id || c.numero === cte.numero)
    if (jaExiste) {
      toast({ title: 'CT-e já vinculado', description: 'Este conhecimento já consta na carga.' })
      return
    }
    const novoVinculo: MdfeCteVinculado = {
      cte_id: cte.id,
      chave_acesso: cte.chave_acesso || '',
      numero: cte.numero,
      uf_descarregamento: cte.uf_fim || ufDescarregamento,
      municipio_descarregamento: cte.municipio_fim || municipioDescarregamento,
      valor_carga: cte.valor_total_carga || cte.valor_total_prestacao || 1000,
      peso_bruto_kg: cte.peso_bruto_kg || 500,
    }
    setCtesVinculados([...ctesVinculados, novoVinculo])
    setSelectedCteId('')
  }

  // Validação das regras de negócio do MDF-e
  const validarFormularioMdfe = (): { valido: boolean; erros: string[] } => {
    const erros: string[] = []
    if (!numero) erros.push('Número do MDF-e é obrigatório.')
    if (!serie) erros.push('Série do MDF-e é obrigatória.')
    if (!placaVeiculo) erros.push('Placa do veículo de tração é obrigatória.')
    if (!rntrc) erros.push('RNTRC do transportador é obrigatório.')
    if (condutores.length === 0) erros.push('Cadastre ao menos um condutor (Nome e CPF).')
    if (ctesVinculados.length === 0)
      erros.push('Vincule ao menos um CT-e para acobertamento da carga.')
    return { valido: erros.length === 0, erros }
  }

  // Salvar MDF-e
  const salvarDocumentoMdfe = async (novoStatus: string = 'rascunho') => {
    const { valido, erros } = validarFormularioMdfe()
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

      // Geração prévia do XML textual Modelo 58
      const xml = gerarXmlMdfeModelo58({
        chaveAcesso: chaveFinal,
        numero,
        serie,
        dataEmissao: new Date().toISOString(),
        ambiente,
        ufCarregamento,
        municipioCarregamento,
        ufDescarregamento,
        municipioDescarregamento,
        placaVeiculo,
        ufVeiculo,
        rntrc,
        condutores,
        reboques,
        valesPedagio,
        ctesVinculados,
        valorTotalCarga: totaisCarga.valor,
        pesoBrutoTotalKg: totaisCarga.peso,
        emitente: {
          cnpj: empresaCnpj,
          razaoSocial: empresaRazao,
          uf: empresaUf,
        },
        observacoes,
      })

      const payload = {
        empresa_id: empresaAtivaId || '',
        numero,
        serie,
        chave_acesso: chaveFinal,
        modal: 'rodoviario',
        tipo_emitente: '1',
        tipo_transportador: '1',
        uf_carregamento: ufCarregamento,
        municipio_carregamento: municipioCarregamento,
        uf_descarregamento: ufDescarregamento,
        municipio_descarregamento: municipioDescarregamento,
        placa_veiculo: placaVeiculo,
        uf_veiculo: ufVeiculo,
        rntrc,
        condutores,
        reboques,
        vale_pedagio: valesPedagio,
        valor_total_carga: totaisCarga.valor,
        peso_bruto_total_kg: totaisCarga.peso,
        quantidade_cte: totaisCarga.quantidadeCte,
        unidade_medida_peso: '01',
        cte_vinculados: ctesVinculados,
        ambiente,
        status: novoStatus,
        xml_gerado: xml,
        observacoes,
        created_by_user_id: user?.id || '',
      }

      if (editingId) {
        await pb.collection('mdfe_documents').update(editingId, payload)
        toast({ title: 'MDF-e Atualizado', description: `Status alterado para ${novoStatus}.` })
      } else {
        const criado = await pb.collection('mdfe_documents').create(payload)
        setEditingId(criado.id)
        toast({ title: 'MDF-e Criado', description: `Número ${numero} salvo com sucesso.` })
      }

      setIsEditorOpen(false)
      carregarDados()
    } catch (err: any) {
      console.error('Erro ao salvar MDF-e:', err)
      toast({
        title: 'Erro ao Salvar MDF-e',
        description: err?.message || 'Falha na validação do servidor.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Autorização em Homologação
  const confirmarAutorizacaoHomolog = async () => {
    if (!actionDocId) return
    try {
      const protocolo = `HOM-MDF-${Date.now()}`
      await pb.collection('mdfe_documents').update(actionDocId, {
        status: 'autorizado_homologacao',
        protocolo_autorizacao: protocolo,
        data_autorizacao: new Date().toISOString(),
        justificativa_homologacao: justificativaHomolog,
      })
      toast({
        title: 'MDF-e Autorizado em Homologação',
        description: `Protocolo: ${protocolo}`,
      })
      setHomologModalOpen(false)
      setActionDocId(null)
      carregarDados()
    } catch (err: any) {
      toast({
        title: 'Falha na autorização',
        description: err?.message || 'Erro ao autorizar MDF-e.',
        variant: 'destructive',
      })
    }
  }

  // Encerramento de Manifesto
  const confirmarEncerramento = async () => {
    if (!actionDocId) return
    if (!ufEncerramento || !municipioEncerramento) {
      toast({
        title: 'Dados Incompletos',
        description: 'Informe a UF e o Município de encerramento do manifesto.',
        variant: 'destructive',
      })
      return
    }
    try {
      const protocolo = `ENC-${Date.now()}`
      await pb.collection('mdfe_documents').update(actionDocId, {
        status: 'encerrado',
        data_encerramento: new Date().toISOString(),
        uf_encerramento: ufEncerramento,
        municipio_encerramento: municipioEncerramento,
        protocolo_encerramento: protocolo,
      })
      toast({
        title: 'MDF-e Encerrado com Sucesso',
        description: `O manifesto foi encerrado no município de ${municipioEncerramento}-${ufEncerramento}.`,
      })
      setCloseModalOpen(false)
      setActionDocId(null)
      carregarDados()
    } catch (err: any) {
      toast({
        title: 'Erro ao Encerrar MDF-e',
        description: err?.message || 'Falha ao encerrar manifesto.',
        variant: 'destructive',
      })
    }
  }

  // Cancelamento com Motivo
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
      await pb.collection('mdfe_documents').update(actionDocId, {
        status: 'cancelado',
        motivo_cancelamento: motivoCancelamento.trim(),
        data_cancelamento: new Date().toISOString(),
      })
      toast({ title: 'MDF-e Cancelado', description: 'O documento foi cancelado com sucesso.' })
      setCancelModalOpen(false)
      setActionDocId(null)
      setMotivoCancelamento('')
      carregarDados()
    } catch (err: any) {
      toast({
        title: 'Erro ao cancelar',
        description: err?.message || 'Falha ao cancelar MDF-e.',
        variant: 'destructive',
      })
    }
  }

  // Download do XML textual
  const baixarXml = (doc: any) => {
    const conteudo = doc.xml_gerado || '<!-- XML não gerado -->'
    const blob = new Blob([conteudo], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `MDFE_${doc.chave_acesso || doc.numero}.xml`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Filtragem da Listagem
  const manifestosFiltrados = useMemo(() => {
    return manifests.filter((m) => {
      const matchBusca =
        !filterSearch ||
        m.numero?.includes(filterSearch) ||
        m.placa_veiculo?.toLowerCase().includes(filterSearch.toLowerCase()) ||
        m.chave_acesso?.includes(filterSearch)
      const matchStatus = filterStatus === 'todos' || m.status === filterStatus
      return matchBusca && matchStatus
    })
  }, [manifests, filterSearch, filterStatus])

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-700 text-white shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Emissão de MDF-e
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-indigo-50 text-indigo-700 font-bold border-indigo-200"
              >
                Modelo 58 • Manifesto de Carga
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-indigo-700" />
                  {empresaRazao}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manifesto Eletrônico de Documentos Fiscais para vinculação de CT-e de carga, controle
              de trânsito interestadual, condutores e encerramento.
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
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo MDF-e
          </Button>
        </div>
      </div>

      {/* PAINEL DE FILTROS E INDICADORES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total de Manifestos</p>
              <p className="text-2xl font-black text-foreground">{manifests.length}</p>
            </div>
            <Truck className="w-8 h-8 text-indigo-600/30" />
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Autorizados / Trânsito</p>
              <p className="text-2xl font-black text-emerald-700">
                {
                  manifests.filter(
                    (m) =>
                      m.status === 'autorizado_homologacao' ||
                      m.status === 'autorizado_producao' ||
                      m.status === 'em_transito',
                  ).length
                }
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Encerrados</p>
              <p className="text-2xl font-black text-neutral-800">
                {manifests.filter((m) => m.status === 'encerrado').length}
              </p>
            </div>
            <Flag className="w-8 h-8 text-neutral-600/30" />
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Carga em Circulação</p>
              <p className="text-xl font-black text-foreground">
                R${' '}
                {manifests
                  .filter((m) => m.status !== 'cancelado' && m.status !== 'encerrado')
                  .reduce((acc, m) => acc + (Number(m.valor_total_carga) || 0), 0)
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
            placeholder="Buscar por número do MDF-e, placa do veículo ou chave..."
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
            <SelectItem value="em_transito">Em Trânsito</SelectItem>
            <SelectItem value="encerrado">Encerrado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABELA DE MDF-E */}
      <Card className="border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/60 border-b font-bold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Número / Série</th>
                <th className="py-3 px-4">Emissão</th>
                <th className="py-3 px-4">Veículo / Placa</th>
                <th className="py-3 px-4">Percurso (Carga → Descarga)</th>
                <th className="py-3 px-4 text-center">CT-e Vinculados</th>
                <th className="py-3 px-4 text-right">Valor da Carga</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-700" />
                    Carregando manifestos eletrônicos...
                  </td>
                </tr>
              ) : manifestosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Nenhum MDF-e encontrado para os critérios selecionados.
                  </td>
                </tr>
              ) : (
                manifestosFiltrados.map((doc) => {
                  const badge = MDFE_STATUS_BADGE[doc.status] || {
                    label: doc.status,
                    className: 'bg-muted text-muted-foreground',
                  }
                  const podeEditar = doc.status === 'rascunho' || doc.status === 'validado'
                  const podeEncerrar =
                    doc.status === 'autorizado_homologacao' ||
                    doc.status === 'autorizado_producao' ||
                    doc.status === 'em_transito'
                  const podeCancelar =
                    doc.status === 'autorizado_homologacao' || doc.status === 'validado'

                  return (
                    <tr key={doc.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground">
                          MDF-e {doc.numero} • Série {doc.serie}
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
                          {doc.placa_veiculo?.toUpperCase() || '—'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          RNTRC: {doc.rntrc || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">
                          {doc.uf_carregamento} → {doc.uf_descarregamento}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <Badge variant="secondary" className="text-[10px]">
                          {doc.quantidade_cte || doc.cte_vinculados?.length || 0} CT-e
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-foreground">
                        R$ {(doc.valor_total_carga || 0).toFixed(2)}
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
                            title="Baixar XML textual Modelo 58"
                            onClick={() => baixarXml(doc)}
                          >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                          </Button>
                          {doc.status !== 'autorizado_homologacao' &&
                            doc.status !== 'encerrado' &&
                            doc.status !== 'cancelado' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-indigo-700 border-indigo-300 hover:bg-indigo-50"
                                onClick={() => {
                                  setActionDocId(doc.id)
                                  setHomologModalOpen(true)
                                }}
                              >
                                Homologar
                              </Button>
                            )}
                          {podeEncerrar && (
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-neutral-800 text-white hover:bg-neutral-900"
                              onClick={() => {
                                setActionDocId(doc.id)
                                setUfEncerramento(doc.uf_descarregamento || 'RJ')
                                setMunicipioEncerramento(
                                  doc.municipio_descarregamento || 'Rio de Janeiro',
                                )
                                setCloseModalOpen(true)
                              }}
                            >
                              Encerrar
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

      {/* DIÁLOGO EDITOR MDF-E COM RESUMO FIXO */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-muted/40">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-700" />
                  {editingId
                    ? `Editando MDF-e ${numero}`
                    : 'Novo Manifesto de Documentos Fiscais (MDF-e)'}
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

          {/* RESUMO FIXO DA CARGA MANIFESTADA */}
          <div className="bg-indigo-50/60 border-b px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-muted-foreground block text-[10px]">VALOR DA CARGA</span>
                <span className="text-sm font-black text-indigo-900">
                  R$ {totaisCarga.valor.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">PESO BRUTO TOTAL</span>
                <span className="text-sm font-bold text-foreground">
                  {totaisCarga.peso.toFixed(2)} kg
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">CT-E VINCULADOS</span>
                <span className="text-sm font-bold text-foreground">
                  {totaisCarga.quantidadeCte} documento(s)
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">VEÍCULO / PLACA</span>
                <span className="text-sm font-bold font-mono text-foreground">
                  {placaVeiculo.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background text-[11px] font-mono">
                {ufCarregamento} → {ufDescarregamento}
              </Badge>
            </div>
          </div>

          {/* CONTEÚDO COM ABAS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-5 text-xs font-semibold bg-muted/60 p-1">
                <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
                <TabsTrigger value="veiculo">Veículo & Condutores</TabsTrigger>
                <TabsTrigger value="pedagio">Vale-Pedágio</TabsTrigger>
                <TabsTrigger value="ctes">CT-e Vinculados</TabsTrigger>
                <TabsTrigger value="observacoes">Carga & Obs</TabsTrigger>
              </TabsList>

              {/* ABA 1: DADOS GERAIS */}
              <TabsContent value="geral" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Número do MDF-e *</Label>
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

                <div className="border rounded-lg p-3 bg-muted/20 space-y-3">
                  <h4 className="text-xs font-bold text-foreground">
                    Carregamento e Descarregamento da Viagem
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">UF Carregamento *</Label>
                      <Input
                        value={ufCarregamento}
                        onChange={(e) => setUfCarregamento(e.target.value.toUpperCase())}
                        maxLength={2}
                        className="text-xs uppercase"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Município Carregamento *</Label>
                      <Input
                        value={municipioCarregamento}
                        onChange={(e) => setMunicipioCarregamento(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">UF Descarregamento *</Label>
                      <Input
                        value={ufDescarregamento}
                        onChange={(e) => setUfDescarregamento(e.target.value.toUpperCase())}
                        maxLength={2}
                        className="text-xs uppercase"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Município Descarregamento *</Label>
                      <Input
                        value={municipioDescarregamento}
                        onChange={(e) => setMunicipioDescarregamento(e.target.value)}
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
                    placeholder="Geração automática padrão SEFAZ"
                    className="text-xs font-mono"
                  />
                  {chaveAcesso && (
                    <p className="text-[11px] mt-1 text-muted-foreground flex items-center gap-1">
                      {validarChaveAcesso(chaveAcesso) ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Chave MDF-e Válida (Módulo 11 SEFAZ)
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Chave inválida
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* ABA 2: VEÍCULO E CONDUTORES */}
              <TabsContent value="veiculo" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs font-bold text-indigo-700">
                      Placa do Veículo Tração *
                    </Label>
                    <Input
                      value={placaVeiculo}
                      onChange={(e) => setPlacaVeiculo(e.target.value.toUpperCase())}
                      placeholder="ABC1D23"
                      className="text-xs uppercase font-mono font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">UF da Placa</Label>
                    <Input
                      value={ufVeiculo}
                      onChange={(e) => setUfVeiculo(e.target.value.toUpperCase())}
                      maxLength={2}
                      className="text-xs uppercase"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-indigo-700">
                      RNTRC do Transportador *
                    </Label>
                    <Input
                      value={rntrc}
                      onChange={(e) => setRntrc(e.target.value)}
                      placeholder="Registro ANTT"
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                {/* CONDUTORES */}
                <div className="border rounded-lg p-3 bg-muted/20 space-y-3">
                  <h4 className="text-xs font-bold text-foreground">Condutores do Veículo</h4>
                  <div className="flex flex-col sm:flex-row items-end gap-2">
                    <div className="flex-1 w-full">
                      <Label className="text-xs">Nome do Motorista</Label>
                      <Input
                        value={novoCondutorNome}
                        onChange={(e) => setNovoCondutorNome(e.target.value)}
                        placeholder="Nome completo..."
                        className="text-xs"
                      />
                    </div>
                    <div className="w-full sm:w-44">
                      <Label className="text-xs">CPF do Motorista</Label>
                      <Input
                        value={novoCondutorCpf}
                        onChange={(e) => setNovoCondutorCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="text-xs font-mono"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={adicionarCondutor}
                      className="bg-indigo-700 text-white text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                    </Button>
                  </div>

                  <div className="border rounded-md overflow-hidden bg-background">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted font-bold">
                        <tr>
                          <th className="py-2 px-3">Nome do Condutor</th>
                          <th className="py-2 px-3">CPF</th>
                          <th className="py-2 px-3 text-right w-16">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {condutores.map((c, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="py-2 px-3 font-semibold">{c.nome}</td>
                            <td className="py-2 px-3 font-mono">{c.cpf}</td>
                            <td className="py-2 px-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-rose-600"
                                onClick={() =>
                                  setCondutores(condutores.filter((_, i) => i !== idx))
                                }
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* REBOQUES */}
                <div className="border rounded-lg p-3 bg-muted/20 space-y-3">
                  <h4 className="text-xs font-bold text-foreground">Reboques / Semirreboques</h4>
                  <div className="flex flex-col sm:flex-row items-end gap-2">
                    <div className="w-full sm:w-44">
                      <Label className="text-xs">Placa do Reboque</Label>
                      <Input
                        value={novoReboquePlaca}
                        onChange={(e) => setNovoReboquePlaca(e.target.value.toUpperCase())}
                        placeholder="XYZ9A87"
                        className="text-xs uppercase font-mono"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <Label className="text-xs">Capacidade (kg)</Label>
                      <Input
                        type="number"
                        value={novoReboqueCapacidade || ''}
                        onChange={(e) => setNovoReboqueCapacidade(parseFloat(e.target.value) || 0)}
                        placeholder="Ex: 25000"
                        className="text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={adicionarReboque}
                      className="bg-indigo-700 text-white text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Reboque
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* ABA 3: VALE-PEDÁGIO */}
              <TabsContent value="pedagio" className="space-y-4">
                <div className="flex flex-col sm:flex-row items-end gap-2 bg-muted/30 p-3 rounded-lg border">
                  <div className="flex-1 w-full">
                    <Label className="text-xs">Empresa Fornecedora do Vale-Pedágio</Label>
                    <Input
                      value={novoValeEmpresa}
                      onChange={(e) => setNovoValeEmpresa(e.target.value)}
                      placeholder="Ex: Sem Parar, ConectCar, Veloe..."
                      className="text-xs"
                    />
                  </div>
                  <div className="w-full sm:w-36">
                    <Label className="text-xs">Valor do Pedágio (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={novoValeValor || ''}
                      onChange={(e) => setNovoValeValor(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={adicionarValePedagio}
                    className="bg-indigo-700 text-white text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Fornecedora</th>
                        <th className="py-2.5 px-3">Comprovante</th>
                        <th className="py-2.5 px-3 text-right">Valor (R$)</th>
                        <th className="py-2.5 px-3 text-right w-16">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {valesPedagio.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-3 text-center text-muted-foreground">
                            Nenhum registro de vale-pedágio obrigatório vinculado.
                          </td>
                        </tr>
                      ) : (
                        valesPedagio.map((v, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="py-2 px-3 font-semibold">{v.empresa_fornecedora}</td>
                            <td className="py-2 px-3 font-mono">{v.numero_comprovante}</td>
                            <td className="py-2 px-3 text-right font-bold">
                              R$ {(v.valor || 0).toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-rose-600"
                                onClick={() =>
                                  setValesPedagio(valesPedagio.filter((_, i) => i !== idx))
                                }
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* ABA 4: CT-E VINCULADOS */}
              <TabsContent value="ctes" className="space-y-4">
                <div className="flex flex-col sm:flex-row items-end gap-2 bg-muted/30 p-3 rounded-lg border">
                  <div className="flex-1 w-full">
                    <Label className="text-xs">Selecionar CT-e Emitido para Vincular</Label>
                    <Select value={selectedCteId} onValueChange={setSelectedCteId}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Escolha um CT-e registrado..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ctesDisponiveis.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            CT-e {c.numero} • {c.uf_fim} ({c.municipio_fim}) • R${' '}
                            {(c.valor_total_carga || c.valor_total_prestacao || 0).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    onClick={adicionarCteAoManifesto}
                    className="bg-indigo-700 text-white text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Vincular ao Manifesto
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Número CT-e</th>
                        <th className="py-2.5 px-3">Chave de Acesso</th>
                        <th className="py-2.5 px-3">Destino (Descarga)</th>
                        <th className="py-2.5 px-3 text-right">Valor Carga (R$)</th>
                        <th className="py-2.5 px-3 text-right">Peso (kg)</th>
                        <th className="py-2.5 px-3 text-right w-16">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ctesVinculados.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-muted-foreground">
                            Nenhum CT-e vinculado ao manifesto. É obrigatório ao menos 1 documento
                            de transporte.
                          </td>
                        </tr>
                      ) : (
                        ctesVinculados.map((c, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="py-2 px-3 font-semibold">CT-e {c.numero}</td>
                            <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
                              {c.chave_acesso || 'Chave em geração'}
                            </td>
                            <td className="py-2 px-3">
                              {c.municipio_descarregamento}-{c.uf_descarregamento}
                            </td>
                            <td className="py-2 px-3 text-right font-bold">
                              R$ {(c.valor_carga || 0).toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-right font-medium">
                              {(c.peso_bruto_kg || 0).toFixed(2)} kg
                            </td>
                            <td className="py-2 px-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-rose-600"
                                onClick={() =>
                                  setCtesVinculados(ctesVinculados.filter((_, i) => i !== idx))
                                }
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
                        <td colSpan={3} className="py-2 px-3 text-foreground">
                          TOTAL DA CARGA MANIFESTADA
                        </td>
                        <td className="py-2 px-3 text-right text-indigo-900 font-black">
                          R$ {totaisCarga.valor.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right text-foreground font-black">
                          {totaisCarga.peso.toFixed(2)} kg
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </TabsContent>

              {/* ABA 5: OBSERVAÇÕES E CARGA */}
              <TabsContent value="observacoes" className="space-y-4">
                <div>
                  <Label className="text-xs">Observações do Manifesto / Fisco</Label>
                  <Input
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Instruções para postos fiscais de pesagem, paradas programadas..."
                    className="text-xs"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* RODAPÉ DO EDITOR */}
          <DialogFooter className="p-3 border-t bg-muted/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Geração de XML modelo 58 para posterior envio pela transportadora.</span>
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
                onClick={() => salvarDocumentoMdfe('rascunho')}
                disabled={saving}
              >
                Salvar Rascunho
              </Button>
              <Button
                size="sm"
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
                onClick={() => salvarDocumentoMdfe('validado')}
                disabled={saving}
              >
                {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Validar e Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE ENCERRAMENTO */}
      <Dialog open={closeModalOpen} onOpenChange={setCloseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-neutral-900">
              <Flag className="w-5 h-5" />
              Encerramento de MDF-e
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              O encerramento é obrigatório ao final da viagem para liberação do veículo e dos
              condutores para novos manifestos perante a SEFAZ.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">UF Encerramento *</Label>
                <Input
                  value={ufEncerramento}
                  onChange={(e) => setUfEncerramento(e.target.value.toUpperCase())}
                  maxLength={2}
                  className="text-xs uppercase mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Município Encerramento *</Label>
                <Input
                  value={municipioEncerramento}
                  onChange={(e) => setMunicipioEncerramento(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCloseModalOpen(false)}>
              Voltar
            </Button>
            <Button
              size="sm"
              className="bg-neutral-900 text-white font-bold hover:bg-neutral-800"
              onClick={confirmarEncerramento}
            >
              Confirmar Encerramento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE HOMOLOGAÇÃO */}
      <Dialog open={homologModalOpen} onOpenChange={setHomologModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-indigo-700">
              <CheckCircle2 className="w-5 h-5" />
              Autorizar MDF-e em Homologação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Esta ação valida os dados perante as regras do modelo 58 e registra a autorização de
              teste, gerando protocolo de auditoria.
            </p>
            <div>
              <Label className="text-xs font-semibold">Justificativa</Label>
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
              className="bg-indigo-700 text-white font-bold hover:bg-indigo-800"
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
              Cancelamento de MDF-e
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              O cancelamento de manifesto exige motivo circunstanciado de no mínimo 15 caracteres.
            </p>
            <div>
              <Label className="text-xs font-semibold">Motivo do Cancelamento *</Label>
              <Input
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Ex: Cancelamento por quebra do veículo antes do início da viagem..."
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

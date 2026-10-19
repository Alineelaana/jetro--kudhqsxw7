import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import {
  listSolicitacoes,
  updateSolicitacao,
  concluirCadastroOficial,
} from '@/services/client-workflow'
import {
  type SolicitacaoClienteRecord,
  type ClienteOficialRecord,
  type SituacaoCredito,
  PERFIS_CLIENTE,
  CANAIS_COMERCIAIS,
  CLASSIFICACOES_FISCAIS,
} from '@/lib/client-workflow-types'
import {
  Building2,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Search,
  Eye,
  Check,
  RotateCcw,
  Ban,
  History,
  FileText,
  DollarSign,
  Truck,
  Plus,
  RefreshCw,
  Edit,
  MapPin,
  Lock,
  Loader2,
  Info,
} from 'lucide-react'
import {
  consultarCNPJPublico,
  validarCNPJ,
  formatarCNPJ,
  type CnpjParsedData,
} from '@/services/cnpj-service'

export function CadastroClientesOficialScreen() {
  const { user } = useAuth()

  // 1. Estados da Fila de Pré-Cadastros e Clientes Oficiais
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoClienteRecord[]>([])
  const [clientesOficiais, setClientesOficiais] = useState<ClienteOficialRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'fila' | 'oficial'>('fila')
  const [kpiFilter, setKpiFilter] = useState<string>('todos')

  // Listas auxiliares (rotas e tabelas cadastradas)
  const [rotas, setRotas] = useState<any[]>([])
  const [tabelasPrecos, setTabelasPrecos] = useState<any[]>([])
  const [vendedores, setVendedores] = useState<any[]>([])

  // 2. Modais e Ações da Fila
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoClienteRecord | null>(
    null,
  )
  const [devolverModalOpen, setDevolverModalOpen] = useState(false)
  const [pendenciasTexto, setPendenciasTexto] = useState('')
  const [rejeitarModalOpen, setRejeitarModalOpen] = useState(false)
  const [motivoRejeicao, setMotivoRejeicao] = useState('')

  // 3. Modal / Formulário de Cadastro Oficial (9 seções completas)
  const [clienteFormOpen, setClienteFormOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<ClienteOficialRecord | null>(null)
  const [solicitacaoVinculada, setSolicitacaoVinculada] = useState<SolicitacaoClienteRecord | null>(
    null,
  )
  const [savingCliente, setSavingCliente] = useState(false)

  // Campos das 9 Seções do Cadastro Oficial
  // 1. Identificação
  const [ativo, setAtivo] = useState(true)
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PJ')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [razaoSocial, setRazaoSocial] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [inscricaoEstadual, setInscricaoEstadual] = useState('')
  const [cnae, setCnae] = useState('')
  const [situacaoCadastral, setSituacaoCadastral] = useState('Ativo')
  const [consultandoCnpj, setConsultandoCnpj] = useState(false)
  const [consultaInfo, setConsultaInfo] = useState<string | null>(null)
  const [avisoDivergencia, setAvisoDivergencia] = useState<string | null>(null)

  // 2. Perfil Comercial
  const [perfilCliente, setPerfilCliente] = useState('Farmácia')
  const [canalComercial, setCanalComercial] = useState('Farma')
  const [segmento, setSegmento] = useState('Varejo Farmacêutico')
  const [tipoLoja, setTipoLoja] = useState('Loja de Rua')
  const [potencialCompra, setPotencialCompra] = useState('')
  const [frequenciaPrevista, setFrequenciaPrevista] = useState('Semanal')

  // 3. Equipe de Vendas
  const [rca1Id, setRca1Id] = useState('')
  const [rca1Nome, setRca1Nome] = useState('')
  const [rca1Codigo, setRca1Codigo] = useState('')
  const [gerenteId, setGerenteId] = useState('')
  const [gerenteNome, setGerenteNome] = useState('')
  const [rca2Id, setRca2Id] = useState('')
  const [televendasId, setTelevendasId] = useState('')
  const [b2bId, setB2bId] = useState('')

  // 4. Endereço e Logística
  const [cep, setCep] = useState('')
  const [uf, setUf] = useState('ES')
  const [municipio, setMunicipio] = useState('')
  const [bairro, setBairro] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numeroEnd, setNumeroEnd] = useState('')
  const [complemento, setComplemento] = useState('')
  const [pontoReferencia, setPontoReferencia] = useState('')
  const [rotaId, setRotaId] = useState('')
  const [observacoesLogisticas, setObservacoesLogisticas] = useState('')

  // 5. Condições Comerciais
  const [tabelaPrecoId, setTabelaPrecoId] = useState('')
  const [descontoMaximo, setDescontoMaximo] = useState('')
  const [pedidoMinimo, setPedidoMinimo] = useState('')
  const [formaAtendimento, setFormaAtendimento] = useState('Presencial + B2B')
  const [limitePretendido, setLimitePretendido] = useState('')
  const [condicaoPagamentoSolicitada, setCondicaoPagamentoSolicitada] = useState('')
  const [exigeCreditoFinanceiro, setExigeCreditoFinanceiro] = useState(true)

  // 6. Fiscais
  const [regimeTributario, setRegimeTributario] = useState('Simples Nacional')
  const [simplesNacional, setSimplesNacional] = useState(true)
  const [classificacaoIcms, setClassificacaoIcms] = useState('Revendedor (Comércio)')
  const [consumidorFinal, setConsumidorFinal] = useState(false)
  const [contribuinteIcms, setContribuinteIcms] = useState(true)
  const [produtorRural, setProdutorRural] = useState(false)
  const [emailXml, setEmailXml] = useState('')

  // 7. Contatos
  const [telefonePrincipal, setTelefonePrincipal] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [emailPrincipal, setEmailPrincipal] = useState('')
  const [compradorNome, setCompradorNome] = useState('')

  // 8. Documentos & Anexos
  // 9. Observações & Histórico
  const [observacoesComerciais, setObservacoesComerciais] = useState('')
  const [observacoesFiscais, setObservacoesFiscais] = useState('')
  const [observacoesGerais, setObservacoesGerais] = useState('')

  // Modal de Histórico
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedHistoryEvents, setSelectedHistoryEvents] = useState<any[]>([])

  // Carregar dados
  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Solicitações de pré-cadastro
      const solics = await listSolicitacoes('', '-created')
      setSolicitacoes(solics)

      // 2. Clientes Oficiais (partners com partner_type = 'Cliente')
      const clients = await pb.collection('partners').getFullList({
        filter: 'partner_type = "Cliente"',
        sort: '-created',
      })
      setClientesOficiais(clients as unknown as ClienteOficialRecord[])

      // 3. Rotas logísticas existentes
      try {
        const rList = await pb.collection('logistics_routes').getFullList({
          filter: 'active = true',
          sort: 'route_name',
        })
        setRotas(rList)
      } catch {
        /* intentionally ignored */
      }

      // 4. Tabelas de Preço existentes
      try {
        const tList = await pb.collection('price_tables').getFullList({
          filter: 'status = "ativa"',
          sort: 'name',
        })
        setTabelasPrecos(tList)
      } catch {
        /* intentionally ignored */
      }

      // 5. Vendedores / Representantes
      try {
        const vList = await pb.collection('representantes').getFullList({
          filter: 'active = true',
          sort: 'name',
        })
        setVendedores(vList)
      } catch {
        /* intentionally ignored */
      }
    } catch {
      toast({ title: 'Erro ao carregar dados do Comercial', variant: 'destructive' })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Indicadores Superiores Reais e Clicáveis
  const kpis = useMemo(() => {
    const aguardando = solicitacoes.filter((s) => s.status === 'aguardando_validacao').length
    const emAnalise = solicitacoes.filter((s) => s.status === 'em_analise').length
    const emCorrecao = solicitacoes.filter((s) => s.status === 'em_correcao').length
    const concluidos = solicitacoes.filter((s) => s.status === 'concluido').length
    const creditoPendente = clientesOficiais.filter(
      (c) => c.situacao_credito === 'Pendente de análise' || !c.situacao_credito,
    ).length
    const comRestricao = clientesOficiais.filter(
      (c) => c.bloqueio_vendas_prazo || c.situacao_credito === 'Bloqueado',
    ).length

    return { aguardando, emAnalise, emCorrecao, concluidos, creditoPendente, comRestricao }
  }, [solicitacoes, clientesOficiais])

  // Ações da Fila Comercial
  const handleAssumirAnalise = async (solic: SolicitacaoClienteRecord) => {
    try {
      const hist = solic.historico || []
      hist.push({
        data_hora: new Date().toISOString(),
        usuario_id: user?.id || '',
        usuario_nome: (user?.name as string) || (user?.email as string) || 'Comercial',
        acao: 'Análise assumida pelo Comercial',
        status: 'em_analise',
      })
      await updateSolicitacao(solic.id, { status: 'em_analise', historico: hist })
      toast({ title: 'Análise assumida com sucesso' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao assumir análise', description: err.message, variant: 'destructive' })
    }
  }

  const handleAbrirValidacao = (solic: SolicitacaoClienteRecord) => {
    setSolicitacaoVinculada(solic)
    setEditingCliente(null)

    // Preenchimento automático dos dados do RCA (sem redigitação)
    setTipoPessoa(solic.tipo_pessoa || 'PJ')
    setCpfCnpj(solic.cpf_cnpj || '')
    setRazaoSocial(solic.razao_social || '')
    setNomeFantasia(solic.nome_fantasia || solic.razao_social || '')
    setInscricaoEstadual(solic.inscricao_estadual || '')
    setCnae(solic.cnae || '')
    setSituacaoCadastral(solic.situacao_cadastral || 'Ativo')
    setCep(solic.cep || '')
    setUf(solic.uf || 'ES')
    setMunicipio(solic.municipio || '')
    setBairro(solic.bairro || '')
    setLogradouro(solic.logradouro || '')
    setNumeroEnd(solic.numero_end || '')
    setComplemento(solic.complemento || '')
    setPontoReferencia(solic.ponto_referencia || '')
    setTelefonePrincipal(solic.telefone || '')
    setWhatsapp(solic.whatsapp || '')
    setEmailPrincipal(solic.email || '')
    setEmailXml(solic.email_xml || solic.email || '')
    setCompradorNome(solic.responsavel_estabelecimento || '')

    setConsultaInfo(null)
    setAvisoDivergencia(null)

    // Responsáveis Comerciais (Automáticos do RCA)
    setRca1Id(solic.rca_id || '')
    setRca1Nome(solic.rca_nome || '')
    setRca1Codigo(solic.rca_codigo || '')
    setGerenteId(solic.gerente_id || '')
    setGerenteNome(solic.gerente_nome || '')
    setRca2Id('')
    setTelevendasId('')
    setB2bId('')

    // Perfil e Parâmetros
    setPerfilCliente('Farmácia')
    setCanalComercial('Farma')
    setSegmento('Varejo Farmacêutico')
    setTipoLoja('Loja de Rua')
    setPotencialCompra('')
    setFrequenciaPrevista('Semanal')
    setRotaId(rotas.length > 0 ? rotas[0].id : '')
    setTabelaPrecoId(tabelasPrecos.length > 0 ? tabelasPrecos[0].id : '')
    setDescontoMaximo('5.00')
    setPedidoMinimo('300.00')
    setFormaAtendimento('Presencial + B2B')
    setLimitePretendido(solic.limite_pretendido || '10000.00')
    setCondicaoPagamentoSolicitada(solic.condicao_pagamento_solicitada || '28 dias boleto')
    setExigeCreditoFinanceiro(true)
    setObservacoesComerciais(solic.observacoes_vendedor || '')
    setObservacoesLogisticas('')
    setObservacoesFiscais('')
    setObservacoesGerais(solic.motivo_solicitacao || '')

    setClienteFormOpen(true)
  }

  const handleDevolverCorrecao = async () => {
    if (!selectedSolicitacao) return
    if (!pendenciasTexto.trim()) {
      toast({ title: 'Descreva as pendências a serem corrigidas', variant: 'destructive' })
      return
    }

    try {
      const hist = selectedSolicitacao.historico || []
      hist.push({
        data_hora: new Date().toISOString(),
        usuario_id: user?.id || '',
        usuario_nome: (user?.name as string) || (user?.email as string) || 'Comercial',
        acao: 'Solicitação devolvida para correção do RCA',
        status: 'em_correcao',
        motivo: pendenciasTexto,
      })

      await updateSolicitacao(selectedSolicitacao.id, {
        status: 'em_correcao',
        pendencias_correcao: pendenciasTexto,
        historico: hist,
      })

      toast({ title: 'Solicitação devolvida ao vendedor para correção' })
      setDevolverModalOpen(false)
      setSelectedSolicitacao(null)
      setPendenciasTexto('')
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao devolver', description: err.message, variant: 'destructive' })
    }
  }

  const handleRejeitar = async () => {
    if (!selectedSolicitacao) return
    if (!motivoRejeicao.trim()) {
      toast({ title: 'Informe a justificativa da rejeição', variant: 'destructive' })
      return
    }

    try {
      const hist = selectedSolicitacao.historico || []
      hist.push({
        data_hora: new Date().toISOString(),
        usuario_id: user?.id || '',
        usuario_nome: (user?.name as string) || (user?.email as string) || 'Comercial',
        acao: 'Solicitação rejeitada pelo Comercial',
        status: 'rejeitado',
        motivo: motivoRejeicao,
      })

      await updateSolicitacao(selectedSolicitacao.id, {
        status: 'rejeitado',
        historico: hist,
      })

      toast({ title: 'Solicitação rejeitada' })
      setRejeitarModalOpen(false)
      setSelectedSolicitacao(null)
      setMotivoRejeicao('')
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao rejeitar', description: err.message, variant: 'destructive' })
    }
  }

  // Consulta de CNPJ na tela de Cadastro Oficial
  const handleCnpjLookupOficial = async () => {
    if (tipoPessoa !== 'PJ') return
    const clean = cpfCnpj.replace(/\D/g, '')

    if (!validarCNPJ(clean)) {
      toast({
        title: 'CNPJ inválido',
        description: 'Digite um CNPJ válido com 14 dígitos para consultar na Receita.',
        variant: 'destructive',
      })
      return
    }

    setConsultandoCnpj(true)
    setAvisoDivergencia(null)

    try {
      const data: CnpjParsedData = await consultarCNPJPublico(clean)

      // Atualiza formatação do CNPJ
      setCpfCnpj(data.cnpjFormatado)

      const divergencias: string[] = []

      // Razão Social
      if (data.razaoSocial) {
        if (
          !razaoSocial.trim() ||
          razaoSocial.trim().toUpperCase() === data.razaoSocial.toUpperCase()
        ) {
          setRazaoSocial(data.razaoSocial)
        } else {
          divergencias.push(`Razão Social (mantido "${razaoSocial}")`)
        }
      }

      // Nome Fantasia
      if (data.nomeFantasia) {
        if (
          !nomeFantasia.trim() ||
          nomeFantasia.trim().toUpperCase() === data.nomeFantasia.toUpperCase()
        ) {
          setNomeFantasia(data.nomeFantasia)
        } else {
          divergencias.push(`Nome Fantasia (mantido "${nomeFantasia}")`)
        }
      }

      // CNAE Principal
      if (data.cnaePrincipal) {
        if (!cnae.trim() || cnae.trim() === data.cnaePrincipal) {
          setCnae(data.cnaePrincipal)
        } else {
          divergencias.push(`CNAE (mantido "${cnae}")`)
        }
      }

      // Inscrição Estadual (se retornada)
      if (data.inscricaoEstadual) {
        if (!inscricaoEstadual.trim() || inscricaoEstadual.trim() === data.inscricaoEstadual) {
          setInscricaoEstadual(data.inscricaoEstadual)
        } else {
          divergencias.push(`Inscrição Estadual (mantido "${inscricaoEstadual}")`)
        }
      }

      // Situação Cadastral
      if (data.situacaoCadastral && (!situacaoCadastral.trim() || situacaoCadastral === 'Ativo')) {
        setSituacaoCadastral(data.situacaoCadastral)
      }

      // CEP
      if (data.cep) {
        if (!cep.trim() || cep.replace(/\D/g, '') === data.cep.replace(/\D/g, '')) {
          setCep(data.cep)
        } else {
          divergencias.push(`CEP (mantido "${cep}")`)
        }
      }

      // UF
      if (data.uf) {
        if (!uf.trim() || uf.trim().toUpperCase() === data.uf.toUpperCase()) {
          setUf(data.uf)
        } else {
          divergencias.push(`UF (mantido "${uf}")`)
        }
      }

      // Município
      if (data.municipio) {
        if (!municipio.trim() || municipio.trim().toUpperCase() === data.municipio.toUpperCase()) {
          setMunicipio(data.municipio)
        } else {
          divergencias.push(`Município (mantido "${municipio}")`)
        }
      }

      // Bairro
      if (data.bairro) {
        if (!bairro.trim() || bairro.trim().toUpperCase() === data.bairro.toUpperCase()) {
          setBairro(data.bairro)
        } else {
          divergencias.push(`Bairro (mantido "${bairro}")`)
        }
      }

      // Logradouro
      if (data.logradouro) {
        if (
          !logradouro.trim() ||
          logradouro.trim().toUpperCase() === data.logradouro.toUpperCase()
        ) {
          setLogradouro(data.logradouro)
        } else {
          divergencias.push(`Logradouro (mantido "${logradouro}")`)
        }
      }

      // Número
      if (data.numero) {
        if (!numeroEnd.trim() || numeroEnd.trim() === data.numero) {
          setNumeroEnd(data.numero)
        } else {
          divergencias.push(`Número (mantido "${numeroEnd}")`)
        }
      }

      // Complemento
      if (data.complemento && !complemento.trim()) {
        setComplemento(data.complemento)
      }

      // Telefone
      if (data.telefone && !telefonePrincipal.trim()) {
        setTelefonePrincipal(data.telefone)
      }

      // E-mail
      if (data.email) {
        if (!emailPrincipal.trim()) setEmailPrincipal(data.email)
        if (!emailXml.trim()) setEmailXml(data.email)
      }

      setConsultaInfo(`Consultado na Receita via ${data.origem} em ${data.consultadoEmTexto}`)

      if (divergencias.length > 0) {
        setAvisoDivergencia(`Campos existentes preservados: ${divergencias.join('; ')}.`)
        toast({
          title: 'Dados do CNPJ preenchidos',
          description: `Campos manuais divergentes foram preservados. (${data.origem})`,
        })
      } else {
        toast({
          title: 'Dados do CNPJ preenchidos com sucesso',
          description: `Origem: ${data.provedorDescricao}`,
        })
      }
    } catch (err: any) {
      toast({
        title: 'Não foi possível consultar CNPJ',
        description: err?.message || 'Tente preencher manualmente.',
        variant: 'destructive',
      })
    } finally {
      setConsultandoCnpj(false)
    }
  }

  // Concluir Cadastro Oficial (Efetivação e Geração Sequencial CLI-ANO-XXXXXX)
  const handleSalvarConcluirCadastro = async () => {
    if (!razaoSocial.trim() || !cpfCnpj.trim()) {
      toast({ title: 'Razão Social e CPF/CNPJ são obrigatórios', variant: 'destructive' })
      return
    }

    if (!rotaId && rotas.length > 0) {
      toast({
        title: 'Rota logística é obrigatória',
        description: 'Selecione uma rota cadastrada no Jetro.',
        variant: 'destructive',
      })
      return
    }

    setSavingCliente(true)
    try {
      const selectedRota = rotas.find((r) => r.id === rotaId)
      const selectedTabela = tabelasPrecos.find((t) => t.id === tabelaPrecoId)

      const dados: Partial<ClienteOficialRecord> = {
        partner_type: 'Cliente',
        person_type: tipoPessoa,
        cnpj: tipoPessoa === 'PJ' ? cpfCnpj : '',
        cpf: tipoPessoa === 'PF' ? cpfCnpj : '',
        company_name: razaoSocial,
        full_name: razaoSocial,
        trade_name: nomeFantasia || razaoSocial,
        state_registration: inscricaoEstadual,
        cnae,
        email: emailPrincipal,
        phone: telefonePrincipal,
        cep,
        address: logradouro,
        address_number: numeroEnd,
        address_complement: complemento,
        address_district: bairro,
        address_city: municipio,
        address_state: uf,
        reference_point: pontoReferencia,
        active: ativo,
        rca_id: rca1Id,
        rca_nome: rca1Nome,
        rca_codigo: rca1Codigo,
        gerente_comercial_id: gerenteId,
        gerente_comercial_nome: gerenteNome,
        televendas_id: televendasId,
        responsavel_comercial_digital_id: b2bId,
        perfil_cliente: perfilCliente,
        canal_comercial: canalComercial,
        segmento,
        tipo_loja: tipoLoja,
        potencial_compra: potencialCompra,
        frequencia_prevista: frequenciaPrevista,
        rota_id: rotaId,
        rota_nome: selectedRota?.route_name || '',
        rota_codigo: selectedRota?.route_code || '',
        tabela_preco_id: tabelaPrecoId,
        tabela_preco_nome: selectedTabela?.name || '',
        desconto_maximo: descontoMaximo,
        pedido_minimo: pedidoMinimo,
        forma_atendimento: formaAtendimento,
        regime_tributario: regimeTributario,
        simples_nacional: simplesNacional,
        classificacao_icms: classificacaoIcms,
        consumidor_final: consumidorFinal,
        contribuinte_icms: contribuinteIcms,
        produtor_rural: produtorRural,
        email_xml: emailXml || emailPrincipal,
        observacoes_comerciais: observacoesComerciais,
        observacoes_logisticas: observacoesLogisticas,
        observacoes_fiscais: observacoesFiscais,
        observacoes: observacoesGerais,
      }

      const res = await concluirCadastroOficial({
        solicitacaoId: solicitacaoVinculada?.id,
        dadosCliente: dados,
        usuarioConclusao: {
          id: user?.id || '',
          nome: (user?.name as string) || (user?.email as string) || 'Comercial',
        },
        exigeAnaliseCredito: exigeCreditoFinanceiro,
        limitePretendido,
        condicaoPagamentoSolicitada,
        observacoesComerciais,
      })

      toast({
        title: 'Cadastro Oficial Concluído com Sucesso!',
        description: `Código Gerado: ${res.cliente.codigo_oficial || res.cliente.id}. ${
          exigeCreditoFinanceiro
            ? 'Encaminhado automaticamente ao Financeiro para análise de crédito.'
            : 'Liberado para transações sem análise prévia de crédito.'
        }`,
      })

      setClienteFormOpen(false)
      loadData()
      setActiveTab('oficial')
    } catch (err: any) {
      toast({
        title: 'Falha ao efetivar cadastro',
        description: err?.message || 'Verifique se o CNPJ/CPF já não está cadastrado.',
        variant: 'destructive',
      })
    }
    setSavingCliente(false)
  }

  // Filtragem da Fila de Solicitações
  const filteredSolicitacoes = useMemo(() => {
    return solicitacoes.filter((s) => {
      if (kpiFilter === 'aguardando') return s.status === 'aguardando_validacao'
      if (kpiFilter === 'em_analise') return s.status === 'em_analise'
      if (kpiFilter === 'em_correcao') return s.status === 'em_correcao'
      if (kpiFilter === 'concluidos') return s.status === 'concluido'
      return true
    })
  }, [solicitacoes, kpiFilter])

  // Filtragem da Lista de Clientes Oficiais
  const filteredClientes = useMemo(() => {
    return clientesOficiais.filter((c) => {
      if (kpiFilter === 'credito_pendente')
        return c.situacao_credito === 'Pendente de análise' || !c.situacao_credito
      if (kpiFilter === 'bloqueados')
        return c.bloqueio_vendas_prazo || c.situacao_credito === 'Bloqueado'
      return true
    })
  }, [clientesOficiais, kpiFilter])

  // Colunas da Fila de Pré-Cadastros
  const filaColumns: JetroColumnDef<SolicitacaoClienteRecord>[] = [
    {
      id: 'numero',
      title: 'Nº Solicitação',
      accessorKey: 'numero',
      sortable: true,
      minWidth: 140,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-[#005B2E]">{row.numero || 'SOL-NOVA'}</span>
      ),
    },
    {
      id: 'data_solicitacao',
      title: 'Data Recebimento',
      accessorKey: 'data_solicitacao',
      sortable: true,
      minWidth: 120,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.data_solicitacao ? new Date(row.data_solicitacao).toLocaleDateString('pt-BR') : '-'}
        </span>
      ),
    },
    {
      id: 'razao_social',
      title: 'Cliente / Fantasia',
      accessorKey: 'razao_social',
      sortable: true,
      minWidth: 220,
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-foreground text-sm leading-tight">
            {row.razao_social || '-'}
          </p>
          <p className="text-xs text-muted-foreground">{row.nome_fantasia || '-'}</p>
        </div>
      ),
    },
    {
      id: 'cpf_cnpj',
      title: 'CPF / CNPJ',
      accessorKey: 'cpf_cnpj',
      sortable: true,
      minWidth: 150,
      cell: ({ row }) => <span className="font-mono text-xs">{row.cpf_cnpj || '-'}</span>,
    },
    {
      id: 'municipio',
      title: 'Cidade / UF',
      minWidth: 140,
      cell: ({ row }) => (
        <span className="text-xs">
          {row.municipio || '-'}/{row.uf || '-'}
        </span>
      ),
    },
    {
      id: 'rca_nome',
      title: 'RCA 1 / Gerente',
      accessorKey: 'rca_nome',
      sortable: true,
      minWidth: 180,
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold text-foreground">{row.rca_nome || '-'}</p>
          <p className="text-[10px] text-muted-foreground">{row.gerente_nome || '-'}</p>
        </div>
      ),
    },
    {
      id: 'status',
      title: 'Situação',
      accessorKey: 'status',
      sortable: true,
      minWidth: 160,
      cell: ({ row }) => {
        if (row.status === 'aguardando_validacao')
          return (
            <Badge className="bg-amber-500/20 text-amber-800 border-amber-300">
              Aguardando Validação
            </Badge>
          )
        if (row.status === 'em_analise')
          return (
            <Badge className="bg-blue-500/20 text-blue-800 border-blue-300">
              Em Análise Comercial
            </Badge>
          )
        if (row.status === 'em_correcao')
          return (
            <Badge className="bg-red-500/20 text-red-800 border-red-300">Devolvido ao RCA</Badge>
          )
        if (row.status === 'concluido')
          return (
            <Badge className="bg-emerald-500/20 text-emerald-800 border-emerald-300">
              Concluído
            </Badge>
          )
        return <Badge variant="outline">{row.status}</Badge>
      },
    },
    {
      id: 'acoes',
      title: 'Ações da Fila',
      minWidth: 200,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.status === 'aguardando_validacao' && (
            <Button
              size="sm"
              variant="outline"
              title="Assumir Análise"
              onClick={() => handleAssumirAnalise(row)}
              className="h-7 text-xs border-[#005B2E] text-[#005B2E] hover:bg-emerald-50"
            >
              Assumir
            </Button>
          )}

          {['aguardando_validacao', 'em_analise'].includes(row.status) && (
            <>
              <Button
                size="sm"
                title="Validar & Concluir Cadastro"
                onClick={() => handleAbrirValidacao(row)}
                className="h-7 text-xs bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Validar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                title="Solicitar Correção"
                onClick={() => {
                  setSelectedSolicitacao(row)
                  setPendenciasTexto('')
                  setDevolverModalOpen(true)
                }}
                className="h-7 w-7 p-0 text-amber-700 hover:text-amber-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                title="Rejeitar Solicitação"
                onClick={() => {
                  setSelectedSolicitacao(row)
                  setMotivoRejeicao('')
                  setRejeitarModalOpen(true)
                }}
                className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700"
              >
                <Ban className="w-3.5 h-3.5" />
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant="ghost"
            title="Histórico"
            onClick={() => {
              setSelectedHistoryEvents(row.historico || [])
              setHistoryOpen(true)
            }}
            className="h-7 w-7 p-0 text-[#C9A227]"
          >
            <History className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  // Colunas do Cadastro Oficial de Clientes
  const clientesColumns: JetroColumnDef<ClienteOficialRecord>[] = [
    {
      id: 'codigo_oficial',
      title: 'Código Oficial',
      accessorKey: 'codigo_oficial',
      sortable: true,
      minWidth: 140,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-[#005B2E] text-xs">
          {row.codigo_oficial || row.id.slice(0, 8)}
        </span>
      ),
    },
    {
      id: 'razao_social',
      title: 'Razão Social / Fantasia',
      accessorKey: 'company_name',
      sortable: true,
      minWidth: 240,
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-foreground text-sm leading-tight">
            {row.company_name || row.full_name || '-'}
          </p>
          <p className="text-xs text-muted-foreground">{row.trade_name || '-'}</p>
        </div>
      ),
    },
    {
      id: 'cnpj',
      title: 'CPF / CNPJ',
      accessorKey: 'cnpj',
      sortable: true,
      minWidth: 150,
      cell: ({ row }) => <span className="font-mono text-xs">{row.cnpj || row.cpf || '-'}</span>,
    },
    {
      id: 'perfil_cliente',
      title: 'Perfil Comercial',
      accessorKey: 'perfil_cliente',
      sortable: true,
      minWidth: 140,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.perfil_cliente || 'Varejo'}
        </Badge>
      ),
    },
    {
      id: 'rota_nome',
      title: 'Rota Logística',
      accessorKey: 'rota_nome',
      sortable: true,
      minWidth: 140,
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-foreground flex items-center gap-1">
          <Truck className="w-3 h-3 text-[#005B2E]" />
          {row.rota_nome || 'Não definida'}
        </span>
      ),
    },
    {
      id: 'rca_nome',
      title: 'RCA 1 / Gerente',
      minWidth: 160,
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold">{row.rca_nome || '-'}</p>
          <p className="text-[10px] text-muted-foreground">{row.gerente_comercial_nome || '-'}</p>
        </div>
      ),
    },
    {
      id: 'situacao_credito',
      title: 'Situação do Crédito',
      accessorKey: 'situacao_credito',
      sortable: true,
      minWidth: 190,
      cell: ({ row }) => {
        const sc = row.situacao_credito || 'Pendente de análise'
        if (sc === 'Aprovado') {
          return (
            <div>
              <Badge className="bg-emerald-500/20 text-emerald-800 border-emerald-300">
                Aprovado (R$ {Number(row.limite_credito || 0).toLocaleString('pt-BR')})
              </Badge>
            </div>
          )
        }
        if (sc === 'Bloqueado' || row.bloqueio_vendas_prazo) {
          return (
            <Badge className="bg-rose-500/20 text-rose-800 border-rose-300 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Bloqueado a Prazo
            </Badge>
          )
        }
        return <Badge className="bg-amber-500/20 text-amber-800 border-amber-300">{sc}</Badge>
      },
    },
    {
      id: 'acoes',
      title: 'Ações',
      minWidth: 140,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            title="Histórico de Auditoria"
            onClick={() => {
              setSelectedHistoryEvents(row.historico_eventos || [])
              setHistoryOpen(true)
            }}
            className="h-7 w-7 p-0 text-[#C9A227]"
          >
            <History className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#005B2E]" />
            Cadastro de Clientes (Validação Comercial & Manutenção Oficial)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Base oficial e definitiva do Jetro ERP. Integração sem redigitação da fila de
            pré-cadastros ao cadastro oficial.
          </p>
        </div>
        <Button
          onClick={() => {
            setSolicitacaoVinculada(null)
            setEditingCliente(null)
            setCpfCnpj('')
            setRazaoSocial('')
            setNomeFantasia('')
            setInscricaoEstadual('')
            setCnae('')
            setSituacaoCadastral('Ativo')
            setCep('')
            setUf('ES')
            setMunicipio('')
            setBairro('')
            setLogradouro('')
            setNumeroEnd('')
            setComplemento('')
            setTelefonePrincipal('')
            setEmailPrincipal('')
            setEmailXml('')
            setConsultaInfo(null)
            setAvisoDivergencia(null)
            setClienteFormOpen(true)
          }}
          className="bg-[#005B2E] hover:bg-[#004724] text-white font-bold shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Novo Cadastro Direto
        </Button>
      </div>

      {/* INDICADORES SUPERIORES COM DADOS REAIS E CLICÁVEIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <Card
          onClick={() => {
            setActiveTab('fila')
            setKpiFilter('aguardando')
          }}
          className={`cursor-pointer transition-all border ${
            kpiFilter === 'aguardando' && activeTab === 'fila'
              ? 'ring-2 ring-amber-500 bg-amber-50/50'
              : 'hover:border-amber-400'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Aguardando</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-xl font-black text-amber-700 mt-1">{kpis.aguardando}</p>
            <span className="text-[10px] text-muted-foreground">Pré-cadastros na fila</span>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setActiveTab('fila')
            setKpiFilter('em_correcao')
          }}
          className={`cursor-pointer transition-all border ${
            kpiFilter === 'em_correcao' && activeTab === 'fila'
              ? 'ring-2 ring-red-500 bg-red-50/50'
              : 'hover:border-red-400'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Em Correção</span>
              <RotateCcw className="w-3.5 h-3.5 text-red-600" />
            </div>
            <p className="text-xl font-black text-red-700 mt-1">{kpis.emCorrecao}</p>
            <span className="text-[10px] text-muted-foreground">Devolvidos ao RCA</span>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setActiveTab('fila')
            setKpiFilter('em_analise')
          }}
          className={`cursor-pointer transition-all border ${
            kpiFilter === 'em_analise' && activeTab === 'fila'
              ? 'ring-2 ring-blue-500 bg-blue-50/50'
              : 'hover:border-blue-400'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Em Análise</span>
              <Users className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-xl font-black text-blue-700 mt-1">{kpis.emAnalise}</p>
            <span className="text-[10px] text-muted-foreground">Comercial conferindo</span>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setActiveTab('fila')
            setKpiFilter('concluidos')
          }}
          className={`cursor-pointer transition-all border ${
            kpiFilter === 'concluidos' && activeTab === 'fila'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/50'
              : 'hover:border-emerald-400'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Concluídos</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-emerald-700 mt-1">{kpis.concluidos}</p>
            <span className="text-[10px] text-muted-foreground">Efetivados em clientes</span>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setActiveTab('oficial')
            setKpiFilter('credito_pendente')
          }}
          className={`cursor-pointer transition-all border ${
            kpiFilter === 'credito_pendente' && activeTab === 'oficial'
              ? 'ring-2 ring-amber-500 bg-amber-50/50'
              : 'hover:border-amber-400'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Crédito Pend.</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-xl font-black text-amber-700 mt-1">{kpis.creditoPendente}</p>
            <span className="text-[10px] text-muted-foreground">No Financeiro</span>
          </CardContent>
        </Card>

        <Card
          onClick={() => {
            setActiveTab('oficial')
            setKpiFilter('bloqueados')
          }}
          className={`cursor-pointer transition-all border ${
            kpiFilter === 'bloqueados' && activeTab === 'oficial'
              ? 'ring-2 ring-rose-500 bg-rose-50/50'
              : 'hover:border-rose-400'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Bloqueados</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <p className="text-xl font-black text-rose-700 mt-1">{kpis.comRestricao}</p>
            <span className="text-[10px] text-muted-foreground">Restrição a prazo</span>
          </CardContent>
        </Card>
      </div>

      {/* DUAS EXPERIÊNCIAS NA MESMA TELA: FILA DE PRÉ-CADASTROS & CADASTRO OFICIAL */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="fila" className="text-xs font-bold gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#005B2E]" />
              A. Fila de Pré-Cadastros ({solicitacoes.length})
            </TabsTrigger>
            <TabsTrigger value="oficial" className="text-xs font-bold gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#005B2E]" />
              B. Cadastro Oficial de Clientes ({clientesOficiais.length})
            </TabsTrigger>
          </TabsList>
          {kpiFilter !== 'todos' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setKpiFilter('todos')}
              className="text-xs text-muted-foreground"
            >
              Limpar filtro de KPI ({kpiFilter})
            </Button>
          )}
        </div>

        {/* ABA A: FILA DE PRÉ-CADASTROS */}
        <TabsContent value="fila" className="space-y-4">
          <JetroTable
            columns={filaColumns}
            data={filteredSolicitacoes}
            loading={loading}
            pageSize={10}
            preferenceKey="comercial_fila_precadastro_grid"
            exportTitle="Fila_PreCadastros_Comercial_Jetro"
          />
        </TabsContent>

        {/* ABA B: CADASTRO OFICIAL */}
        <TabsContent value="oficial" className="space-y-4">
          <JetroTable
            columns={clientesColumns}
            data={filteredClientes}
            loading={loading}
            pageSize={10}
            preferenceKey="comercial_clientes_oficiais_grid"
            exportTitle="Cadastro_Oficial_Clientes_Jetro"
          />
        </TabsContent>
      </Tabs>

      {/* MODAL OFICIAL: FORMULÁRIO COMPLETO COM AS 9 SEÇÕES */}
      <Dialog open={clienteFormOpen} onOpenChange={setClienteFormOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#005B2E]" />
                {solicitacaoVinculada
                  ? `Validação Cadastral Oficial — Solicitação #${solicitacaoVinculada.numero}`
                  : 'Cadastro Oficial de Cliente'}
              </span>
              <Badge className="bg-[#005B2E]/10 text-[#005B2E] border-[#005B2E]/30 font-mono text-xs">
                Código será gerado sequencialmente na efetivação
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {/* INDICADOR OBRIGATÓRIO DE CRÉDITO NO CABEÇALHO */}
          <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-amber-900 block text-sm">
                Crédito: Pendente de Análise Financeira
              </span>
              <p className="text-amber-800">
                Regra Jetro: O Comercial conclui o cadastro oficial gerando código definitivo.
                Vendas a prazo permanecem bloqueadas até aprovação pelo Financeiro.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Switch
                checked={exigeCreditoFinanceiro}
                onCheckedChange={setExigeCreditoFinanceiro}
              />
              <span className="font-bold text-foreground">Exige análise de crédito a prazo</span>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            {/* SEÇÃO 1: IDENTIFICAÇÃO */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#005B2E] uppercase tracking-wide border-b border-border pb-1">
                1. Identificação Oficial (Pessoa, Documentos & CNAE)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Tipo de Pessoa *</Label>
                  <Select value={tipoPessoa} onValueChange={(v: 'PF' | 'PJ') => setTipoPessoa(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PJ">Pessoa Jurídica (PJ)</SelectItem>
                      <SelectItem value="PF">Pessoa Física (PF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-bold">
                    {tipoPessoa === 'PJ' ? 'CNPJ *' : 'CPF *'}
                  </Label>
                  <div className="flex gap-1.5">
                    <Input
                      value={cpfCnpj}
                      onChange={(e) => {
                        const val =
                          tipoPessoa === 'PJ' ? formatarCNPJ(e.target.value) : e.target.value
                        setCpfCnpj(val)
                      }}
                      className="h-9 text-xs font-mono"
                      placeholder={tipoPessoa === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                    />
                    {tipoPessoa === 'PJ' && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleCnpjLookupOficial}
                        disabled={consultandoCnpj || !validarCNPJ(cpfCnpj)}
                        className="h-9 px-3 text-xs border-[#005B2E]/40 text-[#005B2E] hover:bg-[#005B2E]/10 hover:text-[#005B2E] font-bold whitespace-nowrap shrink-0 shadow-sm transition-all disabled:opacity-50"
                        title={
                          !validarCNPJ(cpfCnpj)
                            ? 'Digite um CNPJ válido com 14 dígitos para buscar na Receita'
                            : 'Buscar dados cadastrais na Receita Federal'
                        }
                      >
                        {consultandoCnpj ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            Consultando...
                          </>
                        ) : (
                          <>
                            <Search className="w-3.5 h-3.5 mr-1.5 text-[#005B2E]" />
                            Buscar CNPJ
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Status do Cadastro</Label>
                  <div className="flex items-center gap-2 pt-1.5">
                    <Switch checked={ativo} onCheckedChange={setAtivo} />
                    <span className="text-xs font-semibold">{ativo ? 'Ativo' : 'Inativo'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Razão Social / Nome Completo *</Label>
                  <Input
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Nome Fantasia</Label>
                  <Input
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Inscrição Estadual (IE)</Label>
                  <Input
                    value={inscricaoEstadual}
                    onChange={(e) => setInscricaoEstadual(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">CNAE Principal</Label>
                  <Input
                    value={cnae}
                    onChange={(e) => setCnae(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Situação Cadastral</Label>
                  <Input
                    value={situacaoCadastral}
                    onChange={(e) => setSituacaoCadastral(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: PERFIL COMERCIAL (CNAE NÃO SUBSTITUI PERFIL) */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#005B2E] uppercase tracking-wide border-b border-border pb-1">
                2. Perfil Comercial & Ramo de Atividade
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Perfil do Cliente / Ramo *</Label>
                  <Select value={perfilCliente} onValueChange={setPerfilCliente}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERFIS_CLIENTE.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Canal Comercial *</Label>
                  <Select value={canalComercial} onValueChange={setCanalComercial}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CANAIS_COMERCIAIS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Frequência Prevista</Label>
                  <Select value={frequenciaPrevista} onValueChange={setFrequenciaPrevista}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semanal">Semanal</SelectItem>
                      <SelectItem value="Quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="Mensal">Mensal</SelectItem>
                      <SelectItem value="Spot">Spot (Ocasional)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: EQUIPE DE VENDAS */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#005B2E] uppercase tracking-wide border-b border-border pb-1">
                3. Equipe de Vendas (RCA 1, RCA 2, Televendas, Gerente & B2B)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-muted/40 p-2.5 rounded border border-border text-xs">
                  <span className="font-bold text-[#005B2E] block">RCA 1 (Principal):</span>
                  <span className="font-semibold text-foreground">
                    {rca1Nome || 'Não informado'}
                  </span>
                  <span className="text-muted-foreground block text-[11px]">
                    Código: {rca1Codigo || '-'}
                  </span>
                </div>
                <div className="bg-muted/40 p-2.5 rounded border border-border text-xs">
                  <span className="font-bold text-[#005B2E] block">Gerente Comercial:</span>
                  <span className="font-semibold text-foreground">
                    {gerenteNome || 'Não informado'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">RCA 2 (Opcional)</Label>
                  <Select value={rca2Id} onValueChange={setRca2Id}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Selecione RCA 2..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {vendedores.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} ({v.code || v.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Televendas Responsável</Label>
                  <Input
                    value={televendasId}
                    onChange={(e) => setTelevendasId(e.target.value)}
                    placeholder="Equipe Televendas"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Vínculo Operacional B2B</Label>
                  <Input
                    value={b2bId}
                    onChange={(e) => setB2bId(e.target.value)}
                    placeholder="Atendimento Portal B2B"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: ENDEREÇOS E LOGÍSTICA (ROTA OBRIGATÓRIA) */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#005B2E] uppercase tracking-wide border-b border-border pb-1 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#005B2E]" /> 4. Endereço e Rota Logística (Campo
                Obrigatório)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">CEP</Label>
                  <Input
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-bold">Município</Label>
                  <Input
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">UF</Label>
                  <Input
                    value={uf}
                    onChange={(e) => setUf(e.target.value.toUpperCase())}
                    maxLength={2}
                    className="h-9 text-xs uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-bold">Logradouro</Label>
                  <Input
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Número</Label>
                  <Input
                    value={numeroEnd}
                    onChange={(e) => setNumeroEnd(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Bairro</Label>
                  <Input
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#005B2E]">
                    Rota Logística Oficial * (Alimenta Módulos Operacionais)
                  </Label>
                  <Select value={rotaId} onValueChange={setRotaId}>
                    <SelectTrigger className="h-9 text-xs border-[#005B2E]">
                      <SelectValue placeholder="Selecione a Rota Cadastrada no Jetro..." />
                    </SelectTrigger>
                    <SelectContent>
                      {rotas.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.route_name} ({r.route_code || 'Rota'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">
                    Observações Logísticas (Janelas, Acesso)
                  </Label>
                  <Input
                    value={observacoesLogisticas}
                    onChange={(e) => setObservacoesLogisticas(e.target.value)}
                    placeholder="Recebimento das 08h às 17h, restrição para caminhão pesado..."
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 5: CONDIÇÕES COMERCIAIS */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#005B2E] uppercase tracking-wide border-b border-border pb-1">
                5. Condições Comerciais & Tabelas de Preço
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Tabela de Preços Principal *</Label>
                  <Select value={tabelaPrecoId} onValueChange={setTabelaPrecoId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Selecione a Tabela..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tabelasPrecos.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Desconto Máximo Autorizado (%)</Label>
                  <Input
                    value={descontoMaximo}
                    onChange={(e) => setDescontoMaximo(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Pedido Mínimo (R$)</Label>
                  <Input
                    value={pedidoMinimo}
                    onChange={(e) => setPedidoMinimo(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 6: PARÂMETROS FISCAIS */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#005B2E] uppercase tracking-wide border-b border-border pb-1">
                6. Parâmetros Fiscais (NF-e, ICMS & Regime)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Classificação ICMS</Label>
                  <Select value={classificacaoIcms} onValueChange={setClassificacaoIcms}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSIFICACOES_FISCAIS.map((cf) => (
                        <SelectItem key={cf} value={cf}>
                          {cf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Regime Tributário</Label>
                  <Select value={regimeTributario} onValueChange={setRegimeTributario}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                      <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                      <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">E-mail para Envio de XML/DANFE</Label>
                  <Input
                    type="email"
                    value={emailXml}
                    onChange={(e) => setEmailXml(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 7: CONTATOS */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#005B2E] uppercase tracking-wide border-b border-border pb-1">
                7. Contatos Oficiais
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Telefone</Label>
                  <Input
                    value={telefonePrincipal}
                    onChange={(e) => setTelefonePrincipal(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">WhatsApp</Label>
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">E-mail Principal</Label>
                  <Input
                    value={emailPrincipal}
                    onChange={(e) => setEmailPrincipal(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Responsável Compras</Label>
                  <Input
                    value={compradorNome}
                    onChange={(e) => setCompradorNome(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 8 E 9: OBSERVAÇÕES & HISTÓRICO */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#005B2E] uppercase tracking-wide border-b border-border pb-1">
                8 & 9. Observações Gerais & Parecer Comercial
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Observações Comerciais</Label>
                  <Textarea
                    value={observacoesComerciais}
                    onChange={(e) => setObservacoesComerciais(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Observações Fiscais</Label>
                  <Textarea
                    value={observacoesFiscais}
                    onChange={(e) => setObservacoesFiscais(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setClienteFormOpen(false)}
              disabled={savingCliente}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSalvarConcluirCadastro}
              disabled={savingCliente}
              className="bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Concluir e Efetivar Cadastro Oficial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL PARA SOLICITAR CORREÇÃO AO RCA */}
      <Dialog open={devolverModalOpen} onOpenChange={setDevolverModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-amber-800 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" /> Devolver para Correção do RCA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              O vendedor <span className="font-bold">{selectedSolicitacao?.rca_nome}</span> será
              notificado e visualizará exatamente o que ajustar na tela dele. A solicitação manterá
              o mesmo identificador #{selectedSolicitacao?.numero}.
            </p>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Pendências / O que corrigir *</Label>
              <Textarea
                value={pendenciasTexto}
                onChange={(e) => setPendenciasTexto(e.target.value)}
                placeholder="Ex: Anexar comprovante de endereço atualizado ou corrigir número da Inscrição Estadual..."
                rows={3}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDevolverModalOpen(false)}>
              Voltar
            </Button>
            <Button
              size="sm"
              onClick={handleDevolverCorrecao}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              Enviar ao RCA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL PARA REJEITAR SOLICITAÇÃO */}
      <Dialog open={rejeitarModalOpen} onOpenChange={setRejeitarModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-700 flex items-center gap-2">
              <Ban className="w-5 h-5" /> Rejeitar Solicitação #{selectedSolicitacao?.numero}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="text-muted-foreground">
              Rejeições cadastrais são registradas no log imutável de governança comercial do Jetro.
            </p>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Justificativa da Rejeição *</Label>
              <Textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Informe a justificativa..."
                rows={3}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejeitarModalOpen(false)}>
              Voltar
            </Button>
            <Button variant="destructive" size="sm" onClick={handleRejeitar} className="font-bold">
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE HISTÓRICO COMPLETO */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-[#C9A227]" />
              Histórico Imutável de Eventos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {selectedHistoryEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum evento registrado.</p>
            ) : (
              selectedHistoryEvents.map((ev, i) => (
                <div key={i} className="border-l-2 border-[#005B2E] pl-3 py-1 space-y-0.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{ev.acao}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {ev.data_hora ? new Date(ev.data_hora).toLocaleString('pt-BR') : '-'}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Responsável:{' '}
                    <span className="font-semibold">{ev.usuario_nome || 'Sistema'}</span>
                  </p>
                  {ev.motivo && <p className="text-amber-800">Motivo: {ev.motivo}</p>}
                  {ev.detalhes && <p className="text-slate-600">{ev.detalhes}</p>}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

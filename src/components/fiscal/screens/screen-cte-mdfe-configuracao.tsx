import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Truck,
  Settings,
  ShieldAlert,
  Save,
  Building2,
  FileText,
  Info,
  CheckCircle2,
  Loader2,
  Lock,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useBrand } from '@/hooks/use-brand'
import pb from '@/lib/pocketbase/client'

export function ScreenCteMdfeConfiguracao() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { brand, empresaAtivaId, empresasDisponiveis } = useBrand()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Configuração de CT-e
  const [cteConfigId, setCteConfigId] = useState<string | null>(null)
  const [cteSerie, setCteSerie] = useState('1')
  const [cteSequencial, setCteSequencial] = useState<number>(1)
  const [cteAmbiente, setCteAmbiente] = useState<'homologacao' | 'producao'>('homologacao')
  const [cteRegime, setCteRegime] = useState('simples_nacional')
  const [cteRntrc, setCteRntrc] = useState('')
  const [cteCfopEstadual, setCteCfopEstadual] = useState('5353')
  const [cteCfopInterestadual, setCteCfopInterestadual] = useState('6353')
  const [cteAliquota, setCteAliquota] = useState<number>(12)
  const [cteObservacoes, setCteObservacoes] = useState(
    'CT-e emitido em ambiente de homologação para testes.',
  )

  // Configuração de MDF-e
  const [mdfeConfigId, setMdfeConfigId] = useState<string | null>(null)
  const [mdfeSerie, setMdfeSerie] = useState('1')
  const [mdfeSequencial, setMdfeSequencial] = useState<number>(1)
  const [mdfeAmbiente, setMdfeAmbiente] = useState<'homologacao' | 'producao'>('homologacao')
  const [mdfeRntrc, setMdfeRntrc] = useState('')
  const [mdfeTipoEmitente, setMdfeTipoEmitente] = useState('1') // 1-Prestador, 2-Carga Propria
  const [mdfeTipoTransp, setMdfeTipoTransp] = useState('1') // 1-ETC, 2-TAC, 3-CTC

  const empresaAtual =
    (empresasDisponiveis as any[])?.find((e: any) => e.id === empresaAtivaId) || null
  const empresaRazao = empresaAtual?.razao_social || brand?.empresaNome || 'HURAM TRANSPORTES'
  const empresaCnpj = (empresaAtual as any)?.cnpj || '00.000.000/0001-91'

  const carregarConfiguracoes = async () => {
    setLoading(true)
    try {
      const filterEmpresa = empresaAtivaId ? `empresa_id = "${empresaAtivaId}"` : ''

      // CT-e configs
      try {
        const cteConfigs = await pb.collection('cte_configs').getFullList({
          filter: filterEmpresa || undefined,
        })
        if (cteConfigs.length > 0) {
          const cfg = cteConfigs[0]
          setCteConfigId(cfg.id)
          setCteSerie(cfg.serie || '1')
          setCteSequencial(cfg.ultimo_sequencial || 1)
          setCteAmbiente(cfg.ambiente || 'homologacao')
          setCteRegime(cfg.regime_tributario || 'simples_nacional')
          setCteRntrc(cfg.rntrc || '')
          setCteCfopEstadual(cfg.cfop_padrao_estadual || '5353')
          setCteCfopInterestadual(cfg.cfop_padrao_interestadual || '6353')
          setCteAliquota(cfg.aliquota_icms_padrao || 12)
          setCteObservacoes(cfg.observacoes_contribuinte_padrao || '')
        }
      } catch {
        /* intentionally ignored */
      }

      // MDF-e configs
      try {
        const mdfeConfigs = await pb.collection('mdfe_configs').getFullList({
          filter: filterEmpresa || undefined,
        })
        if (mdfeConfigs.length > 0) {
          const cfg = mdfeConfigs[0]
          setMdfeConfigId(cfg.id)
          setMdfeSerie(cfg.serie || '1')
          setMdfeSequencial(cfg.ultimo_sequencial || 1)
          setMdfeAmbiente(cfg.ambiente || 'homologacao')
          setMdfeRntrc(cfg.rntrc_padrao || '')
          setMdfeTipoEmitente(cfg.tipo_emitente || '1')
          setMdfeTipoTransp(cfg.tipo_transportador || '1')
        }
      } catch {
        /* intentionally ignored */
      }
    } catch (err) {
      console.error('Erro ao buscar configurações:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarConfiguracoes()
  }, [empresaAtivaId])

  const salvarConfiguracoes = async () => {
    setSaving(true)
    try {
      // Salvar CT-e Config
      const payloadCte = {
        empresa_id: empresaAtivaId || '',
        serie: cteSerie,
        ultimo_sequencial: cteSequencial,
        ambiente: cteAmbiente,
        regime_tributario: cteRegime,
        rntrc: cteRntrc,
        cfop_padrao_estadual: cteCfopEstadual,
        cfop_padrao_interestadual: cteCfopInterestadual,
        aliquota_icms_padrao: cteAliquota,
        observacoes_contribuinte_padrao: cteObservacoes,
        ativo: true,
      }
      if (cteConfigId) {
        await pb.collection('cte_configs').update(cteConfigId, payloadCte)
      } else {
        const res = await pb.collection('cte_configs').create(payloadCte)
        setCteConfigId(res.id)
      }

      // Salvar MDF-e Config
      const payloadMdfe = {
        empresa_id: empresaAtivaId || '',
        serie: mdfeSerie,
        ultimo_sequencial: mdfeSequencial,
        ambiente: mdfeAmbiente,
        rntrc_padrao: mdfeRntrc,
        tipo_emitente: mdfeTipoEmitente,
        tipo_transportador: mdfeTipoTransp,
        ativo: true,
      }
      if (mdfeConfigId) {
        await pb.collection('mdfe_configs').update(mdfeConfigId, payloadMdfe)
      } else {
        const res = await pb.collection('mdfe_configs').create(payloadMdfe)
        setMdfeConfigId(res.id)
      }

      toast({
        title: 'Configurações Gravadas',
        description: 'Parâmetros de CT-e e MDF-e salvos com sucesso.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao Salvar',
        description: err?.message || 'Falha ao gravar parâmetros fiscais.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-[#005B2E] mb-2" />
        <p className="text-xs">Carregando configurações fiscais de transporte...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neutral-800 text-white shadow-sm">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Configuração CT-e & MDF-e
              </h1>
              <Badge variant="outline" className="text-xs font-bold">
                Módulos 57 & 58
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaRazao}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Parâmetros de numeração sequencial, séries de emissão, dados do transportador perante
              a ANTT e regras fiscais padrão.
            </p>
          </div>
        </div>

        <Button
          onClick={salvarConfiguracoes}
          disabled={saving}
          className="bg-[#005B2E] hover:bg-[#004724] text-white font-bold text-xs"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          )}
          Salvar Configurações
        </Button>
      </div>

      {/* AVISO IMPORTANTE SOBRE CERTIFICADO E SEFAZ */}
      <Card className="border-2 border-amber-300 bg-amber-50/60 shadow-2xs">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-900">
            <p className="font-bold">Atenção sobre Transmissão e Certificado Digital A1</p>
            <p className="leading-relaxed">
              A emissão real com validade jurídica (transmissão à SEFAZ) exige{' '}
              <strong>Certificado Digital A1</strong> e assinatura digital criptográfica XMLDSIG,
              executadas fora do HURAM. O ERP HURAM gera o XML completo com layout oficial e cálculo
              fiscal auditável para que você importe e transmita através do emissor do contador ou
              gateway de transporte contratado. O ambiente padrão de homologação permite testes
              completos com dados simulados.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD CT-E */}
        <Card className="border shadow-sm">
          <CardHeader className="bg-[#005B2E]/5 border-b pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-[#005B2E]">
              <Truck className="w-4 h-4" />
              Parâmetros de CT-e (Conhecimento de Transporte)
            </CardTitle>
            <CardDescription className="text-xs">
              Série, sequencial de numeração e tributação padrão de frete.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Série Padrão</Label>
                <Input
                  value={cteSerie}
                  onChange={(e) => setCteSerie(e.target.value)}
                  className="text-xs font-mono font-bold"
                />
              </div>
              <div>
                <Label className="text-xs">Último Sequencial</Label>
                <Input
                  type="number"
                  value={cteSequencial}
                  onChange={(e) => setCteSequencial(parseInt(e.target.value, 10) || 1)}
                  className="text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Ambiente de Operação</Label>
              <Select
                value={cteAmbiente}
                onValueChange={(v: 'homologacao' | 'producao') => setCteAmbiente(v)}
              >
                <SelectTrigger className="text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homologacao">Homologação (Simulação / Testes)</SelectItem>
                  <SelectItem value="producao">Produção (Exige Gateway/Certificado A1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Regime Tributário</Label>
                <Select value={cteRegime} onValueChange={setCteRegime}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                    <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                    <SelectItem value="lucro_real">Lucro Real</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">RNTRC do Transportador</Label>
                <Input
                  value={cteRntrc}
                  onChange={(e) => setCteRntrc(e.target.value)}
                  placeholder="Número ANTT"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">CFOP Estadual Padrão</Label>
                <Input
                  value={cteCfopEstadual}
                  onChange={(e) => setCteCfopEstadual(e.target.value)}
                  className="text-xs font-mono font-bold"
                />
              </div>
              <div>
                <Label className="text-xs">CFOP Interestadual</Label>
                <Input
                  value={cteCfopInterestadual}
                  onChange={(e) => setCteCfopInterestadual(e.target.value)}
                  className="text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Observações Padrão no CT-e</Label>
              <Input
                value={cteObservacoes}
                onChange={(e) => setCteObservacoes(e.target.value)}
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* CARD MDF-E */}
        <Card className="border shadow-sm">
          <CardHeader className="bg-indigo-50 border-b pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-700">
              <Truck className="w-4 h-4" />
              Parâmetros de MDF-e (Manifesto Eletrônico)
            </CardTitle>
            <CardDescription className="text-xs">
              Série, sequencial de manifesto e enquadramento ANTT.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Série MDF-e</Label>
                <Input
                  value={mdfeSerie}
                  onChange={(e) => setMdfeSerie(e.target.value)}
                  className="text-xs font-mono font-bold"
                />
              </div>
              <div>
                <Label className="text-xs">Último Sequencial</Label>
                <Input
                  type="number"
                  value={mdfeSequencial}
                  onChange={(e) => setMdfeSequencial(parseInt(e.target.value, 10) || 1)}
                  className="text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Ambiente de Operação</Label>
              <Select
                value={mdfeAmbiente}
                onValueChange={(v: 'homologacao' | 'producao') => setMdfeAmbiente(v)}
              >
                <SelectTrigger className="text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homologacao">Homologação (Simulação / Testes)</SelectItem>
                  <SelectItem value="producao">Produção (Exige Gateway/Certificado A1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">RNTRC Padrão da Frota</Label>
              <Input
                value={mdfeRntrc}
                onChange={(e) => setMdfeRntrc(e.target.value)}
                placeholder="Registro ANTT"
                className="text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tipo de Emitente</Label>
                <Select value={mdfeTipoEmitente} onValueChange={setMdfeTipoEmitente}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Prestador de Serviço</SelectItem>
                    <SelectItem value="2">2 - Transportador Carga Própria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Tipo de Transportador</Label>
                <Select value={mdfeTipoTransp} onValueChange={setMdfeTipoTransp}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - ETC (Empresa)</SelectItem>
                    <SelectItem value="2">2 - TAC (Autônomo)</SelectItem>
                    <SelectItem value="3">3 - CTC (Cooperativa)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border text-xs space-y-1">
              <span className="font-semibold text-foreground block">Emitente do Manifesto:</span>
              <p className="text-muted-foreground">
                {empresaRazao} • CNPJ {empresaCnpj}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import {
  Calculator,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

export interface FiscalSimulatorDialogProps {
  productId: string
  productCode: string
  productName: string
  empresaId: string
  empresaName: string
  defaultUnit?: string
}

export function FiscalAuditSimulator({
  productId,
  productCode,
  productName,
  empresaId,
  empresaName,
  defaultUnit = 'UN',
}: FiscalSimulatorDialogProps) {
  const [operacao, setOperacao] = useState<
    'venda_interna' | 'venda_interestadual' | 'entrada_compra' | 'devolucao' | 'bonificacao'
  >('venda_interna')
  const [operacaoCgo, setOperacaoCgo] = useState('VENDA_NORMAL')
  const [procedenciaItem, setProcedenciaItem] = useState<
    'producao_propria' | 'mercadoria_terceiros'
  >('producao_propria')
  const [cgoList, setCgoList] = useState<any[]>([])
  const [cfopDeterminado, setCfopDeterminado] = useState<string>('5101')
  const [cfopExplicacao, setCfopExplicacao] = useState<string>('')
  const [ufOrigem, setUfOrigem] = useState('ES')
  const [ufDestino, setUfDestino] = useState('ES')
  const [quantidade, setQuantidade] = useState('1')
  const [valorUnitario, setValorUnitario] = useState('100.00')
  const [desconto, setDesconto] = useState('0.00')
  const [frete, setFrete] = useState('0.00')
  const [consumidorFinal, setConsumidorFinal] = useState(false)
  const [contribuinteIcms, setContribuinteIcms] = useState(true)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showMemory, setShowMemory] = useState(true)

  // Carrega operações de negócio (CGO) e resolve CFOP integrado
  useEffect(() => {
    pb.collection('fiscal_operations')
      .getFullList({ filter: 'ativa = true', sort: 'codigo' })
      .then((ops) => setCgoList(ops))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    const resolveCfop = async () => {
      try {
        const [ops, rls] = await Promise.all([
          pb.collection('fiscal_operations').getFullList({ filter: 'ativa = true' }),
          pb.collection('fiscal_cfop_rules').getFullList({ filter: 'ativa = true' }),
        ])
        const { evaluateCfopMatrix } = await import('@/lib/fiscal-cfop-engine')
        const out = evaluateCfopMatrix(
          {
            operacao_codigo: operacaoCgo,
            empresa_id: empresaId,
            uf_emitente: ufOrigem,
            uf_destinatario: operacao === 'venda_interna' ? ufOrigem : ufDestino,
            itens: [
              {
                descricao: productName,
                procedencia: procedenciaItem,
                quantidade: Number(quantidade) || 1,
                valor_unitario: Number(valorUnitario) || 100,
              },
            ],
          },
          ops as any,
          rls as any,
        )
        if (!active) return
        if (out.itens[0]?.cfop) {
          setCfopDeterminado(out.itens[0].cfop)
          setCfopExplicacao(out.itens[0].explicacao)
        }
      } catch (e) {
        console.error('Falha ao resolver CFOP no simulador:', e)
      }
    }
    resolveCfop()
    return () => {
      active = false
    }
  }, [
    operacaoCgo,
    empresaId,
    ufOrigem,
    ufDestino,
    operacao,
    procedenciaItem,
    productName,
    quantidade,
    valorUnitario,
  ])

  const handleSimular = async () => {
    if (!productId || !empresaId) {
      toast({
        title: 'Dados insuficientes',
        description: 'Produto e empresa devem estar selecionados para a simulação fiscal.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const resp = await pb.send('/backend/v1/huram/fiscal/simulate', {
        method: 'POST',
        body: {
          empresa_id: empresaId,
          product_id: productId,
          operacao,
          uf_origem: ufOrigem,
          uf_destino: operacao === 'venda_interna' ? ufOrigem : ufDestino,
          quantidade,
          valor_unitario: valorUnitario,
          desconto,
          despesas_frete: frete,
          consumidor_final: consumidorFinal,
          contribuinte_icms: contribuinteIcms,
          unidade: defaultUnit,
        },
      })

      if (resp && resp.success) {
        setResult(resp.data)
        toast({
          title: 'Simulação Fiscal Auditada',
          description: `Cálculo registrado com ID ${resp.data?.simulation_id || 'OK'}`,
        })
      } else {
        toast({
          title: 'Falha na simulação',
          description: resp?.error || 'Erro ao calcular tributos no servidor',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro no cálculo do servidor',
        description: err?.message || 'Falha de comunicação com o simulador fiscal',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setQuantidade('1')
    setValorUnitario('100.00')
    setDesconto('0.00')
    setFrete('0.00')
    setResult(null)
  }

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="py-3 px-4 bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                Simulador Fiscal Auditável (Backend Multi-empresa)
                <Badge variant="outline" className="text-xs font-normal">
                  {empresaName}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Cálculo em tempo real via backend com registro imutável em coleção de auditoria
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs gap-1"
              disabled={loading}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar
            </Button>
            <Button
              size="sm"
              onClick={handleSimular}
              className="h-8 text-xs gap-1 bg-primary text-primary-foreground font-semibold"
              disabled={loading}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {loading ? 'Calculando e Auditando...' : 'Calcular Tributos'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Camada de CFOP e Operação Comercial (CGO) HURAM */}
        <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 uppercase">
              <Layers className="w-3.5 h-3.5 text-[#005B2E]" /> Determinação de CFOP por Item
              (Matriz HURAM)
            </span>
            <Badge
              variant="outline"
              className="border-emerald-300 text-emerald-800 text-[10px] font-bold"
            >
              CFOP Resolvido: {cfopDeterminado}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Operação Comercial (CGO)
              </Label>
              <Select value={operacaoCgo} onValueChange={setOperacaoCgo}>
                <SelectTrigger className="h-8 text-xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cgoList.map((op) => (
                    <SelectItem key={op.codigo} value={op.codigo}>
                      {op.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Procedência nesta Empresa
              </Label>
              <Select value={procedenciaItem} onValueChange={(v: any) => setProcedenciaItem(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="producao_propria">Produção Própria (Fábrica)</SelectItem>
                  <SelectItem value="mercadoria_terceiros">
                    Mercadoria de Terceiros (Revenda)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Explicação da Regra
              </Label>
              <div className="text-[11px] font-medium text-emerald-900 bg-white/80 p-1.5 rounded border border-emerald-100 truncate">
                {cfopExplicacao || 'CFOP determinado pela matriz fiscal'}
              </div>
            </div>
          </div>
        </div>

        {/* Parâmetros do Cenário */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-muted/10 p-3 rounded-lg border border-border/60">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Tipo de Operação</Label>
            <Select
              value={operacao}
              onValueChange={(v: any) => {
                setOperacao(v)
                if (v === 'venda_interna') setUfDestino(ufOrigem)
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venda_interna">Venda Interna (Estadual)</SelectItem>
                <SelectItem value="venda_interestadual">Venda Interestadual</SelectItem>
                <SelectItem value="entrada_compra">Entrada por Compra</SelectItem>
                <SelectItem value="devolucao">Devolução de Mercadoria</SelectItem>
                <SelectItem value="bonificacao">Remessa em Bonificação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">UF Origem × Destino</Label>
            <div className="flex items-center gap-1">
              <Input
                value={ufOrigem}
                onChange={(e) => setUfOrigem(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
                className="h-8 text-xs w-16 text-center font-mono font-bold"
                placeholder="UF"
              />
              <span className="text-xs text-muted-foreground">→</span>
              <Input
                value={operacao === 'venda_interna' ? ufOrigem : ufDestino}
                onChange={(e) => setUfDestino(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
                disabled={operacao === 'venda_interna'}
                className="h-8 text-xs w-16 text-center font-mono font-bold"
                placeholder="UF"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Quantidade ({defaultUnit})</Label>
            <Input
              type="number"
              step="any"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Valor Unitário (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={valorUnitario}
              onChange={(e) => setValorUnitario(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Desconto Comercial (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Frete / Despesas (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={frete}
              onChange={(e) => setFrete(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Destinatário</Label>
            <div className="flex items-center gap-3 pt-1">
              <label className="text-xs flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consumidorFinal}
                  onChange={(e) => setConsumidorFinal(e.target.checked)}
                  className="rounded text-primary h-3.5 w-3.5"
                />
                Consumidor Final
              </label>
              <label className="text-xs flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contribuinteIcms}
                  onChange={(e) => setContribuinteIcms(e.target.checked)}
                  className="rounded text-primary h-3.5 w-3.5"
                />
                Contribuinte ICMS
              </label>
            </div>
          </div>

          <div className="flex items-end">
            <div className="text-xs text-muted-foreground pb-2">
              Produto:{' '}
              <span className="font-semibold text-foreground">
                {productCode} - {productName}
              </span>
            </div>
          </div>
        </div>

        {/* Exibição dos Resultados do Cálculo Auditado */}
        {result && (
          <div className="space-y-4 pt-2">
            {/* Resumo com Classificação e Totais */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <div className="p-2.5 rounded border bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">
                  CFOP Aplicado
                </div>
                <div className="text-base font-extrabold font-mono text-primary">
                  {result.cfop_resultado || '-'}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {operacao.replace('_', ' ')}
                </div>
              </div>

              <div className="p-2.5 rounded border bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">
                  CST / CSOSN
                </div>
                <div className="text-base font-extrabold font-mono text-foreground">
                  {result.cst_csosn_resultado || '-'}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Origem {result.origem_resultado || '0'}
                </div>
              </div>

              <div className="p-2.5 rounded border bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">
                  NCM / CEST
                </div>
                <div className="text-xs font-bold font-mono text-foreground">
                  {result.ncm_resultado || '-'}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {result.cest_resultado ? `CEST: ${result.cest_resultado}` : 'Sem CEST'}
                </div>
              </div>

              <div className="p-2.5 rounded border bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">
                  Valor Base Operação
                </div>
                <div className="text-base font-extrabold font-mono text-foreground">
                  R$ {result.valor_total}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {result.quantidade} {result.unidade}
                </div>
              </div>

              <div className="p-2.5 rounded border bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">
                  Total Tributos
                </div>
                <div className="text-base font-extrabold font-mono text-destructive">
                  R$ {result.total_tributos}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {(
                    (parseFloat(result.total_tributos) / (parseFloat(result.valor_total) || 1)) *
                    100
                  ).toFixed(1)}
                  % carga
                </div>
              </div>

              <div className="p-2.5 rounded border bg-card">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">
                  Reforma Tributária
                </div>
                <div className="text-xs font-bold font-mono text-primary">
                  IBS R$ {result.ibs_valor} | CBS R$ {result.cbs_valor}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {result.cClassTrib_resultado
                    ? `cClass: ${result.cClassTrib_resultado}`
                    : 'Sem cClassTrib'}
                </div>
              </div>
            </div>

            {/* Tabela Detalhada dos Tributos */}
            <div className="border rounded-md overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead className="bg-muted/40 font-semibold border-b">
                  <tr>
                    <th className="py-2 px-3 text-left">Tributo</th>
                    <th className="py-2 px-3 text-left">CST/Código</th>
                    <th className="py-2 px-3 text-right">Base de Cálculo</th>
                    <th className="py-2 px-3 text-right">Alíquota</th>
                    <th className="py-2 px-3 text-right">Valor Apurado</th>
                    <th className="py-2 px-3 text-left">Enquadramento Legal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-2 px-3 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      ICMS Próprio
                    </td>
                    <td className="py-2 px-3 font-mono">{result.cst_csosn_resultado}</td>
                    <td className="py-2 px-3 text-right font-mono">R$ {result.icms_base}</td>
                    <td className="py-2 px-3 text-right font-mono">{result.icms_aliquota}%</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-foreground">
                      R$ {result.icms_valor}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      Regra estadual {result.uf_origem} → {result.uf_destino}
                    </td>
                  </tr>

                  {parseFloat(result.icms_st_valor || '0') > 0 && (
                    <tr className="bg-amber-500/5">
                      <td className="py-2 px-3 font-semibold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        ICMS-ST (Substituição)
                      </td>
                      <td className="py-2 px-3 font-mono">{result.cst_csosn_resultado}</td>
                      <td className="py-2 px-3 text-right font-mono">R$ {result.icms_st_base}</td>
                      <td className="py-2 px-3 text-right font-mono">
                        MVA {result.icms_st_mva}% / {result.icms_st_aliquota}%
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                        R$ {result.icms_st_valor}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        Protocolo ICMS / Regime ST
                      </td>
                    </tr>
                  )}

                  {parseFloat(result.fcp_valor || '0') > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                        FCP (Combate à Pobreza)
                      </td>
                      <td className="py-2 px-3 font-mono">-</td>
                      <td className="py-2 px-3 text-right font-mono">R$ {result.fcp_base}</td>
                      <td className="py-2 px-3 text-right font-mono">{result.fcp_aliquota}%</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        R$ {result.fcp_valor}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">Adicional FCP estadual</td>
                    </tr>
                  )}

                  {parseFloat(result.difal_valor || '0') > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                        DIFAL Consumidor Final
                      </td>
                      <td className="py-2 px-3 font-mono">EC 87/15</td>
                      <td className="py-2 px-3 text-right font-mono">R$ {result.valor_total}</td>
                      <td className="py-2 px-3 text-right font-mono">Diferencial</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        R$ {result.difal_valor}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        Partilha UF Destino {result.uf_destino}
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td className="py-2 px-3 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      PIS
                    </td>
                    <td className="py-2 px-3 font-mono">{result.pis_cst}</td>
                    <td className="py-2 px-3 text-right font-mono">R$ {result.pis_base}</td>
                    <td className="py-2 px-3 text-right font-mono">{result.pis_aliquota}%</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      R$ {result.pis_valor}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">Regime Não-Cumulativo/Geral</td>
                  </tr>

                  <tr>
                    <td className="py-2 px-3 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                      COFINS
                    </td>
                    <td className="py-2 px-3 font-mono">{result.cofins_cst}</td>
                    <td className="py-2 px-3 text-right font-mono">R$ {result.cofins_base}</td>
                    <td className="py-2 px-3 text-right font-mono">{result.cofins_aliquota}%</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      R$ {result.cofins_valor}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">Regime Não-Cumulativo/Geral</td>
                  </tr>

                  <tr className="bg-primary/5">
                    <td className="py-2 px-3 font-semibold flex items-center gap-1.5 text-primary">
                      <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                      Reforma Tributária (IBS + CBS)
                    </td>
                    <td className="py-2 px-3 font-mono">
                      {result.cClassTrib_resultado || 'Padrão'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">R$ {result.ibs_base}</td>
                    <td className="py-2 px-3 text-right font-mono">
                      IBS {result.ibs_aliquota}% + CBS {result.cbs_aliquota}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-primary">
                      R${' '}
                      {(
                        parseFloat(result.ibs_valor || '0') + parseFloat(result.cbs_valor || '0')
                      ).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      EC 132/23 (IBS estadual + CBS federal)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Registro de Auditoria e Memória de Cálculo */}
            <div className="border rounded-md p-3 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-foreground">
                    Auditoria do Backend Registrada
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    ID: {result.simulation_id || 'AUDITADO'}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Operador: {result.user_name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMemory(!showMemory)}
                  className="h-6 text-[11px] gap-1 px-2"
                >
                  <FileText className="w-3 h-3" />
                  {showMemory ? 'Ocultar Memória de Cálculo' : 'Ver Memória de Cálculo'}
                  {showMemory ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {showMemory && (
                <div className="mt-2 space-y-2 pt-2 border-t text-xs">
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Regras fiscais aplicadas pelo backend:
                    </span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-foreground/80 font-mono text-[11px]">
                      {result.rules_applied &&
                        result.rules_applied.map((r: string, idx: number) => (
                          <li key={idx}>{r}</li>
                        ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Passo a passo da apuração matemática:
                    </span>
                    <div className="bg-muted/40 p-2 rounded mt-1 font-mono text-[11px] space-y-0.5 text-muted-foreground">
                      {result.calculation_memory &&
                        result.calculation_memory.map((m: string, idx: number) => (
                          <div key={idx}>▸ {m}</div>
                        ))}
                    </div>
                  </div>

                  {result.warnings && result.warnings.length > 0 && (
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-800 dark:text-amber-300 flex items-start gap-1.5 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        {result.warnings.map((w: string, idx: number) => (
                          <div key={idx}>{w}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

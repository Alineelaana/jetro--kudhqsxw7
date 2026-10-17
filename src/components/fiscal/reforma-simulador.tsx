import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProducts } from '@/services/products'
import { getPricingConfig } from '@/services/pricing'
import { getReformConfigs, createReformSimulation } from '@/services/fiscal'
import { useAuth } from '@/hooks/use-auth'
import { parseNum, formatCurrency, calcFinalCost, calcTotalTaxes } from '@/lib/pricing-types'
import type { PricingConfig } from '@/lib/pricing-types'
import { Loader2, FlaskConical, Save, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export function ReformaSimulador() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState('')
  const [cfg, setCfg] = useState<PricingConfig | null>(null)
  const [reformCfg, setReformCfg] = useState<Record<string, unknown>[]>([])
  const [operacao, setOperacao] = useState('venda')
  const [estado, setEstado] = useState('ES')
  const [quantidade, setQuantidade] = useState('1')
  const [valor, setValor] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getProducts(), getReformConfigs()])
      .then(([p, rc]) => {
        setProducts(p as unknown as Record<string, unknown>[])
        setReformCfg(rc as unknown as Record<string, unknown>[])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedId) {
      getPricingConfig(selectedId)
        .then((c) => setCfg(c as unknown as PricingConfig))
        .catch(() => setCfg(null))
    }
  }, [selectedId])

  const cbsConfig = useMemo(() => reformCfg.find((c) => c.tributo === 'CBS'), [reformCfg])
  const ibsConfig = useMemo(() => reformCfg.find((c) => c.tributo === 'IBS'), [reformCfg])
  const selConfig = useMemo(
    () => reformCfg.find((c) => c.tributo === 'Imposto_Seletivo'),
    [reformCfg],
  )

  const result = useMemo(() => {
    if (!cfg) return null
    const custo = calcFinalCost(cfg) + calcTotalTaxes(cfg)
    const preco = parseNum(valor)
    const cbsAliq = parseNum(cbsConfig?.aliquota as string)
    const ibsAliq = parseNum(ibsConfig?.aliquota as string)
    const selAliq = parseNum(selConfig?.aliquota as string)
    const cbs = preco * (cbsAliq / 100)
    const ibs = preco * (ibsAliq / 100)
    const sel = preco * (selAliq / 100)
    const tributosAtuais = calcTotalTaxes(cfg)
    const creditos = custo * (parseNum(cbsConfig?.credito_presumido as string) / 100)
    const custoLiquido = custo + cbs + ibs + sel - creditos
    const receitaLiquida = preco - cbs - ibs - sel
    const margemAtual = preco > 0 ? ((preco - custo) / preco) * 100 : 0
    const margemSimulada = preco > 0 ? ((preco - custoLiquido) / preco) * 100 : 0
    const precoMinimo = custoLiquido / (1 - parseNum(cfg.minimum_margin || '10') / 100)
    const precoSugerido = custoLiquido / (1 - parseNum(cfg.desired_margin || '30') / 100)
    const difValor = precoSugerido - parseNum(cfg.suggested_price)
    const difPercent =
      parseNum(cfg.suggested_price) > 0 ? (difValor / parseNum(cfg.suggested_price)) * 100 : 0
    return {
      custo,
      preco,
      cbs,
      ibs,
      sel,
      tributosAtuais,
      creditos,
      custoLiquido,
      receitaLiquida,
      margemAtual,
      margemSimulada,
      precoMinimo,
      precoSugerido,
      difValor,
      difPercent,
    }
  }, [cfg, valor, cbsConfig, ibsConfig, selConfig])

  const handleSave = async () => {
    if (!selectedId || !result) {
      toast.error('Selecione um produto e valor')
      return
    }
    setSaving(true)
    try {
      const product = products.find((p) => p.id === selectedId)
      await createReformSimulation({
        produto_id: selectedId,
        produto_name: (product?.name as string) || '',
        operacao: operacao,
        estado: estado,
        quantidade: quantidade,
        valor: valor,
        custo_atual: result.custo.toFixed(2),
        preco_atual: valor,
        tributos_atuais: result.tributosAtuais.toFixed(2),
        cbs: result.cbs.toFixed(2),
        ibs: result.ibs.toFixed(2),
        imposto_seletivo: result.sel.toFixed(2),
        creditos_aproveitaveis: result.creditos.toFixed(2),
        custo_liquido: result.custoLiquido.toFixed(2),
        receita_liquida: result.receitaLiquida.toFixed(2),
        margem_atual: result.margemAtual.toFixed(2),
        margem_simulada: result.margemSimulada.toFixed(2),
        preco_minimo: result.precoMinimo.toFixed(2),
        preco_sugerido: result.precoSugerido.toFixed(2),
        diferenca_valor: result.difValor.toFixed(2),
        diferenca_percent: result.difPercent.toFixed(2),
        scenario_name: `Simulação Reforma - ${operacao}`,
        created_by: (user?.name as string) || '',
        company: 'Velora Log',
        branch: 'Matriz',
      })
      toast.success('Simulação salva sem alterar preço oficial')
    } catch {
      toast.error('Erro ao salvar simulação')
    }
    setSaving(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="focus-visible:ring-[#005B2E]">
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id as string} value={p.id as string}>
                  {p.name as string} — {p.code as string}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Operação</Label>
              <Select value={operacao} onValueChange={setOperacao}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="devolucao">Devolução</SelectItem>
                  <SelectItem value="importacao">Importação</SelectItem>
                  <SelectItem value="exportacao">Exportação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Estado</Label>
              <Input
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Qtd</Label>
              <Input
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Valor (R$)</Label>
              <Input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      {result && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader>
            <CardTitle className="text-base text-[#005B2E] flex items-center gap-2">
              <FlaskConical className="w-4 h-4" /> Resultado da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded bg-muted/50">
                <span className="text-xs text-muted-foreground block">Custo Atual</span>
                <span className="font-bold">R$ {formatCurrency(result.custo)}</span>
              </div>
              <div className="p-3 rounded bg-muted/50">
                <span className="text-xs text-muted-foreground block">Tributos Atuais</span>
                <span className="font-bold">R$ {formatCurrency(result.tributosAtuais)}</span>
              </div>
              <div className="p-3 rounded bg-[#005B2E]/5">
                <span className="text-xs text-muted-foreground block">CBS</span>
                <span className="font-bold text-[#005B2E]">R$ {formatCurrency(result.cbs)}</span>
              </div>
              <div className="p-3 rounded bg-[#C89B3C]/5">
                <span className="text-xs text-muted-foreground block">IBS</span>
                <span className="font-bold text-[#C89B3C]">R$ {formatCurrency(result.ibs)}</span>
              </div>
              <div className="p-3 rounded bg-[#8b5cf6]/5">
                <span className="text-xs text-muted-foreground block">Imposto Seletivo</span>
                <span className="font-bold text-[#8b5cf6]">R$ {formatCurrency(result.sel)}</span>
              </div>
              <div className="p-3 rounded bg-muted/50">
                <span className="text-xs text-muted-foreground block">Créditos</span>
                <span className="font-bold text-emerald-600">
                  R$ {formatCurrency(result.creditos)}
                </span>
              </div>
              <div className="p-3 rounded bg-muted/50">
                <span className="text-xs text-muted-foreground block">Custo Líquido</span>
                <span className="font-bold">R$ {formatCurrency(result.custoLiquido)}</span>
              </div>
              <div className="p-3 rounded bg-muted/50">
                <span className="text-xs text-muted-foreground block">Receita Líquida</span>
                <span className="font-bold">R$ {formatCurrency(result.receitaLiquida)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded bg-muted/50">
                <span className="text-xs text-muted-foreground block">Margem Atual</span>
                <span className="font-bold">{formatCurrency(result.margemAtual)}%</span>
              </div>
              <div className="p-3 rounded bg-muted/50">
                <span className="text-xs text-muted-foreground block">Margem Simulada</span>
                <span
                  className={`font-bold ${result.margemSimulada < result.margemAtual ? 'text-red-600' : 'text-emerald-600'}`}
                >
                  {formatCurrency(result.margemSimulada)}%
                </span>
              </div>
              <div className="p-3 rounded bg-muted/50">
                <span className="text-xs text-muted-foreground block">Preço Mínimo</span>
                <span className="font-bold">R$ {formatCurrency(result.precoMinimo)}</span>
              </div>
              <div className="p-3 rounded bg-muted/50">
                <span className="text-xs text-muted-foreground block">Preço Sugerido</span>
                <span className="font-bold">R$ {formatCurrency(result.precoSugerido)}</span>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}{' '}
              Salvar Simulação (não altera preço oficial)
            </Button>
          </CardContent>
        </Card>
      )}
      {!selectedId && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <TrendingUp className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Selecione um produto para simular</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

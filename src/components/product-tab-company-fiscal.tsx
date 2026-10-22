import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
  History,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { getProductCompanyFiscals, saveProductCompanyFiscal } from '@/services/products'
import type { ProductCompanyFiscal } from '@/lib/product-types'
import { useBrand, type EmpresaBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { FiscalAuditSimulator } from '@/components/fiscal/fiscal-audit-simulator'

interface Props {
  productId: string | null
  productCode?: string
  productName?: string
  baseNcm?: string
  baseOrigin?: string
  baseTipoFinalidade?: string
}

export function ProductTabCompanyFiscal({
  productId,
  productCode = '',
  productName = '',
  baseNcm = '',
  baseOrigin = '0',
  baseTipoFinalidade = 'revenda',
}: Props) {
  const { empresasDisponiveis } = useBrand()
  const [fiscals, setFiscals] = useState<ProductCompanyFiscal[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('')
  const [currentConfig, setCurrentConfig] = useState<Partial<ProductCompanyFiscal>>({})
  const [showHistory, setShowHistory] = useState(false)

  // Carregar configurações do produto
  const loadFiscals = async () => {
    if (!productId) return
    setLoading(true)
    try {
      const data = await getProductCompanyFiscals(productId)
      setFiscals(data)
      // Se não tiver selecionado, selecionar a primeira empresa disponível
      if (!selectedEmpresaId && empresasDisponiveis.length > 0) {
        setSelectedEmpresaId(empresasDisponiveis[0].id)
      }
    } catch {
      toast({
        title: 'Não foi possível carregar configurações fiscais por empresa.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      loadFiscals()
    } else if (empresasDisponiveis.length > 0 && !selectedEmpresaId) {
      setSelectedEmpresaId(empresasDisponiveis[0].id)
    }
  }, [productId, empresasDisponiveis])

  // Quando muda a empresa selecionada ou a lista de fiscals, atualizar form local
  useEffect(() => {
    if (!selectedEmpresaId) return
    const found = fiscals.find((f) => f.empresa_id === selectedEmpresaId)
    if (found) {
      setCurrentConfig({ ...found })
    } else {
      // Configuração inicial em branco com herança
      setCurrentConfig({
        product_id: productId || '',
        empresa_id: selectedEmpresaId,
        fiscal_status: 'rascunho',
        tipo_operacao_fiscal: (baseTipoFinalidade as any) || 'revenda',
        cfop_padrao_interno: baseTipoFinalidade === 'fabricacao_propria' ? '5101' : '5102',
        cfop_padrao_interestadual: baseTipoFinalidade === 'fabricacao_propria' ? '6101' : '6102',
        cst_csosn: '00',
        origem_override: baseOrigin || '0',
        ncm_override: baseNcm || '',
        allow_lot_control: false,
      })
    }
  }, [selectedEmpresaId, fiscals, productId, baseTipoFinalidade, baseOrigin, baseNcm])

  const setConfigField = (field: keyof ProductCompanyFiscal, val: unknown) => {
    setCurrentConfig((prev) => ({ ...prev, [field]: val }))
  }

  const handleSave = async () => {
    if (!productId) {
      toast({
        title: 'Salve o produto primeiro para cadastrar configurações por empresa.',
        variant: 'destructive',
      })
      return
    }
    if (!selectedEmpresaId) {
      toast({ title: 'Selecione uma empresa.', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const payload: Partial<ProductCompanyFiscal> = {
        ...currentConfig,
        product_id: productId,
        empresa_id: selectedEmpresaId,
      }

      await saveProductCompanyFiscal(payload)
      toast({
        title: 'Configuração fiscal da empresa salva com sucesso!',
        description: 'Parâmetros fiscais, overrides e controle de lote atualizados.',
      })
      await loadFiscals()
    } catch (err: unknown) {
      const e = err as { message?: string }
      toast({
        title: 'Erro ao salvar configuração fiscal da empresa.',
        description: e?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedEmpresa = empresasDisponiveis.find((e) => e.id === selectedEmpresaId)

  if (!productId) {
    return (
      <Card className="border-dashed border-2 border-border/80">
        <CardContent className="py-10 text-center space-y-2">
          <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="font-bold text-foreground">
            Configuração Fiscal por Estabelecimento/Empresa
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Salve os dados gerais do produto primeiro. Em seguida, você poderá configurar regras
            específicas, CFOPs, CSTs e alíquotas separadas para DEC Eldorado e Gran Romano.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-muted/40 rounded-lg border border-border">
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Estabelecimento / Empresa Ativa
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <Select value={selectedEmpresaId} onValueChange={setSelectedEmpresaId}>
              <SelectTrigger className="w-64 h-9 bg-background focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresasDisponiveis.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.nome_fantasia || emp.name} ({emp.code || 'EMP'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEmpresa && (
              <Badge variant="outline" className="text-xs py-1">
                {selectedEmpresa.code || 'Unidade'}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Badge
            className={`text-xs font-bold px-2.5 py-1 ${
              currentConfig.fiscal_status === 'validado_fiscal'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            {currentConfig.fiscal_status === 'validado_fiscal' ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pronto p/ NF-e
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Rascunho Fiscal
              </span>
            )}
          </Badge>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold h-9"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1" />
            )}
            Salvar Regra
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bloco Operação e CFOP */}
        <Card className="border border-border">
          <CardContent className="p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#005B2E] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Operação e Enquadramento
            </h4>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tipo de Operação Fiscal na Empresa</Label>
              <Select
                value={currentConfig.tipo_operacao_fiscal || 'revenda'}
                onValueChange={(v) => {
                  setConfigField('tipo_operacao_fiscal', v)
                  // Sugestão de CFOP de acordo com fabricação própria vs revenda
                  if (v === 'fabricacao_propria') {
                    setConfigField('cfop_padrao_interno', '5101')
                    setConfigField('cfop_padrao_interestadual', '6101')
                  } else if (v === 'revenda') {
                    setConfigField('cfop_padrao_interno', '5102')
                    setConfigField('cfop_padrao_interestadual', '6102')
                  }
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenda">Revenda de Mercadorias (5102 / 6102)</SelectItem>
                  <SelectItem value="fabricacao_propria">
                    Fabricação Própria (5101 / 6101)
                  </SelectItem>
                  <SelectItem value="industrializacao">
                    Industrialização / Matéria-prima (Gran Romano)
                  </SelectItem>
                  <SelectItem value="outro">Outra Operação Específica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">CFOP Interno (ES→ES / SP→SP)</Label>
                <Input
                  value={currentConfig.cfop_padrao_interno || ''}
                  onChange={(e) => setConfigField('cfop_padrao_interno', e.target.value)}
                  placeholder="Ex: 5101 ou 5102"
                  className="h-8 font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">CFOP Interestadual</Label>
                <Input
                  value={currentConfig.cfop_padrao_interestadual || ''}
                  onChange={(e) => setConfigField('cfop_padrao_interestadual', e.target.value)}
                  placeholder="Ex: 6101 ou 6102"
                  className="h-8 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">CST / CSOSN</Label>
                <Input
                  value={currentConfig.cst_csosn || ''}
                  onChange={(e) => setConfigField('cst_csosn', e.target.value)}
                  placeholder="Ex: 00, 10, 20, 102"
                  className="h-8 font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">CEST (quando aplicável)</Label>
                <Input
                  value={currentConfig.cest || ''}
                  onChange={(e) => setConfigField('cest', e.target.value)}
                  placeholder="Ex: 01.001.00"
                  className="h-8 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Código de Benefício Fiscal (cBenef)</Label>
              <Input
                value={currentConfig.codigo_beneficio_fiscal || ''}
                onChange={(e) => setConfigField('codigo_beneficio_fiscal', e.target.value)}
                placeholder="Ex: ES000001 (anulável se não houver)"
                className="h-8 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">Controle Obrigatório por Lote</Label>
                <p className="text-[11px] text-muted-foreground">
                  Exige identificação de lote nesta empresa
                </p>
              </div>
              <Switch
                checked={!!currentConfig.allow_lot_control}
                onCheckedChange={(v) => setConfigField('allow_lot_control', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bloco Tributos e Overrides */}
        <Card className="border border-border">
          <CardContent className="p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#005B2E]">
              Overrides de Tributação e Reforma
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">ICMS Alíquota (%)</Label>
                <Input
                  value={currentConfig.icms_aliquota || ''}
                  onChange={(e) => setConfigField('icms_aliquota', e.target.value)}
                  placeholder="Ex: 12.00 ou 17.00"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Redução Base ICMS (%)</Label>
                <Input
                  value={currentConfig.icms_base_reduzida || ''}
                  onChange={(e) => setConfigField('icms_base_reduzida', e.target.value)}
                  placeholder="Ex: 20.00"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">MVA / Margem ST (%)</Label>
                <Input
                  value={currentConfig.icms_st_mva || ''}
                  onChange={(e) => setConfigField('icms_st_mva', e.target.value)}
                  placeholder="Ex: 40.00"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">FCP Alíquota (%)</Label>
                <Input
                  value={currentConfig.fcp_aliquota || ''}
                  onChange={(e) => setConfigField('fcp_aliquota', e.target.value)}
                  placeholder="Ex: 2.00"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">PIS CST / Alíquota (%)</Label>
                <div className="flex gap-1">
                  <Input
                    value={currentConfig.pis_cst || ''}
                    onChange={(e) => setConfigField('pis_cst', e.target.value)}
                    placeholder="CST"
                    className="h-8 text-xs w-16 font-mono"
                  />
                  <Input
                    value={currentConfig.pis_aliquota || ''}
                    onChange={(e) => setConfigField('pis_aliquota', e.target.value)}
                    placeholder="%"
                    className="h-8 text-xs flex-1 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">COFINS CST / Alíquota (%)</Label>
                <div className="flex gap-1">
                  <Input
                    value={currentConfig.cofins_cst || ''}
                    onChange={(e) => setConfigField('cofins_cst', e.target.value)}
                    placeholder="CST"
                    className="h-8 text-xs w-16 font-mono"
                  />
                  <Input
                    value={currentConfig.cofins_aliquota || ''}
                    onChange={(e) => setConfigField('cofins_aliquota', e.target.value)}
                    placeholder="%"
                    className="h-8 text-xs flex-1 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">cClassTrib (Reforma)</Label>
                <Input
                  value={currentConfig.cClassTrib || ''}
                  onChange={(e) => setConfigField('cClassTrib', e.target.value)}
                  placeholder="Código Classificação"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">IBS / CBS (%)</Label>
                <div className="flex gap-1">
                  <Input
                    value={currentConfig.ibs_aliquota || ''}
                    onChange={(e) => setConfigField('ibs_aliquota', e.target.value)}
                    placeholder="IBS %"
                    className="h-8 text-xs flex-1 font-mono"
                  />
                  <Input
                    value={currentConfig.cbs_aliquota || ''}
                    onChange={(e) => setConfigField('cbs_aliquota', e.target.value)}
                    placeholder="CBS %"
                    className="h-8 text-xs flex-1 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Observações Fiscais desta Unidade</Label>
              <Textarea
                value={currentConfig.observacoes_fiscais || ''}
                onChange={(e) => setConfigField('observacoes_fiscais', e.target.value)}
                rows={2}
                placeholder="Ex: Mercadoria sujeita a pauta fiscal em ES..."
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SIMULADOR FISCAL AUDITÁVEL NO BACKEND (FASE A) */}
      {productId && selectedEmpresaId && (
        <FiscalAuditSimulator
          productId={productId}
          productCode={productCode || 'PROD'}
          productName={productName || 'Produto'}
          empresaId={selectedEmpresaId}
          empresaName={selectedEmpresa?.nome_fantasia || selectedEmpresa?.name || 'Empresa'}
        />
      )}

      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <span className="font-bold">Princípio de Isolamento por Empresa:</span> A Gran Romano
          (SP/ES) e a DEC Eldorado (ES) mantêm perfis fiscais e CFOPs independentes. Uma regra
          alterada na Gran Romano nunca substitui nem sobrescreve a configuração da DEC Eldorado.
          Simulações fiscais e emissão de NF-e consultam esta configuração ativa.
        </div>
      </div>
    </div>
  )
}

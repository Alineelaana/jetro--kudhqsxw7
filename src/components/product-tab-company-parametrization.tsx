import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Receipt,
  DollarSign,
  PackageCheck,
  Save,
  Loader2,
  Lock,
  Calculator,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import type { Product, Empresa } from '@/lib/product-types'
import { recordProductAuditLog } from '@/services/products'

interface Props {
  product: Product | null
  companies: Empresa[]
  initialCompanyId?: string
}

interface CompanyFiscalState {
  id?: string
  ncm: string
  cest: string
  cfop_padrao: string
  origem: string
  cst_icms: string
  aliquota_icms: string
  reducao_base_icms: string
  aliquota_icms_st: string
  mva_st: string
  cst_pis: string
  aliquota_pis: string
  cst_cofins: string
  aliquota_cofins: string
  cst_ipi: string
  aliquota_ipi: string
  codigo_enquadramento_ipi: string
  cClassTrib: string
  cBenef: string
  motivo_desoneracao_icms: string
  status_validacao_fiscal: string
  notas_fiscais_empresa?: string
}

interface CompanyCommercialState {
  id?: string
  cost_price: string
  sale_price: string
  min_sale_price: string
  markup_percent: string
  profit_margin: string
  commission_percent: string
  max_discount_percent: string
  cost_origin: string
  cost_locked: boolean
  cost_history?: string
}

interface CompanyStockState {
  id?: string
  stock_current: string
  stock_min: string
  stock_max: string
  stock_safety: string
  replenishment_point: string
  lead_time_days: string
  standard_batch: string
  storage_location: string
  storage_aisle: string
  storage_shelf: string
  lot_number?: string
  validity_date?: string
}

const defaultFiscal: CompanyFiscalState = {
  ncm: '',
  cest: '',
  cfop_padrao: '5102',
  origem: '0',
  cst_icms: '00',
  aliquota_icms: '18.00',
  reducao_base_icms: '0.00',
  aliquota_icms_st: '0.00',
  mva_st: '0.00',
  cst_pis: '01',
  aliquota_pis: '1.65',
  cst_cofins: '01',
  aliquota_cofins: '7.60',
  cst_ipi: '99',
  aliquota_ipi: '0.00',
  codigo_enquadramento_ipi: '999',
  cClassTrib: '',
  cBenef: '',
  motivo_desoneracao_icms: '',
  status_validacao_fiscal: 'rascunho',
}

const defaultCommercial: CompanyCommercialState = {
  cost_price: '0.00',
  sale_price: '0.00',
  min_sale_price: '0.00',
  markup_percent: '0.00',
  profit_margin: '0.00',
  commission_percent: '0.00',
  max_discount_percent: '0.00',
  cost_origin: 'initial',
  cost_locked: true,
}

const defaultStock: CompanyStockState = {
  stock_current: '0',
  stock_min: '0',
  stock_max: '0',
  stock_safety: '0',
  replenishment_point: '0',
  lead_time_days: '0',
  standard_batch: '1',
  storage_location: '',
  storage_aisle: '',
  storage_shelf: '',
}

export function ProductTabCompanyParametrization({ product, companies, initialCompanyId }: Props) {
  const { toast } = useToast()
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    initialCompanyId || companies[0]?.id || '',
  )
  const [subTab, setSubTab] = useState<'fiscal' | 'commercial' | 'stock'>('fiscal')

  const [fiscalData, setFiscalData] = useState<CompanyFiscalState>(defaultFiscal)
  const [commercialData, setCommercialData] = useState<CompanyCommercialState>(defaultCommercial)
  const [stockData, setStockData] = useState<CompanyStockState>(defaultStock)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Atualiza empresa selecionada se o initialCompanyId mudar
  useEffect(() => {
    if (initialCompanyId && initialCompanyId !== selectedCompanyId) {
      setSelectedCompanyId(initialCompanyId)
    }
  }, [initialCompanyId])

  const loadCompanyData = useCallback(async () => {
    if (!product?.id || !selectedCompanyId) {
      setFiscalData(defaultFiscal)
      setCommercialData(defaultCommercial)
      setStockData(defaultStock)
      return
    }

    setLoading(true)
    try {
      // 1. Fiscal
      const fiscalRecs = await pb.collection('product_company_fiscal').getList(1, 1, {
        filter: `product_id = '${product.id}' && empresa_id = '${selectedCompanyId}'`,
      })
      if (fiscalRecs.items.length > 0) {
        const item: any = fiscalRecs.items[0]
        setFiscalData({
          id: item.id,
          ncm: item.ncm || '',
          cest: item.cest || '',
          cfop_padrao: item.cfop_padrao || '5102',
          origem: item.origem || '0',
          cst_icms: item.cst_icms || '00',
          aliquota_icms: String(item.aliquota_icms ?? '18.00'),
          reducao_base_icms: String(item.reducao_base_icms ?? '0.00'),
          aliquota_icms_st: String(item.aliquota_icms_st ?? '0.00'),
          mva_st: String(item.mva_st ?? '0.00'),
          cst_pis: item.cst_pis || '01',
          aliquota_pis: String(item.aliquota_pis ?? '1.65'),
          cst_cofins: item.cst_cofins || '01',
          aliquota_cofins: String(item.aliquota_cofins ?? '7.60'),
          cst_ipi: item.cst_ipi || '99',
          aliquota_ipi: String(item.aliquota_ipi ?? '0.00'),
          codigo_enquadramento_ipi: item.codigo_enquadramento_ipi || '999',
          cClassTrib: item.cClassTrib || '',
          cBenef: item.cBenef || '',
          motivo_desoneracao_icms: item.motivo_desoneracao_icms || '',
          status_validacao_fiscal: item.status_validacao_fiscal || 'rascunho',
          notas_fiscais_empresa: item.notas_fiscais_empresa || '',
        })
      } else {
        // Fallback inicial com dados globais do produto se for primeiro acesso
        setFiscalData({
          ...defaultFiscal,
          ncm: product.ncm || '',
          cest: product.cest || '',
          cfop_padrao: product.cfop || '5102',
          origem: product.origin || '0',
          cst_icms: product.cst_csosn || '00',
          aliquota_icms: product.icms_aliquot || '18.00',
          aliquota_ipi: product.ipi || '0.00',
          aliquota_pis: product.pis || '1.65',
          aliquota_cofins: product.cofins || '7.60',
        })
      }

      // 2. Commercial
      const commRecs = await pb.collection('product_company_commercial').getList(1, 1, {
        filter: `product_id = '${product.id}' && empresa_id = '${selectedCompanyId}'`,
      })
      if (commRecs.items.length > 0) {
        const item: any = commRecs.items[0]
        setCommercialData({
          id: item.id,
          cost_price: String(item.cost_price ?? '0.00'),
          sale_price: String(item.sale_price ?? '0.00'),
          min_sale_price: String(item.min_sale_price ?? '0.00'),
          markup_percent: String(item.markup_percent ?? '0.00'),
          profit_margin: String(item.profit_margin ?? '0.00'),
          commission_percent: String(item.commission_percent ?? '0.00'),
          max_discount_percent: String(item.max_discount_percent ?? '0.00'),
          cost_origin: item.cost_origin || 'initial',
          cost_locked: item.cost_locked !== false,
          cost_history: item.cost_history || '',
        })
      } else {
        setCommercialData({
          ...defaultCommercial,
          cost_price: product.cost_price || '0.00',
          sale_price: product.price || '0.00',
          profit_margin: product.profit_margin || '0.00',
          commission_percent: product.commission || '0.00',
          max_discount_percent: product.max_discount || '0.00',
        })
      }

      // 3. Stock
      const stockRecs = await pb.collection('product_company_stock').getList(1, 1, {
        filter: `product_id = '${product.id}' && empresa_id = '${selectedCompanyId}'`,
      })
      if (stockRecs.items.length > 0) {
        const item: any = stockRecs.items[0]
        setStockData({
          id: item.id,
          stock_current: String(item.stock_current ?? '0'),
          stock_min: String(item.stock_min ?? '0'),
          stock_max: String(item.stock_max ?? '0'),
          stock_safety: String(item.stock_safety ?? '0'),
          replenishment_point: String(item.replenishment_point ?? '0'),
          lead_time_days: String(item.lead_time_days ?? '0'),
          standard_batch: String(item.standard_batch ?? '1'),
          storage_location: item.storage_location || '',
          storage_aisle: item.storage_aisle || '',
          storage_shelf: item.storage_shelf || '',
          lot_number: item.lot_number || '',
          validity_date: item.validity_date || '',
        })
      } else {
        setStockData({
          ...defaultStock,
          stock_current: String(product.stock ?? '0'),
          stock_min: String(product.min_stock ?? '0'),
          stock_max: String(product.max_stock ?? '0'),
          storage_location: product.location || '',
          lot_number: product.lot || '',
          validity_date: product.validity || '',
        })
      }
    } catch (err: any) {
      console.error('Erro ao buscar dados específicos da empresa:', err)
      toast({
        title: 'Aviso',
        description: 'Não foi possível carregar os parâmetros desta empresa.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [product, selectedCompanyId, toast])

  useEffect(() => {
    loadCompanyData()
  }, [loadCompanyData])

  const handleSaveCompanyParams = async () => {
    if (!product?.id) {
      toast({
        title: 'Produto não salvo',
        description: 'Salve o produto mestre primeiro antes de parametrizar por empresa.',
        variant: 'destructive',
      })
      return
    }
    if (!selectedCompanyId) {
      toast({
        title: 'Selecione uma empresa',
        description: 'Escolha a empresa para salvar os parâmetros.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      // 1. Salvar Fiscal
      if (fiscalData.id) {
        await pb.collection('product_company_fiscal').update(fiscalData.id, {
          ...fiscalData,
          aliquota_icms: parseFloat(fiscalData.aliquota_icms) || 0,
          reducao_base_icms: parseFloat(fiscalData.reducao_base_icms) || 0,
          aliquota_icms_st: parseFloat(fiscalData.aliquota_icms_st) || 0,
          mva_st: parseFloat(fiscalData.mva_st) || 0,
          aliquota_pis: parseFloat(fiscalData.aliquota_pis) || 0,
          aliquota_cofins: parseFloat(fiscalData.aliquota_cofins) || 0,
          aliquota_ipi: parseFloat(fiscalData.aliquota_ipi) || 0,
        })
      } else {
        const created = await pb.collection('product_company_fiscal').create({
          product_id: product.id,
          empresa_id: selectedCompanyId,
          ...fiscalData,
          aliquota_icms: parseFloat(fiscalData.aliquota_icms) || 0,
          reducao_base_icms: parseFloat(fiscalData.reducao_base_icms) || 0,
          aliquota_icms_st: parseFloat(fiscalData.aliquota_icms_st) || 0,
          mva_st: parseFloat(fiscalData.mva_st) || 0,
          aliquota_pis: parseFloat(fiscalData.aliquota_pis) || 0,
          aliquota_cofins: parseFloat(fiscalData.aliquota_cofins) || 0,
          aliquota_ipi: parseFloat(fiscalData.aliquota_ipi) || 0,
        })
        setFiscalData((prev) => ({ ...prev, id: created.id }))
      }

      // 2. Salvar Comercial
      if (commercialData.id) {
        await pb.collection('product_company_commercial').update(commercialData.id, {
          sale_price: parseFloat(commercialData.sale_price) || 0,
          min_sale_price: parseFloat(commercialData.min_sale_price) || 0,
          markup_percent: parseFloat(commercialData.markup_percent) || 0,
          profit_margin: parseFloat(commercialData.profit_margin) || 0,
          commission_percent: parseFloat(commercialData.commission_percent) || 0,
          max_discount_percent: parseFloat(commercialData.max_discount_percent) || 0,
        })
      } else {
        const created = await pb.collection('product_company_commercial').create({
          product_id: product.id,
          empresa_id: selectedCompanyId,
          cost_price: parseFloat(commercialData.cost_price) || 0,
          sale_price: parseFloat(commercialData.sale_price) || 0,
          min_sale_price: parseFloat(commercialData.min_sale_price) || 0,
          markup_percent: parseFloat(commercialData.markup_percent) || 0,
          profit_margin: parseFloat(commercialData.profit_margin) || 0,
          commission_percent: parseFloat(commercialData.commission_percent) || 0,
          max_discount_percent: parseFloat(commercialData.max_discount_percent) || 0,
          cost_origin: commercialData.cost_origin || 'initial',
          cost_locked: true,
        })
        setCommercialData((prev) => ({ ...prev, id: created.id }))
      }

      // 3. Salvar Estoque
      if (stockData.id) {
        await pb.collection('product_company_stock').update(stockData.id, {
          stock_current: parseFloat(stockData.stock_current) || 0,
          stock_min: parseFloat(stockData.stock_min) || 0,
          stock_max: parseFloat(stockData.stock_max) || 0,
          stock_safety: parseFloat(stockData.stock_safety) || 0,
          replenishment_point: parseFloat(stockData.replenishment_point) || 0,
          lead_time_days: parseInt(stockData.lead_time_days) || 0,
          standard_batch: parseFloat(stockData.standard_batch) || 1,
          storage_location: stockData.storage_location || '',
          storage_aisle: stockData.storage_aisle || '',
          storage_shelf: stockData.storage_shelf || '',
          lot_number: stockData.lot_number || '',
          validity_date: stockData.validity_date || null,
        })
      } else {
        const created = await pb.collection('product_company_stock').create({
          product_id: product.id,
          empresa_id: selectedCompanyId,
          stock_current: parseFloat(stockData.stock_current) || 0,
          stock_min: parseFloat(stockData.stock_min) || 0,
          stock_max: parseFloat(stockData.stock_max) || 0,
          stock_safety: parseFloat(stockData.stock_safety) || 0,
          replenishment_point: parseFloat(stockData.replenishment_point) || 0,
          lead_time_days: parseInt(stockData.lead_time_days) || 0,
          standard_batch: parseFloat(stockData.standard_batch) || 1,
          storage_location: stockData.storage_location || '',
          storage_aisle: stockData.storage_aisle || '',
          storage_shelf: stockData.storage_shelf || '',
          lot_number: stockData.lot_number || '',
          validity_date: stockData.validity_date || null,
        })
        setStockData((prev) => ({ ...prev, id: created.id }))
      }

      // Registrar auditoria
      await recordProductAuditLog({
        productId: product.id,
        empresaId: selectedCompanyId,
        scope: 'empresa',
        action: 'update',
        field: 'parametros_empresa_completos',
        newValue: `Fiscal/Comercial/Estoque atualizados para a empresa ${selectedCompanyId}`,
        description: 'Parametrização independente por empresa salva com sucesso.',
      })

      const targetComp = companies.find((c) => c.id === selectedCompanyId)
      toast({
        title: 'Parâmetros salvos com sucesso',
        description: `Dados fiscais, comerciais e de estoque gravados para ${
          targetComp?.razao_social || 'a empresa'
        }.`,
      })
    } catch (err: any) {
      console.error('Erro ao salvar parâmetros da empresa:', err)
      toast({
        title: 'Erro ao salvar',
        description: err?.message || 'Falha ao salvar parametrizações da empresa.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId)

  return (
    <div className="space-y-4">
      {/* Seletor de Empresa para Parametrização */}
      <Card className="border border-[#005B2E]/30 bg-muted/20">
        <CardContent className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#005B2E]/10 text-[#005B2E]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-[#005B2E]">
                Empresa Selecionada para Parametrização
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Parâmetros fiscais, custos/preços e estoques são INDEPENDENTES por empresa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-64 h-9 text-xs font-semibold focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs font-medium">
                    {c.razao_social || c.nome_fantasia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadCompanyData}
              disabled={loading}
              className="h-9 px-2"
              title="Recarregar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              type="button"
              onClick={handleSaveCompanyParams}
              disabled={saving || !product?.id}
              className="h-9 text-xs bg-[#005B2E] hover:bg-[#004A25] text-white gap-1.5"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Salvar Empresa
            </Button>
          </div>
        </CardContent>
      </Card>

      {!product?.id && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Produto novo ainda não salvo no banco: salve os dados gerais primeiro para ativar a
            gravação independente por empresa.
          </span>
        </div>
      )}

      {/* Sub-abas de parametrização da empresa */}
      <Tabs value={subTab} onValueChange={(v: any) => setSubTab(v)} className="w-full">
        <TabsList className="grid grid-cols-3 h-9 bg-muted/60 p-1">
          <TabsTrigger value="fiscal" className="text-xs gap-1.5 data-[state=active]:bg-background">
            <Receipt className="w-3.5 h-3.5 text-[#005B2E]" /> Fiscal da Empresa
          </TabsTrigger>
          <TabsTrigger
            value="commercial"
            className="text-xs gap-1.5 data-[state=active]:bg-background"
          >
            <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Custos & Venda
          </TabsTrigger>
          <TabsTrigger value="stock" className="text-xs gap-1.5 data-[state=active]:bg-background">
            <PackageCheck className="w-3.5 h-3.5 text-amber-600" /> Estoque Local
          </TabsTrigger>
        </TabsList>

        {/* 1. FISCAL DA EMPRESA */}
        <TabsContent value="fiscal" className="space-y-4 pt-3">
          <div className="p-2.5 rounded bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-900 dark:text-blue-200">
              Parametrização Fiscal para: {selectedCompany?.razao_social || selectedCompanyId}
            </span>
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-700">
              Isolado por CNPJ
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">NCM da Empresa *</Label>
              <Input
                value={fiscalData.ncm}
                onChange={(e) => setFiscalData({ ...fiscalData, ncm: e.target.value })}
                placeholder="Ex: 4819.10.00"
                className="h-8 text-xs font-mono focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">CEST</Label>
              <Input
                value={fiscalData.cest}
                onChange={(e) => setFiscalData({ ...fiscalData, cest: e.target.value })}
                placeholder="Ex: 01.001.00"
                className="h-8 text-xs font-mono focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">CFOP Padrão de Saída *</Label>
              <Input
                value={fiscalData.cfop_padrao}
                onChange={(e) => setFiscalData({ ...fiscalData, cfop_padrao: e.target.value })}
                placeholder="5102"
                className="h-8 text-xs font-mono focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Origem da Mercadoria *</Label>
              <Select
                value={fiscalData.origem}
                onValueChange={(v) => setFiscalData({ ...fiscalData, origem: v })}
              >
                <SelectTrigger className="h-8 text-xs focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 - Nacional</SelectItem>
                  <SelectItem value="1">1 - Estrangeira (Importação direta)</SelectItem>
                  <SelectItem value="2">2 - Estrangeira (Adquirida no mercado interno)</SelectItem>
                  <SelectItem value="3">
                    3 - Nacional com conteúdo de importação &gt; 40%
                  </SelectItem>
                  <SelectItem value="4">4 - Nacional com processos produtivos básicos</SelectItem>
                  <SelectItem value="5">
                    5 - Nacional com conteúdo de importação &lt;= 40%
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ICMS & ST */}
          <Card className="border border-border">
            <CardContent className="p-3 space-y-3">
              <h5 className="text-xs font-bold text-[#005B2E] uppercase">
                ICMS & Substituição Tributária
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">CST / CSOSN ICMS</Label>
                  <Input
                    value={fiscalData.cst_icms}
                    onChange={(e) => setFiscalData({ ...fiscalData, cst_icms: e.target.value })}
                    placeholder="00 / 102"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Alíquota ICMS (%)</Label>
                  <Input
                    value={fiscalData.aliquota_icms}
                    onChange={(e) =>
                      setFiscalData({ ...fiscalData, aliquota_icms: e.target.value })
                    }
                    placeholder="18.00"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Redução Base ICMS (%)</Label>
                  <Input
                    value={fiscalData.reducao_base_icms}
                    onChange={(e) =>
                      setFiscalData({ ...fiscalData, reducao_base_icms: e.target.value })
                    }
                    placeholder="0.00"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">MVA ST (%)</Label>
                  <Input
                    value={fiscalData.mva_st}
                    onChange={(e) => setFiscalData({ ...fiscalData, mva_st: e.target.value })}
                    placeholder="0.00"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PIS / COFINS / IPI */}
          <Card className="border border-border">
            <CardContent className="p-3 space-y-3">
              <h5 className="text-xs font-bold text-[#005B2E] uppercase">PIS, COFINS e IPI</h5>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">CST PIS</Label>
                  <Input
                    value={fiscalData.cst_pis}
                    onChange={(e) => setFiscalData({ ...fiscalData, cst_pis: e.target.value })}
                    placeholder="01"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Alíq. PIS (%)</Label>
                  <Input
                    value={fiscalData.aliquota_pis}
                    onChange={(e) => setFiscalData({ ...fiscalData, aliquota_pis: e.target.value })}
                    placeholder="1.65"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">CST COFINS</Label>
                  <Input
                    value={fiscalData.cst_cofins}
                    onChange={(e) => setFiscalData({ ...fiscalData, cst_cofins: e.target.value })}
                    placeholder="01"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Alíq. COFINS (%)</Label>
                  <Input
                    value={fiscalData.aliquota_cofins}
                    onChange={(e) =>
                      setFiscalData({ ...fiscalData, aliquota_cofins: e.target.value })
                    }
                    placeholder="7.60"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">CST IPI</Label>
                  <Input
                    value={fiscalData.cst_ipi}
                    onChange={(e) => setFiscalData({ ...fiscalData, cst_ipi: e.target.value })}
                    placeholder="99"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Alíq. IPI (%)</Label>
                  <Input
                    value={fiscalData.aliquota_ipi}
                    onChange={(e) => setFiscalData({ ...fiscalData, aliquota_ipi: e.target.value })}
                    placeholder="0.00"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. CUSTOS & PREÇO DE VENDA */}
        <TabsContent value="commercial" className="space-y-4 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  Preço de Custo (R$)
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </Label>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800">
                  <Calculator className="w-3 h-3 mr-1" />
                  Sistema ({commercialData.cost_origin || 'Entrada'})
                </Badge>
              </div>
              <Input
                value={commercialData.cost_price}
                readOnly
                disabled
                className="h-9 font-medium bg-muted/50 cursor-not-allowed select-none"
              />
              <p className="text-[11px] text-muted-foreground">
                Custo médio da empresa calculado por notas de entrada ou OP.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Preço de Venda nesta Empresa (R$) *</Label>
              <Input
                value={commercialData.sale_price}
                onChange={(e) =>
                  setCommercialData({ ...commercialData, sale_price: e.target.value })
                }
                placeholder="Ex: 12.50"
                className="h-9 focus-visible:ring-[#005B2E]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Preço Mínimo Autorizado (R$)</Label>
              <Input
                value={commercialData.min_sale_price}
                onChange={(e) =>
                  setCommercialData({ ...commercialData, min_sale_price: e.target.value })
                }
                placeholder="Ex: 10.00"
                className="h-9 focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Markup (%)</Label>
              <Input
                value={commercialData.markup_percent}
                onChange={(e) =>
                  setCommercialData({ ...commercialData, markup_percent: e.target.value })
                }
                placeholder="40"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Margem de Lucro (%)</Label>
              <Input
                value={commercialData.profit_margin}
                onChange={(e) =>
                  setCommercialData({ ...commercialData, profit_margin: e.target.value })
                }
                placeholder="25"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Comissão Vendedor (%)</Label>
              <Input
                value={commercialData.commission_percent}
                onChange={(e) =>
                  setCommercialData({ ...commercialData, commission_percent: e.target.value })
                }
                placeholder="3.5"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Desconto Máximo (%)</Label>
              <Input
                value={commercialData.max_discount_percent}
                onChange={(e) =>
                  setCommercialData({ ...commercialData, max_discount_percent: e.target.value })
                }
                placeholder="10"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </TabsContent>

        {/* 3. ESTOQUE LOCAL DA EMPRESA */}
        <TabsContent value="stock" className="space-y-4 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Estoque Físico Atual</Label>
              <Input
                value={stockData.stock_current}
                onChange={(e) => setStockData({ ...stockData, stock_current: e.target.value })}
                placeholder="0"
                className="h-8 text-xs font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Estoque Mínimo</Label>
              <Input
                value={stockData.stock_min}
                onChange={(e) => setStockData({ ...stockData, stock_min: e.target.value })}
                placeholder="0"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Estoque Máximo</Label>
              <Input
                value={stockData.stock_max}
                onChange={(e) => setStockData({ ...stockData, stock_max: e.target.value })}
                placeholder="0"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Estoque de Segurança</Label>
              <Input
                value={stockData.stock_safety}
                onChange={(e) => setStockData({ ...stockData, stock_safety: e.target.value })}
                placeholder="0"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Endereço / Local no Almoxarifado</Label>
              <Input
                value={stockData.storage_location}
                onChange={(e) => setStockData({ ...stockData, storage_location: e.target.value })}
                placeholder="Ex: Galpão Central - Rua 4"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Corredor</Label>
              <Input
                value={stockData.storage_aisle}
                onChange={(e) => setStockData({ ...stockData, storage_aisle: e.target.value })}
                placeholder="Ex: C-02"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Prateleira / Nível</Label>
              <Input
                value={stockData.storage_shelf}
                onChange={(e) => setStockData({ ...stockData, storage_shelf: e.target.value })}
                placeholder="Ex: N3-P08"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Lote Atual</Label>
              <Input
                value={stockData.lot_number || ''}
                onChange={(e) => setStockData({ ...stockData, lot_number: e.target.value })}
                placeholder="Ex: LOTE-2026-A"
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Data de Validade</Label>
              <Input
                type="date"
                value={stockData.validity_date || ''}
                onChange={(e) => setStockData({ ...stockData, validity_date: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Lead Time de Reposição (dias)</Label>
              <Input
                value={stockData.lead_time_days}
                onChange={(e) => setStockData({ ...stockData, lead_time_days: e.target.value })}
                placeholder="7"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

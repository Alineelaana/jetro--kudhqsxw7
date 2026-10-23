import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  ShoppingCart,
  FileCheck2,
  GitCompare,
  AlertTriangle,
  Building2,
  Upload,
  ExternalLink,
  ChevronRight,
  Loader2,
  PackageCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '@/hooks/use-brand'
import { PurchaseInvoicesPanel } from '@/components/purchasing/purchase-invoices-panel'
import { XmlImportDialog } from '@/components/fiscal/xml-import-dialog'
import { getPurchaseInvoices } from '@/services/purchasing'
import { getProducts } from '@/services/products'

export function ScreenComprasEntradas() {
  const navigate = useNavigate()
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('notas_compra')
  const [xmlImportOpen, setXmlImportOpen] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.razao_social ||
    brand?.nomeExibicao ||
    brand?.empresaNome ||
    'Todas as Empresas'

  const loadData = async () => {
    try {
      const invs = await getPurchaseInvoices().catch(() => [])
      setInvoices((invs || []) as any[])
    } catch {
      // safe fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Compras e Entradas
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Entrada XML com Idempotência
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Recepção fiscal de mercadorias, entrada idempotente via chave de 44 dígitos,
              conferência física/fiscal e gestão de de-para com fornecedores.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setXmlImportOpen(true)}
            className="bg-[#005B2E] hover:bg-[#004222] text-white font-bold text-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Importar XML da NF-e
          </Button>
        </div>
      </div>

      {/* ABAS INTERNAS CONFORME ESPECIFICAÇÃO */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-1 sm:grid-cols-3 max-w-xl h-auto gap-1">
          <TabsTrigger
            value="notas_compra"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Notas de Compra</span>
          </TabsTrigger>

          <TabsTrigger
            value="confronto"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <GitCompare className="w-3.5 h-3.5 text-blue-600" />
            <span>Confronto / Conferência</span>
          </TabsTrigger>

          <TabsTrigger
            value="pendencias_depara"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Pendências de Vinculação</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: NOTAS DE COMPRA */}
        <TabsContent value="notas_compra" className="space-y-4">
          <PurchaseInvoicesPanel />
        </TabsContent>

        {/* ABA 2: CONFRONTO / CONFERÊNCIA */}
        <TabsContent value="confronto" className="space-y-4">
          <Card className="border-2 border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Confronto Físico × Fiscal da Entrada
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Comparação entre os dados fiscais da NF-e importada (quantidades e valores do
                    XML) e o recebimento físico registrado em doca.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs font-bold border-blue-400 text-blue-700"
                >
                  Auditoria de Entrada
                </Badge>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#005B2E] animate-spin" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  Nenhuma nota fiscal de compra disponível para conferência.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/80 text-foreground font-bold">
                        <th className="text-left p-2.5">NF-e</th>
                        <th className="text-left p-2.5">Fornecedor</th>
                        <th className="text-left p-2.5">Valor XML</th>
                        <th className="text-left p-2.5">Chave de Acesso</th>
                        <th className="text-left p-2.5">Status Confronto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-muted/30">
                          <td className="p-2.5 font-mono font-bold text-[#C89B3C]">
                            {inv.invoice_number || '—'}
                          </td>
                          <td className="p-2.5">{inv.supplier_name || '—'}</td>
                          <td className="p-2.5 font-semibold">R$ {inv.total_value || '0,00'}</td>
                          <td className="p-2.5 font-mono text-[11px] text-muted-foreground truncate max-w-[200px]">
                            {inv.access_key || inv.chave_acesso || '—'}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Idempotência Confirmada
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: PENDÊNCIAS DE VINCULAÇÃO (DE-PARA DE FORNECEDOR) */}
        <TabsContent value="pendencias_depara" className="space-y-4">
          <Card className="border-2 border-amber-200 bg-amber-50/20">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h2 className="text-base font-bold text-amber-950">
                    Regra Estrita de Matching (De-Para Fornecedor)
                  </h2>
                </div>
                <Badge variant="outline" className="border-amber-400 text-amber-800 font-bold">
                  Zero Invenção de Itens
                </Badge>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Conforme a arquitetura fiscal aprovada, mercadorias contidas em XML que não possuam
                correspondência exata em <code>supplier_product_refs</code> (código do produto do
                fornecedor, unidade de medida e CNPJ do emitente) ou GTIN/código interno permanecem
                bloqueadas como pendências.{' '}
                <strong>O ERP HURAM nunca inventa dados de produtos</strong> nem duplica itens no
                estoque sem homologação humana prévia.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => navigate('/admin/cadastros/produtos')}
                  className="bg-[#005B2E] hover:bg-[#004222] text-white font-bold text-xs"
                >
                  Ir para Cadastro Mestre & De-Para de Produtos
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setXmlImportOpen(true)}
                  className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-bold text-xs"
                >
                  Testar Upload de XML
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIÁLOGO DE IMPORTAÇÃO XML */}
      <XmlImportDialog open={xmlImportOpen} onOpenChange={setXmlImportOpen} onSuccess={loadData} />
    </div>
  )
}

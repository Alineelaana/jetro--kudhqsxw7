import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  DollarSign,
  Package,
  Wallet,
  Factory,
  Truck,
  ShoppingCart,
  Building2,
  RefreshCw,
  CalendarClock,
} from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { BiCommercial } from '@/components/bi/centers/bi-commercial'
import { BiStock } from '@/components/bi/bi-stock'
import { BiFinancial } from '@/components/bi/bi-financial'
import { BiIndustrial } from '@/components/bi/bi-industrial'
import { BiSales } from '@/components/bi/bi-sales'
import { BiGenericCenter } from '@/components/bi/centers/bi-center-configs'

export function ScreenInteligenciaPorArea() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()

  const tabParam = searchParams.get('tab')
  const validTabs = ['comercial', 'estoque', 'financeiro', 'industrial', 'logistica', 'vendas']
  const initialTab = validTabs.includes(tabParam || '') ? (tabParam as string) : 'comercial'

  const [activeTab, setActiveTab] = useState<string>(initialTab)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (val: string) => {
    setActiveTab(val)
    setSearchParams({ tab: val }, { replace: true })
  }

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Dados da área atualizados' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Inteligência por Área
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Módulos Operacionais & Gerenciais
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Aprofundamento analítico segmentado: Comercial, Estoque, Financeiro, Industrial,
              Logística e Vendas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="text-xs focus-visible:ring-[#005B2E]"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/admin/inteligencia')}
            className="text-xs bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
          >
            Central Executiva
          </Button>
        </div>
      </div>

      {/* ABAS: Comercial · Estoque · Financeiro · Industrial · Logística · Vendas */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="comercial"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5" />
            Comercial
          </TabsTrigger>
          <TabsTrigger
            value="estoque"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            Estoque
          </TabsTrigger>
          <TabsTrigger
            value="financeiro"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger
            value="industrial"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-1.5"
          >
            <Factory className="w-3.5 h-3.5" />
            Industrial
          </TabsTrigger>
          <TabsTrigger
            value="logistica"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            Logística
          </TabsTrigger>
          <TabsTrigger
            value="vendas"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Vendas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comercial" className="space-y-4">
          <BiCommercial key={`com-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="estoque" className="space-y-4">
          <BiStock key={`est-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <BiFinancial key={`fin-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="industrial" className="space-y-4">
          <BiIndustrial key={`ind-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="logistica" className="space-y-4">
          <BiGenericCenter key={`log-${refreshKey}`} centerKey="logistics-intel" />
        </TabsContent>

        <TabsContent value="vendas" className="space-y-4">
          <BiSales key={`vendas-${refreshKey}`} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

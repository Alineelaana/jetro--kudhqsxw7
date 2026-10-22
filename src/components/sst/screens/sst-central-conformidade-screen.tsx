import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { SstComplianceDashboard } from '@/components/sst/sst-compliance-dashboard'
import { SST_ENTERPRISE_SCREEN_CONFIGS } from '@/lib/sst-enterprise-types'
import {
  ShieldCheck,
  BookOpen,
  Armchair,
  Box,
  TrendingUp,
  Zap,
  Cog,
  Gauge,
  Layers,
  AlertTriangle,
  Biohazard,
  ClipboardList,
} from 'lucide-react'

export function SstCentralConformidadeScreen() {
  const nrCatalogCfg = SST_ENTERPRISE_SCREEN_CONFIGS['nr_catalog']
  const ergonomiaCfg = SST_ENTERPRISE_SCREEN_CONFIGS['ergonomics']
  const confinadoCfg = SST_ENTERPRISE_SCREEN_CONFIGS['confined_spaces']
  const alturaCfg = SST_ENTERPRISE_SCREEN_CONFIGS['height_work']
  const nr10Cfg = SST_ENTERPRISE_SCREEN_CONFIGS['nr10_electrical']
  const nr11Cfg = SST_ENTERPRISE_SCREEN_CONFIGS['nr11_material_handling']
  const nr12Cfg = SST_ENTERPRISE_SCREEN_CONFIGS['nr12_machines']
  const nr13Cfg = SST_ENTERPRISE_SCREEN_CONFIGS['nr13_boilers']
  const nr15Cfg = SST_ENTERPRISE_SCREEN_CONFIGS['nr15_insalubridade']
  const nr16Cfg = SST_ENTERPRISE_SCREEN_CONFIGS['nr16_periculosidade']
  const auditoriasCfg = SST_ENTERPRISE_SCREEN_CONFIGS['audit_checklists']

  return (
    <div className="space-y-4">
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="status"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Painel de Conformidade
          </TabsTrigger>
          <TabsTrigger
            value="catalogo"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Catálogo de NRs
          </TabsTrigger>
          <TabsTrigger
            value="ergonomia"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Armchair className="w-3.5 h-3.5 mr-1.5" /> Ergonomia (NR-17)
          </TabsTrigger>
          <TabsTrigger
            value="confinado"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Box className="w-3.5 h-3.5 mr-1.5" /> Espaço Confinado (NR-33)
          </TabsTrigger>
          <TabsTrigger
            value="altura"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Trab. em Altura (NR-35)
          </TabsTrigger>
          <TabsTrigger
            value="nr10"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" /> Eletricidade (NR-10)
          </TabsTrigger>
          <TabsTrigger
            value="nr11"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" /> Movimentação (NR-11)
          </TabsTrigger>
          <TabsTrigger
            value="nr12"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Cog className="w-3.5 h-3.5 mr-1.5" /> Máquinas (NR-12)
          </TabsTrigger>
          <TabsTrigger
            value="nr13"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Gauge className="w-3.5 h-3.5 mr-1.5" /> Caldeiras/Vasos (NR-13)
          </TabsTrigger>
          <TabsTrigger
            value="nr15"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Biohazard className="w-3.5 h-3.5 mr-1.5" /> Insalubridade (NR-15)
          </TabsTrigger>
          <TabsTrigger
            value="nr16"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Periculosidade (NR-16)
          </TabsTrigger>
          <TabsTrigger
            value="auditorias"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <ClipboardList className="w-3.5 h-3.5 mr-1.5" /> Auditorias SST
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-4">
          <SstComplianceDashboard />
        </TabsContent>

        <TabsContent value="catalogo" className="mt-4">
          {nrCatalogCfg && <RhGenericScreen config={nrCatalogCfg} />}
        </TabsContent>

        <TabsContent value="ergonomia" className="mt-4">
          {ergonomiaCfg && <RhGenericScreen config={ergonomiaCfg} />}
        </TabsContent>

        <TabsContent value="confinado" className="mt-4">
          {confinadoCfg && <RhGenericScreen config={confinadoCfg} />}
        </TabsContent>

        <TabsContent value="altura" className="mt-4">
          {alturaCfg && <RhGenericScreen config={alturaCfg} />}
        </TabsContent>

        <TabsContent value="nr10" className="mt-4">
          {nr10Cfg && <RhGenericScreen config={nr10Cfg} />}
        </TabsContent>

        <TabsContent value="nr11" className="mt-4">
          {nr11Cfg && <RhGenericScreen config={nr11Cfg} />}
        </TabsContent>

        <TabsContent value="nr12" className="mt-4">
          {nr12Cfg && <RhGenericScreen config={nr12Cfg} />}
        </TabsContent>

        <TabsContent value="nr13" className="mt-4">
          {nr13Cfg && <RhGenericScreen config={nr13Cfg} />}
        </TabsContent>

        <TabsContent value="nr15" className="mt-4">
          {nr15Cfg && <RhGenericScreen config={nr15Cfg} />}
        </TabsContent>

        <TabsContent value="nr16" className="mt-4">
          {nr16Cfg && <RhGenericScreen config={nr16Cfg} />}
        </TabsContent>

        <TabsContent value="auditorias" className="mt-4">
          {auditoriasCfg && <RhGenericScreen config={auditoriasCfg} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}

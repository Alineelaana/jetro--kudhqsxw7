import { SstCockpit } from '@/components/sst/sst-cockpit'
import { SstDashboard } from '@/components/sst/sst-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutDashboard, BarChart3 } from 'lucide-react'

export function SstPainelScreen() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="cockpit" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="cockpit"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> Cockpit Executivo SST
          </TabsTrigger>
          <TabsTrigger
            value="indicadores"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Indicadores & Taxa de Frequência /
            Gravidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cockpit" className="mt-4">
          <SstCockpit />
        </TabsContent>

        <TabsContent value="indicadores" className="mt-4">
          <SstDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

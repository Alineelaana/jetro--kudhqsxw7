import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PromotionPanel } from '@/components/promotions/promotion-panel'
import { PromotionSimulator } from '@/components/promotions/promotion-simulator'

export default function PromotionsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-2xl font-black text-[#005B2E] mb-4">Motor Central de Promoções</h1>
      <Tabs defaultValue="promotions">
        <TabsList>
          <TabsTrigger value="promotions">Promoções</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
        </TabsList>
        <TabsContent value="promotions" className="mt-4">
          <PromotionPanel />
        </TabsContent>
        <TabsContent value="simulator" className="mt-4">
          <PromotionSimulator />
        </TabsContent>
      </Tabs>
    </div>
  )
}

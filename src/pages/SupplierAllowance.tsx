import { useState, useEffect } from 'react'
import { SaLayout } from '@/components/supplier-allowance/sa-layout'
import { SaAgreements } from '@/components/supplier-allowance/sa-agreements'
import { SaAccounts } from '@/components/supplier-allowance/sa-accounts'
import { SaMovements } from '@/components/supplier-allowance/sa-movements'
import { SaAccruals } from '@/components/supplier-allowance/sa-accruals'
import { SaAppropriations } from '@/components/supplier-allowance/sa-appropriations'
import { SaConsumptions } from '@/components/supplier-allowance/sa-consumptions'
import { SaSettlements } from '@/components/supplier-allowance/sa-settlements'
import { SaCockpit } from '@/components/supplier-allowance/sa-cockpit'
import { SA_TABS } from '@/lib/supplier-allowance-types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Bot, FileText, Settings } from 'lucide-react'

function PlaceholderTab({
  icon: Icon,
  title,
  message,
}: {
  icon: any
  title: string
  message: string
}) {
  return (
    <Card className="border-2 border-dashed border-[#005B2E]/30">
      <CardContent className="py-16 text-center">
        <Icon className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#005B2E]">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{message}</p>
      </CardContent>
    </Card>
  )
}

const SCREEN_TO_TAB: Record<string, string> = {
  cockpit: 'cockpit',
  acordos: 'agreements',
  'conta-corrente': 'accounts',
  movimentacoes: 'movements',
  apuracoes: 'accruals',
  apropriacoes: 'appropriations',
  consumos: 'consumptions',
  liquidacoes: 'settlements',
  relatorios: 'reports',
  configuracoes: 'configuracoes',
}

interface SupplierAllowancePageProps {
  screen?: string
}

export default function SupplierAllowance({ screen = 'cockpit' }: SupplierAllowancePageProps) {
  const [tab, setTab] = useState(SCREEN_TO_TAB[screen] || 'cockpit')

  useEffect(() => {
    setTab(SCREEN_TO_TAB[screen] || 'cockpit')
  }, [screen])

  return (
    <SaLayout title="Verbas de Fornecedores">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-[#005B2E]/10 p-1">
          {SA_TABS.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="data-[state=active]:bg-[#005B2E] data-[state=active]:text-white text-xs"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="agreements" className="mt-4">
          <SaAgreements />
        </TabsContent>
        <TabsContent value="accounts" className="mt-4">
          <SaAccounts />
        </TabsContent>
        <TabsContent value="movements" className="mt-4">
          <SaMovements />
        </TabsContent>
        <TabsContent value="accruals" className="mt-4">
          <SaAccruals />
        </TabsContent>
        <TabsContent value="appropriations" className="mt-4">
          <SaAppropriations />
        </TabsContent>
        <TabsContent value="consumptions" className="mt-4">
          <SaConsumptions />
        </TabsContent>
        <TabsContent value="settlements" className="mt-4">
          <SaSettlements />
        </TabsContent>
        <TabsContent value="cockpit" className="mt-4">
          <SaCockpit />
        </TabsContent>
        <TabsContent value="adapta" className="mt-4">
          <PlaceholderTab
            icon={Bot}
            title="ADAPTA Verbas de Fornecedores"
            message="A inteligência do agente ADAPTA será implementada no Épico 4. Nesta fase, apenas os pontos de integração estão disponíveis."
          />
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
          <PlaceholderTab
            icon={FileText}
            title="Relatórios"
            message="A geração de documentos utiliza exclusivamente o Corporate Document Engine, mantendo o padrão institucional da plataforma."
          />
        </TabsContent>
        <TabsContent value="configuracoes" className="mt-4">
          <PlaceholderTab
            icon={Settings}
            title="Configurações"
            message="Configurações do módulo de Verbas de Fornecedores — parâmetros de apuração, liquidação e integrações."
          />
        </TabsContent>
      </Tabs>
    </SaLayout>
  )
}

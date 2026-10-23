import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Users, FolderTree, LineChart, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { CadastroStandardScreen } from '@/components/cadastros/cadastro-standard-screen'
import { InserirClientesScreen } from '@/components/vendas/inserir-clientes-screen'

export function ScreenClientes() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('cadastro')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Clientes Comerciais
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Módulo Comercial
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gestão de carteira de clientes, inserção rápida, segmentação em grupos e inteligência
              de relacionamento comercial.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-3 max-w-lg h-auto gap-1">
          <TabsTrigger
            value="cadastro"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Cadastro & Carteira</span>
          </TabsTrigger>
          <TabsTrigger value="inserir" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-blue-600" />
            <span>Inserção de Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="analise" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <LineChart className="w-3.5 h-3.5 text-purple-600" />
            <span>Análise de Clientes</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: CADASTRO COMPLETO (reutiliza motor padrão de cadastro de parceiros/clientes) */}
        <TabsContent value="cadastro" className="space-y-4">
          <CadastroStandardScreen configKey="clientes" />
        </TabsContent>

        {/* ABA 2: INSERÇÃO RÁPIDA DE CLIENTES */}
        <TabsContent value="inserir" className="space-y-4">
          <InserirClientesScreen />
        </TabsContent>

        {/* ABA 3: ANÁLISE DE CLIENTES */}
        <TabsContent value="analise" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-foreground">
                  Inteligência e Perfil de Compra
                </h3>
                <Badge
                  variant="outline"
                  className="text-xs text-purple-700 bg-purple-50 border-purple-200"
                >
                  Curva ABC & Recência
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-slate-50/50">
                  <span className="text-xs text-muted-foreground block">
                    Clientes com Compra no Mês
                  </span>
                  <span className="text-2xl font-black text-[#005B2E] block mt-1">84.2%</span>
                  <span className="text-[11px] text-muted-foreground">
                    Positivação da carteira ativa
                  </span>
                </div>
                <div className="p-4 rounded-xl border bg-slate-50/50">
                  <span className="text-xs text-muted-foreground block">
                    Ticket Médio por Cliente
                  </span>
                  <span className="text-2xl font-black text-blue-700 block mt-1">R$ 4.890,00</span>
                  <span className="text-[11px] text-muted-foreground">
                    Últimos 90 dias faturados
                  </span>
                </div>
                <div className="p-4 rounded-xl border bg-slate-50/50">
                  <span className="text-xs text-muted-foreground block">
                    Clientes em Risco de Churn
                  </span>
                  <span className="text-2xl font-black text-amber-700 block mt-1">12</span>
                  <span className="text-[11px] text-muted-foreground">
                    Sem pedido há mais de 45 dias
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

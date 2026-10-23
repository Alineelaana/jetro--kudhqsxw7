import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Handshake, FileSignature, Wallet, Tag, Calculator, Receipt, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { SaAgreements } from '@/components/supplier-allowance/sa-agreements'
import { SaAccounts } from '@/components/supplier-allowance/sa-accounts'
import { SaAppropriations } from '@/components/supplier-allowance/sa-appropriations'
import { SaAccruals } from '@/components/supplier-allowance/sa-accruals'
import { SaSettlements } from '@/components/supplier-allowance/sa-settlements'

export function ScreenVerbasFornecedor() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState<
    'acordos' | 'contacorrente' | 'aplicacao' | 'apuracoes' | 'prestacao'
  >('acordos')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Verbas de Fornecedor
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Origem Única • Corporate Ledger
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gestão de acordos e contratos de verba, conta-corrente por fornecedor, aplicação em
              produtos para subsídio promocional, apurações automáticas e liquidação/prestação de
              contas.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS */}
      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-5 max-w-3xl h-auto gap-1">
          <TabsTrigger value="acordos" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <FileSignature className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Gestão de Acordos</span>
          </TabsTrigger>
          <TabsTrigger
            value="contacorrente"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5 text-blue-600" />
            <span>Conta Corrente</span>
          </TabsTrigger>
          <TabsTrigger
            value="aplicacao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span>Aplicação em Produtos</span>
          </TabsTrigger>
          <TabsTrigger
            value="apuracoes"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5 text-purple-600" />
            <span>Apurações</span>
          </TabsTrigger>
          <TabsTrigger
            value="prestacao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>Prestação / Liquidação</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: ACORDOS */}
        <TabsContent value="acordos" className="space-y-4">
          <SaAgreements />
        </TabsContent>

        {/* ABA 2: CONTA CORRENTE */}
        <TabsContent value="contacorrente" className="space-y-4">
          <SaAccounts />
        </TabsContent>

        {/* ABA 3: APLICAÇÃO EM PRODUTOS */}
        <TabsContent value="aplicacao" className="space-y-4">
          <SaAppropriations />
        </TabsContent>

        {/* ABA 4: APURAÇÕES */}
        <TabsContent value="apuracoes" className="space-y-4">
          <SaAccruals />
        </TabsContent>

        {/* ABA 5: PRESTAÇÃO DE CONTAS / LIQUIDAÇÃO */}
        <TabsContent value="prestacao" className="space-y-4">
          <SaSettlements />
        </TabsContent>
      </Tabs>
    </div>
  )
}

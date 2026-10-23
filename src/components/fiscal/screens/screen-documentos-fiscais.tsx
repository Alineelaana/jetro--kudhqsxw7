import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  FileText,
  FileCheck,
  Send,
  Building2,
  Receipt,
  Truck,
  RotateCcw,
  Ban,
  Upload,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { NfePanel } from '@/components/sales/nfe-panel'
import { NfcePanel } from '@/components/sales/nfce-panel'
import { NfsePanel } from '@/components/fiscal/nfse-panel'
import { CtePanel, MdfePanel } from '@/components/fiscal/cte-mdfe-panel'
import { CartaCorrecao } from '@/components/fiscal/carta-correcao'
import { ManifestacaoDestinatario } from '@/components/fiscal/manifestacao'
import { FiscalGenericScreen } from '@/components/fiscal/fiscal-generic-screen'
import { PurchaseInvoicesPanel } from '@/components/purchasing/purchase-invoices-panel'
import { INUT_FIELDS, type FiscalScreenConfig } from '@/lib/fiscal-types'

const INUT_SCREEN: FiscalScreenConfig = {
  collection: 'fiscal_inutilizations',
  title: 'Inutilização de Numeração',
  nameLabel: 'Tipo Doc',
  statusField: 'status',
  fields: INUT_FIELDS,
}

export function ScreenDocumentosFiscais() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('nfe_emitidas')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.razao_social ||
    brand?.nomeExibicao ||
    brand?.empresaNome ||
    'Todas as Empresas'

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Documentos Fiscais
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Emissão & Recepção Eletrônica
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gestão centralizada de NF-e (modelo 55), entrada via XML, NFC-e, NFS-e, CT-e, MDF-e,
              Carta de Correção e Inutilização de Faixa.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS INTERNAS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 h-auto gap-1">
          <TabsTrigger
            value="nfe_emitidas"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>NF-e Emitidas</span>
          </TabsTrigger>

          <TabsTrigger
            value="nfe_entrada_xml"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>NF-e Entrada / XML</span>
          </TabsTrigger>

          <TabsTrigger value="nfce" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>NFC-e</span>
          </TabsTrigger>

          <TabsTrigger value="nfse" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>NFS-e</span>
          </TabsTrigger>

          <TabsTrigger
            value="cte_mdfe"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            <span>CT-e / MDF-e</span>
          </TabsTrigger>

          <TabsTrigger
            value="correcao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
            <span>Carta de Correção</span>
          </TabsTrigger>

          <TabsTrigger
            value="inutilizacao_manifestacao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Ban className="w-3.5 h-3.5 text-rose-600" />
            <span>Inutilização & Manifestação</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: NF-E EMITIDAS */}
        <TabsContent value="nfe_emitidas" className="space-y-4">
          <NfePanel />
        </TabsContent>

        {/* ABA 2: NF-E ENTRADA / XML */}
        <TabsContent value="nfe_entrada_xml" className="space-y-4">
          <PurchaseInvoicesPanel />
        </TabsContent>

        {/* ABA 3: NFC-E */}
        <TabsContent value="nfce" className="space-y-4">
          <NfcePanel />
        </TabsContent>

        {/* ABA 4: NFS-E */}
        <TabsContent value="nfse" className="space-y-4">
          <NfsePanel />
        </TabsContent>

        {/* ABA 5: CT-E / MDF-E */}
        <TabsContent value="cte_mdfe" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Truck className="w-4 h-4 text-[#005B2E]" />
              <h2 className="text-base font-bold text-foreground">
                Conhecimento de Transporte Eletrônico (CT-e)
              </h2>
            </div>
            <CtePanel />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 border-b pb-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-foreground">
                Manifesto Eletrônico de Documentos Fiscais (MDF-e)
              </h2>
            </div>
            <MdfePanel />
          </div>
        </TabsContent>

        {/* ABA 6: CARTA DE CORREÇÃO */}
        <TabsContent value="correcao" className="space-y-4">
          <CartaCorrecao />
        </TabsContent>

        {/* ABA 7: INUTILIZAÇÃO E MANIFESTAÇÃO */}
        <TabsContent value="inutilizacao_manifestacao" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Ban className="w-4 h-4 text-rose-600" />
              <h2 className="text-base font-bold text-foreground">
                Inutilização de Faixa de Numeração
              </h2>
            </div>
            <FiscalGenericScreen config={INUT_SCREEN} />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 border-b pb-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-foreground">Manifestação do Destinatário</h2>
            </div>
            <ManifestacaoDestinatario />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

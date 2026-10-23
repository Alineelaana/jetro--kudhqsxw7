import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  KeyRound,
  ShieldAlert,
  Building2,
  Sliders,
  Hash,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { FiscalGenericScreen } from '@/components/fiscal/fiscal-generic-screen'
import { CERTIFICATE_FIELDS, type FiscalScreenConfig } from '@/lib/fiscal-types'

const CERT_SCREEN: FiscalScreenConfig = {
  collection: 'fiscal_certificates',
  title: 'Certificado Digital A1',
  nameLabel: 'Titular',
  statusField: 'situacao',
  fields: CERTIFICATE_FIELDS,
}

const FISCAL_CONFIG_SCREEN: FiscalScreenConfig = {
  collection: 'fiscal_configurations',
  title: 'Parâmetros por Empresa',
  nameLabel: 'Empresa',
  fields: [
    { name: 'company', label: 'Empresa', type: 'text', required: true },
    { name: 'regime_tributario', label: 'Regime Tributário', type: 'text' },
    { name: 'crt', label: 'CRT', type: 'text' },
    { name: 'inscricao_estadual', label: 'Insc. Estadual', type: 'text' },
    { name: 'inscricao_municipal', label: 'Insc. Municipal', type: 'text' },
    { name: 'ambiente', label: 'Ambiente', type: 'select', options: ['homologacao', 'producao'] },
    { name: 'serie_nfe', label: 'Série NF-e', type: 'text' },
    { name: 'serie_nfce', label: 'Série NFC-e', type: 'text' },
    { name: 'vigencia_inicial', label: 'Vigência Inicial', type: 'date' },
  ],
}

const NUMERATION_CONFIG: FiscalScreenConfig = {
  collection: 'system_configurations',
  title: 'Séries e Numeração',
  nameLabel: 'Descrição',
  statusField: 'status',
  fields: [
    { name: 'chave', label: 'Chave / Série', type: 'text', required: true },
    { name: 'valor', label: 'Último Número Usado', type: 'text', required: true },
    { name: 'descricao', label: 'Tipo de Documento (NF-e, NFC-e, etc)', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: ['ativo', 'inativo'] },
  ],
}

export function ScreenCertificadosConfiguracoes() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('certificados')

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
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Certificados e Configurações
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Segurança Fiscal & Conectividade
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gestão de certificados digitais padrão ICP-Brasil (A1), parâmetros fiscais por empresa
              e controle sequencial de séries e numeração.
            </p>
          </div>
        </div>
      </div>

      {/* BOX DE DECLARAÇÃO EXPLÍCITA DE PENDÊNCIAS EXTERNAS */}
      <Card className="border-2 border-amber-300 bg-amber-50/50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Declaração Explícita de Pendências Externas (SEFAZ & Certificado A1)
            </h2>
            <p className="text-xs text-amber-800 leading-relaxed">
              A arquitetura fiscal do ERP HURAM gera o XML modelo 55 no layout oficial 4.00, calcula
              tributos com precisão decimal e opera em <strong>Ambiente de Homologação</strong>. A
              transmissão em tempo real para a SEFAZ de produção depende exclusivamente das
              seguintes pendências externas:
            </p>
            <ul className="text-xs text-amber-800 list-disc list-inside space-y-0.5 pt-1">
              <li>
                <strong>Certificado Digital A1 (.pfx):</strong> Aquisição de certificado e-CNPJ
                ICP-Brasil válido da empresa emitente.
              </li>
              <li>
                <strong>Credenciamento SEFAZ:</strong> Homologação e liberação formal do CNPJ
                emissor junto à Secretaria da Fazenda Estadual (ES / SP).
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* ABAS INTERNAS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-1 sm:grid-cols-3 max-w-xl h-auto gap-1">
          <TabsTrigger
            value="certificados"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Certificado Digital A1</span>
          </TabsTrigger>

          <TabsTrigger
            value="parametros"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Parâmetros por Empresa</span>
          </TabsTrigger>

          <TabsTrigger
            value="numeracao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Hash className="w-3.5 h-3.5 text-amber-600" />
            <span>Séries e Numeração</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: CERTIFICADO DIGITAL A1 */}
        <TabsContent value="certificados" className="space-y-4">
          <FiscalGenericScreen config={CERT_SCREEN} />
        </TabsContent>

        {/* ABA 2: PARÂMETROS POR EMPRESA */}
        <TabsContent value="parametros" className="space-y-4">
          <FiscalGenericScreen config={FISCAL_CONFIG_SCREEN} />
        </TabsContent>

        {/* ABA 3: SÉRIES E NUMERAÇÃO */}
        <TabsContent value="numeracao" className="space-y-4">
          <FiscalGenericScreen config={NUMERATION_CONFIG} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

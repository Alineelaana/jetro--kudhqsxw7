import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BookOpen, FileSpreadsheet, Calculator, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { ApuracaoPanel } from '@/components/fiscal/apuracao-panel'
import { FiscalGenericScreen } from '@/components/fiscal/fiscal-generic-screen'
import { type FiscalScreenConfig } from '@/lib/fiscal-types'

const SPED_CONFIG: FiscalScreenConfig = {
  collection: 'sped_records',
  title: 'SPED Fiscal & Contribuições',
  nameLabel: 'Período',
  statusField: 'status',
  statusOptions: ['Gerado', 'Validado', 'Inconsistente', 'Corrigido', 'Transmitido', 'Retificado'],
  fields: [
    { name: 'periodo', label: 'Período', type: 'text', required: true },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: ['EFD_ICMS_IPI', 'EFD_Contribuicoes', 'ECD', 'ECF', 'Reinf', 'Outros'],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['Gerado', 'Validado', 'Inconsistente', 'Corrigido', 'Transmitido', 'Retificado'],
    },
    { name: 'recibo', label: 'Recibo', type: 'text' },
    { name: 'data_transmissao', label: 'Data Transmissão', type: 'date' },
    { name: 'versao', label: 'Versão', type: 'text' },
  ],
}

const LIVROS_CONFIG: FiscalScreenConfig = {
  collection: 'fiscal_books',
  title: 'Livro Fiscal',
  nameLabel: 'Período',
  statusField: 'tipo_livro',
  fields: [
    { name: 'periodo', label: 'Período', type: 'text', required: true },
    {
      name: 'tipo_livro',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: [
        'Entradas',
        'Saidas',
        'Apuracao_ICMS',
        'Apuracao_IPI',
        'Servicos_Prestados',
        'Servicos_Tomados',
        'CBS',
        'IBS',
        'Imposto_Seletivo',
        'Outros',
      ],
    },
    { name: 'total_debitos', label: 'Total Débitos', type: 'text' },
    { name: 'total_creditos', label: 'Total Créditos', type: 'text' },
    { name: 'saldo', label: 'Saldo', type: 'text' },
  ],
}

export function ScreenEscrituracaoObrigacoes() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('sped')

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
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Escrituração e Obrigações
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Conformidade Fiscal & SPED
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Geração de arquivos SPED (EFD ICMS/IPI e Contribuições), controle de livros fiscais de
              entradas/saídas e apuração periódica de impostos.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS INTERNAS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-1 sm:grid-cols-3 max-w-xl h-auto gap-1">
          <TabsTrigger value="sped" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>SPED</span>
          </TabsTrigger>

          <TabsTrigger value="livros" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Livros Fiscais</span>
          </TabsTrigger>

          <TabsTrigger
            value="apuracao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-600" />
            <span>Apuração de Impostos</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: SPED */}
        <TabsContent value="sped" className="space-y-4">
          <FiscalGenericScreen config={SPED_CONFIG} />
        </TabsContent>

        {/* ABA 2: LIVROS FISCAIS */}
        <TabsContent value="livros" className="space-y-4">
          <FiscalGenericScreen config={LIVROS_CONFIG} />
        </TabsContent>

        {/* ABA 3: APURAÇÃO DE IMPOSTOS */}
        <TabsContent value="apuracao" className="space-y-4">
          <ApuracaoPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { SstPpp } from '@/components/sst/sst-ppp'
import { SstEsocialMonitor } from '@/components/sst/sst-esocial-monitor'
import { SstObligationsCalendar } from '@/components/sst/sst-obligations-calendar'
import { SST_SCREEN_CONFIGS } from '@/lib/sst-types'
import { SST_ENTERPRISE_SCREEN_CONFIGS } from '@/lib/sst-enterprise-types'
import { FileText, FileCheck2, FolderArchive, SendHorizontal, CalendarDays } from 'lucide-react'

export function SstDocumentosObrigacoesScreen() {
  const ltcatCfg = SST_ENTERPRISE_SCREEN_CONFIGS['ltcat'] || {
    collection: 'sst_ltcat',
    title: 'LTCAT — Laudo Técnico das Condições Ambientais do Trabalho',
    fields: [
      { name: 'documento_numero', label: 'Nº do Laudo / Versão', type: 'text', required: true },
      { name: 'empresa', label: 'Empresa', type: 'text', required: true },
      { name: 'filial', label: 'Filial / Estabelecimento', type: 'text' },
      {
        name: 'engenheiro_responsavel',
        label: 'Engenheiro de Segurança / CRM/CREA',
        type: 'text',
        required: true,
      },
      { name: 'data_elaboracao', label: 'Data Elaboração', type: 'date', required: true },
      { name: 'data_validade', label: 'Validade / Revisão', type: 'date' },
      {
        name: 'conclusao_aposentadoria_especial',
        label: 'Conclusão Aposentadoria Especial',
        type: 'textarea',
        span: 2,
      },
    ],
    statusField: 'situacao',
    statusOptions: ['Vigente', 'Em Revisão', 'Vencido', 'Arquivado'],
  }

  const technicalDocsCfg = SST_SCREEN_CONFIGS['documents'] || {
    collection: 'sst_documents',
    title: 'Documentos Técnicos e Laudos SST',
    fields: [
      { name: 'titulo', label: 'Título do Documento', type: 'text', required: true },
      {
        name: 'categoria',
        label: 'Categoria (PGR, PCMSO, Laudo Ergonômico, ART, Laudo Elétrico)',
        type: 'text',
        required: true,
      },
      { name: 'versao', label: 'Versão', type: 'text' },
      { name: 'responsavel', label: 'Responsável Técnico', type: 'text' },
      { name: 'data_revisao', label: 'Data de Revisão', type: 'date' },
    ],
    statusField: 'situacao',
    statusOptions: ['Ativo', 'Em Revisão', 'Vencido', 'Arquivado'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="ppp" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="ppp"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" /> PPP
          </TabsTrigger>
          <TabsTrigger
            value="ltcat"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <FileCheck2 className="w-3.5 h-3.5 mr-1.5" /> LTCAT
          </TabsTrigger>
          <TabsTrigger
            value="documentos"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <FolderArchive className="w-3.5 h-3.5 mr-1.5" /> Documentos Técnicos
          </TabsTrigger>
          <TabsTrigger
            value="esocial"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <SendHorizontal className="w-3.5 h-3.5 mr-1.5" /> Monitor eSocial SST
          </TabsTrigger>
          <TabsTrigger
            value="calendario"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Calendário de Obrigações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ppp" className="mt-4">
          <SstPpp />
        </TabsContent>

        <TabsContent value="ltcat" className="mt-4">
          <RhGenericScreen config={ltcatCfg} />
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <RhGenericScreen config={technicalDocsCfg} />
        </TabsContent>

        <TabsContent value="esocial" className="mt-4">
          <SstEsocialMonitor />
        </TabsContent>

        <TabsContent value="calendario" className="mt-4">
          <SstObligationsCalendar />
        </TabsContent>
      </Tabs>
    </div>
  )
}

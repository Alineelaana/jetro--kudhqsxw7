import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhTimeControl } from '@/components/rh/rh-time-control'
import { DpBankHoursLedger } from '@/components/dp/dp-bank-hours-ledger'
import { DpHorasExtras } from '@/components/dp/dp-horas-extras'
import { DpGenericScreen } from '@/components/dp/dp-generic-screen'
import { DP_SCREEN_CONFIGS } from '@/lib/dp-types'
import { Clock, CalendarRange, CheckSquare, PlusCircle, Scale } from 'lucide-react'

export function DpJornadaPontoScreen() {
  const jornadasCfg = DP_SCREEN_CONFIGS['work_schedules'] || {
    collection: 'dp_work_schedules',
    title: 'Modelos de Jornada',
    fields: [
      { name: 'nome', label: 'Nome da Jornada', type: 'text', required: true },
      { name: 'carga_semanal', label: 'Carga Semanal (horas)', type: 'text' },
      { name: 'tipo', label: 'Tipo (CLT, Estágio, Turno)', type: 'text' },
      { name: 'horario_entrada', label: 'Entrada Padrão', type: 'text' },
      { name: 'intervalo', label: 'Intervalo', type: 'text' },
      { name: 'horario_saida', label: 'Saída Padrão', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Ativa', 'Inativa'],
  }

  const escalasCfg = DP_SCREEN_CONFIGS['escalas'] || {
    collection: 'dp_escalas',
    title: 'Escalas de Trabalho',
    fields: [
      { name: 'nome', label: 'Nome da Escala (ex: 12x36, 5x2)', type: 'text', required: true },
      { name: 'descricao', label: 'Descrição / Ciclo', type: 'textarea', span: 2 },
      { name: 'tipo', label: 'Tipo', type: 'text' },
      { name: 'departamento', label: 'Departamento Aplicado', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: ['Ativa', 'Inativa', 'Em Revisão'],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="ponto" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="jornadas"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" /> Jornadas
          </TabsTrigger>
          <TabsTrigger
            value="escalas"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <CalendarRange className="w-3.5 h-3.5 mr-1.5" /> Escalas
          </TabsTrigger>
          <TabsTrigger
            value="ponto"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <CheckSquare className="w-3.5 h-3.5 mr-1.5" /> Ponto
          </TabsTrigger>
          <TabsTrigger
            value="horas_extras"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Horas Extras
          </TabsTrigger>
          <TabsTrigger
            value="banco_horas"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Scale className="w-3.5 h-3.5 mr-1.5" /> Banco de Horas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jornadas" className="mt-4">
          <DpGenericScreen config={jornadasCfg} />
        </TabsContent>

        <TabsContent value="escalas" className="mt-4">
          <DpGenericScreen config={escalasCfg} />
        </TabsContent>

        <TabsContent value="ponto" className="mt-4">
          <RhTimeControl />
        </TabsContent>

        <TabsContent value="horas_extras" className="mt-4">
          <DpHorasExtras />
        </TabsContent>

        <TabsContent value="banco_horas" className="mt-4">
          <DpBankHoursLedger />
        </TabsContent>
      </Tabs>
    </div>
  )
}

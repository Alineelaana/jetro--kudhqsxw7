import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { RH_SCREEN_CONFIGS, APPROVAL_STATUS } from '@/lib/rh-types'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'

export function RhAprovacoesScreen() {
  const approvalsCfg = RH_SCREEN_CONFIGS['approvals'] || {
    collection: 'rh_approvals',
    title: 'Fila Única de Aprovações RH',
    nameLabel: 'Solicitação',
    statusField: 'situacao',
    statusOptions: [...APPROVAL_STATUS],
    fields: [
      { name: 'tipo_solicitacao', label: 'Tipo', type: 'text', required: true },
      { name: 'employee_name', label: 'Colaborador', type: 'text' },
      { name: 'solicitante', label: 'Solicitante', type: 'text' },
      { name: 'aprovador', label: 'Aprovador Responsável', type: 'text' },
      { name: 'data_hora', label: 'Data/Hora', type: 'date' },
      { name: 'valor_anterior', label: 'Valor / Cargo Anterior', type: 'text' },
      { name: 'valor_novo', label: 'Novo Valor / Cargo Proposto', type: 'text' },
      { name: 'justificativa', label: 'Justificativa da Solicitação', type: 'textarea', span: 2 },
    ],
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-600" />
            <div>
              <p className="text-xs text-muted-foreground">Fila de Aprovações</p>
              <p className="text-sm font-bold text-foreground">Fluxo Centralizado RH</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-xs text-muted-foreground">Alçadas Definidas</p>
              <p className="text-sm font-bold text-foreground">Governança & SLA</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Rastreabilidade</p>
              <p className="text-sm font-bold text-foreground">Auditoria Integrada</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <RhGenericScreen config={approvalsCfg} />
    </div>
  )
}

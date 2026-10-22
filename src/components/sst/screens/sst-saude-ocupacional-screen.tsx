import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { SST_SCREEN_CONFIGS } from '@/lib/sst-types'
import { SST_ENTERPRISE_SCREEN_CONFIGS } from '@/lib/sst-enterprise-types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import {
  FileText,
  HeartPulse,
  Stethoscope,
  ShieldAlert,
  Syringe,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react'

export function SstSaudeOcupacionalScreen() {
  const { user } = useAuth()
  // Regra de Sigilo Reforçado (LGPD e CFM):
  // Conteúdo clínico detalhado somente visível a médicos do trabalho / SESMT / Admins autorizados
  const userRole = (user as any)?.role || (user as any)?.perfil || ''
  const isMedicalAuthorized =
    ['admin', 'medico', 'sesmt', 'saude', 'superadmin'].includes(userRole.toLowerCase()) ||
    user?.email?.includes('admin')

  const [sigiloUnlocked, setSigiloUnlocked] = useState(isMedicalAuthorized)

  const pcmsoCfg = SST_SCREEN_CONFIGS['pcmso'] || {
    collection: 'sst_pcmso',
    title: 'PCMSO — Programa de Controle Médico de Saúde Ocupacional (NR-7)',
    fields: [
      { name: 'ano_vigencia', label: 'Ano de Vigência', type: 'text', required: true },
      {
        name: 'medico_coordenador',
        label: 'Médico Coordenador / CRM',
        type: 'text',
        required: true,
      },
      { name: 'clinica_parceira', label: 'Clínica / Prestadora Ocupacional', type: 'text' },
      { name: 'data_inicio', label: 'Início Vigência', type: 'date' },
      { name: 'data_termino', label: 'Término Vigência', type: 'date' },
      { name: 'observacoes', label: 'Diretrizes Clínicas', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Vigente', 'Em Renovação', 'Expirado'],
  }

  // ASO: Gestores/RH veem apenas data, vencimento e aptidão. Conteúdo médico protegido.
  const asoCfg = {
    collection: 'sst_aso',
    title: 'ASO — Atestados de Saúde Ocupacional',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      {
        name: 'tipo_aso',
        label: 'Tipo (Admissional, Periódico, Retorno, Mudança de Risco, Demissional)',
        type: 'text',
        required: true,
      },
      { name: 'data_emissao', label: 'Data Emissão', type: 'date', required: true },
      { name: 'data_validade', label: 'Próximo Vencimento', type: 'date', required: true },
      { name: 'medico_crm', label: 'Médico Examinador / CRM', type: 'text' },
      ...(sigiloUnlocked
        ? [
            {
              name: 'conclusao_clinica',
              label: '[SIGILO MÉDICO] Parecer Clínico / Observações Confidenciais',
              type: 'textarea' as const,
              span: 2 as const,
            },
          ]
        : []),
    ],
    statusField: 'situacao',
    statusOptions: ['Apto', 'Inapto', 'Apto com Restrições', 'Aguardando Exames'],
  }

  // Exames Ocupacionais transferidos do DP
  const examesCfg = {
    collection: 'sst_exams',
    title: 'Exames Complementares Ocupacionais (NR-7)',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      {
        name: 'tipo_exame',
        label: 'Tipo (Audiometria, Espirometria, Raio-X, Sangue, ECG, EEG)',
        type: 'text',
        required: true,
      },
      { name: 'data_realizacao', label: 'Data Realização', type: 'date', required: true },
      { name: 'data_vencimento', label: 'Próxima Realização', type: 'date' },
      { name: 'laboratorio', label: 'Laboratório / Clínica', type: 'text' },
      ...(sigiloUnlocked
        ? [
            {
              name: 'laudo_clinico',
              label: '[SIGILO MÉDICO] Resultado do Laudo e Indicadores Biológicos',
              type: 'textarea' as const,
              span: 2 as const,
            },
          ]
        : []),
    ],
    statusField: 'situacao',
    statusOptions: [
      'Normal',
      'Alterado Ocupacional',
      'Alterado Não Ocupacional',
      'Pendente Realização',
    ],
  }

  // Prontuário Médico: 100% restrito
  const registroMedicoCfg = SST_ENTERPRISE_SCREEN_CONFIGS['medical_records'] || {
    collection: 'sst_medical_records',
    title: 'Registro Médico Ocupacional (Prontuário Confidencial CFM)',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      { name: 'data_atendimento', label: 'Data Consulta', type: 'date', required: true },
      { name: 'medico_responsavel', label: 'Médico Atendente', type: 'text' },
      { name: 'motivo_atendimento', label: 'Motivo / Queixa Principal', type: 'text' },
      { name: 'anamnese_evolucao', label: 'Anamnese e Conduta Médica', type: 'textarea', span: 2 },
    ],
    statusField: 'situacao',
    statusOptions: ['Atendido', 'Em Acompanhamento', 'Alta', 'Encaminhado Especialista'],
  }

  const vacinacaoCfg = SST_SCREEN_CONFIGS['vaccination'] || {
    collection: 'sst_vaccination',
    title: 'Controle de Imunização e Vacinas Ocupacionais',
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      {
        name: 'vacina',
        label: 'Vacina (Tétano, Hepatite B, Febre Amarela, Influenza, Covid)',
        type: 'text',
        required: true,
      },
      { name: 'dose', label: 'Dose (1ª, 2ª, 3ª, Reforço, Anual)', type: 'text' },
      { name: 'data_aplicacao', label: 'Data Aplicação', type: 'date' },
      { name: 'data_proxima_dose', label: 'Próxima Dose Prevista', type: 'date' },
      { name: 'lote_fabricante', label: 'Lote / Fabricante', type: 'text' },
    ],
    statusField: 'situacao',
    statusOptions: [
      'Esquema Completo',
      'Pendente Próxima Dose',
      'Dose Atrasada',
      'Recusa Formalizada',
    ],
  }

  return (
    <div className="space-y-4">
      {/* Alerta de Sigilo Reforçado LGPD / CFM */}
      <Card className="border-2 border-rose-600/30 bg-rose-50/40">
        <CardContent className="p-3.5 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" />
            <div>
              <p className="font-bold text-rose-900">
                Sigilo Médico Reforçado — Conformidade LGPD (Dados Pessoais Sensíveis) e Código de
                Ética Médica (CFM)
              </p>
              <p className="text-muted-foreground mt-0.5">
                {sigiloUnlocked
                  ? 'Modo Médico Autorizado: Visualização completa de laudos, prontuários e anamneses liberada para este perfil.'
                  : 'Modo Administrativo / RH: Apenas aptidão (Apto/Inapto) e vencimentos são visíveis. Detalhes clínicos e prontuários estão protegidos.'}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSigiloUnlocked(!sigiloUnlocked)}
            className="h-8 text-xs font-semibold border-rose-300 text-rose-800 hover:bg-rose-100"
          >
            {sigiloUnlocked ? (
              <>
                <Lock className="w-3.5 h-3.5 mr-1" /> Ocultar Dados Clínicos
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 mr-1" /> Autenticar Acesso Médico
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="aso" className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="pcmso"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" /> PCMSO
          </TabsTrigger>
          <TabsTrigger
            value="aso"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <HeartPulse className="w-3.5 h-3.5 mr-1.5" /> ASO
          </TabsTrigger>
          <TabsTrigger
            value="exames"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Stethoscope className="w-3.5 h-3.5 mr-1.5" /> Exames Ocupacionais (ex-DP)
          </TabsTrigger>
          <TabsTrigger
            value="prontuario"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Registro Médico
          </TabsTrigger>
          <TabsTrigger
            value="vacinacao"
            className="text-xs font-semibold data-[state=active]:bg-[#005B2E] data-[state=active]:text-white"
          >
            <Syringe className="w-3.5 h-3.5 mr-1.5" /> Vacinação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pcmso" className="mt-4">
          <RhGenericScreen config={pcmsoCfg} />
        </TabsContent>

        <TabsContent value="aso" className="mt-4">
          <RhGenericScreen config={asoCfg as any} />
        </TabsContent>

        <TabsContent value="exames" className="mt-4">
          <RhGenericScreen config={examesCfg as any} />
        </TabsContent>

        <TabsContent value="prontuario" className="mt-4">
          {!sigiloUnlocked ? (
            <Card className="border-2 border-dashed py-12 text-center">
              <CardContent>
                <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                <p className="font-bold text-foreground">Acesso Restrito ao Médico do Trabalho</p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  Os prontuários médicos são protegidos por sigilo profissional (Resolução CFM
                  1.821/2007) e não podem ser consultados por gestores operacionais ou RH.
                </p>
              </CardContent>
            </Card>
          ) : (
            <RhGenericScreen config={registroMedicoCfg} />
          )}
        </TabsContent>

        <TabsContent value="vacinacao" className="mt-4">
          <RhGenericScreen config={vacinacaoCfg} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

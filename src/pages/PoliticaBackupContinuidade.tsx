import { PolicyLayout } from '@/components/policy-layout'
import { Database, ShieldCheck, RefreshCw, AlertTriangle, Info } from 'lucide-react'

export default function PoliticaBackupContinuidade() {
  return (
    <PolicyLayout title="Política de Backup e Continuidade" lastUpdated="10 de agosto de 2026">
      <h2 className="text-xl font-bold text-[#005B2E] pt-4 flex items-center gap-2">
        <Info className="h-5 w-5" />
        1. Objetivo
      </h2>
      <p>Garantir recuperação em caso de incidentes.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4 flex items-center gap-2">
        <Database className="h-5 w-5" />
        2. Backups
      </h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Backups periódicos.</li>
        <li>Armazenamento seguro.</li>
        <li>Testes de restauração.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4 flex items-center gap-2">
        <RefreshCw className="h-5 w-5" />
        3. Continuidade
      </h2>
      <p>Plano para:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>falhas;</li>
        <li>indisponibilidade;</li>
        <li>incidentes críticos.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5" />
        4. Recuperação
      </h2>
      <p>Procedimentos internos de recuperação conforme criticidade.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        5. Limitações
      </h2>
      <p>Backups não substituem boas práticas do cliente.</p>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Jetro — Plataforma Inteligente de Gestão Empresarial.
        </p>
      </div>
    </PolicyLayout>
  )
}

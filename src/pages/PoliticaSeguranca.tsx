import { PolicyLayout } from '@/components/policy-layout'

export default function PoliticaSeguranca() {
  return (
    <PolicyLayout title="Política de Segurança da Informação" lastUpdated="10 de agosto de 2026">
      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. Objetivo</h2>
      <p>Garantir confidencialidade, integridade e disponibilidade das informações.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">2. Princípios</h2>
      <p>A gestão da segurança da informação no Jetro é orientada pelos seguintes princípios:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Confidencialidade</li>
        <li>Integridade</li>
        <li>Disponibilidade</li>
        <li>Rastreabilidade</li>
        <li>Autenticidade</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">3. Controles</h2>
      <p>
        Para assegurar a proteção das informações, a plataforma Jetro adota os seguintes controles:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Autenticação</li>
        <li>Autorização</li>
        <li>RBAC (Controle de Acesso Baseado em Papéis)</li>
        <li>Criptografia</li>
        <li>Backups</li>
        <li>Auditoria</li>
        <li>Logs</li>
        <li>Monitoramento</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">4. Responsabilidades</h2>
      <p>Usuários devem:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Proteger credenciais</li>
        <li>Utilizar equipamentos confiáveis</li>
        <li>Comunicar incidentes</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">5. Gestão de Incidentes</h2>
      <p>Incidentes serão registrados, analisados e tratados conforme processo interno.</p>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Jetro — Plataforma Inteligente de Gestão Empresarial.
        </p>
      </div>
    </PolicyLayout>
  )
}

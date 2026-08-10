import { PolicyLayout } from '@/components/policy-layout'

export default function PoliticaLicenciamento() {
  return (
    <PolicyLayout
      title="Política de Contrato de Licenciamento (SaaS)"
      lastUpdated="10 de agosto de 2026"
    >
      <p>
        Esta Política de Contrato de Licenciamento estabelece os termos e condições para o uso da
        plataforma{' '}
        <strong className="text-[#005B2E]">
          Jetro – Plataforma Inteligente de Gestão Empresarial
        </strong>
        , licenciada sob o modelo de Software como Serviço (SaaS).
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. Natureza</h2>
      <p>
        O Jetro é licenciado como Software como Serviço (SaaS). O cliente recebe direito de uso. Não
        adquire propriedade do software.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">2. Licença</h2>
      <p>A licença concedida ao cliente possui as seguintes características:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Não exclusiva</li>
        <li>Intransferível</li>
        <li>Revogável em caso de inadimplemento contratual</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">3. Obrigações da Jetro</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Disponibilizar a plataforma</li>
        <li>Prestar suporte conforme SLA</li>
        <li>Proteger dados</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">4. Obrigações do Cliente</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Manter usuários autorizados</li>
        <li>Pagar mensalidades</li>
        <li>Utilizar corretamente</li>
        <li>Não copiar</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">5. Proibições</h2>
      <p>É expressamente proibido ao cliente:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Engenharia reversa</li>
        <li>Redistribuição</li>
        <li>Revenda</li>
        <li>Clonagem</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">6. Encerramento</h2>
      <p>
        Ao término: acesso encerrado; retenção conforme LGPD; exportação de dados conforme contrato.
      </p>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Jetro — Plataforma Inteligente de Gestão Empresarial.
        </p>
      </div>
    </PolicyLayout>
  )
}

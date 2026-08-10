import { PolicyLayout } from '@/components/policy-layout'

export default function PoliticaComercial() {
  return (
    <PolicyLayout title="Política Comercial" lastUpdated="10 de agosto de 2026">
      <p>
        Esta Política Comercial estabelece as diretrizes para contratação, utilização, renovação e
        relacionamento comercial entre o{' '}
        <strong className="text-[#005B2E]">
          Jetro — Plataforma Inteligente de Gestão Empresarial
        </strong>{' '}
        e seus clientes.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. Objetivo</h2>
      <p>
        Esta Política Comercial estabelece as diretrizes para contratação, utilização, renovação e
        relacionamento comercial entre o Jetro e seus clientes.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">2. Modelo de Contratação</h2>
      <p>O Jetro é disponibilizado no modelo Software como Serviço (SaaS), mediante assinatura.</p>
      <p>A contratação poderá variar conforme:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Plano escolhido;</li>
        <li>Quantidade de usuários;</li>
        <li>Módulos contratados;</li>
        <li>Recursos adicionais;</li>
        <li>Necessidades específicas da empresa.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">3. Demonstração da Plataforma</h2>
      <p>
        A demonstração tem caráter exclusivamente comercial e pode não contemplar todas as
        funcionalidades ou personalizações disponíveis na versão contratada.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">4. Propostas Comerciais</h2>
      <p>As propostas emitidas possuem prazo de validade informado no documento.</p>
      <p>Após esse período, valores e condições poderão ser revistos.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">5. Implantação</h2>
      <p>Quando contratada, a implantação poderá incluir:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>parametrização inicial;</li>
        <li>treinamento;</li>
        <li>migração de dados (quando prevista em contrato);</li>
        <li>acompanhamento da entrada em operação.</li>
      </ul>
      <p>Os serviços efetivamente contratados serão definidos na proposta comercial.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">6. Licenciamento</h2>
      <p>
        A licença concede direito de uso da plataforma, não transferência de propriedade
        intelectual.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">7. Cobrança</h2>
      <p>As condições de cobrança serão definidas em contrato ou proposta comercial.</p>
      <p>Podem incluir:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>mensalidade;</li>
        <li>implantação;</li>
        <li>treinamentos;</li>
        <li>serviços adicionais;</li>
        <li>módulos opcionais.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">8. Reajustes</h2>
      <p>
        Os valores poderão ser reajustados conforme previsto em contrato, observando os índices
        definidos entre as partes.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">9. Cancelamento</h2>
      <p>
        As condições para cancelamento, aviso prévio e encerramento da assinatura seguirão o
        contrato firmado.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">10. Suporte</h2>
      <p>O atendimento seguirá o SLA vigente da plataforma.</p>
      <p>Demandas podem ser classificadas por prioridade.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">11. Customizações</h2>
      <p>Desenvolvimentos específicos poderão ser analisados separadamente.</p>
      <p>A aprovação dependerá de viabilidade técnica, cronograma e orçamento.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">12. Integrações</h2>
      <p>Integrações com sistemas de terceiros poderão exigir:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>APIs disponíveis;</li>
        <li>contratação adicional;</li>
        <li>desenvolvimento específico.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">13. Responsabilidades do Cliente</h2>
      <p>O cliente compromete-se a:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>fornecer informações corretas;</li>
        <li>manter usuários autorizados;</li>
        <li>cumprir obrigações contratuais;</li>
        <li>utilizar a plataforma de forma adequada.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">14. Responsabilidades do Jetro</h2>
      <p>Comprometemo-nos a:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>disponibilizar a plataforma conforme contratado;</li>
        <li>manter padrões de segurança;</li>
        <li>prestar suporte conforme SLA;</li>
        <li>buscar evolução contínua do produto.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">15. Alterações desta Política</h2>
      <p>
        Esta Política Comercial poderá ser atualizada para refletir melhorias nos serviços ou
        mudanças nas condições comerciais.
      </p>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Jetro — Plataforma Inteligente de Gestão Empresarial.
        </p>
      </div>
    </PolicyLayout>
  )
}

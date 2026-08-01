import { PolicyLayout } from '@/components/policy-layout'

export default function PoliticaComercial() {
  return (
    <PolicyLayout title="Política Comercial" lastUpdated="01 de agosto de 2026">
      <p>
        Esta Política Comercial estabelece as condições, prazos e diretrizes para a contratação dos
        serviços de operações logísticas prestados pela{' '}
        <strong className="text-[#005B2E]">Velora Log Operações Logísticas</strong>, incluindo
        armazenagem de produtos (WMS), picking & packing, transporte de cargas, distribuição urbana,
        logística portuária, cross docking e gestão de frota.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. Escopo dos Serviços</h2>
      <p>
        A Velora Log oferece soluções logísticas completas. Atendemos em todo o estado do Espírito
        Santo, compreendendo:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Armazenagem de produtos com gestão WMS, controle de lotes e validade;</li>
        <li>Picking & packing com inventário contínuo e máxima acuracidade;</li>
        <li>Transporte rodoviário de cargas fracionadas e dedicadas, com seguro e rastreamento;</li>
        <li>Distribuição urbana e Last Mile com roteirização inteligente;</li>
        <li>Logística portuária com conexão aos principais portos do ES;</li>
        <li>Cross docking e triagem ágil de mercadorias;</li>
        <li>Gestão de frota com telemetria e gerenciamento de risco.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">
        2. Fluxo de Solicitação de Orçamento
      </h2>
      <p>O processo de cotação funciona da seguinte forma:</p>
      <ol className="list-decimal pl-6 space-y-1">
        <li>
          O cliente preenche o formulário de orçamento disponível neste site, informando os dados da
          operação (tipo de serviço, origem, destino, mercadoria, volume e periodicidade);
        </li>
        <li>
          A equipe comercial da Velora Log analisa a solicitação e responde com uma cotação
          detalhada por meio do canal de contato fornecido (WhatsApp{' '}
          <strong className="text-[#005B2E]">(31) 99129-7619</strong>);
        </li>
        <li>
          A cotação inclui escopo, prazos estimados, condições comerciais e validade da proposta;
        </li>
        <li>
          Após a aprovação do cliente, a operação é formalizada conforme as condições descritas na
          proposta.
        </li>
      </ol>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">
        3. Prazo de Resposta e Validade da Cotação
      </h2>
      <p>
        O prazo médio de resposta para solicitações de orçamento é de até{' '}
        <strong className="text-[#005B2E]">48 horas úteis</strong>, podendo variar conforme a
        complexidade da operação. As cotações enviadas pela Velora Log têm validade de{' '}
        <strong className="text-[#005B2E]">15 (quinze) dias corridos</strong> a partir da data de
        envio, exceto quando indicado de outra forma na proposta.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">4. Condições de Pagamento</h2>
      <p>
        As condições de pagamento são definidas caso a caso, conforme o escopo e a duração da
        operação. Em geral, aplicam-se as seguintes diretrizes:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Operações pontuais: pagamento antecipado ou à vista, conforme acordado na proposta;</li>
        <li>Contratos recorrentes: faturamento mensal com vencimento definido em contrato;</li>
        <li>Possibilidade de condições especiais para projetos de longo prazo.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">5. Contratação</h2>
      <p>
        A aceitação da cotação pelo cliente formaliza o interesse na contratação. Operações
        específicas podem ser formalizadas por meio de contrato escrito, que detalhará escopo,
        prazos, valores, responsabilidades e demais condições acordadas entre as partes.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">6. Cancelamento e Reagendamento</h2>
      <p>
        Cancelamentos e reagendamentos de operações devem ser comunicados à Velora Log com
        antecedência mínima de <strong className="text-[#005B2E]">24 horas</strong>. Operações
        canceladas em prazo inferior podem estar sujeitas a cobranças proporcionais aos custos já
        incorridos. Reagendamentos estão sujeitos à disponibilidade de agenda e capacidade
        operacional.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">
        7. Responsabilidade e Níveis de Serviço
      </h2>
      <p>
        A Velora Log compromete-se a executar os serviços com padrões de qualidade e pontualidade
        adequados. Os níveis de serviço (SLAs) específicos — incluindo prazos de entrega,
        acuracidade de inventário e disponibilidade — são definidos na proposta comercial ou
        contrato. A responsabilidade da Velora Log limita-se ao valor dos serviços contratados,
        salvo nos casos de dolo ou culpa grave devidamente comprovados.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">8. Disposições Gerais</h2>
      <p>
        As condições comerciais descritas nesta política aplicam-se aos serviços apresentados neste
        site. Contratações específicas podem ter condições diferenciadas, que prevalecerão sobre os
        termos gerais aqui descritos quando formalizadas em contrato escrito. Em caso de dúvidas,
        entre em contato pelo WhatsApp (31) 99129-7619.
      </p>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Velora Log Operações Logísticas — Excelência em soluções logísticas no Espírito Santo.
        </p>
      </div>
    </PolicyLayout>
  )
}

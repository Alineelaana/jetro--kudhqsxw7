import { PolicyLayout } from '@/components/policy-layout'

export default function PoliticaPrivacidade() {
  return (
    <PolicyLayout title="Política de Privacidade" lastUpdated="01 de agosto de 2026">
      <p>
        A <strong className="text-[#005B2E]">Velora Log Operações Logísticas</strong> valoriza a
        privacidade e a proteção dos dados pessoais de seus clientes e visitantes. Esta Política de
        Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos as informações
        fornecidas por você em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº
        13.709/2018).
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. Dados Pessoais Coletados</h2>
      <p>
        Por meio do formulário de solicitação de orçamento disponível neste site, coletamos os
        seguintes dados pessoais:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Nome completo do solicitante;</li>
        <li>E-mail corporativo;</li>
        <li>Telefone / WhatsApp para contato;</li>
        <li>Empresa (opcional);</li>
        <li>Serviço de interesse (armazenagem, transporte, distribuição, entre outros);</li>
        <li>
          Tipo de operação, cidades de origem e destino, tipo de mercadoria, volume estimado e
          periodicidade;
        </li>
        <li>Observações e detalhes adicionais da operação fornecidos no campo de mensagem.</li>
      </ul>
      <p>
        Além disso, registramos a confirmação de consentimento com esta Política de Privacidade,
        incluindo o status de aceitação e a data e hora em que o consentimento foi concedido.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">2. Finalidades do Tratamento</h2>
      <p>Os dados pessoais coletados são utilizados para as seguintes finalidades:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Responder às solicitações de orçamento e cotação de serviços logísticos;</li>
        <li>
          Prestar os serviços contratados de armazenagem, transporte, distribuição e operações
          conexas;
        </li>
        <li>
          Estabelecer comunicação comercial legítima com o cliente, inclusive via WhatsApp e e-mail;
        </li>
        <li>Cumprir obrigações legais e regulatórias aplicáveis.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">3. Armazenamento e Segurança</h2>
      <p>
        Os dados fornecidos são armazenados de forma segura em banco de dados na nuvem, com controle
        de acesso restrito. Somente pessoal autorizado da Velora Log tem acesso às informações,
        sempre em conformidade com as melhores práticas de segurança da informação. Adotamos medidas
        técnicas e organizacionais para proteger os dados contra acesso não autorizado, alteração,
        divulgação ou destruição indevida.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">4. Período de Retenção</h2>
      <p>
        Os dados submetidos por meio do formulário de orçamento são mantidos pelo período necessário
        para responder e gerenciar a solicitação, bem como pelo prazo estabelecido em obrigações
        legais ou contratuais. Após esse período, os dados são eliminados ou anonimizados.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">5. Base Legal</h2>
      <p>
        O tratamento dos dados pessoais descritos nesta política possui como base legal o
        consentimento expresso do titular (art. 7º, inciso I, da LGPD) e a execução de contrato ou
        de procedimentos preliminares relacionados a contrato (art. 7º, inciso V, da LGPD).
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">6. Direitos do Titular dos Dados</h2>
      <p>
        Conforme a LGPD (Lei nº 13.709/2018), você possui os seguintes direitos como titular dos
        dados:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Confirmação da existência de tratamento e acesso aos dados;</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
        <li>Portabilidade dos dados a outro fornecedor de serviço ou produto;</li>
        <li>
          Informação sobre a possibilidade de não consentir e sobre as consequências da recusa;
        </li>
        <li>Revogação do consentimento a qualquer tempo.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">7. Como Exercer Seus Direitos</h2>
      <p>
        Para exercer qualquer um dos direitos listados acima, entre em contato com a Velora Log por
        meio do WhatsApp <strong className="text-[#005B2E]">(31) 99129-7619</strong>. Sua
        solicitação será analisada e respondida no prazo estabelecido pela LGPD.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">8. Alterações desta Política</h2>
      <p>
        A Velora Log reserva-se o direito de atualizar esta Política de Privacidade a qualquer
        momento. Recomendamos que você revise periodicamente esta página para se manter informado
        sobre quaisquer alterações.
      </p>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Em caso de dúvidas sobre esta Política de Privacidade, entre em contato pelo WhatsApp (31)
          99129-7619.
        </p>
      </div>
    </PolicyLayout>
  )
}

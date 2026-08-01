import { PolicyLayout } from '@/components/policy-layout'

export default function TermosDeUso() {
  return (
    <PolicyLayout title="Termos de Uso" lastUpdated="01 de agosto de 2026">
      <p>
        Estes Termos de Uso estabelecem as regras e condições para o acesso e utilização do website
        da <strong className="text-[#005B2E]">Velora Log Operações Logísticas</strong>. Ao acessar e
        navegar neste site, você concorda integralmente com os termos aqui apresentados.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. Aceitação dos Termos</h2>
      <p>
        Ao acessar e utilizar o site da Velora Log, o usuário declara ter lido, compreendido e
        aceitado estes Termos de Uso, bem como a Política de Privacidade e a Política de Cookies do
        site. Caso não concorde com qualquer um dos termos, o usuário deve abster-se de utilizar o
        site.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">2. Propriedade Intelectual</h2>
      <p>
        Todo o conteúdo disponibilizado neste site — incluindo, mas não se limitando a, logos,
        textos, imagens, elementos visuais, layouts, paletas de cores, ícones e design — é de
        propriedade exclusiva da Velora Log Operações Logísticas e está protegido pelas leis de
        propriedade intelectual aplicáveis no Brasil.
      </p>
      <p>
        É proibida a reprodução, distribuição, modificação, comunicação pública ou qualquer outra
        forma de utilização total ou parcial do conteúdo deste site sem autorização expressa e
        prévia da Velora Log.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">3. Uso Adequado do Site</h2>
      <p>
        O usuário compromete-se a utilizar o site de forma lícita e responsável. São permitidas as
        seguintes atividades:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Navegação e consulta às informações sobre os serviços oferecidos;</li>
        <li>Envio de solicitações de orçamento por meio do formulário disponível no site;</li>
        <li>Contato com a Velora Log pelos canais oficiais de atendimento.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">4. Proibições de Uso</h2>
      <p>Fica expressamente proibido ao usuário:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Enviar formulários de orçamento com informações fraudulentas, falsas ou enganosas;</li>
        <li>Coletar dados de outros usuários ou do site sem autorização;</li>
        <li>
          Tentar danificar, sobrecarregar, incapacitar ou interromper o funcionamento do site;
        </li>
        <li>
          Utilizar ferramentas automatizadas (bots, scrapers) para acesso em massa ao site sem
          autorização;
        </li>
        <li>
          Inserir códigos maliciosos, vírus ou qualquer elemento que possa comprometer a segurança
          do site;
        </li>
        <li>Utilizar o site para fins ilegais ou que violem direitos de terceiros.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">5. Natureza Informativa do Conteúdo</h2>
      <p>
        O conteúdo disponibilizado neste site tem caráter meramente informativo e não substitui uma
        proposta comercial formal. As informações sobre serviços, condições e preços estão sujeitas
        a alterações sem aviso prévio. Uma proposta comercial oficial será fornecida pela Velora Log
        mediante solicitação de orçamento e análise da demanda.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">6. Limitação de Responsabilidade</h2>
      <p>
        A Velora Log envida esforços para manter as informações do site atualizadas e precisas, mas
        não garante a ausência de erros ou interrupções no funcionamento do site. A Velora Log não
        se responsabiliza por danos decorrentes do uso indevido do site ou da dependência de
        informações sem a devida confirmação por meio de proposta comercial formal.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">7. Alterações dos Termos</h2>
      <p>
        A Velora Log reserva-se o direito de modificar estes Termos de Uso a qualquer momento. As
        alterações entram em vigor a partir de sua publicação neste site. Recomenda-se a consulta
        periódica desta página.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">8. Legislação Aplicável</h2>
      <p>
        Estes Termos de Uso são regidos pela legislação da República Federativa do Brasil. Fica
        eleito o foro da comarca do Espírito Santo para dirimir quaisquer controvérsias decorrentes
        destes termos.
      </p>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo WhatsApp (31)
          99129-7619 ou e-mail contato@veloralog.com.br.
        </p>
      </div>
    </PolicyLayout>
  )
}

import { PolicyLayout } from '@/components/policy-layout'

export default function PoliticaPrivacidade() {
  return (
    <PolicyLayout title="Política de Privacidade" lastUpdated="09 de agosto de 2026">
      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. Apresentação</h2>
      <p>
        Bem-vindo ao{' '}
        <strong className="text-[#005B2E]">
          Jetro – Plataforma Inteligente de Gestão Empresarial
        </strong>
        .
      </p>
      <p>
        Sua privacidade é importante para nós. Esta Política de Privacidade explica como coletamos,
        utilizamos, armazenamos, protegemos e tratamos seus dados pessoais quando você utiliza nosso
        site, nossa plataforma ou entra em contato conosco.
      </p>
      <p>Ao utilizar nossos serviços, você declara estar ciente desta Política.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">2. Quem somos</h2>
      <p>
        O Jetro é uma plataforma de gestão empresarial desenvolvida para integrar processos,
        pessoas, operações e informações em um único ambiente digital.
      </p>
      <p>
        Nosso compromisso é tratar seus dados de forma transparente, segura e em conformidade com a
        Lei Geral de Proteção de Dados (LGPD).
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">3. Quais dados coletamos</h2>
      <p>Podemos coletar os seguintes dados:</p>

      <h3 className="text-lg font-bold text-[#005B2E] pt-2">Dados fornecidos por você</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Nome</li>
        <li>E-mail</li>
        <li>Telefone</li>
        <li>Nome da empresa</li>
        <li>CNPJ</li>
        <li>Cidade</li>
        <li>Cargo (quando informado)</li>
        <li>Mensagens enviadas pelo formulário de contato</li>
        <li>Informações fornecidas durante demonstrações ou reuniões</li>
      </ul>

      <h3 className="text-lg font-bold text-[#005B2E] pt-2">Dados de navegação</h3>
      <p>Durante a utilização do site podemos registrar informações como:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Endereço IP</li>
        <li>Tipo de navegador</li>
        <li>Sistema operacional</li>
        <li>Páginas acessadas</li>
        <li>Data e horário de acesso</li>
        <li>Tempo de permanência</li>
        <li>Origem do acesso</li>
        <li>Cookies e identificadores de sessão</li>
      </ul>

      <h3 className="text-lg font-bold text-[#005B2E] pt-2">Dados da plataforma</h3>
      <p>
        Quando você utiliza o sistema Jetro, poderão ser tratados dados necessários ao funcionamento
        da plataforma, conforme as funcionalidades contratadas pela sua empresa.
      </p>
      <p>
        Esses dados pertencem à empresa contratante e são tratados conforme a finalidade do serviço.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">4. Como utilizamos seus dados</h2>
      <p>Utilizamos os dados para:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>responder solicitações de contato;</li>
        <li>apresentar demonstrações da plataforma;</li>
        <li>fornecer suporte;</li>
        <li>melhorar nossos produtos e serviços;</li>
        <li>manter a segurança da plataforma;</li>
        <li>cumprir obrigações legais;</li>
        <li>enviar comunicações relacionadas ao uso do sistema;</li>
        <li>gerar indicadores internos e análises estatísticas.</li>
      </ul>
      <p>
        Nunca utilizamos seus dados para finalidades incompatíveis com aquelas informadas nesta
        Política.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">5. Base legal para o tratamento</h2>
      <p>
        O tratamento dos dados poderá ocorrer com fundamento em uma ou mais das seguintes bases
        legais previstas na LGPD:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>consentimento do titular;</li>
        <li>execução de contrato;</li>
        <li>cumprimento de obrigação legal;</li>
        <li>exercício regular de direitos;</li>
        <li>legítimo interesse;</li>
        <li>proteção ao crédito, quando aplicável.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">6. Compartilhamento de dados</h2>
      <p>Os dados poderão ser compartilhados apenas quando necessário com:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>provedores de infraestrutura em nuvem;</li>
        <li>serviços de hospedagem;</li>
        <li>ferramentas de comunicação;</li>
        <li>prestadores de suporte técnico;</li>
        <li>parceiros tecnológicos necessários ao funcionamento da plataforma;</li>
        <li>autoridades públicas quando houver obrigação legal.</li>
      </ul>
      <p>Não comercializamos dados pessoais.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">7. Armazenamento e segurança</h2>
      <p>Adotamos medidas técnicas e administrativas para proteger os dados contra:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>acesso não autorizado;</li>
        <li>perda;</li>
        <li>alteração;</li>
        <li>destruição;</li>
        <li>divulgação indevida;</li>
        <li>uso ilícito.</li>
      </ul>
      <p>Entre as medidas utilizadas podem estar:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>autenticação de usuários;</li>
        <li>controle de permissões;</li>
        <li>criptografia quando aplicável;</li>
        <li>registro de auditoria;</li>
        <li>monitoramento de segurança;</li>
        <li>backups periódicos.</li>
      </ul>
      <p>Apesar dos esforços, nenhum sistema é absolutamente imune a riscos.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">8. Cookies</h2>
      <p>Utilizamos cookies para:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>manter sessões autenticadas;</li>
        <li>melhorar a experiência do usuário;</li>
        <li>lembrar preferências;</li>
        <li>gerar estatísticas de utilização;</li>
        <li>otimizar o desempenho do site.</li>
      </ul>
      <p>
        Você pode configurar seu navegador para bloquear cookies, porém algumas funcionalidades
        poderão deixar de funcionar corretamente.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">9. Retenção dos dados</h2>
      <p>Os dados serão mantidos pelo tempo necessário para:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>prestação dos serviços;</li>
        <li>cumprimento de obrigações legais;</li>
        <li>exercício regular de direitos;</li>
        <li>atendimento às finalidades desta Política.</li>
      </ul>
      <p>
        Após esse período, poderão ser eliminados ou anonimizados, conforme a legislação aplicável.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">10. Direitos do titular</h2>
      <p>Nos termos da LGPD, você poderá solicitar:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>confirmação da existência de tratamento;</li>
        <li>acesso aos dados;</li>
        <li>correção de informações;</li>
        <li>atualização de dados;</li>
        <li>anonimização quando aplicável;</li>
        <li>portabilidade;</li>
        <li>eliminação de dados tratados mediante consentimento;</li>
        <li>informações sobre compartilhamento;</li>
        <li>revogação do consentimento, quando aplicável.</li>
      </ul>
      <p>As solicitações serão analisadas conforme a legislação vigente.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">11. Segurança da conta</h2>
      <p>Quando utilizar a plataforma Jetro, recomendamos:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>manter sua senha em sigilo;</li>
        <li>utilizar senhas fortes;</li>
        <li>não compartilhar credenciais;</li>
        <li>encerrar a sessão em computadores públicos;</li>
        <li>comunicar imediatamente qualquer suspeita de acesso indevido.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">12. Inteligência Artificial</h2>
      <p>
        O Jetro poderá disponibilizar recursos baseados em Inteligência Artificial para auxiliar
        usuários na navegação, consulta de informações e apoio à tomada de decisão.
      </p>
      <p>
        As respostas produzidas por recursos de IA possuem caráter auxiliar e não substituem análise
        humana quando necessária.
      </p>
      <p>O uso desses recursos respeita as políticas de privacidade e segurança da plataforma.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">13. Links para terceiros</h2>
      <p>Nosso site poderá conter links para páginas externas.</p>
      <p>
        Não somos responsáveis pelas políticas de privacidade ou pelo conteúdo de sites de
        terceiros.
      </p>
      <p>
        Recomendamos que você leia as respectivas políticas antes de fornecer informações pessoais.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">14. Alterações desta Política</h2>
      <p>
        Esta Política poderá ser atualizada periodicamente para refletir melhorias na plataforma,
        mudanças legais ou alterações nos serviços.
      </p>
      <p>A versão mais recente estará sempre disponível em nosso site.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">15. Contato</h2>
      <p>
        Em caso de dúvidas, solicitações ou exercício de direitos relacionados à proteção de dados,
        entre em contato conosco pelos canais oficiais disponibilizados no site do Jetro.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">16. Legislação Aplicável</h2>
      <p>
        Esta Política é regida pelas leis da República Federativa do Brasil, especialmente pela Lei
        nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD) e demais normas aplicáveis.
      </p>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Jetro – Plataforma Inteligente de Gestão Empresarial.
        </p>
      </div>
    </PolicyLayout>
  )
}

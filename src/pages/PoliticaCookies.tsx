import { PolicyLayout } from '@/components/policy-layout'

export default function PoliticaCookies() {
  return (
    <PolicyLayout title="Política de Cookies" lastUpdated="01 de agosto de 2026">
      <p>
        Esta Política de Cookies explica o que são cookies, como a{' '}
        <strong className="text-[#005B2E]">Velora Log Operações Logísticas</strong> os utiliza e
        como você pode gerenciá-los em seu navegador.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. O que são Cookies?</h2>
      <p>
        Cookies são pequenos arquivos de texto armazenados em seu dispositivo (computador, tablet ou
        celular) quando você acessa um site. Eles permitem que o site lembre de suas ações e
        preferências durante um período de tempo, proporcionando uma experiência de navegação mais
        fluida e personalizada.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">2. Por que Utilizamos Cookies?</h2>
      <p>
        A Velora Log utiliza cookies para garantir o funcionamento adequado do site, melhorar a
        experiência do usuário e obter informações sobre como o site é utilizado, permitindo
        aprimoramentos contínuos.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">3. Tipos de Cookies Utilizados</h2>

      <h3 className="text-lg font-bold text-[#005B2E] pt-2">3.1. Cookies Necessários</h3>
      <p>
        São cookies essenciais para o funcionamento básico do site. Sem eles, recursos como
        navegação e acesso a áreas seguras podem não funcionar corretamente. Estes cookies não
        armazenam informações pessoais.
      </p>

      <h3 className="text-lg font-bold text-[#005B2E] pt-2">3.2. Cookies de Preferência</h3>
      <p>
        Armazenam suas preferências de navegação, como idioma e configurações de exibição, para que
        não seja necessário reconfigurá-las a cada visita.
      </p>

      <h3 className="text-lg font-bold text-[#005B2E] pt-2">3.3. Cookies Analíticos</h3>
      <p>
        Quando utilizados, esses cookies coletam informações agregadas e anônimas sobre como os
        visitantes utilizam o site (páginas visitadas, tempo de permanência, origem do acesso).
        Esses dados são empregados exclusivamente para melhorar o desempenho e a usabilidade do
        site.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">4. Gestão de Cookies</h2>
      <p>
        Você tem controle total sobre o uso de cookies. Pode aceitar, bloquear ou excluir cookies
        por meio das configurações do seu navegador. Abaixo estão os links para as instruções de
        gerenciamento de cookies nos navegadores mais utilizados:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Google Chrome: Configurações → Privacidade e segurança → Cookies e outros dados do site;
        </li>
        <li>
          Mozilla Firefox: Configurações → Privacidade e Segurança → Cookies e dados de sites;
        </li>
        <li>Safari: Preferências → Privacidade → Cookies e dados de sites;</li>
        <li>Microsoft Edge: Configurações → Cookies e permissões de site.</li>
      </ul>
      <p>
        Observe que a desativação de cookies pode afetar a funcionalidade de algumas áreas do site,
        impedindo que determinados recursos operem corretamente.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">5. Alterações desta Política</h2>
      <p>
        A Velora Log pode atualizar esta Política de Cookies periodicamente. Recomendamos que você
        revise esta página regularmente para se manter informado sobre eventuais mudanças.
      </p>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Em caso de dúvidas sobre esta Política de Cookies, entre em contato pelo WhatsApp (31)
          99129-7619.
        </p>
      </div>
    </PolicyLayout>
  )
}

import { PolicyLayout } from '@/components/policy-layout'

export default function PoliticaCookies() {
  return (
    <PolicyLayout title="Política de Cookies" lastUpdated="10 de agosto de 2026">
      <p>
        Esta Política de Cookies explica como a{' '}
        <strong className="text-[#005B2E]">
          Jetro — Plataforma Inteligente de Gestão Empresarial
        </strong>{' '}
        utiliza cookies e como você pode gerenciá-los em seu navegador.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. O que são cookies</h2>
      <p>
        Cookies são pequenos arquivos utilizados para melhorar sua experiência. Eles são armazenados
        em seu dispositivo (computador, tablet ou celular) quando você acessa um site, permitindo
        que o site lembre de suas ações e preferências durante um período de tempo.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">2. Tipos utilizados</h2>
      <p>Utilizamos os seguintes tipos de cookies em nossa plataforma:</p>

      <h3 className="text-lg font-bold text-[#005B2E] pt-2">2.1. Cookies Essenciais</h3>
      <p>Necessários para funcionamento.</p>

      <h3 className="text-lg font-bold text-[#005B2E] pt-2">2.2. Cookies de Segurança</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Autenticação.</li>
        <li>Sessão.</li>
        <li>Proteção contra fraude.</li>
      </ul>

      <h3 className="text-lg font-bold text-[#005B2E] pt-2">2.3. Cookies de Preferência</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Idioma.</li>
        <li>Tema.</li>
        <li>Configurações.</li>
      </ul>

      <h3 className="text-lg font-bold text-[#005B2E] pt-2">2.4. Cookies Analíticos</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Uso do site.</li>
        <li>Páginas acessadas.</li>
        <li>Performance.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">3. Gerenciamento</h2>
      <p>O usuário pode desativá-los no navegador.</p>
      <p className="pt-2">
        Abaixo estão os links para as instruções de gerenciamento de cookies nos navegadores mais
        utilizados:
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

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">4. Alterações desta Política</h2>
      <p>
        A Jetro pode atualizar esta Política de Cookies periodicamente. Recomendamos que você revise
        esta página regularmente para se manter informado sobre eventuais mudanças.
      </p>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Jetro — Plataforma Inteligente de Gestão Empresarial.
        </p>
      </div>
    </PolicyLayout>
  )
}

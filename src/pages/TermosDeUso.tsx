import { PolicyLayout } from '@/components/policy-layout'

export default function TermosDeUso() {
  return (
    <PolicyLayout title="Termos de Uso" lastUpdated="09 de agosto de 2026">
      <p>
        Estes Termos de Uso estabelecem as regras e condições para o acesso e utilização do site
        institucional e da plataforma{' '}
        <strong className="text-[#005B2E]">
          Jetro – Plataforma Inteligente de Gestão Empresarial
        </strong>
        . Ao acessar e utilizar nossos serviços, você concorda integralmente com os termos aqui
        apresentados.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. Termos de Uso — Objetivo</h2>
      <p>
        Os Termos de Uso estabelecem as regras para utilização do site institucional e da plataforma
        Jetro.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. Aceitação</h2>
      <p>
        Ao acessar o site ou utilizar a plataforma Jetro, o usuário declara que leu e concorda com
        estes Termos de Uso. Caso não concorde, deverá interromper imediatamente a utilização.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">2. Objeto</h2>
      <p>
        O Jetro é uma plataforma de gestão empresarial destinada à administração de processos
        corporativos, podendo disponibilizar módulos administrativos, operacionais, financeiros,
        comerciais e analíticos conforme o plano contratado.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">3. Cadastro</h2>
      <p>O usuário compromete-se a:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>fornecer informações verdadeiras;</li>
        <li>manter seus dados atualizados;</li>
        <li>proteger suas credenciais;</li>
        <li>não compartilhar sua senha.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">4. Uso permitido</h2>
      <p>É permitido utilizar a plataforma exclusivamente para atividades legais e autorizadas.</p>
      <p className="pt-2">É expressamente proibido:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>tentar invadir o sistema;</li>
        <li>explorar vulnerabilidades;</li>
        <li>copiar funcionalidades;</li>
        <li>utilizar robôs sem autorização;</li>
        <li>distribuir malware;</li>
        <li>violar direitos de terceiros.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">5. Propriedade Intelectual</h2>
      <p>Todo o conteúdo do Jetro é protegido pela legislação de direitos autorais. Isso inclui:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>software;</li>
        <li>código-fonte;</li>
        <li>identidade visual;</li>
        <li>marca;</li>
        <li>documentação;</li>
        <li>layout;</li>
        <li>banco de dados;</li>
        <li>fluxos.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">6. Disponibilidade</h2>
      <p>Embora busquemos alta disponibilidade, poderão ocorrer interrupções por:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>manutenção;</li>
        <li>atualizações;</li>
        <li>incidentes;</li>
        <li>eventos de força maior.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">7. Limitação de responsabilidade</h2>
      <p>O Jetro não responde por:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>uso inadequado da plataforma;</li>
        <li>decisões empresariais tomadas pelo cliente;</li>
        <li>indisponibilidades de terceiros;</li>
        <li>falhas de internet do usuário.</li>
      </ul>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">8. Alterações</h2>
      <p>Os Termos poderão ser atualizados periodicamente.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">9. Legislação</h2>
      <p>Aplicam-se as leis brasileiras.</p>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Jetro – Plataforma Inteligente de Gestão Empresarial.
        </p>
      </div>
    </PolicyLayout>
  )
}

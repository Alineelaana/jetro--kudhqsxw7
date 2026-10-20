import {
  Video,
  BookOpen,
  Navigation,
  Search,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UniversityJetroSection() {
  const learningPillars = [
    {
      title: 'Vídeos de Treinamento por Módulo',
      icon: Video,
      description:
        'Aulas diretas ao ponto demonstrando a operação real: emissão de pedidos, conciliação financeira, parametrização tributária e orquestração de WMS.',
      items: [
        'Organização por departamentos e níveis de acesso',
        'Demonstrações práticas gravadas na interface real',
        'Passo a passo para novos colaboradores e reciclagem',
      ],
    },
    {
      title: 'Tours Guiados Interativos no ERP',
      icon: Navigation,
      description:
        'Guias interativos passo a passo sobrepostos às telas reais do sistema, conduzindo o usuário em cada botão, filtro e rotina operacional.',
      items: [
        'Destaque visual do campo ou botão correto na tela',
        'Instruções contextuais sem necessidade de manual externo',
        'Redução imediata do tempo de curva de implantação',
      ],
    },
    {
      title: 'Tutoriais & Procedimentos Padrão',
      icon: BookOpen,
      description:
        'Base de conhecimento estruturada com artigos práticos, regras de negócio e orientações para resolução rápida de dúvidas do dia a dia.',
      items: [
        'Artigos objetivos pesquisáveis por palavra-chave',
        'Modelos de preenchimento e boas práticas de controle',
        'Procedimentos alinhados à legislação fiscal vigente',
      ],
    },
    {
      title: 'Orientação pelo Jetro On-line',
      icon: Search,
      description:
        'O assistente interno indica os treinamentos e tours relevantes diretamente no chat sempre que um usuário pergunta como executar uma tarefa.',
      items: [
        'Sugestão contextualizada de rotinas operacionais',
        'Atalho com 1 clique para iniciar o tour na tela desejada',
        'Suporte autônomo e contínuo para sua equipe',
      ],
    },
  ]

  const handleExplore = () => {
    const el = document.getElementById('contato')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="universidade"
      className="py-20 sm:py-28 bg-white text-[#202B28] border-b border-[#E4EAE6]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-12">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 text-[#063D30] text-xs font-semibold tracking-wide">
            <GraduationCap className="w-3.5 h-3.5 text-[#116B50]" />
            Capacitação Contínua & Adoção
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-heading text-[#063D30] tracking-tight">
            Universidade Jetro.{' '}
            <span className="text-[#116B50]">
              Conhecimento para aproveitar melhor cada funcionalidade.
            </span>
          </h2>
          <p className="text-[#66736D] text-sm sm:text-base leading-relaxed font-normal">
            Um ERP só gera valor real quando as pessoas sabem utilizá-lo com segurança. A
            Universidade Jetro combina vídeos, tutoriais e tours interativos integrados diretamente
            à interface.
          </p>
        </div>

        {/* 4 Pilares de Aprendizado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {learningPillars.map((p, idx) => {
            const Icon = p.icon
            const iconBgStyles = [
              'bg-[#EBF3EF] border-[#116B50]/20 text-[#116B50]',
              'bg-[#FAF7F0] border-[#C69B45]/30 text-[#C69B45]',
              'bg-[#F1F4F2] border-[#063D30]/15 text-[#063D30]',
              'bg-[#EBF3EF] border-[#116B50]/20 text-[#116B50]',
            ]
            const chosenStyle = iconBgStyles[idx % iconBgStyles.length]

            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#F8FAF9]/60 hover:bg-white border border-[#E4EAE6] p-6 flex flex-col justify-between hover:border-[#116B50]/40 transition-all duration-300 group shadow-2xs hover:shadow-md"
              >
                <div className="space-y-4">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${chosenStyle}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-base font-semibold font-heading text-[#063D30] group-hover:text-[#116B50] transition-colors">
                    {p.title}
                  </h3>

                  <p className="text-xs text-[#66736D] leading-relaxed font-normal">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E4EAE6]">
                  <ul className="space-y-2">
                    {p.items.map((item, i) => (
                      <li
                        key={i}
                        className="text-[11px] text-[#202B28]/85 flex items-start gap-1.5 font-normal"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#116B50] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Banner de Eficiência de Implantação */}
        <div className="rounded-2xl bg-white border border-[#E4EAE6] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs text-left">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C69B45]">
              Acelere a Curva de Adoção
            </span>
            <h3 className="text-xl sm:text-2xl font-semibold font-heading text-[#063D30]">
              Menos chamados de suporte básico, mais autonomia para sua operação
            </h3>
            <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed font-normal">
              Com tutoriais e tours integrados, novos operadores iniciam suas tarefas com orientação
              interativa passo a passo desde o primeiro dia de uso.
            </p>
          </div>

          <Button
            onClick={handleExplore}
            className="w-full md:w-auto bg-[#063D30] hover:bg-[#042820] text-white font-semibold text-sm px-6 py-5 rounded-xl cursor-pointer shrink-0 shadow-xs hover:shadow transition-all"
          >
            <span>Ver como funciona na prática</span>
            <ArrowRight className="w-4 h-4 ml-2 text-[#C69B45]" />
          </Button>
        </div>
      </div>
    </section>
  )
}

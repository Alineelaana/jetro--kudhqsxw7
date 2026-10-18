import { Video, BookOpen, Navigation, Search, CheckCircle2, ArrowRight } from 'lucide-react'
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
      className="py-20 sm:py-28 bg-[#00140b] text-white border-t border-white/5"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-12">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-[#C9A227]/30 text-[#f6d77c] text-xs font-bold uppercase tracking-wider">
            Capacitação Contínua & Adoção
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Universidade Jetro.{' '}
            <span className="text-[#C9A227]">
              Conhecimento para aproveitar melhor cada funcionalidade.
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Um ERP só gera valor real quando as pessoas sabem utilizá-lo com segurança. A
            Universidade Jetro combina vídeos, tutoriais e tours interativos integrados diretamente
            à interface.
          </p>
        </div>

        {/* 4 Pilares de Aprendizado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {learningPillars.map((p, idx) => {
            const Icon = p.icon
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-950/70 border border-white/10 p-6 flex flex-col justify-between hover:border-[#C9A227]/50 transition-all duration-300 group shadow-lg"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-[#C9A227] group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#f6d77c] transition-colors">
                    {p.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5">
                  <ul className="space-y-2">
                    {p.items.map((item, i) => (
                      <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
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
        <div className="rounded-2xl bg-slate-950 border border-[#C9A227]/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
              Acelere a Curva de Adoção
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Menos chamados de suporte básico, mais autonomia para sua operação
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Com tutoriais e tours integrados, novos operadores iniciam suas tarefas com orientação
              interativa passo a passo desde o primeiro dia de uso.
            </p>
          </div>

          <Button
            onClick={handleExplore}
            className="w-full md:w-auto bg-[#005A36] hover:bg-[#004225] border border-[#C9A227]/40 text-white font-bold text-sm px-6 py-5 rounded-xl cursor-pointer shrink-0"
          >
            <span>Ver como funciona na prática</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}

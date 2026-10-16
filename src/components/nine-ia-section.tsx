import { Button } from '@/components/ui/button'
import { Bot, Sparkles, MessageSquare, Brain, Lightbulb } from 'lucide-react'
import nineAvatar from '@/assets/whatsapp-image-2026-08-09-at-23.43.52-265df.jpeg'

export function NineIaSection() {
  const handleOpenNine = () => {
    const chatBtn = document.getElementById('floating-chat-trigger')
    if (chatBtn) {
      chatBtn.click()
    } else {
      const budgetSection = document.getElementById('orcamento')
      if (budgetSection) {
        budgetSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section
      id="nine-ia"
      className="py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative text-center">
            <div className="relative inline-block">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#005A36] to-[#C89B3C] rounded-full blur-lg opacity-40 animate-pulse" />
              <div className="relative h-64 w-64 sm:h-80 sm:w-80 rounded-full overflow-hidden border-4 border-[#C89B3C] shadow-2xl mx-auto">
                <img
                  src={nineAvatar}
                  alt="Jeh - Inteligência Artificial Jetro"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 right-2 bg-[#005A36] text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg border border-[#C89B3C] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#E5B85C]" />
                <span>Jeh</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#005A36]/10 text-[#005A36] text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              <Bot className="h-4 w-4 text-[#C89B3C]" />
              <span>Inteligência Artificial Integrada</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
              Conheça a Jeh
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              A Jeh é a inteligência artificial integrada ao ecossistema Jetro. Ela ajuda usuários a
              encontrar informações, compreender processos, analisar dados e navegar pela plataforma
              de maneira mais inteligente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-border space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-[#005A36] font-bold text-sm">
                  <Brain className="h-4 w-4 text-[#C89B3C]" />
                  <span>Análise Orientada a Dados</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Interpreta indicadores de vendas, financeira e operacional com respostas claras.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-border space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 text-[#005A36] font-bold text-sm">
                  <Lightbulb className="h-4 w-4 text-[#C89B3C]" />
                  <span>Suporte Operacional</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Orienta colaboradores sobre procedimentos, cadastros e fluxos do sistema.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleOpenNine}
                size="lg"
                className="bg-[#005A36] hover:bg-[#004225] text-white font-bold px-8 py-6 text-base rounded-lg shadow-lg shadow-[#005A36]/20"
              >
                <MessageSquare className="mr-2 h-5 w-5 text-[#E5B85C]" />
                Fale com a Jeh, nossa assistente virtual
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

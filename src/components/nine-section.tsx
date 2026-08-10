import { Bot, Sparkles, MessageSquare, Database, Shield, Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import nineAvatar from '@/assets/whatsapp-image-2026-08-09-at-23.43.52-265df.jpeg'

interface NineSectionProps {
  onOpenChat?: () => void
}

export function NineSection({ onOpenChat }: NineSectionProps) {
  return (
    <section
      id="nine-ia"
      className="py-16 sm:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden"
    >
      {/* Glowing elements */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 blur-[110px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Avatar & Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm w-full">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-400 to-[#C89B3C] blur-md opacity-50 group-hover:opacity-80 transition-opacity" />

              <div className="relative rounded-3xl bg-slate-900 p-6 border border-slate-800 text-center space-y-5 shadow-2xl">
                <div className="relative mx-auto w-40 h-40 rounded-full p-1.5 bg-gradient-to-tr from-emerald-400 via-teal-300 to-[#C89B3C] shadow-xl">
                  <img
                    src={nineAvatar}
                    alt="Srta. NINE - Inteligência Artificial Jetro"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                    Srta. NINE
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </h3>
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mt-0.5">
                    Inteligência Artificial Jetro
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs text-slate-300 space-y-1.5">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Superpoderes da Nine:
                  </p>
                  <ul className="space-y-1 text-slate-400 pl-4 list-disc">
                    <li>Análise de indicadores do ERP em tempo real</li>
                    <li>Respostas claras sobre processos e dados</li>
                    <li>Suporte à navegação e tomada de decisão</li>
                  </ul>
                </div>

                <Button
                  onClick={onOpenChat}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-5 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Fale com a Nine, nossa IA</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Description & Capabilities */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              <span>Inteligência Artificial Nativa</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Conheça a Nine
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              A Nine é a inteligência artificial integrada ao ecossistema Jetro. Ela ajuda usuários
              a encontrar informações, compreender processos, analisar dados e navegar pela
              plataforma de maneira mais inteligente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="p-2 w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Consultas em Dados Reais</h4>
                <p className="text-xs text-slate-400">
                  Responde perguntas sobre faturamento, estoque, inadimplência e metas com base em
                  dados oficiais do seu ERP.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="p-2 w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Governança & Segurança</h4>
                <p className="text-xs text-slate-400">
                  Respeita rigorosamente os perfis de acesso, visibilidade por filial e regras de
                  segurança da sua empresa.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={onOpenChat}
                variant="outline"
                className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 font-semibold"
              >
                <span>Iniciar conversa com a Nine</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

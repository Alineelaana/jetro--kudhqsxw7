import React from 'react'
import { Sparkles, Check, ArrowRight, UserCheck, Bot } from 'lucide-react'
import { JEH_AVATAR_URL } from '@/lib/jeh-assets'
import { JETRO_ONLINE_AVATAR_URL } from '@/lib/jetro-online-assets'

interface ComparisonRow {
  aspect: string
  jeh: string
  jetroOnline: string
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    aspect: 'Finalidade principal',
    jeh: 'Atendimento comercial',
    jetroOnline: 'Assistência operacional',
  },
  {
    aspect: 'Público atendido',
    jeh: 'Visitantes do site',
    jetroOnline: 'Usuários autenticados',
  },
  {
    aspect: 'Missão institucional',
    jeh: 'Apresenta o ERP',
    jetroOnline: 'Ajuda a utilizar o ERP',
  },
  {
    aspect: 'Informações e respostas',
    jeh: 'Responde dúvidas de interessados',
    jetroOnline: 'Consulta e analisa dados autorizados',
  },
  {
    aspect: 'Qualificação e ação',
    jeh: 'Captura e qualifica leads',
    jetroOnline: 'Apoia atividades e decisões',
  },
  {
    aspect: 'Continuidade e suporte',
    jeh: 'Encaminha oportunidades comerciais',
    jetroOnline: 'Recomenda treinamentos e tours',
  },
]

export function AiComparisonSection() {
  return (
    <section
      id="comparativo-ia"
      className="relative bg-gradient-to-b from-[#001D0F] via-[#002414] to-[#00180C] text-white py-14 sm:py-20 border-b border-[#C9A227]/30 overflow-hidden"
    >
      {/* Detalhes de luz de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#005B2E]/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10 space-y-10 sm:space-y-12">
        {/* Cabeçalho da Seção Comparativa */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005B2E]/60 border border-[#C9A227]/50 text-[#FFE28A] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Ecossistema de IA HURAM</span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Duas inteligências. Uma experiência mais completa.
          </h3>
          <p className="text-sm sm:text-base text-slate-300">
            Cada assistente foi concebida com um propósito claro, regras de acesso dedicadas e foco
            no momento certo do relacionamento com a sua empresa.
          </p>
        </div>

        {/* ============================================================== */}
        {/* TABELA COMPARATIVA RESPONSIVA                                  */}
        {/* Desktop: tabela com colunas bem delineadas                     */}
        {/* Mobile: cards comparativos por aspecto                         */}
        {/* ============================================================== */}

        {/* Versão Desktop / Tablet */}
        <div className="hidden md:block rounded-2xl border-2 border-[#C9A227]/60 bg-[#001A0E]/90 shadow-2xl overflow-hidden backdrop-blur-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#C9A227]/40 bg-[#002816]">
                <th className="p-4 lg:p-5 w-1/4 text-xs font-bold uppercase tracking-wider text-slate-300">
                  Dimensão
                </th>
                {/* Coluna da Jeh */}
                <th className="p-4 lg:p-5 w-[37.5%] border-l border-white/10 bg-[#00311B]/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C9A227] shrink-0 bg-[#002613] shadow-md">
                      <img
                        src={JEH_AVATAR_URL}
                        alt="Jeh"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white">Jeh</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#C9A227]/25 text-[#FFE28A] font-bold border border-[#C9A227]/40 uppercase tracking-wider">
                          Comercial
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-200">
                        Primeiro contato com visitantes
                      </span>
                    </div>
                  </div>
                </th>
                {/* Coluna do HURAM On-line */}
                <th className="p-4 lg:p-5 w-[37.5%] border-l border-white/10 bg-[#002B17]/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#C9A227] shrink-0 bg-[#001D0F] shadow-md">
                      <img
                        src={JETRO_ONLINE_AVATAR_URL}
                        alt="HURAM On-line"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white">HURAM On-line</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-200 font-bold border border-emerald-500/40 uppercase tracking-wider">
                          Operacional
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300">
                        Uso diário integrado ao ERP
                      </span>
                    </div>
                  </div>
                </th>{' '}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs sm:text-sm">
              {COMPARISON_ROWS.map((row, index) => (
                <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 lg:p-5 font-semibold text-slate-300 bg-[#001A0E]/50">
                    {row.aspect}
                  </td>
                  <td className="p-4 lg:p-5 border-l border-white/10 bg-[#002A17]/30 text-white font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#005B2E] border border-[#C9A227]/60 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#FFE28A]" />
                      </div>
                      <span>{row.jeh}</span>
                    </div>
                  </td>
                  <td className="p-4 lg:p-5 border-l border-white/10 bg-[#002213]/30 text-slate-200 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-400/50 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-300" />
                      </div>
                      <span>{row.jetroOnline}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Versão Mobile (Cards por Aspecto) */}
        <div className="md:hidden space-y-4">
          {/* Card Resumo das duas IAs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#002A17] border border-[#C9A227]/40 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full overflow-hidden border-2 border-[#C9A227] bg-[#002613]">
                <img src={JEH_AVATAR_URL} alt="Jeh" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-sm font-bold text-white">Jeh</h4>
              <span className="text-[10px] block px-2 py-0.5 rounded-full bg-[#C9A227]/20 text-[#FFE28A] font-bold">
                Atendimento Comercial
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#002414] border border-emerald-500/40 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full overflow-hidden border-2 border-[#C9A227] bg-[#001D0F]">
                <img
                  src={JETRO_ONLINE_AVATAR_URL}
                  alt="HURAM On-line"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-sm font-bold text-white">HURAM On-line</h4>
              <span className="text-[10px] block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 font-bold">
                Assistência Operacional
              </span>
            </div>
          </div>

          {/* Lista de Aspectos */}
          <div className="space-y-3">
            {COMPARISON_ROWS.map((row, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-[#002011] border border-white/10 space-y-2.5"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFE28A] block">
                  {row.aspect}
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-[#002F1A] border border-[#C9A227]/30 flex items-start gap-2">
                    <span className="text-[10px] font-bold text-[#FFE28A] uppercase shrink-0 mt-0.5">
                      Jeh:
                    </span>
                    <span className="text-white font-medium">{row.jeh}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#00180D] border border-white/10 flex items-start gap-2">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase shrink-0 mt-0.5">
                      HURAM On-line:
                    </span>
                    <span className="text-slate-300 font-medium">{row.jetroOnline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mensagem Final EXATA (item 7) */}
        <div className="text-center max-w-3xl mx-auto pt-2">
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#002D18] via-[#003B20] to-[#002D18] border-2 border-[#C9A227]/70 shadow-xl">
            <p className="text-base sm:text-xl font-black text-white leading-relaxed">
              "A Jeh aproxima novos clientes do HURAM. O HURAM On-line aproxima os usuários das
              informações da empresa."
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

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
      className="relative bg-white text-[#202B28] py-16 sm:py-20 border-b border-[#E4EAE6] overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10 space-y-10 sm:space-y-12">
        {/* Cabeçalho da Seção Comparativa */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 text-[#063D30] text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#C69B45]" />
            <span>Ecossistema de IA HURAM</span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold font-heading text-[#063D30] tracking-tight">
            Duas inteligências. Uma experiência mais completa.
          </h3>
          <p className="text-sm sm:text-base text-[#66736D] font-normal leading-relaxed">
            Cada assistente foi concebida com um propósito claro, regras de acesso dedicadas e foco
            no momento certo do relacionamento com a sua empresa.
          </p>
        </div>

        {/* Versão Desktop / Tablet */}
        <div className="hidden md:block rounded-2xl border border-[#E4EAE6] bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E4EAE6] bg-[#F8FAF9]">
                <th className="p-4 lg:p-5 w-1/4 text-xs font-semibold uppercase tracking-wider text-[#66736D]">
                  Dimensão
                </th>
                {/* Coluna da Jeh */}
                <th className="p-4 lg:p-5 w-[37.5%] border-l border-[#E4EAE6] bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E4EAE6] shrink-0 bg-[#F8FAF9] shadow-2xs">
                      <img
                        src={JEH_AVATAR_URL}
                        alt="Jeh"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold font-heading text-[#063D30]">
                          Jeh
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#063D30] font-medium border border-emerald-200 uppercase tracking-wider">
                          Comercial
                        </span>
                      </div>
                      <span className="text-[11px] text-[#116B50]">
                        Primeiro contato com visitantes
                      </span>
                    </div>
                  </div>
                </th>
                {/* Coluna do HURAM On-line */}
                <th className="p-4 lg:p-5 w-[37.5%] border-l border-[#E4EAE6] bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-[#E4EAE6] shrink-0 bg-[#F8FAF9] shadow-2xs">
                      <img
                        src={JETRO_ONLINE_AVATAR_URL}
                        alt="HURAM On-line"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold font-heading text-[#063D30]">
                          HURAM On-line
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1F4F2] text-[#063D30] font-medium border border-[#063D30]/15 uppercase tracking-wider">
                          Operacional
                        </span>
                      </div>
                      <span className="text-[11px] text-[#66736D]">
                        Uso diário integrado ao ERP
                      </span>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4EAE6] text-xs sm:text-sm">
              {COMPARISON_ROWS.map((row, index) => (
                <tr key={index} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="p-4 lg:p-5 font-semibold text-[#063D30] bg-[#F8FAF9]/50">
                    {row.aspect}
                  </td>
                  <td className="p-4 lg:p-5 border-l border-[#E4EAE6] bg-white text-[#202B28] font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#116B50]" />
                      </div>
                      <span className="font-normal text-[#202B28]">{row.jeh}</span>
                    </div>
                  </td>
                  <td className="p-4 lg:p-5 border-l border-[#E4EAE6] bg-white text-[#202B28] font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#063D30]" />
                      </div>
                      <span className="font-normal text-[#202B28]">{row.jetroOnline}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Versão Mobile (Cards por Aspecto) */}
        <div className="md:hidden space-y-4 text-left">
          {/* Card Resumo das duas IAs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-[#E4EAE6] text-center space-y-2 shadow-2xs">
              <div className="w-12 h-12 mx-auto rounded-full overflow-hidden border border-[#E4EAE6] bg-[#F8FAF9]">
                <img src={JEH_AVATAR_URL} alt="Jeh" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-sm font-semibold font-heading text-[#063D30]">Jeh</h4>
              <span className="text-[10px] block px-2 py-0.5 rounded-full bg-emerald-50 text-[#063D30] font-medium border border-emerald-200">
                Atendimento Comercial
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E4EAE6] text-center space-y-2 shadow-2xs">
              <div className="w-12 h-12 mx-auto rounded-full overflow-hidden border border-[#E4EAE6] bg-[#F8FAF9]">
                <img
                  src={JETRO_ONLINE_AVATAR_URL}
                  alt="HURAM On-line"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-sm font-semibold font-heading text-[#063D30]">HURAM On-line</h4>
              <span className="text-[10px] block px-2 py-0.5 rounded-full bg-[#F1F4F2] text-[#063D30] font-medium border border-[#063D30]/15">
                Assistência Operacional
              </span>
            </div>
          </div>

          {/* Lista de Aspectos */}
          <div className="space-y-3">
            {COMPARISON_ROWS.map((row, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white border border-[#E4EAE6] space-y-2.5 shadow-2xs"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C69B45] block font-heading">
                  {row.aspect}
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#E4EAE6] flex items-start gap-2">
                    <span className="text-[10px] font-semibold text-[#063D30] uppercase shrink-0 mt-0.5">
                      Jeh:
                    </span>
                    <span className="text-[#202B28] font-normal">{row.jeh}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#E4EAE6] flex items-start gap-2">
                    <span className="text-[10px] font-semibold text-[#116B50] uppercase shrink-0 mt-0.5">
                      HURAM On-line:
                    </span>
                    <span className="text-[#202B28] font-normal">{row.jetroOnline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mensagem Final EXATA (item 7) */}
        <div className="text-center max-w-3xl mx-auto pt-2">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAF9] border border-[#E4EAE6] shadow-2xs">
            <p className="text-base sm:text-xl font-semibold font-heading text-[#063D30] leading-relaxed">
              "A Jeh aproxima novos clientes do HURAM. O HURAM On-line aproxima os usuários das
              informações da empresa."
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

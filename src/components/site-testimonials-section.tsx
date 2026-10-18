import { useEffect, useState } from 'react'
import {
  Quote,
  Instagram,
  Sparkles,
  ShieldCheck,
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getPublicApprovedTestimonials,
  getTestimonialPhotoUrl,
  buildInstagramUrl,
  type SiteTestimonial,
} from '@/services/site-testimonials'
import { TestimonialSubmitModal } from '@/components/testimonial-submit-modal'

export function SiteTestimonialsSection() {
  const [testimonials, setTestimonials] = useState<SiteTestimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)

  const loadData = async () => {
    try {
      const data = await getPublicApprovedTestimonials()
      setTestimonials(data)
    } catch (err) {
      console.error('Falha ao carregar depoimentos públicos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const displayedList = testimonials.slice(0, visibleCount)
  const hasMore = testimonials.length > visibleCount

  return (
    <section
      id="depoimentos"
      className="relative py-20 sm:py-28 bg-[#001c10] text-white border-t border-white/5 overflow-hidden"
    >
      {/* Luz ambiente de fundo verde e dourada */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-radial from-[#005B2E]/20 via-[#C9A227]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Cabeçalho da seção com os títulos EXATOS solicitados */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-[#C9A227]/40 text-[#f6d77c] text-xs font-bold uppercase tracking-wider shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              Experiências reais
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              O que nossos clientes dizem sobre o Jetro
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Experiências reais de empresas que fazem parte da nossa trajetória.
            </p>
          </div>

          {/* Botão de Ação EXATO solicitado */}
          <div className="shrink-0">
            <Button
              type="button"
              onClick={() => setModalOpen(true)}
              className="h-12 px-6 bg-gradient-to-r from-[#005B2E] to-[#007038] hover:from-[#004d26] hover:to-[#005f30] text-white font-bold text-sm rounded-xl border border-[#C9A227]/50 shadow-xl shadow-emerald-950/50 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#C9A227]" />
              Deixe seu depoimento sobre o Jetro
            </Button>
          </div>
        </div>

        {/* Grade de Depoimentos ou Estado Convidativo quando vazio */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          /* Convite discreto para clientes compartilharem experiências (quando nenhum aprovado) */
          <div className="rounded-2xl bg-gradient-to-b from-[#002817]/60 to-[#00140b]/60 border border-[#C9A227]/30 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/40 text-[#f6d77c] flex items-center justify-center mx-auto">
              <Quote className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Sua empresa utiliza o Jetro ERP?</h3>
            <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">
              Compartilhe sua experiência de evolução na gestão, rotina e tecnologia. Seu relato
              inspirará outras empresas que buscam inteligência e eficiência operacional.
            </p>
            <div className="pt-2">
              <Button
                type="button"
                onClick={() => setModalOpen(true)}
                className="bg-[#005B2E] hover:bg-[#004824] text-white font-bold text-sm px-6 h-11 border border-[#C9A227]/40 rounded-xl"
              >
                <MessageSquarePlus className="w-4 h-4 mr-2 text-[#C9A227]" />
                Deixe seu depoimento sobre o Jetro
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedList.map((item) => {
                const photoUrl = getTestimonialPhotoUrl(item)
                const instaUrl = buildInstagramUrl(item.instagram)

                return (
                  <div
                    key={item.id}
                    className="relative rounded-2xl bg-gradient-to-b from-[#002817]/80 to-[#00140b]/90 border border-[#C9A227]/30 hover:border-[#C9A227] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#C9A227]/10 group"
                  >
                    {/* Aspas decorativas douradas */}
                    <div className="absolute top-6 right-6 text-[#C9A227]/20 group-hover:text-[#C9A227]/35 transition-colors pointer-events-none">
                      <Quote className="w-10 h-10" />
                    </div>

                    {/* Conteúdo do depoimento */}
                    <div className="space-y-4 relative z-10">
                      {/* Selo: Depoimento Verificado (Apenas quando verificado=true) */}
                      {item.verificado && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Depoimento verificado</span>
                        </div>
                      )}

                      <p className="text-slate-200 text-sm leading-relaxed italic">
                        "{item.depoimento}"
                      </p>
                    </div>

                    {/* Rodapé do card: Foto, Autor, Empresa e Instagram com link seguro */}
                    <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-3.5 relative z-10">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={item.nome_autor}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#C9A227]/60 shrink-0 shadow-md"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-black/40 border-2 border-[#C9A227]/40 flex items-center justify-center text-[#f6d77c] shrink-0 font-bold text-sm">
                          {item.nome_autor.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-[#f6d77c] transition-colors">
                          {item.nome_autor}
                        </h4>
                        <p className="text-xs text-slate-300 font-medium truncate">
                          {item.empresa}
                        </p>
                        {instaUrl && (
                          <a
                            href={instaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-[#f6d77c] hover:underline mt-0.5 truncate transition-colors"
                            title={`Acessar Instagram @${item.instagram.replace(/^@/, '')}`}
                          >
                            <Instagram className="w-3 h-3 text-[#C9A227] shrink-0" />
                            <span>@{item.instagram.replace(/^@/, '')}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Ver mais depoimentos quando houver mais de 6 */}
            {hasMore && (
              <div className="pt-10 text-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="border-[#C9A227]/40 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs px-6 h-10 rounded-xl"
                >
                  Ver mais depoimentos ({testimonials.length - visibleCount} restantes)
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Envio Público */}
      <TestimonialSubmitModal
        open={modalOpen}
        onOpenChange={(v) => {
          setModalOpen(v)
          if (!v) loadData()
        }}
      />
    </section>
  )
}

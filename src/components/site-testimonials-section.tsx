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
      className="relative py-20 sm:py-28 bg-[#F8FAF9] text-[#202B28] border-b border-[#E4EAE6] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Cabeçalho da seção com os títulos EXATOS solicitados */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#C69B45]/30 text-[#063D30] text-xs font-semibold tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C69B45]" />
              Experiências reais
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold font-heading text-[#063D30] tracking-tight leading-tight">
              O que nossos clientes dizem sobre o Jetro
            </h2>

            <p className="text-[#66736D] text-sm sm:text-base leading-relaxed font-normal">
              Experiências reais de empresas que fazem parte da nossa trajetória.
            </p>
          </div>

          {/* Botão de Ação EXATO solicitado */}
          <div className="shrink-0">
            <Button
              type="button"
              onClick={() => setModalOpen(true)}
              className="h-12 px-6 bg-[#063D30] hover:bg-[#042820] text-white font-semibold text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#C69B45]" />
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
                className="h-64 rounded-2xl bg-[#F8FAF9] border border-[#E4EAE6] animate-pulse"
              />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          /* Convite discreto para clientes compartilharem experiências (quando nenhum aprovado) */
          <div className="rounded-2xl bg-[#F8FAF9] border border-[#E4EAE6] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xs space-y-4">
            <div className="w-14 h-14 rounded-full bg-white border border-[#E4EAE6] text-[#063D30] flex items-center justify-center mx-auto shadow-2xs">
              <Quote className="w-7 h-7 text-[#116B50]" />
            </div>
            <h3 className="text-xl font-semibold font-heading text-[#063D30]">
              Sua empresa utiliza o Jetro ERP?
            </h3>
            <p className="text-[#66736D] text-sm max-w-lg mx-auto leading-relaxed font-normal">
              Compartilhe sua experiência de evolução na gestão, rotina e tecnologia. Seu relato
              inspirará outras empresas que buscam inteligência e eficiência operacional.
            </p>
            <div className="pt-2">
              <Button
                type="button"
                onClick={() => setModalOpen(true)}
                className="bg-[#063D30] hover:bg-[#042820] text-white font-semibold text-sm px-6 h-11 rounded-xl cursor-pointer shadow-xs"
              >
                <MessageSquarePlus className="w-4 h-4 mr-2 text-[#C69B45]" />
                Deixe seu depoimento sobre o Jetro
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {displayedList.map((item) => {
                const photoUrl = getTestimonialPhotoUrl(item)
                const instaUrl = buildInstagramUrl(item.instagram)

                return (
                  <div
                    key={item.id}
                    className="relative rounded-2xl bg-white border border-[#E4EAE6] hover:border-[#116B50]/40 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-2xs hover:shadow-md group"
                  >
                    {/* Aspas decorativas */}
                    <div className="absolute top-6 right-6 text-[#116B50]/15 group-hover:text-[#116B50]/25 transition-colors pointer-events-none">
                      <Quote className="w-10 h-10" />
                    </div>

                    {/* Conteúdo do depoimento */}
                    <div className="space-y-4 relative z-10">
                      {/* Selo: Depoimento Verificado */}
                      {item.verificado && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#063D30] text-[11px] font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#116B50] shrink-0" />
                          <span>Depoimento verificado</span>
                        </div>
                      )}

                      <p className="text-[#202B28]/90 text-sm leading-relaxed italic font-normal">
                        "{item.depoimento}"
                      </p>
                    </div>

                    {/* Rodapé do card: Foto, Autor, Empresa e Instagram com link seguro */}
                    <div className="pt-6 mt-6 border-t border-[#E4EAE6] flex items-center gap-3.5 relative z-10">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={item.nome_autor}
                          className="w-12 h-12 rounded-full object-cover border border-[#E4EAE6] shrink-0 shadow-2xs"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#F8FAF9] border border-[#E4EAE6] flex items-center justify-center text-[#063D30] shrink-0 font-semibold text-sm">
                          {item.nome_autor.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold font-heading text-[#063D30] truncate group-hover:text-[#116B50] transition-colors">
                          {item.nome_autor}
                        </h4>
                        <p className="text-xs text-[#66736D] font-normal truncate">
                          {item.empresa}
                        </p>
                        {instaUrl && (
                          <a
                            href={instaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#116B50] hover:text-[#063D30] hover:underline mt-0.5 truncate transition-colors font-medium"
                            title={`Acessar Instagram @${item.instagram.replace(/^@/, '')}`}
                          >
                            <Instagram className="w-3 h-3 text-[#116B50] shrink-0" />
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
                  className="border-[#063D30]/25 bg-white hover:bg-[#F8FAF9] text-[#063D30] font-semibold text-xs px-6 h-10 rounded-xl cursor-pointer"
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

import { useEffect, useState } from 'react'
import { Building2, ExternalLink, Instagram, Sparkles, ArrowUpRight } from 'lucide-react'
import {
  getPublicSiteClients,
  getSiteClientLogoUrl,
  resolveSiteClientLogoUrl,
  type SiteClient,
} from '@/services/site-clients'
import { buildInstagramUrl } from '@/services/site-testimonials'

export function SiteClientsSection() {
  const [clients, setClients] = useState<SiteClient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const data = await getPublicSiteClients()
        if (isMounted) {
          setClients(data)
        }
      } catch (err) {
        console.error('Falha ao carregar clientes do site:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section
      id="nossos-clientes"
      className="relative py-20 sm:py-28 bg-[#F8FAF9] text-[#202B28] border-b border-[#E4EAE6] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Cabeçalho da seção com textos EXATOS exigidos */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 text-[#063D30] text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#C69B45]" />
            Nossos Clientes
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold font-heading text-[#063D30] tracking-tight leading-tight">
            Empresas que fazem parte da nossa história
          </h2>

          <p className="text-[#66736D] text-sm sm:text-base leading-relaxed font-normal">
            Conheça algumas das empresas que fazem parte da trajetória do Jetro. Cada parceria
            representa nosso compromisso com a evolução da gestão empresarial, a tecnologia e a
            busca por soluções cada vez mais inteligentes.
          </p>
        </div>

        {/* Grade de Clientes em formato premium */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-white border border-[#E4EAE6] animate-pulse"
              />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-2xl bg-white border border-[#E4EAE6] max-w-xl mx-auto shadow-2xs">
            <Building2 className="w-10 h-10 text-[#063D30] mx-auto mb-3 opacity-80" />
            <p className="text-[#66736D] text-sm">
              Nossa história continua sendo construída a cada dia ao lado de grandes empresas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clients.map((client) => {
              const logoUrl = resolveSiteClientLogoUrl(client)
              const instaUrl = client.instagram ? buildInstagramUrl(client.instagram) : ''

              return (
                <div
                  key={client.id}
                  className="group relative rounded-2xl bg-white border border-[#E4EAE6] hover:border-[#116B50]/40 p-6 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-md text-left"
                >
                  {/* Área do Logo */}
                  <div className="h-32 flex items-center justify-center p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6] relative overflow-hidden transition-all duration-300 group-hover:border-[#116B50]/30">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={`Logotipo oficial de ${client.nome}`}
                        className="max-h-24 max-w-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center px-3 py-2">
                        <span className="font-heading tracking-wider font-semibold text-base sm:text-lg text-[#063D30] block">
                          {client.nome}
                        </span>
                        <span className="text-[9px] tracking-widest uppercase text-[#C69B45] font-semibold mt-0.5 block">
                          Parceiro Oficial Jetro
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informações da Empresa */}
                  <div className="pt-4 mt-2 border-t border-[#E4EAE6] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold font-heading text-[#063D30] truncate group-hover:text-[#116B50] transition-colors">
                        {client.nome}
                      </h3>
                      {client.instagram && (
                        <p className="text-xs text-[#66736D] truncate font-normal">
                          @{client.instagram.replace(/^@/, '')}
                        </p>
                      )}
                    </div>

                    {/* Links rápidos */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {client.site && (
                        <a
                          href={client.site}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-[#F8FAF9] hover:bg-[#063D30] border border-[#E4EAE6] flex items-center justify-center text-[#66736D] hover:text-white transition-colors"
                          title={`Visitar site oficial de ${client.nome}`}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                      {instaUrl && (
                        <a
                          href={instaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-[#F8FAF9] hover:bg-[#063D30] border border-[#E4EAE6] flex items-center justify-center text-[#66736D] hover:text-white transition-all"
                          title={`Ver perfil no Instagram de ${client.nome}`}
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

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
      className="relative py-20 sm:py-28 bg-[#00140b] text-white border-t border-white/5 overflow-hidden"
    >
      {/* Luz ambiente de fundo verde e dourada */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-64 bg-radial from-[#C9A227]/10 via-[#005B2E]/15 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Cabeçalho da seção com textos EXATOS exigidos */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-[#C9A227]/40 text-[#f6d77c] text-xs font-bold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            Nossos Clientes
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Empresas que fazem parte da nossa história
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
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
                className="h-44 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-2xl bg-white/[0.02] border border-white/10 max-w-xl mx-auto">
            <Building2 className="w-10 h-10 text-[#C9A227] mx-auto mb-3 opacity-80" />
            <p className="text-slate-300 text-sm">
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
                  className="group relative rounded-2xl bg-gradient-to-b from-[#002817]/90 to-[#00140b]/95 border border-[#C9A227]/30 hover:border-[#C9A227] p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#C9A227]/15"
                >
                  {/* Brilho dourado no hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#C9A227]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Área do Logo com fundo suave/claro harmonioso com a paleta #002817/#00140b e dourado */}
                  <div className="h-32 flex items-center justify-center p-3.5 rounded-xl bg-white/[0.97] border border-[#C9A227]/40 shadow-inner relative overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#C9A227]/20 group-hover:border-[#C9A227]">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={`Logotipo oficial de ${client.nome}`}
                        className="max-h-24 max-w-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center px-3 py-2">
                        <span className="font-serif tracking-wider font-bold text-base sm:text-lg text-[#002817] block">
                          {client.nome}
                        </span>
                        <span className="text-[9px] tracking-widest uppercase text-[#8E6E17] font-semibold mt-0.5 block">
                          Parceiro Oficial Jetro
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informações da Empresa */}
                  <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-[#f6d77c] transition-colors">
                        {client.nome}
                      </h3>
                      {client.instagram && (
                        <p className="text-xs text-slate-400 truncate">
                          @{client.instagram.replace(/^@/, '')}
                        </p>
                      )}
                    </div>

                    {/* Links rápidos (Site / Instagram) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {client.site && (
                        <a
                          href={client.site}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#005B2E] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
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
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-gradient-to-tr hover:from-amber-600 hover:via-pink-600 hover:to-purple-600 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all"
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

import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import ctaBgImg from '@/assets/whatsapp-image-2026-08-09-at-23.43.49-566dc.jpeg'

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#002817] py-16 sm:py-24 border-t border-[#C89B3C]/30 text-white">
      {/* Background overlay pattern */}
      <div className="absolute inset-0 z-0 opacity-15">
        <img src={ctaBgImg} alt="" className="w-full h-full object-cover object-center blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#002817] via-[#002817]/90 to-[#002817]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#C89B3C]/20 border border-[#C89B3C]/50 text-[#E5B85C] text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              Apresentação Comercial
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Transforme sua operação logística com a Jetro
            </h2>

            <p className="text-gray-200 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-normal">
              Solicite uma apresentação comercial e descubra como nossa arquitetura pode elevar a
              eficiência da sua empresa no Espírito Santo.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <div className="bg-[#003822] border border-[#C89B3C]/40 px-5 py-3 rounded-xl flex items-center gap-3 shadow-md">
                <Phone className="w-5 h-5 text-[#E5B85C]" />
                <span className="text-[#E5B85C] text-lg sm:text-xl font-bold tracking-wide">
                  31 9 9129-7619
                </span>
              </div>

              <Button
                asChild
                className="bg-[#C89B3C] hover:bg-[#E5B85C] text-white font-bold px-8 py-6 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                <Link to="/#orcamento">Solicitar Orçamento</Link>
              </Button>
            </div>
          </div>

          {/* Restored Image Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#C89B3C]/40 shadow-2xl group max-w-lg w-full">
              <img
                src={ctaBgImg}
                alt="Jetro Gestão Inteligente"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#002817]/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-3 left-4 right-3 text-left">
                <span className="text-xs font-semibold text-[#E5B85C] uppercase tracking-wider bg-[#002817]/80 backdrop-blur-md px-2.5 py-1 rounded">
                  Jetro — Plataforma Inteligente
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

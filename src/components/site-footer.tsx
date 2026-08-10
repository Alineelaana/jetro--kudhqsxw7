import { MapPin, Phone, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { POLICY_LINKS } from '@/lib/policy-links'
import logoJetro from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-7232a.jpeg'

export function SiteFooter() {
  return (
    <footer id="contato" className="bg-[#01361D] text-white/80 py-12 border-t border-[#C89B3C]/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-4">
            <img
              src={logoJetro}
              alt="Jetro - Plataforma Inteligente de Gestão Empresarial"
              className="h-16 w-auto object-contain rounded-lg border border-[#C89B3C]/30 shadow-md"
            />
            <p className="text-sm leading-relaxed max-w-sm text-white/80">
              <strong>Jetro - Plataforma Inteligente de Gestão Empresarial</strong>. Soluções
              integradas para armazenagem, transporte de cargas, controladoria, inteligência de
              negócios e gestão corporativa de alta performance.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-black text-base border-b border-[#C89B3C]/40 pb-2 inline-block">
              Soluções Integradas
            </h4>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#servicos" className="hover:text-[#E4C46A] transition-colors">
                  • Armazenagem & Gestão WMS
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#E4C46A] transition-colors">
                  • Transporte Rodoviário & Frotas
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#E4C46A] transition-colors">
                  • Controladoria & Performance ERP
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#E4C46A] transition-colors">
                  • Logística de Distribuição Inteligente
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#E4C46A] transition-colors">
                  • Inteligência de Negócios Jetro
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-black text-base border-b border-[#C89B3C]/40 pb-2 inline-block">
              Central de Atendimento
            </h4>
            <ul className="text-sm space-y-2.5">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C89B3C]" />
                <span>Central: (31) 99129-7619</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C89B3C]" />
                <span>Atendimento: Seg. a Sex. 08h às 18h</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C89B3C]" />
                <span>Plataforma de Gestão com Atendimento Nacional</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-xs text-center text-white/60 flex flex-col gap-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {POLICY_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-[#E4C46A] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>
              © {new Date().getFullYear()} Jetro - Plataforma Inteligente de Gestão Empresarial.
              Todos os direitos reservados.
            </span>
            <span className="text-[#E4C46A] font-semibold">
              Inteligência que conecta | Tecnologia que evolui | Resultados que transformam
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

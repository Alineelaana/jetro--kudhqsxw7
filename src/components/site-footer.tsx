import { Link } from 'react-router-dom'
import { logoHuramDark } from '@/lib/brand-assets'
import { useAuth } from '@/hooks/use-auth'
import { AttributionFooter } from '@/components/attribution-footer'
import { ShieldCheck, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

export function SiteFooter() {
  const currentYear = new Date().getFullYear()
  const { isAuthenticated } = useAuth()

  return (
    <footer className="bg-[#F8FAF9] text-[#202B28] border-t border-[#E4EAE6] pt-16 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Coluna 1: Marca & Posicionamento */}
          <div className="space-y-4">
            <Link
              to={isAuthenticated ? '/admin' : '/'}
              className="inline-flex items-center gap-3 group transition-opacity hover:opacity-95"
              title={
                isAuthenticated
                  ? 'Painel Operacional HURAM'
                  : 'Retornar para a tela inicial / login'
              }
            >
              <img
                src={logoHuramDark}
                alt="HURAM — Sistema Inteligente de Gestão"
                className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-heading text-[#063D30] tracking-tight leading-none">
                  HURAM
                </span>
                <span className="text-[10px] font-semibold text-[#C69B45] tracking-wider uppercase mt-0.5">
                  Sistema Inteligente de Gestão
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed">
              Inteligência que conecta sua gestão. Plataforma desenvolvida para integrar processos,
              organizar informações, acompanhar operações e transformar dados em decisões
              estratégicas.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#063D30] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#116B50]" />
              <span>Ambiente seguro em nuvem na Skip Cloud</span>
            </div>
          </div>

          {/* Coluna 2: Navegação Institucional */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#063D30] mb-4 font-heading flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C69B45]" />
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#66736D]">
              <li>
                <a
                  href="#inicio"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Início
                </a>
              </li>
              <li>
                <a
                  href="#sobre"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  A HURAM
                </a>
              </li>
              <li>
                <a
                  href="#solucoes"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Soluções & Módulos
                </a>
              </li>
              <li>
                <a
                  href="#telas"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Por Dentro do ERP (Galeria)
                </a>
              </li>
              <li>
                <a
                  href="#fluxo"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Gestão de Ponta a Ponta
                </a>
              </li>
              <li>
                <a href="#ia" className="hover:text-[#063D30] hover:font-medium transition-colors">
                  Inteligência Artificial (Jeh & HURAM On-line)
                </a>
              </li>
              <li>
                <a
                  href="#universidade"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Universidade HURAM & Tours
                </a>
              </li>
              <li>
                <a
                  href="#diferenciais"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Diferenciais de Arquitetura
                </a>
              </li>
              <li>
                <a
                  href="#contato"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Solicitar Demonstração
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Políticas & Termos Oficiais */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#063D30] mb-4 font-heading flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C69B45]" />
              Políticas & Governança
            </h4>
            <ul className="space-y-2 text-xs text-[#66736D]">
              {!isAuthenticated && (
                <li>
                  <Link
                    to="/"
                    className="text-[#063D30] font-semibold hover:text-[#116B50] hover:underline flex items-center gap-1"
                  >
                    <span>Acessar o Sistema (Login)</span>
                    <ExternalLink className="w-3 h-3 text-[#C69B45]" />
                  </Link>
                </li>
              )}
              {isAuthenticated && (
                <li>
                  <Link
                    to="/admin"
                    className="text-[#063D30] font-semibold hover:text-[#116B50] hover:underline flex items-center gap-1"
                  >
                    <span>Painel Administrativo</span>
                    <ExternalLink className="w-3 h-3 text-[#C69B45]" />
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/politica-de-privacidade"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  to="/termos-de-uso"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-de-cookies"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-de-sla"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Acordo de Nível de Serviço (SLA)
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-de-backup-continuidade"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Backup e Continuidade Operacional
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-comercial"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Política Comercial
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-de-licenciamento"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Política de Licenciamento
                </Link>
              </li>
              <li>
                <Link
                  to="/central-de-privacidade"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Central de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  to="/canal-de-privacidade"
                  className="hover:text-[#063D30] hover:font-medium transition-colors"
                >
                  Canal de Privacidade (DPO)
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Canais Oficiais Cadastrados */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#063D30] mb-4 font-heading flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C69B45]" />
              Canais Oficiais
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-[#66736D]">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#063D30] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#202B28] block">
                    WhatsApp Comercial Oficial:
                  </span>
                  <a
                    href="https://wa.me/5531991297619"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#063D30] font-semibold hover:underline"
                  >
                    +55 (31) 99129-7619
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#063D30] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#202B28] block">
                    Atendimento & Demonstração:
                  </span>
                  <span>Canal direto via formulário no site</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#063D30] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#202B28] block">Abrangência:</span>
                  <span>Atendimento em todo território nacional</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-block px-3 py-1.5 rounded-lg bg-white text-[11px] font-semibold text-[#063D30] border border-[#E4EAE6] shadow-2xs">
                  Suporte & Consultoria Especializada
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha Divisória & Copyright */}
        <div className="pt-8 border-t border-[#E4EAE6] flex flex-col sm:flex-row items-center justify-between text-xs text-[#66736D] gap-4">
          <p>
            © {currentYear} HURAM — Sistema Inteligente de Gestão. Todos os direitos reservados.
          </p>
          <p className="text-center sm:text-right font-medium text-[#202B28]/80">
            Governança, Conformidade & Inteligência Empresarial
          </p>
        </div>

        {/* Identificação Legal Obrigatória Preservada Verbatim */}
        <div className="mt-6 pt-4 border-t border-[#E4EAE6]/60 text-center">
          <AttributionFooter variant="inline" className="text-[#66736D] text-xs" />
        </div>
      </div>
    </footer>
  )
}

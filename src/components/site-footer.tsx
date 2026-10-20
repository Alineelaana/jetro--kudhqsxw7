import { Link } from 'react-router-dom'
import { logoHuramDark } from '@/lib/brand-assets'
import { useAuth } from '@/hooks/use-auth'
import { AttributionFooter } from '@/components/attribution-footer'
import { ShieldCheck, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

export function SiteFooter() {
  const currentYear = new Date().getFullYear()
  const { isAuthenticated } = useAuth()

  return (
    <footer className="bg-[#001c10] text-white border-t border-[#D6A755]/30 pt-16 pb-12">
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
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 rounded-md bg-[#002820] p-1"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tight leading-none">
                  HURAM
                </span>
                <span className="text-[10px] font-semibold text-[#D6A755] tracking-wider uppercase mt-0.5">
                  Sistema Inteligente de Gestão
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Inteligência que conecta sua gestão. Plataforma desenvolvida para integrar processos,
              organizar informações, acompanhar operações e transformar dados em decisões
              estratégicas.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#f6d77c]">
              <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
              <span>Ambiente seguro em nuvem na Skip Cloud</span>
            </div>
          </div>

          {/* Coluna 2: Navegação Institucional */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A227] mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <a href="#inicio" className="hover:text-white transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-white transition-colors">
                  A HURAM
                </a>
              </li>
              <li>
                <a href="#solucoes" className="hover:text-white transition-colors">
                  Soluções & Módulos
                </a>
              </li>
              <li>
                <a href="#telas" className="hover:text-white transition-colors">
                  Por Dentro do ERP (Galeria)
                </a>
              </li>
              <li>
                <a href="#fluxo" className="hover:text-white transition-colors">
                  Gestão de Ponta a Ponta
                </a>
              </li>
              <li>
                <a href="#ia" className="hover:text-white transition-colors">
                  Inteligência Artificial (Jeh & HURAM On-line)
                </a>
              </li>
              <li>
                <a href="#universidade" className="hover:text-white transition-colors">
                  Universidade HURAM & Tours
                </a>
              </li>
              <li>
                <a href="#diferenciais" className="hover:text-white transition-colors">
                  Diferenciais de Arquitetura
                </a>
              </li>
              <li>
                <a href="#contato" className="hover:text-white transition-colors">
                  Solicitar Demonstração
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Políticas & Termos Oficiais */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A227] mb-4">
              Políticas & Governança
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {!isAuthenticated && (
                <li>
                  <Link
                    to="/"
                    className="text-[#f6d77c] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Acessar o Sistema (Login)</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              )}
              {isAuthenticated && (
                <li>
                  <Link
                    to="/admin"
                    className="text-[#f6d77c] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Painel Administrativo</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              )}
              <li>
                <Link to="/politica-de-privacidade" className="hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos-de-uso" className="hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/politica-de-cookies" className="hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link to="/politica-de-sla" className="hover:text-white transition-colors">
                  Acordo de Nível de Serviço (SLA)
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-de-backup-continuidade"
                  className="hover:text-white transition-colors"
                >
                  Backup e Continuidade Operacional
                </Link>
              </li>
              <li>
                <Link to="/politica-comercial" className="hover:text-white transition-colors">
                  Política Comercial
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-de-licenciamento"
                  className="hover:text-white transition-colors"
                >
                  Política de Licenciamento
                </Link>
              </li>
              <li>
                <Link to="/central-de-privacidade" className="hover:text-white transition-colors">
                  Central de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/canal-de-privacidade" className="hover:text-white transition-colors">
                  Canal de Privacidade (DPO)
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Canais Oficiais Cadastrados */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A227] mb-4">
              Canais Oficiais
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">
                    WhatsApp Comercial Oficial:
                  </span>
                  <a
                    href="https://wa.me/5531991297619"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f6d77c] hover:underline"
                  >
                    +55 (31) 99129-7619
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">
                    Atendimento & Demonstração:
                  </span>
                  <span>Canal direto via formulário no site</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Abrangência:</span>
                  <span>Atendimento em todo território nacional</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-block px-3 py-1.5 rounded-lg bg-[#005A36] text-[11px] font-semibold text-white border border-[#C9A227]/40">
                  Suporte & Consultoria Especializada
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha Divisória & Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            © {currentYear} HURAM — Sistema Inteligente de Gestão. Todos os direitos reservados.
          </p>
          <p className="text-center sm:text-right">
            Governança, Conformidade & Inteligência Empresarial
          </p>
        </div>

        {/* Identificação Legal Obrigatória Preservada Verbatim */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <AttributionFooter variant="inline" className="text-slate-400/90 text-xs" />
        </div>
      </div>
    </footer>
  )
}

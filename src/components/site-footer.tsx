import { Link } from 'react-router-dom'
import logoImg from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-64131.jpeg'

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#002817] text-white border-t border-[#C89B3C]/30 pt-16 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-3 group transition-opacity hover:opacity-90"
              title="Retornar para a tela inicial / login"
            >
              <img
                src={logoImg}
                alt="Jetro"
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-2xl font-black text-white tracking-tight">JETRO</span>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              Plataforma Inteligente de Gestão Empresarial. Conectamos áreas, processos, pessoas e
              informações em um ecossistema seguro e escalável.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C89B3C] mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <a href="#plataforma" className="hover:text-white transition-colors">
                  Plataforma
                </a>
              </li>
              <li>
                <a href="#solucoes" className="hover:text-white transition-colors">
                  Soluções & Módulos
                </a>
              </li>
              <li>
                <a href="#segmentos" className="hover:text-white transition-colors">
                  Segmentos
                </a>
              </li>
              <li>
                <a href="#nine-ia" className="hover:text-white transition-colors">
                  Inteligência Artificial (Jeh)
                </a>
              </li>
              <li>
                <a href="#contato" className="hover:text-white transition-colors">
                  Contato Comercial
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C89B3C] mb-4">
              Portal & Institucional
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Acessar o Sistema
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Portal Administrativo
                </Link>
              </li>
              <li>
                <Link to="/cliente/login" className="hover:text-white transition-colors">
                  Área do Cliente
                </Link>
              </li>
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
                  Cookies
                </Link>
              </li>
              <li>
                <Link to="/politica-de-sla" className="hover:text-white transition-colors">
                  SLA
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-de-backup-continuidade"
                  className="hover:text-white transition-colors"
                >
                  Backup e Continuidade
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
                  Licenciamento
                </Link>
              </li>
              <li>
                <Link to="/central-de-privacidade" className="hover:text-white transition-colors">
                  Central de Privacidade
                </Link>
                <li>
                  <Link to="/canal-de-privacidade" className="hover:text-white transition-colors">
                    Canal de Privacidade (DPO)
                  </Link>
                </li>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C89B3C] mb-4">
              Contato
            </h4>
            <div className="space-y-3 text-sm text-gray-300">
              <p>Atendimento em todo território Nacional</p>
              <p>Comercial: +55 (31) 9 9129-7619</p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded bg-[#005A36] text-xs font-semibold text-white">
                  Suporte & Atendimento Especializado
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {currentYear} Jetro — Plataforma Inteligente de Gestão Empresarial.</p>
          <p className="text-center sm:text-right">
            Tecnologia de Alta Performance & Governança Corporativa
          </p>
        </div>
      </div>
    </footer>
  )
}

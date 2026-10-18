import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import logoImg from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-64131.jpeg'
import { useAuth } from '@/hooks/use-auth'

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  const navLinks = [
    { label: 'Início', href: '#inicio' },
    { label: 'O Jetro', href: '#sobre' },
    { label: 'Soluções', href: '#solucoes' },
    { label: 'Por Dentro do ERP', href: '#telas' },
    { label: 'Fluxo Integrado', href: '#fluxo' },
    { label: 'Inteligência Artificial', href: '#ia' },
    { label: 'Universidade', href: '#universidade' },
    { label: 'Diferenciais', href: '#diferenciais' },
    { label: 'Contato', href: '#contato' },
  ]

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    if (href.startsWith('#')) {
      const targetId = href.replace('#', '')
      if (!targetId || targetId === 'inicio') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#C9A227]/25 bg-[#002817]/95 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('#inicio')
          }}
          className="flex items-center gap-3 group py-1"
          title="Jetro — Inteligência que conecta sua gestão"
        >
          <img
            src={logoImg}
            alt="Jetro ERP Inteligente"
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-xl font-black tracking-tight text-white leading-none">JETRO</span>
            <span className="text-[10px] font-semibold tracking-wider text-[#C9A227] uppercase mt-0.5">
              ERP Inteligente
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav
          className="hidden xl:flex items-center gap-5 2xl:gap-6"
          aria-label="Navegação Principal"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault()
                handleNavClick(link.href)
              }}
              className="text-xs 2xl:text-sm font-medium text-slate-200 hover:text-[#C9A227] transition-colors py-1 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            onClick={() => handleNavClick('#contato')}
            variant="outline"
            size="sm"
            className="border-[#C9A227]/50 text-white bg-transparent hover:bg-[#C9A227]/10 hover:border-[#C9A227] text-xs font-semibold px-4 cursor-pointer"
          >
            Demonstração
          </Button>

          {!isAuthenticated ? (
            <Button
              asChild
              size="sm"
              className="bg-[#005A36] hover:bg-[#004225] border border-[#C9A227]/40 text-white font-semibold text-xs px-4 shadow-sm hover:shadow-md transition-all"
            >
              <Link to="/" className="flex items-center gap-1.5">
                <span>Acessar o sistema</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="bg-[#005A36] hover:bg-[#004225] border border-[#C9A227]/40 text-white font-semibold text-xs px-4"
            >
              <Link to="/admin" className="flex items-center gap-1.5">
                <span>Ir para o ERP</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-white hover:text-[#C9A227] transition-colors focus:outline-none"
          aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-[#C9A227]/30 bg-[#001c10] px-5 py-6 space-y-4 animate-in fade-in duration-200">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(link.href)
                }}
                className="text-sm font-medium text-slate-200 py-2.5 border-b border-white/5 hover:text-[#C9A227] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 flex flex-col gap-2">
            <Button
              onClick={() => handleNavClick('#contato')}
              variant="outline"
              className="w-full border-[#C9A227]/50 text-white hover:bg-[#C9A227]/10 py-2.5 text-xs font-semibold"
            >
              Solicitar Demonstração
            </Button>

            {!isAuthenticated ? (
              <Button
                asChild
                className="w-full bg-[#005A36] hover:bg-[#004225] border border-[#C9A227]/40 text-white font-semibold py-2.5 text-xs"
              >
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  Acessar o sistema
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="w-full bg-[#005A36] hover:bg-[#004225] border border-[#C9A227]/40 text-white font-semibold py-2.5 text-xs"
              >
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  Ir para o ERP
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

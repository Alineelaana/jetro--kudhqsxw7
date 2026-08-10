import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronRight } from 'lucide-react'
import logoImg from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-1-f45df.jpeg'

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Início', href: '#' },
    { label: 'Plataforma', href: '#plataforma' },
    { label: 'Soluções', href: '#solucoes' },
    { label: 'Segmentos', href: '#segmentos' },
    { label: 'Inteligência Artificial', href: '#nine-ia' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Contato', href: '#contato' },
  ]

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    if (href.startsWith('#')) {
      const targetId = href.replace('#', '')
      if (!targetId) {
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
    <header className="sticky top-0 z-50 w-full border-b border-[#C89B3C]/30 bg-[#002817]">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center group">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-md border-2 border-[#C89B3C] shadow-md group-hover:scale-105 transition-transform duration-300">
            <img src={logoImg} alt="Jetro Logo" className="h-full w-full object-cover" />
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault()
                handleNavClick(link.href)
              }}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button
            asChild
            className="bg-[#005A36] hover:bg-[#004225] text-white font-semibold px-6 shadow-md shadow-[#005A36]/20 transition-all hover:shadow-lg"
          >
            <Link to="/admin" className="flex items-center gap-2">
              Acessar Jetro
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-white hover:text-[#C89B3C] transition-colors"
          aria-label="Alternar Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#C89B3C]/30 bg-[#002817] px-4 py-6 space-y-4 animate-fade-in">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(link.href)
                }}
                className="text-base font-medium text-gray-300 py-2 border-b border-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2">
            <Button
              asChild
              className="w-full bg-[#005A36] hover:bg-[#004225] text-white font-semibold py-3"
            >
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                Acessar Jetro
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

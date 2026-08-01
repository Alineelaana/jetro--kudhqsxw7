import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useSettings } from '@/hooks/use-settings'
import { buildWhatsAppUrl } from '@/lib/utils'
import { Menu, MessageCircle } from 'lucide-react'
import logoGreenBg from '@/assets/chatgpt-image-1-de-ago.de-2026-103411-a43e3.png'

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Serviços', to: '/#servicos' },
  { label: 'Orçamento', to: '/#orcamento' },
  { label: 'Contato', to: '/#contato' },
]

export function SiteHeader() {
  const { whatsappNumber } = useSettings()
  const [open, setOpen] = useState(false)

  const handleHomeClick = () => {
    setOpen(false)
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleMobileNavClick = (to: string) => {
    setOpen(false)
    if (to === '/' && window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#01361D] border-b border-[#C89B3C]/30 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-2 group">
            <img
              src={logoGreenBg}
              alt="Velora Log"
              className="h-16 sm:h-20 w-auto object-contain transition-transform group-hover:scale-105 rounded-lg"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                onClick={link.to === '/' ? handleHomeClick : undefined}
                className="text-sm font-bold text-white/80 hover:text-[#E4C46A] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold shadow-md rounded-lg"
            >
              <Link to="/cliente/login">Área do Cliente</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold shadow-md rounded-lg"
            >
              <Link to="/admin">Login ao Painel</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-[#25D366] hover:bg-[#1da851] text-white font-bold shadow-md rounded-lg"
            >
              <a
                href={buildWhatsAppUrl(
                  whatsappNumber,
                  'Olá! Gostaria de informações sobre os serviços de armazenagem e transporte da Velora Log.',
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                WhatsApp
              </a>
            </Button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6 text-[#005B2E]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white">
              <SheetTitle className="mb-6">
                <Link to="/" onClick={handleHomeClick}>
                  <img
                    src={logoGreenBg}
                    alt="Velora Log"
                    className="h-16 w-auto object-contain rounded-lg"
                  />
                </Link>
              </SheetTitle>
              <nav className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to + link.label}
                    to={link.to}
                    onClick={() => handleMobileNavClick(link.to)}
                    className="text-base font-bold text-foreground hover:text-[#005B2E] transition-colors py-1"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E] hover:text-white font-bold"
                >
                  <Link to="/cliente/login" onClick={() => setOpen(false)}>
                    Área do Cliente
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-2 border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E] hover:text-white font-bold"
                >
                  <Link to="/admin" onClick={() => setOpen(false)}>
                    Login ao Painel
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-[#25D366] hover:bg-[#1da851] text-white font-bold mt-4 shadow-md"
                >
                  <a
                    href={buildWhatsAppUrl(
                      whatsappNumber,
                      'Olá! Gostaria de informações sobre os serviços da Velora Log.',
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Falar no WhatsApp
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

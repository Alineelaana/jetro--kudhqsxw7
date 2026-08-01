import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useSettings } from '@/hooks/use-settings'
import { buildWhatsAppUrl } from '@/lib/utils'
import logoLight from '@/assets/chatgpt-image-1-de-ago.de-2026-103549-66439.png'
import { Menu, MessageCircle } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Armazenagem WMS', href: '#servicos' },
  { label: 'Orçamento', href: '#orcamento' },
  { label: 'Contato', href: '#contato' },
]

export function SiteHeader() {
  const { whatsappNumber } = useSettings()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-[#C89B3C]/20 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <a href="#inicio" className="flex items-center gap-3">
            <img
              src={logoLight}
              alt="VeloraLog Operações Logísticas"
              className="h-12 w-auto object-contain"
            />
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                className="text-sm font-semibold text-foreground/80 hover:text-[#005B2E] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="bg-[#25D366] hover:bg-[#1da851] text-white font-semibold shadow-md"
            >
              <a
                href={buildWhatsAppUrl(
                  whatsappNumber,
                  'Olá! Gostaria de informações sobre os serviços da VeloraLog.',
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
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
                <img src={logoLight} alt="VeloraLog" className="h-10 w-auto object-contain" />
              </SheetTitle>
              <nav className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href + link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-semibold text-foreground hover:text-[#005B2E] transition-colors py-1"
                  >
                    {link.label}
                  </a>
                ))}
                <Button
                  asChild
                  className="bg-[#25D366] hover:bg-[#1da851] text-white font-semibold mt-4 shadow-md"
                >
                  <a
                    href={buildWhatsAppUrl(
                      whatsappNumber,
                      'Olá! Gostaria de informações sobre os serviços da VeloraLog.',
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

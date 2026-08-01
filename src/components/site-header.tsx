import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useSettings } from '@/hooks/use-settings'
import { buildWhatsAppUrl } from '@/lib/utils'
import { Menu, MessageCircle, Truck } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Orçamento', href: '#orcamento' },
  { label: 'Contato', href: '#contato' },
]

export function SiteHeader() {
  const { whatsappNumber } = useSettings()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="#inicio" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground hidden sm:block">
              Logística Premium ES
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button asChild size="sm" className="bg-[#25D366] hover:bg-[#1da851] text-white">
              <a href={buildWhatsAppUrl(whatsappNumber)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="mb-6">Menu</SheetTitle>
              <nav className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <Button asChild className="bg-[#25D366] hover:bg-[#1da851] text-white mt-2">
                  <a
                    href={buildWhatsAppUrl(whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
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

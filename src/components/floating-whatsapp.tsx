import { useSettings } from '@/hooks/use-settings'
import { buildWhatsAppUrl } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'

export function FloatingWhatsApp() {
  const { whatsappNumber } = useSettings()

  return (
    <a
      href={buildWhatsAppUrl(
        whatsappNumber,
        'Olá! Gostaria de falar com a equipe da VeloraLog sobre orçamento logístico.',
      )}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1da851] shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group border-2 border-white"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-8 h-8 text-white" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
    </a>
  )
}

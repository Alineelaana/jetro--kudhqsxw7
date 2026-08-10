import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function FinalCTA() {
  return (
    <section className="bg-gradient-to-b from-[#00472B] to-[#005A36] py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black text-white">
          Transforme sua operação logística com a Jetro
        </h2>
        <p className="text-gray-200 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          Solicite uma apresentação comercial e descubra como nossa arquitetura pode elevar a
          eficiência da sua empresa no Espírito Santo.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Phone className="w-5 h-5 text-[#E5B85C]" />
          <span className="text-[#E5B85C] text-lg sm:text-xl font-bold">31 9 9129-7619</span>
        </div>
        <div className="pt-4">
          <Button
            asChild
            className="bg-[#C89B3C] hover:bg-[#E5B85C] text-white font-bold px-8 py-6 text-base rounded-xl transition-colors duration-300"
          >
            <Link to="/#orcamento">Solicitar Orçamento</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

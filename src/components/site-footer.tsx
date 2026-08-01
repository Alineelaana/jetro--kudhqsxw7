import { Truck } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-white/70 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Logística Premium ES</span>
            </div>
            <p className="text-sm">
              Operações logísticas de excelência no Espírito Santo e em todo o Brasil.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-semibold mb-2">Serviços</h4>
            <ul className="text-sm space-y-1">
              <li>
                <a href="#servicos" className="hover:text-white transition-colors">
                  Transporte Rodoviário
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-white transition-colors">
                  Armazenagem
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-white transition-colors">
                  Distribuição
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-white transition-colors">
                  Cross Docking
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-semibold mb-2">Contato</h4>
            <ul className="text-sm space-y-1">
              <li>(31) 99129-7619</li>
              <li>contato@logisticapremiumes.com.br</li>
              <li>Espírito Santo, Brasil</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-sm text-center">
          © {new Date().getFullYear()} Logística Premium ES. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}

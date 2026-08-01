import logoDark from '@/assets/chatgpt-image-1-de-ago.de-2026-103411-6748f.png'

export function SiteFooter() {
  return (
    <footer className="bg-[#002B16] text-white/70 py-12 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-4">
            <img
              src={logoDark}
              alt="VeloraLog Operações Logísticas"
              className="h-14 w-auto object-contain"
            />
            <p className="text-sm leading-relaxed max-w-sm">
              Operações Logísticas de Excelência no Espírito Santo. Soluções completas em
              armazenagem WMS, transporte rodoviário, logística portuária e distribuição urbana.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-base border-b border-[#C89B3C]/30 pb-2 inline-block">
              Soluções Logísticas
            </h4>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#servicos" className="hover:text-[#E4C46A] transition-colors">
                  Armazenagem de Estoque (WMS)
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#E4C46A] transition-colors">
                  Transporte de Cargas
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#E4C46A] transition-colors">
                  Distribuição Urbana e Delivery
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#E4C46A] transition-colors">
                  Logística Portuária no ES
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#E4C46A] transition-colors">
                  Cross Docking
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-base border-b border-[#C89B3C]/30 pb-2 inline-block">
              Contato & Localização
            </h4>
            <ul className="text-sm space-y-2">
              <li>Central de Atendimento: (31) 99129-7619</li>
              <li>E-mail Comercial: contato@veloralog.com.br</li>
              <li>Atendimento: Segunda a Sexta, 08h às 18h</li>
              <li>Espírito Santo, Brasil</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-xs text-center text-white/50 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            © {new Date().getFullYear()} VeloraLog Operações Logísticas. Todos os direitos
            reservados.
          </span>
          <span>VeloraLog - Excelência em Soluções Logísticas no ES</span>
        </div>
      </div>
    </footer>
  )
}

import { ConformidadePanel } from '@/components/conformidade/conformidade-panel'
import { ShieldCheck } from 'lucide-react'

export default function Conformidade() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#005B2E]/10 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-[#005B2E]" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#005B2E]">
            Central de Conformidade Trabalhista
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitoramento automatizado de conformidade nos módulos RH, DP e SST
          </p>
        </div>
      </div>
      <ConformidadePanel />
    </div>
  )
}

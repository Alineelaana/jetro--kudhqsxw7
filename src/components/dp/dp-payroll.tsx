import { useState } from 'react'
import { RhPayroll } from '@/components/rh/rh-payroll'
import { RhPayrollSimulation } from '@/components/rh/rh-payroll-simulation'
import { Button } from '@/components/ui/button'
import { Calculator, List } from 'lucide-react'

export function DpPayroll() {
  const [view, setView] = useState<'list' | 'simulation'>('list')
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={view === 'list' ? 'default' : 'outline'}
          onClick={() => setView('list')}
          className={
            view === 'list'
              ? 'bg-[#005B2E] hover:bg-[#01361D] text-white font-bold'
              : 'border-[#005B2E]/30 text-[#005B2E]'
          }
        >
          <List className="w-4 h-4 mr-2" /> Listagem
        </Button>
        <Button
          variant={view === 'simulation' ? 'default' : 'outline'}
          onClick={() => setView('simulation')}
          className={
            view === 'simulation'
              ? 'bg-[#005B2E] hover:bg-[#01361D] text-white font-bold'
              : 'border-[#005B2E]/30 text-[#005B2E]'
          }
        >
          <Calculator className="w-4 h-4 mr-2" /> Simulação e Fechamento
        </Button>
      </div>
      {view === 'list' ? <RhPayroll /> : <RhPayrollSimulation />}
    </div>
  )
}

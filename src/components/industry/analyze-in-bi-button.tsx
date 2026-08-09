import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBiNavigation, type BiContextFilters } from '@/lib/industrial-bi-navigation'

interface Props {
  context: BiContextFilters
  label?: string
}

export function AnalyzeInBiButton({ context, label = 'Analisar no BI' }: Props) {
  const navigateToBi = useBiNavigation()

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-bold"
      onClick={() => navigateToBi(context)}
    >
      <BarChart3 className="w-3.5 h-3.5 mr-1" />
      {label}
    </Button>
  )
}

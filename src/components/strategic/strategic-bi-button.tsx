import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface StrategicBiButtonProps {
  entity?: string
  area?: string
  label?: string
}

export function StrategicBiButton({
  entity,
  area,
  label = 'Analisar no BI',
}: StrategicBiButtonProps) {
  const navigate = useNavigate()
  return (
    <Button
      variant="outline"
      size="sm"
      className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-bold"
      onClick={() => {
        const params = new URLSearchParams()
        params.set('source', 'strategic')
        if (entity) params.set('entity', entity)
        if (area) params.set('area', area)
        navigate(`/admin/bi?${params.toString()}`)
      }}
    >
      <BarChart3 className="w-3.5 h-3.5 mr-1" />
      {label}
    </Button>
  )
}

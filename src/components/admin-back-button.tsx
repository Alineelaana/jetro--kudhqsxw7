import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useBackNavigation } from '@/hooks/use-back-navigation'
import { cn } from '@/lib/utils'

interface AdminBackButtonProps {
  fallback?: string
  label?: string
  className?: string
}

export function AdminBackButton({ fallback, label = 'Voltar', className }: AdminBackButtonProps) {
  const goBack = useBackNavigation(fallback)
  return (
    <Button variant="ghost" onClick={goBack} className={cn('text-[#005B2E]', className)}>
      <ArrowLeft className="w-4 h-4 mr-1" /> {label}
    </Button>
  )
}

import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface BiStatCardProps {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
  color: string
}

export function BiStatCard({ icon: Icon, label, value, sub, color }: BiStatCardProps) {
  return (
    <Card className="border-2 border-[#005B2E]/10">
      <CardContent className="py-3 flex items-center gap-3">
        <Icon className={`w-7 h-7 ${color} shrink-0`} />
        <div className="min-w-0">
          <p className="text-lg font-black text-foreground truncate">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

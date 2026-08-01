import { Card, CardContent } from '@/components/ui/card'
import { ChartExportButton } from '@/components/chart-export-button'
import type { ExportFormat } from '@/lib/chart-export-core'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  hexColor: string
  onExport: (format: ExportFormat) => void
}

export function StatCard({ icon: Icon, value, label, hexColor, onExport }: StatCardProps) {
  return (
    <Card className="border-2" style={{ borderColor: `${hexColor}33` }}>
      <CardContent className="py-4 px-5 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${hexColor}1A` }}
        >
          <Icon className="w-5 h-5" style={{ color: hexColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-black text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <ChartExportButton onExport={onExport} className="ml-auto" />
      </CardContent>
    </Card>
  )
}

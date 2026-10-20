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
    <Card className="border border-[#E4EAE6] bg-white shadow-xs hover:shadow-md transition-shadow">
      <CardContent className="py-4 px-5 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${hexColor}1A` }}
        >
          <Icon className="w-5 h-5" style={{ color: hexColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-black text-[#202B28]">{value}</p>
          <p className="text-xs text-[#66736D]">{label}</p>
        </div>
        <ChartExportButton onExport={onExport} className="ml-auto" />
      </CardContent>
    </Card>
  )
}

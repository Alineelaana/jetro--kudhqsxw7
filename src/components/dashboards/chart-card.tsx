import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartExportButton } from '@/components/chart-export-button'
import type { ExportFormat } from '@/lib/chart-export-core'

interface ChartCardProps {
  title: string
  hexColor?: string
  onExport: (format: ExportFormat) => void
  children: ReactNode
  contentClassName?: string
}

export function ChartCard({
  title,
  hexColor,
  onExport,
  children,
  contentClassName,
}: ChartCardProps) {
  return (
    <Card className="border-2" style={{ borderColor: hexColor ? `${hexColor}33` : '#005B2E33' }}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <ChartExportButton onExport={onExport} />
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  )
}

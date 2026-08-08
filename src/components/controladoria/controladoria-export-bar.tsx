import { CorporateExportBar } from '@/components/corporate-documents/corporate-export-bar'

interface Props {
  title: string
  headers: string[]
  rows: (string | number)[][]
  userName: string
}

export function ControladoriaExportBar({ title, headers, rows, userName }: Props) {
  const sections = [
    {
      title,
      headers,
      rows: rows as (string | number)[][],
    },
  ]
  return (
    <CorporateExportBar
      title={title}
      module="controladoria"
      documentType="report"
      sections={sections}
      recordCount={rows.length}
      formats={['pdf', 'excel', 'csv', 'png', 'print']}
    />
  )
}

export function exportCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const BOM = '\uFEFF'

  const escapeValue = (val: string | number): string => {
    const s = String(val ?? '')
    if (s.includes(';') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  const csvContent =
    BOM + [headers, ...rows].map((row) => row.map(escapeValue).join(';')).join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

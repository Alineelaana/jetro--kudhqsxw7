import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { ScanBarcode } from 'lucide-react'

export function StockBarcodeInput({
  onScan,
  placeholder = 'Escaneie ou digite o código de barras...',
}: {
  onScan: (value: string) => void
  placeholder?: string
}) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <div className="relative flex-1">
      <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#005B2E]" />
      <Input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            onScan(value.trim())
            setValue('')
          }
        }}
        placeholder={placeholder}
        className="pl-10 focus-visible:ring-[#005B2E]"
      />
    </div>
  )
}

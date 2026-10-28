import React, { useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Barcode, CornerDownLeft, X } from 'lucide-react'
import { playAudioFeedback, triggerHapticFeedback } from '@/services/collector'

interface CollectorScannerFieldProps {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onScan: (value: string) => void
  autoFocus?: boolean
  disabled?: boolean
  className?: string
  id?: string
}

export const CollectorScannerField: React.FC<CollectorScannerFieldProps> = ({
  label,
  placeholder = 'Aponte o leitor ou digite o código...',
  value,
  onChange,
  onScan,
  autoFocus = true,
  disabled = false,
  className = '',
  id = 'scanner-input',
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [lastScanned, setLastScanned] = useState<string>('')

  useEffect(() => {
    if (autoFocus && !disabled) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoFocus, disabled])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed) {
        setLastScanned(trimmed)
        triggerHapticFeedback('success')
        playAudioFeedback('success')
        onScan(trimmed)
      }
    }
  }

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5"
        >
          <Barcode className="h-4 w-4" />
          {label}
        </Label>
        {lastScanned && (
          <span className="text-[11px] text-slate-400 font-mono">
            Último: <strong className="text-slate-200">{lastScanned}</strong>
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-14 text-lg md:text-xl font-mono tracking-wide bg-slate-900 border-2 border-slate-700 text-slate-50 placeholder:text-slate-500 pr-24 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30 rounded-xl"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-9 w-9 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            disabled={!value.trim() || disabled}
            onClick={() => {
              const trimmed = value.trim()
              if (trimmed) {
                setLastScanned(trimmed)
                triggerHapticFeedback('success')
                playAudioFeedback('success')
                onScan(trimmed)
              }
            }}
            className="h-10 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1"
          >
            <span>Ler</span>
            <CornerDownLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

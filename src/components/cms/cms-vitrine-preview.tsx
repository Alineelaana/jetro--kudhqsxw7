import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Monitor, Tablet, Smartphone } from 'lucide-react'
import type { VitrineItem } from '@/lib/vitrine-types'

const DEVICES = [
  { id: 'desktop' as const, label: 'Desktop', icon: Monitor, width: '100%' },
  { id: 'tablet' as const, label: 'Tablet', icon: Tablet, width: '768px' },
  { id: 'mobile' as const, label: 'Celular', icon: Smartphone, width: '375px' },
]

export function CmsVitrinePreview({
  item,
  open,
  onOpenChange,
}: {
  item: VitrineItem | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  if (!item) return null

  const posClass =
    item.text_position === 'left'
      ? 'items-start text-left'
      : item.text_position === 'right'
        ? 'items-end text-right'
        : 'items-center text-center'
  const imgUrl = device === 'mobile' && item.image_mobile ? item.image_mobile : item.image_desktop

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Prévia da Campanha</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-3">
          {DEVICES.map((d) => (
            <Button
              key={d.id}
              variant={device === d.id ? 'default' : 'outline'}
              size="sm"
              className={device === d.id ? 'bg-[#005B2E] text-white' : ''}
              onClick={() => setDevice(d.id)}
            >
              <d.icon className="w-4 h-4 mr-1" /> {d.label}
            </Button>
          ))}
        </div>
        <div className="flex justify-center">
          <div
            style={{ width: DEVICES.find((d) => d.id === device)?.width, maxWidth: '100%' }}
            className="rounded-lg overflow-hidden border border-border"
          >
            <div
              className="relative aspect-video flex flex-col justify-center p-6 md:p-8"
              style={{ backgroundColor: item.bg_color || '#005B2E' }}
            >
              {imgUrl && (
                <img
                  src={imgUrl}
                  alt={item.image_alt || ''}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {item.overlay_color && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: item.overlay_color,
                    opacity: (item.opacity || 0) / 100,
                  }}
                />
              )}
              <div
                className={`relative flex flex-col gap-2 ${posClass}`}
                style={{ color: item.text_color || '#FFFFFF' }}
              >
                {item.title && <h3 className="text-xl md:text-2xl font-black">{item.title}</h3>}
                {item.subtitle && (
                  <p className="text-sm md:text-base font-semibold opacity-90">{item.subtitle}</p>
                )}
                {item.description && (
                  <p className="text-xs md:text-sm opacity-80 max-w-md">{item.description}</p>
                )}
                {item.button_text && (
                  <button
                    className="mt-2 px-4 py-2 rounded-lg font-bold text-sm"
                    style={{
                      backgroundColor: item.text_color || '#FFFFFF',
                      color: item.bg_color || '#005B2E',
                    }}
                  >
                    {item.button_text}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

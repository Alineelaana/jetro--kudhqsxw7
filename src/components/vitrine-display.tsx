import { useEffect, useState } from 'react'
import { getPublishedVitrineItems } from '@/services/vitrine'
import type { VitrineItem } from '@/lib/vitrine-types'
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants'

function resolveLink(item: VitrineItem): string {
  switch (item.click_destination) {
    case 'budget_form':
      return '#orcamento'
    case 'whatsapp':
      return `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}`
    case 'client_area':
      return '/cliente/login'
    case 'service_page':
      return item.button_link || '#servicos'
    default:
      return item.button_link || '#'
  }
}

function VitrineBanner({ item }: { item: VitrineItem }) {
  if (!item) return null
  const posClass =
    item.text_position === 'left'
      ? 'items-start text-left'
      : item.text_position === 'right'
        ? 'items-end text-right'
        : 'items-center text-center'
  const bgColor = item.bg_color || '#005B2E'
  const textColor = item.text_color || '#FFFFFF'
  return (
    <div
      className="relative aspect-[21/9] sm:aspect-video flex flex-col justify-center p-6 md:p-12 rounded-xl overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {item.image_desktop && (
        <img
          src={item.image_desktop}
          alt={item.image_alt || item.title || ''}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {item.overlay_color && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: item.overlay_color, opacity: (item.opacity || 0) / 100 }}
        />
      )}
      <div className={`relative flex flex-col gap-2 ${posClass}`} style={{ color: textColor }}>
        {item.title && <h2 className="text-2xl md:text-4xl font-black">{item.title}</h2>}
        {item.subtitle && (
          <p className="text-base md:text-lg font-semibold opacity-90">{item.subtitle}</p>
        )}
        {item.description && (
          <p className="text-sm md:text-base opacity-80 max-w-xl">{item.description}</p>
        )}
        {item.button_text && (
          <a
            href={resolveLink(item)}
            className="mt-3 inline-block px-6 py-3 rounded-lg font-bold text-sm transition-transform hover:scale-105"
            style={{
              backgroundColor: textColor,
              color: bgColor,
            }}
          >
            {item.button_text}
          </a>
        )}
      </div>
    </div>
  )
}

export function VitrineDisplay({ position }: { position: string }) {
  const [items, setItems] = useState<VitrineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublishedVitrineItems(position)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [position])

  if (loading || !Array.isArray(items) || items.length === 0) return null

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {items.map((item) => (
          <VitrineBanner key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

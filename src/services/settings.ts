import pb from '@/lib/pocketbase/client'
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants'

export async function getSetting(key: string): Promise<string | null> {
  try {
    const record = await pb.collection('settings').getFirstListItem(`key = "${key}"`)
    return (record as Record<string, unknown>).value as string
  } catch {
    return null
  }
}

export async function getWhatsappNumber(): Promise<string> {
  const value = await getSetting('whatsapp_number')
  return value || DEFAULT_WHATSAPP_NUMBER
}

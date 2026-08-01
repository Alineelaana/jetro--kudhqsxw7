import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = (phoneNumber || '5531991297619').replace(/\D/g, '')
  const encodedMsg = encodeURIComponent(message || 'Olá! Gostaria de mais informações.')
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`
}

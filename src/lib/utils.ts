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

export function normalizePhone(phone: string): string {
  let cleaned = (phone || '').replace(/\D/g, '')
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1)
  if (!cleaned.startsWith('55') && cleaned.length <= 11) {
    cleaned = '55' + cleaned
  }
  return cleaned
}

export function buildBudgetWhatsAppUrl(
  phone: string,
  clientName: string,
  budgetNumber: string,
  service: string,
): string {
  const normalized = normalizePhone(phone)
  const message = `Olá ${clientName}!\n\nSeu orçamento ${budgetNumber ? '#' + budgetNumber : ''} da Velora Log está pronto.\n\nServiço: ${service}\n\nPara mais detalhes, entre em contato conosco.\n\nAtenciosamente,\nEquipe Velora Log`
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

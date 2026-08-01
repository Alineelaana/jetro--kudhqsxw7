/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add any other utility functions here

export function buildWhatsAppUrl(number: string, message?: string): string {
  const cleanNumber = number.replace(/\D/g, '')
  const url = `https://wa.me/${cleanNumber}`
  return message ? `${url}?text=${encodeURIComponent(message)}` : url
}

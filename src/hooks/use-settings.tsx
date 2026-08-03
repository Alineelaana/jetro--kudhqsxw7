import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getWhatsappNumber } from '@/services/settings'
import { DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants'

interface SettingsContextType {
  whatsappNumber: string
  loading: boolean
}

const SettingsContext = createContext<SettingsContextType>({
  whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
  loading: true,
})

export const useSettings = () => useContext(SettingsContext)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const fallbackNumber =
    typeof DEFAULT_WHATSAPP_NUMBER === 'string' && DEFAULT_WHATSAPP_NUMBER
      ? DEFAULT_WHATSAPP_NUMBER
      : '5531991297619'
  const [whatsappNumber, setWhatsappNumber] = useState<string>(fallbackNumber)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.resolve(getWhatsappNumber?.())
      .then((num) => {
        if (cancelled) return
        if (typeof num === 'string' && num.trim()) {
          setWhatsappNumber(num)
        } else {
          setWhatsappNumber(fallbackNumber)
        }
      })
      .catch(() => {
        if (!cancelled) setWhatsappNumber(fallbackNumber)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <SettingsContext.Provider value={{ whatsappNumber, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

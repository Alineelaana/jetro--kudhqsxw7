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
  const [whatsappNumber, setWhatsappNumber] = useState<string>(DEFAULT_WHATSAPP_NUMBER)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWhatsappNumber()
      .then((num) => {
        if (typeof num === 'string' && num.trim()) {
          setWhatsappNumber(num)
        } else {
          setWhatsappNumber(DEFAULT_WHATSAPP_NUMBER)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <SettingsContext.Provider value={{ whatsappNumber, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

import React, { createContext, useContext, useEffect, useState } from 'react'
import { b2bService } from '@/lib/b2b/b2b-service'
import { B2BClientProfile, B2BPartnerProfile, B2BCartItem, B2BProductItem } from '@/lib/b2b/types'
import { clientPocketBase } from '@/lib/pocketbase/client-client'

interface B2BContextType {
  client: B2BClientProfile | null
  partner: B2BPartnerProfile | null
  isLoading: boolean
  cart: B2BCartItem[]
  addToCart: (product: B2BProductItem, quantity?: number) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  refreshProfile: () => Promise<void>
  logout: () => void
}

const B2BContext = createContext<B2BContextType | null>(null)

export const B2BProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<B2BClientProfile | null>(null)
  const [partner, setPartner] = useState<B2BPartnerProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [cart, setCart] = useState<B2BCartItem[]>(() => {
    try {
      const saved = localStorage.getItem('huram_b2b_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Sincronizar carrinho com localStorage
  useEffect(() => {
    try {
      localStorage.setItem('huram_b2b_cart', JSON.stringify(cart))
    } catch { /* intentionally ignored */ }
  }, [cart])

  const refreshProfile = async () => {
    try {
      if (b2bService.isAuthenticated()) {
        const res = await b2bService.getMe()
        setClient(res.client)
        setPartner(res.partner)
      } else {
        setClient(null)
        setPartner(null)
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil B2B:', err)
      setClient(null)
      setPartner(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshProfile()

    // Ouvir alterações de authStore do cliente
    const unsubscribe = clientPocketBase.authStore.onChange(() => {
      refreshProfile()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const addToCart = (product: B2BProductItem, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id)
      const minQty = product.b2b_min_order_qty || 1
      const addQty = Math.max(quantity, minQty)

      if (existingIndex > -1) {
        const copy = [...prev]
        copy[existingIndex].quantity += addQty
        return copy
      } else {
        return [
          ...prev,
          {
            product,
            quantity: addQty,
            unit_price: product.price,
          },
        ]
      }
    })
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const logout = () => {
    b2bService.logout()
    setClient(null)
    setPartner(null)
    clearCart()
    window.location.href = '/portal/login'
  }

  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0)
  const cartTotal = cart.reduce((acc, curr) => acc + curr.quantity * curr.unit_price, 0)

  return (
    <B2BContext.Provider
      value={{
        client,
        partner,
        isLoading,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </B2BContext.Provider>
  )
}

export const useB2B = () => {
  const context = useContext(B2BContext)
  if (!context) {
    throw new Error('useB2B deve ser utilizado dentro de um B2BProvider')
  }
  return context
}

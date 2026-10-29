import { clientPocketBase } from '@/lib/pocketbase/client-client'
import {
  B2BClientProfile,
  B2BPartnerProfile,
  B2BProductItem,
  B2BOrderListItem,
  B2BOrderDetail,
  B2BCartItem,
} from './types'

export interface B2BSignupPayload {
  email: string
  password: string
  company_name: string
  trade_name?: string
  cnpj: string
  phone: string
  contact_name?: string
  state_registration?: string
  address?: string
  address_number?: string
  address_district?: string
  address_city?: string
  address_state?: string
  cep?: string
  empresa_id?: string
  filial_id?: string
}

export const b2bService = {
  // 1. Cadastro self-service
  async signup(payload: B2BSignupPayload) {
    const res = await fetch('/backend/v1/b2b/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Falha ao realizar cadastro')
    }
    return data
  },

  // 2. Login de cliente (coleção auth 'clients')
  async login(email: string, pass: string) {
    const authData = await clientPocketBase.collection('clients').authWithPassword(email, pass)
    return authData
  },

  // Logout
  logout() {
    clientPocketBase.authStore.clear()
  },

  // Verifica se está logado como cliente
  isAuthenticated(): boolean {
    return (
      clientPocketBase.authStore.isValid &&
      (clientPocketBase.authStore.record?.collectionName === 'clients' ||
        clientPocketBase.authStore.model?.collectionName === 'clients')
    )
  },

  // 3. Obter perfil e dados do parceiro (com limite de crédito condicional)
  async getMe(): Promise<{ client: B2BClientProfile; partner: B2BPartnerProfile | null }> {
    const token = clientPocketBase.authStore.token
    if (!token) throw new Error('Cliente B2B não autenticado')

    const res = await fetch('/backend/v1/b2b/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Falha ao buscar dados cadastrais')
    }
    return data
  },

  // 4. Catálogo de produtos liberados
  async getCatalog(): Promise<B2BProductItem[]> {
    const token = clientPocketBase.authStore.token
    if (!token) throw new Error('Cliente B2B não autenticado')

    const res = await fetch('/backend/v1/b2b/products', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Falha ao carregar catálogo')
    }
    return data.items || []
  },

  // 5. Finalizar pedido (carrinho -> submissão direta à Central de Aprovações)
  async submitOrder(payload: {
    items: B2BCartItem[]
    notes?: string
    delivery_address?: string
    payment_condition?: string
    payment_method?: string
  }) {
    const token = clientPocketBase.authStore.token
    if (!token) throw new Error('Cliente B2B não autenticado')

    const formattedItems = payload.items.map((it) => ({
      product_id: it.product.id,
      code: it.product.code,
      name: it.product.name,
      quantity: it.quantity,
      unit: it.product.unit,
      unit_price: it.unit_price,
      notes: it.notes || '',
    }))

    const res = await fetch('/backend/v1/b2b/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: formattedItems,
        notes: payload.notes,
        delivery_address: payload.delivery_address,
        payment_condition: payload.payment_condition,
        payment_method: payload.payment_method,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Falha ao submeter pedido B2B')
    }
    return data
  },

  // 6. Listar Meus Pedidos
  async getMyOrders(): Promise<B2BOrderListItem[]> {
    const token = clientPocketBase.authStore.token
    if (!token) throw new Error('Cliente B2B não autenticado')

    const res = await fetch('/backend/v1/b2b/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Falha ao buscar pedidos')
    }
    return data.orders || []
  },

  // 7. Obter Detalhe do Pedido
  async getOrderDetail(orderId: string): Promise<B2BOrderDetail> {
    const token = clientPocketBase.authStore.token
    if (!token) throw new Error('Cliente B2B não autenticado')

    const res = await fetch(`/backend/v1/b2b/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Falha ao obter detalhe do pedido')
    }
    return data.order
  },

  // --- MÉTODOS DE ADMINISTRAÇÃO INTERNA (requerem token de user do ERP) ---
  async adminToggleCreditFlag(partnerId: string, showCredit: boolean, adminToken: string) {
    const res = await fetch('/backend/v1/b2b/admin/toggle-credit-flag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        partner_id: partnerId,
        exibir_limite_credito: showCredit,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Falha ao atualizar exibição de crédito')
    }
    return data
  },

  async adminToggleClientStatus(
    params: { clientId?: string; partnerId?: string; active: boolean },
    adminToken: string,
  ) {
    const res = await fetch('/backend/v1/b2b/admin/toggle-client-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        client_id: params.clientId,
        partner_id: params.partnerId,
        active: params.active,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Falha ao alterar status de acesso')
    }
    return data
  },
}

import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

export interface BiContextFilters {
  module?: string
  entityId?: string
  entityName?: string
  resource?: string
  orderNumber?: string
  productName?: string
}

export function useBiNavigation() {
  const navigate = useNavigate()

  return useCallback(
    (context: BiContextFilters) => {
      const params = new URLSearchParams()
      if (context.module) params.set('source', 'industrial')
      if (context.entityId) params.set('entity_id', context.entityId)
      if (context.entityName) params.set('entity_name', context.entityName)
      if (context.resource) params.set('resource', context.resource)
      if (context.orderNumber) params.set('order', context.orderNumber)
      if (context.productName) params.set('product', context.productName)
      navigate(`/admin/bi?${params.toString()}`)
    },
    [navigate],
  )
}

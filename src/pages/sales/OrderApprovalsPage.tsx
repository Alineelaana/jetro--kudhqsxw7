import React from 'react'
import { SalesPageWrapper } from '@/components/sales/sales-page-wrapper'
import { OrderApprovalsHubScreen } from '@/components/orders/order-approvals-hub-screen'

export default function OrderApprovalsPage() {
  return (
    <SalesPageWrapper>
      <OrderApprovalsHubScreen />
    </SalesPageWrapper>
  )
}

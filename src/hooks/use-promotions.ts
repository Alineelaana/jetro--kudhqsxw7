import { useState, useEffect, useCallback } from 'react'
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  logPromotionAudit,
} from '@/services/promotions'
import { useRealtime } from '@/hooks/use-realtime'
import type { PromotionRule } from '@/lib/promotion-types'

export function usePromotions(statusFilter?: string) {
  const [promotions, setPromotions] = useState<PromotionRule[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setPromotions(await getPromotions(statusFilter))
    } catch {
      setPromotions([])
    }
    setLoading(false)
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('promotion_rules', () => load())

  const handleCreate = useCallback(
    async (data: Record<string, unknown>) => {
      const created = await createPromotion(data)
      logPromotionAudit('create', created.id, `Criou promoção: ${created.name}`)
      load()
      return created
    },
    [load],
  )

  const handleUpdate = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      const updated = await updatePromotion(id, data)
      logPromotionAudit('update', id, `Atualizou promoção: ${updated.name}`)
      load()
      return updated
    },
    [load],
  )

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      await deletePromotion(id)
      logPromotionAudit('delete', id, `Excluiu promoção: ${name}`)
      load()
    },
    [load],
  )

  return {
    promotions,
    loading,
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
    reload: load,
  }
}

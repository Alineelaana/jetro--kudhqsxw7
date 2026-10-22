import pb from '@/lib/pocketbase/client'
import {
  getMaintenanceSchedules,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
} from './industrial-extended'

export interface MaintenanceOrder {
  id: string
  order_number: string
  resource_id: string
  type: 'corretiva' | 'preventiva' | 'preditiva'
  priority?: 'baixa' | 'media' | 'alta' | 'critica'
  description: string
  status: 'aberta' | 'em_andamento' | 'aguardando_peca' | 'concluida' | 'cancelada'
  scheduled_date?: string
  technician?: string
  expand?: {
    resource_id?: {
      id: string
      name?: string
      code?: string
    }
  }
}

export interface MaintenancePlan {
  id: string
  name: string
  resource_id?: string
  frequency_days: number
  expand?: {
    resource_id?: {
      id: string
      name?: string
      code?: string
    }
  }
}

/**
 * Busca ordens de serviço de manutenção.
 * Faz fallback elegante para manutenção agendada de `maintenance_schedules`.
 */
export async function getMaintenanceOrders(): Promise<MaintenanceOrder[]> {
  try {
    const list = await pb.collection('industrial_maintenance_orders').getFullList({
      sort: '-created',
      expand: 'resource_id',
    })
    return (list || []) as unknown as MaintenanceOrder[]
  } catch {
    // Fallback: carregar de maintenance_schedules adaptando campos
    try {
      const schedules = await getMaintenanceSchedules()
      return schedules.map((s, idx) => ({
        id: s.id,
        order_number: `OS-${new Date().getFullYear()}-${1000 + idx}`,
        resource_id: s.resource_id,
        type: (s.type as any) || 'preventiva',
        priority: s.impact_on_production === 'alto' ? 'alta' : 'media',
        description: s.title || s.description || 'Manutenção Programada',
        status: (s.status as any) || 'aberta',
        scheduled_date: s.next_maintenance,
        technician: s.responsible || 'Equipe Manutenção',
        expand: s.expand,
      }))
    } catch {
      return []
    }
  }
}

export async function createMaintenanceOrder(
  data: Partial<MaintenanceOrder>,
): Promise<MaintenanceOrder | any> {
  try {
    const res = await pb.collection('industrial_maintenance_orders').create(data)
    return res as unknown as MaintenanceOrder
  } catch {
    // Se a coleção direta não existir, mapeia para maintenance_schedules
    return createMaintenanceSchedule({
      resource_id: data.resource_id || '',
      type: (data.type as any) || 'corretiva',
      title: data.description || data.order_number || 'Ordem de Manutenção',
      description: data.description || '',
      next_maintenance: data.scheduled_date || new Date().toISOString().substring(0, 10),
      status: (data.status as any) || 'agendada',
      responsible: data.technician || 'Equipe Manutenção',
      impact_on_production:
        data.priority === 'critica' || data.priority === 'alta' ? 'alto' : 'medio',
    })
  }
}

export async function updateMaintenanceOrder(
  id: string,
  data: Partial<MaintenanceOrder>,
): Promise<MaintenanceOrder | any> {
  try {
    const res = await pb.collection('industrial_maintenance_orders').update(id, data)
    return res as unknown as MaintenanceOrder
  } catch {
    return updateMaintenanceSchedule(id, {
      status: (data.status as any) || 'concluida',
    })
  }
}

export async function getMaintenancePlans(): Promise<MaintenancePlan[]> {
  try {
    const list = await pb.collection('industrial_maintenance_plans').getFullList({
      sort: '-created',
      expand: 'resource_id',
    })
    return (list || []) as unknown as MaintenancePlan[]
  } catch {
    try {
      const schedules = await getMaintenanceSchedules()
      return schedules
        .filter((s: any) => s.type === 'preventiva' || s.frequency_days > 0)
        .map((s: any) => ({
          id: s.id,
          name: s.title || 'Plano Preventivo Padrão',
          resource_id: s.resource_id,
          frequency_days: s.frequency_days || 30,
          expand: s.expand,
        }))
    } catch {
      return []
    }
  }
}

export async function createMaintenancePlan(
  data: Partial<MaintenancePlan>,
): Promise<MaintenancePlan | any> {
  try {
    const res = await pb.collection('industrial_maintenance_plans').create(data)
    return res as unknown as MaintenancePlan
  } catch {
    return createMaintenanceSchedule({
      resource_id: data.resource_id || '',
      type: 'preventiva',
      title: data.name || 'Plano Preventivo',
      frequency_days: data.frequency_days || 30,
      status: 'agendada',
    })
  }
}

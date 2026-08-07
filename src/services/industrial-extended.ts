import pb from '@/lib/pocketbase/client'
import type {
  IndustrialCalendar,
  IndustrialShift,
  IndustrialApontamento,
  QualityChecklist,
  QualityNonConformity,
  IndustrialKpi,
  MaintenanceSchedule,
  IndustrialTraceability,
} from '@/lib/industrial-extended-types'

export const getCalendars = () =>
  pb
    .collection('industrial_calendars')
    .getFullList({ sort: '-created', expand: 'resource_id' }) as Promise<IndustrialCalendar[]>

export const createCalendar = (data: Partial<IndustrialCalendar>) =>
  pb.collection('industrial_calendars').create(data) as Promise<IndustrialCalendar>

export const updateCalendar = (id: string, data: Partial<IndustrialCalendar>) =>
  pb.collection('industrial_calendars').update(id, data) as Promise<IndustrialCalendar>

export const getShifts = (calendarId?: string) =>
  pb.collection('industrial_shifts').getFullList({
    sort: 'name',
    filter: calendarId ? `calendar_id = "${calendarId}"` : undefined,
  }) as Promise<IndustrialShift[]>

export const createShift = (data: Partial<IndustrialShift>) =>
  pb.collection('industrial_shifts').create(data) as Promise<IndustrialShift>

export const getApontamentos = (orderId?: string) =>
  pb.collection('industrial_apontamentos').getFullList({
    sort: '-created',
    filter: orderId ? `production_order_id = "${orderId}"` : undefined,
    expand: 'production_order_id,product_id,resource_id',
  }) as Promise<IndustrialApontamento[]>

export const createApontamento = (data: Partial<IndustrialApontamento>) =>
  pb.collection('industrial_apontamentos').create(data) as Promise<IndustrialApontamento>

export const getChecklists = () =>
  pb
    .collection('quality_checklists')
    .getFullList({ sort: '-created', expand: 'product_id' }) as Promise<QualityChecklist[]>

export const createChecklist = (data: Partial<QualityChecklist>) =>
  pb.collection('quality_checklists').create(data) as Promise<QualityChecklist>

export const getNonConformities = (orderId?: string) =>
  pb.collection('quality_non_conformities').getFullList({
    sort: '-created',
    filter: orderId ? `production_order_id = "${orderId}"` : undefined,
    expand: 'production_order_id,product_id',
  }) as Promise<QualityNonConformity[]>

export const createNonConformity = (data: Partial<QualityNonConformity>) =>
  pb.collection('quality_non_conformities').create(data) as Promise<QualityNonConformity>

export const updateNonConformity = (id: string, data: Partial<QualityNonConformity>) =>
  pb.collection('quality_non_conformities').update(id, data) as Promise<QualityNonConformity>

export const getKpis = () =>
  pb
    .collection('industrial_kpis')
    .getFullList({ sort: '-created', expand: 'resource_id' }) as Promise<IndustrialKpi[]>

export const createKpi = (data: Partial<IndustrialKpi>) =>
  pb.collection('industrial_kpis').create(data) as Promise<IndustrialKpi>

export const getMaintenanceSchedules = () =>
  pb
    .collection('maintenance_schedules')
    .getFullList({ sort: 'next_maintenance', expand: 'resource_id' }) as Promise<
    MaintenanceSchedule[]
  >

export const createMaintenanceSchedule = (data: Partial<MaintenanceSchedule>) =>
  pb.collection('maintenance_schedules').create(data) as Promise<MaintenanceSchedule>

export const updateMaintenanceSchedule = (id: string, data: Partial<MaintenanceSchedule>) =>
  pb.collection('maintenance_schedules').update(id, data) as Promise<MaintenanceSchedule>

export const getTraceability = (orderId?: string) =>
  pb.collection('industrial_traceability').getFullList({
    sort: '-created',
    filter: orderId ? `production_order_id = "${orderId}"` : undefined,
    expand: 'production_order_id,product_id,raw_material_id,resource_id',
  }) as Promise<IndustrialTraceability[]>

export const createTraceability = (data: Partial<IndustrialTraceability>) =>
  pb.collection('industrial_traceability').create(data) as Promise<IndustrialTraceability>

export const getMrpSuggestions = () => pb.send('/backend/v1/industrial/mrp', { method: 'GET' })

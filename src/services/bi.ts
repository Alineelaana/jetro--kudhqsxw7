import pb from '@/lib/pocketbase/client'
import type { BIReport } from '@/lib/bi-types'

export const getBIReports = () =>
  pb.collection('bi_reports').getFullList({ sort: '-created' }) as Promise<BIReport[]>

export const createBIReport = (data: Record<string, unknown>) =>
  pb.collection('bi_reports').create(data) as Promise<BIReport>

export const updateBIReport = (id: string, data: Record<string, unknown>) =>
  pb.collection('bi_reports').update(id, data) as Promise<BIReport>

export const deleteBIReport = (id: string) => pb.collection('bi_reports').delete(id)

export function logBIAudit(action: string, targetId: string, summary: string) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module: 'bi',
      target_collection: 'bi_reports',
      target_id: targetId,
      target_summary: summary,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}

export function logBIExport(format: string, summary: string) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action: 'export',
      module: 'bi',
      target_collection: 'bi_exports',
      target_summary: `Exportação ${format}: ${summary}`,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}

import type { BIDashboard } from '@/lib/bi-types'

export const getBIDashboards = () =>
  pb.collection('bi_dashboards').getFullList({ sort: '-created' }) as Promise<BIDashboard[]>

export const createBIDashboard = (data: Record<string, unknown>) =>
  pb.collection('bi_dashboards').create(data) as Promise<BIDashboard>

export const updateBIDashboard = (id: string, data: Record<string, unknown>) =>
  pb.collection('bi_dashboards').update(id, data) as Promise<BIDashboard>

export const deleteBIDashboard = (id: string) => pb.collection('bi_dashboards').delete(id)

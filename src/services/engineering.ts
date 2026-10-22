import pb from '@/lib/pocketbase/client'

export interface EngineeringChangeRequest {
  id: string
  ecr_number: string
  title: string
  description: string
  reason: string
  type: string
  priority: string
  status: string
  product_id: string
  bom_version_id: string
  requested_by: string
  analyzed_by: string
  analysis_notes: string
  impact_assessment: string
  company: string
  branch: string
  created: string
  updated: string
  expand?: { product_id?: { id: string; name: string } }
}

export interface EngineeringChangeOrder {
  id: string
  eco_number: string
  ecr_id: string
  title: string
  description: string
  change_details: unknown
  status: string
  approved_by: string
  approval_date: string
  implemented_by: string
  implementation_date: string
  effective_date: string
  company: string
  branch: string
  created: string
  updated: string
  expand?: { ecr_id?: EngineeringChangeRequest }
}

export interface EngineeringDocument {
  id: string
  product_id: string
  bom_version_id: string
  name: string
  description: string
  doc_type: string
  file_url: string
  version: string
  uploaded_by: string
  created: string
  updated: string
  expand?: { product_id?: { id: string; name: string } }
}

export const getECRs = () =>
  pb.collection('engineering_change_requests').getFullList({
    sort: '-created',
    expand: 'product_id',
  }) as Promise<EngineeringChangeRequest[]>

export const getECOs = () =>
  pb.collection('engineering_change_orders').getFullList({
    sort: '-created',
    expand: 'ecr_id',
  }) as Promise<EngineeringChangeOrder[]>

export const getEngineeringDocuments = () =>
  pb.collection('engineering_documents').getFullList({
    sort: '-created',
    expand: 'product_id',
  }) as Promise<EngineeringDocument[]>

export const createECR = (data: Partial<EngineeringChangeRequest>) =>
  pb.collection('engineering_change_requests').create(data) as Promise<EngineeringChangeRequest>

export const updateECR = (id: string, data: Partial<EngineeringChangeRequest>) =>
  pb.collection('engineering_change_requests').update(id, data) as Promise<EngineeringChangeRequest>

export const createECO = (data: Partial<EngineeringChangeOrder>) =>
  pb.collection('engineering_change_orders').create(data) as Promise<EngineeringChangeOrder>

export const updateECO = (id: string, data: Partial<EngineeringChangeOrder>) =>
  pb.collection('engineering_change_orders').update(id, data) as Promise<EngineeringChangeOrder>

export const createEngineeringDoc = (data: Partial<EngineeringDocument>) =>
  pb.collection('engineering_documents').create(data) as Promise<EngineeringDocument>

export const createEngineeringChange = (data: Record<string, unknown>) =>
  pb.send('/backend/v1/industrial/engineering-change/create', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const approveEngineeringChange = (data: Record<string, unknown>) =>
  pb.send('/backend/v1/industrial/engineering-change/approve', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const approveBomRevision = (data: { bom_id: string; action: 'approve' | 'reject' }) =>
  pb.send('/backend/v1/industrial/bom-revision/approve', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const getBomExplosion = (productId: string) =>
  pb.send(`/backend/v1/industrial/bom-explosion/${productId}`, { method: 'GET' })

export const getEngineeringChanges = async (): Promise<EngineeringChangeRequest[]> => {
  try {
    const list = await pb.collection('engineering_change_requests').getFullList({
      sort: '-created',
    })
    return (list || []) as unknown as EngineeringChangeRequest[]
  } catch {
    return []
  }
}

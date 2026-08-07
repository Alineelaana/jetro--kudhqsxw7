import pb from '@/lib/pocketbase/client'
import type { PlatformWorkflow, WorkflowStep, WorkflowStatus } from '@/lib/platform-layer-types'
import { WORKFLOW_TEMPLATES } from '@/lib/platform-layer-types'

export async function getWorkflows(filters?: {
  status?: WorkflowStatus
  entityType?: string
  assignedTo?: string
}): Promise<PlatformWorkflow[]> {
  const parts: string[] = []
  if (filters?.status) parts.push(`status = "${filters.status}"`)
  if (filters?.entityType) parts.push(`entity_type = "${filters.entityType}"`)
  if (filters?.assignedTo) parts.push(`assigned_to = "${filters.assignedTo}"`)
  return pb.collection('platform_workflows').getFullList({
    sort: '-created',
    filter: parts.length ? parts.join(' && ') : undefined,
  }) as Promise<PlatformWorkflow[]>
}

export async function getWorkflow(id: string): Promise<PlatformWorkflow> {
  return pb.collection('platform_workflows').getOne(id) as Promise<PlatformWorkflow>
}

export async function createWorkflow(data: {
  workflow_key: string
  entity_type: string
  entity_id?: string
  entity_number?: string
  entity_summary?: string
  module_origin: string
  company?: string
  branch?: string
}): Promise<PlatformWorkflow> {
  const template = WORKFLOW_TEMPLATES[data.workflow_key] || WORKFLOW_TEMPLATES.generic
  const firstStep = template[0]
  const user = pb.authStore.record as Record<string, unknown> | null
  return pb.collection('platform_workflows').create({
    ...data,
    current_step: firstStep.key,
    steps: template,
    history: [
      {
        step: firstStep.key,
        action: 'created',
        user: (user?.name as string) || 'System',
        date: new Date().toISOString(),
        notes: 'Workflow iniciado',
      },
    ],
    status: 'in_progress',
    assigned_role: firstStep.role,
    created_by: user?.id || '',
    created_by_name: (user?.name as string) || '',
  }) as Promise<PlatformWorkflow>
}

export async function advanceWorkflow(
  id: string,
  action: 'approve' | 'reject' | 'review' | 'execute' | 'close',
  notes?: string,
): Promise<PlatformWorkflow> {
  const workflow = await getWorkflow(id)
  const steps = workflow.steps as WorkflowStep[]
  const currentIdx = steps.findIndex((s) => s.key === workflow.current_step)
  if (currentIdx === -1) throw new Error('Current step not found')

  const user = pb.authStore.record as Record<string, unknown> | null
  const userName = (user?.name as string) || 'System'
  const now = new Date().toISOString()

  steps[currentIdx].completed_at = now
  steps[currentIdx].completed_by = userName
  steps[currentIdx].result = action
  steps[currentIdx].notes = notes || ''

  const history = [
    ...(workflow.history || []),
    {
      step: workflow.current_step,
      action,
      user: userName,
      date: now,
      notes: notes || '',
    },
  ]

  let status: WorkflowStatus = 'in_progress'
  let nextStep = ''
  let assignedRole = ''

  if (action === 'reject') {
    status = 'rejected'
  } else if (action === 'close' || currentIdx === steps.length - 1) {
    status = 'completed'
  } else {
    const next = steps[currentIdx + 1]
    nextStep = next.key
    assignedRole = next.role
    status = 'in_progress'
  }

  return pb.collection('platform_workflows').update(id, {
    steps,
    history,
    current_step: nextStep,
    status,
    assigned_role: assignedRole,
  }) as Promise<PlatformWorkflow>
}

export async function cancelWorkflow(id: string, reason: string): Promise<void> {
  const user = pb.authStore.record as Record<string, unknown> | null
  const workflow = await getWorkflow(id)
  const history = [
    ...(workflow.history || []),
    {
      step: workflow.current_step,
      action: 'cancelled',
      user: (user?.name as string) || 'System',
      date: new Date().toISOString(),
      notes: reason,
    },
  ]
  await pb.collection('platform_workflows').update(id, { status: 'cancelled', history })
}

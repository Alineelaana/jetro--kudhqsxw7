import pb from '@/lib/pocketbase/client'

export interface AiTrainingItem {
  id: string
  title: string
  content: string
  type: 'instruction' | 'qa' | 'template'
  created: string
  updated: string
}

export async function getAiFulltimeActive(): Promise<boolean> {
  try {
    const result = await pb.send('/backend/v1/ai-settings', { method: 'GET' })
    return result.active === true
  } catch {
    return false
  }
}

export async function setAiFulltimeActive(active: boolean): Promise<void> {
  await pb.send('/backend/v1/ai-settings', {
    method: 'POST',
    body: JSON.stringify({ active }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getTrainingItems(): Promise<AiTrainingItem[]> {
  return pb.send('/backend/v1/ai-training', { method: 'GET' })
}

export async function createTrainingItem(data: {
  title: string
  content: string
  type: string
}): Promise<void> {
  await pb.send('/backend/v1/ai-training', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function updateTrainingItem(
  id: string,
  data: { title: string; content: string; type: string },
): Promise<void> {
  await pb.send(`/backend/v1/ai-training/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function deleteTrainingItem(id: string): Promise<void> {
  await pb.send(`/backend/v1/ai-training/${id}`, { method: 'DELETE' })
}

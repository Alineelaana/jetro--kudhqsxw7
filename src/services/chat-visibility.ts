import pb from '@/lib/pocketbase/client'

export async function getChatVisibility(): Promise<boolean> {
  try {
    const result = await pb.send('/backend/v1/chat-visibility', { method: 'GET' })
    return result.visible !== false
  } catch {
    return true
  }
}

export async function setChatVisibility(visible: boolean): Promise<void> {
  await pb.send('/backend/v1/chat-visibility', {
    method: 'POST',
    body: JSON.stringify({ visible }),
    headers: { 'Content-Type': 'application/json' },
  })
}

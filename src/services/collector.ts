import pb from '@/lib/pocketbase/client'
import type {
  CollectorShift,
  CollectorOperation,
  CollectorSyncBatchResult,
} from '@/types/collector'

const OFFLINE_QUEUE_KEY = 'huram_collector_offline_queue'
const ACTIVE_SHIFT_KEY = 'huram_collector_active_shift'
const DEVICE_INFO_KEY = 'huram_collector_device_info'

// ---------------------------------------------------------------------------
// Helpers Offline Storage
// ---------------------------------------------------------------------------
export function getStoredDevice(): { id: string; codigo: string; filial: string } | null {
  try {
    const raw = localStorage.getItem(DEVICE_INFO_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredDevice(device: { id: string; codigo: string; filial: string }) {
  localStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(device))
}

export function getLocalActiveShift(): CollectorShift | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SHIFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setLocalActiveShift(shift: CollectorShift | null) {
  if (!shift) {
    localStorage.removeItem(ACTIVE_SHIFT_KEY)
  } else {
    localStorage.setItem(ACTIVE_SHIFT_KEY, JSON.stringify(shift))
  }
}

export function getOfflineQueue(): CollectorOperation[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveOfflineQueue(queue: CollectorOperation[]) {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
}

export function enqueueOfflineOperation(op: CollectorOperation) {
  const queue = getOfflineQueue()
  // deduplicate by idempotency_key
  const filtered = queue.filter((item) => item.idempotency_key !== op.idempotency_key)
  filtered.push({ ...op, status: 'pendente_sync' })
  saveOfflineQueue(filtered)
}

// ---------------------------------------------------------------------------
// Sincronização e Envio
// ---------------------------------------------------------------------------
export async function syncOfflineQueue(): Promise<{
  synced: number
  remaining: number
  error?: string
}> {
  const queue = getOfflineQueue()
  if (queue.length === 0) return { synced: 0, remaining: 0 }

  try {
    const res = await pb.send<CollectorSyncBatchResult>('/backend/v1/collector/sync-batch', {
      method: 'POST',
      body: JSON.stringify({ operations: queue }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res && res.ok) {
      // Remove da fila as operações enviadas com sucesso
      const successKeys = new Set(
        res.results.filter((r) => r.success).map((r) => r.idempotency_key),
      )
      const remaining = queue.filter((op) => !successKeys.has(op.idempotency_key))
      saveOfflineQueue(remaining)
      return { synced: res.synced + res.deduplicated, remaining: remaining.length }
    }
    return { synced: 0, remaining: queue.length, error: 'Resposta inválida do servidor' }
  } catch (err) {
    return { synced: 0, remaining: queue.length, error: String(err) }
  }
}

// ---------------------------------------------------------------------------
// Registro de Operação (online com fallback offline imediato)
// ---------------------------------------------------------------------------
export async function executeCollectorOperation(
  data: Omit<CollectorOperation, 'id' | 'created' | 'updated'>,
): Promise<{ success: boolean; offline: boolean; record?: CollectorOperation; error?: string }> {
  // Garantir chave de idempotência
  const idempotency_key =
    data.idempotency_key || `col_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  const payload: CollectorOperation = {
    ...data,
    idempotency_key,
  }

  // Se o navegador já está offline, enfileirar diretamente
  if (!navigator.onLine) {
    enqueueOfflineOperation(payload)
    return { success: true, offline: true, record: payload }
  }

  try {
    const created = await pb.collection('collector_operations').create<CollectorOperation>(payload)
    return { success: true, offline: false, record: created }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    // Se for erro de rede/timeout/502/503/504, enfileirar offline
    const isNetworkError =
      errorMsg.includes('Failed to fetch') ||
      errorMsg.includes('NetworkError') ||
      errorMsg.includes('offline') ||
      errorMsg.includes('status: 0')
    if (isNetworkError) {
      enqueueOfflineOperation(payload)
      return { success: true, offline: true, record: payload }
    }
    return { success: false, offline: false, error: errorMsg }
  }
}

// ---------------------------------------------------------------------------
// Serviços de Turno
// ---------------------------------------------------------------------------
export async function getOpenShiftForOperator(operatorId: string): Promise<CollectorShift | null> {
  try {
    const list = await pb.collection('collector_shifts').getList<CollectorShift>(1, 1, {
      filter: `operador_id = "${operatorId}" && status = "aberto"`,
      sort: '-created',
    })
    if (list.items.length > 0) {
      setLocalActiveShift(list.items[0])
      return list.items[0]
    }
    setLocalActiveShift(null)
    return null
  } catch {
    return getLocalActiveShift()
  }
}

export async function openCollectorShift(data: {
  operador_id: string
  operador_nome?: string
  dispositivo_id?: string
  dispositivo_codigo?: string
  turno_nome?: string
  bateria_inicial?: number
  observacoes?: string
  empresa_id?: string
  filial_id?: string
}): Promise<CollectorShift> {
  const payload = {
    ...data,
    data_inicio: new Date().toISOString(),
    status: 'aberto' as const,
  }
  const created = await pb.collection('collector_shifts').create<CollectorShift>(payload)
  setLocalActiveShift(created)
  return created
}

export async function closeCollectorShift(
  shiftId: string,
  bateriaFinal?: number,
  observacoes?: string,
): Promise<CollectorShift> {
  const payload: Record<string, unknown> = {
    status: 'fechado',
    data_fim: new Date().toISOString(),
  }
  if (bateriaFinal !== undefined) payload.bateria_final = bateriaFinal
  if (observacoes) payload.observacoes = observacoes

  const updated = await pb.collection('collector_shifts').update<CollectorShift>(shiftId, payload)
  setLocalActiveShift(null)
  return updated
}

export async function getCollectorOperations(
  filter?: string,
  limit = 50,
): Promise<CollectorOperation[]> {
  const records = await pb
    .collection('collector_operations')
    .getList<CollectorOperation>(1, limit, {
      filter: filter || undefined,
      sort: '-created',
    })
  return records.items
}

// ---------------------------------------------------------------------------
// Feedback Háptico e Sonoro (Safe PWA APIs)
// ---------------------------------------------------------------------------
export function triggerHapticFeedback(type: 'success' | 'warning' | 'error') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'success') {
        navigator.vibrate(80)
      } else if (type === 'warning') {
        navigator.vibrate([100, 50, 100])
      } else if (type === 'error') {
        navigator.vibrate([200, 100, 200, 100, 300])
      }
    } catch {
      // Ignora erro se navegador bloquear vibração
    }
  }
}

export function playAudioFeedback(type: 'success' | 'warning' | 'error') {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime
    if (type === 'success') {
      osc.frequency.setValueAtTime(880, now) // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.08) // D6
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.25)
    } else if (type === 'warning') {
      osc.frequency.setValueAtTime(587.33, now) // D5
      osc.frequency.setValueAtTime(587.33, now + 0.1)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.25)
    } else {
      osc.frequency.setValueAtTime(220, now) // A3 tom baixo de erro
      osc.frequency.setValueAtTime(164.81, now + 0.12) // E3
      gain.gain.setValueAtTime(0.35, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
      osc.start(now)
      osc.stop(now + 0.35)
    }
  } catch {
    // AudioContext pode exigir interação prévia do usuário
  }
}

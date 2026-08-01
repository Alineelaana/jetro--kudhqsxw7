import pb from '@/lib/pocketbase/client'
import { DEFAULT_FORM_FIELDS, type DefaultFormField } from '@/lib/constants'

export async function getFormFields(): Promise<DefaultFormField[]> {
  try {
    const records = await pb.collection('budget_form_fields').getFullList({
      sort: 'order',
      filter: 'active = true',
    })
    return records.map((r) => {
      let options: string[] | null = null
      const raw = (r as Record<string, unknown>).options
      if (raw) {
        try {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
          if (Array.isArray(parsed)) options = parsed as string[]
        } catch {
          /* ignore parse errors */
        }
      }
      return {
        name: (r as Record<string, unknown>).name as string,
        label: (r as Record<string, unknown>).label as string,
        type: (r as Record<string, unknown>).type as DefaultFormField['type'],
        options,
        required: !!(r as Record<string, unknown>).required,
        order: (r as Record<string, unknown>).order as number,
        active: !!(r as Record<string, unknown>).active,
      }
    })
  } catch {
    return DEFAULT_FORM_FIELDS
  }
}

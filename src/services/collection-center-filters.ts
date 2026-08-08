import pb from '@/lib/pocketbase/client'

export async function loadPartnersMap(): Promise<Record<string, any>> {
  try {
    const records = await pb.collection('partners').getFullList()
    const map: Record<string, any> = {}
    for (const p of records) {
      const names = [p.full_name, p.company_name, p.trade_name].filter(Boolean)
      for (const name of names) {
        map[name.toLowerCase()] = p
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function loadVendedoresForFilter(): Promise<Record<string, any>> {
  try {
    const records = await pb.collection('vendedores').getFullList({
      filter: 'active = true',
    })
    const map: Record<string, any> = {}
    for (const v of records) {
      if (v.name) map[v.name.toLowerCase()] = v
    }
    return map
  } catch {
    return {}
  }
}

import pb from '@/lib/pocketbase/client'

export interface SiteClient {
  id: string
  nome: string
  logo?: string
  site?: string
  instagram?: string
  ordem?: number
  ativo?: boolean
  created?: string
  updated?: string
  collectionId?: string
  collectionName?: string
}

export function getSiteClientLogoUrl(client: SiteClient): string | null {
  if (!client.logo) return null
  return pb.files.getUrl(client, client.logo)
}

export async function getPublicSiteClients(): Promise<SiteClient[]> {
  try {
    const records = await pb.collection('site_clients').getFullList<SiteClient>({
      filter: 'ativo = true',
      sort: 'ordem,nome',
      requestKey: null,
    })
    return records
  } catch (error) {
    console.error('Erro ao buscar clientes públicos do site:', error)
    return []
  }
}

export async function getAllSiteClientsAdmin(): Promise<SiteClient[]> {
  const records = await pb.collection('site_clients').getFullList<SiteClient>({
    sort: 'ordem,nome',
    requestKey: null,
  })
  return records
}

export async function createSiteClient(formData: FormData): Promise<SiteClient> {
  return await pb.collection('site_clients').create<SiteClient>(formData)
}

export async function updateSiteClient(
  id: string,
  formData: FormData | Partial<SiteClient>,
): Promise<SiteClient> {
  return await pb.collection('site_clients').update<SiteClient>(id, formData)
}

export async function deleteSiteClient(id: string): Promise<boolean> {
  return await pb.collection('site_clients').delete(id)
}

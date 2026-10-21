import pb from '@/lib/pocketbase/client'
import { logoGranRomanoOfficial, logoDecEldoradoOfficial } from '@/lib/brand-assets'

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

/**
 * Mapeamento estático confiável de logos oficiais para clientes homologados.
 * Utilizado como fallback prioritário quando o campo `logo` do banco de dados ainda não tiver arquivo persistido,
 * garantindo renderização imediata sem depender exclusivamente do upload do backend.
 * Se o registro possuir `logo` anexado via PocketBase, o arquivo do banco PREVALECE para respeitar o CRUD administrativo.
 */
export const OFFICIAL_CLIENT_LOGOS_FALLBACK: Record<string, string> = {
  'gran romano': logoGranRomanoOfficial,
  'dec eldorado': logoDecEldoradoOfficial,
}

export function resolveSiteClientLogoUrl(client: SiteClient): string | null {
  // 1. Prioridade máxima: arquivo do banco de dados (permite substituição via painel Admin)
  const dbUrl = getSiteClientLogoUrl(client)
  if (dbUrl) return dbUrl

  // 2. Fallback confiável: assets oficiais salvos no repositório por correspondência de nome
  const normalizedName = (client.nome || '').trim().toLowerCase()
  for (const [key, assetUrl] of Object.entries(OFFICIAL_CLIENT_LOGOS_FALLBACK)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return assetUrl
    }
  }

  return null
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

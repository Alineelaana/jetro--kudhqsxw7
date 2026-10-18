import pb from '@/lib/pocketbase/client'

export type TestimonialStatus = 'Pendente de Aprovação' | 'Aprovado' | 'Reprovado' | 'Despublicado'

export interface SiteTestimonial {
  id: string
  nome_autor: string
  empresa: string
  email: string
  instagram: string
  depoimento: string
  foto?: string
  status: TestimonialStatus
  verificado?: boolean
  autorizacao_confirmada?: boolean
  autorizacao_versao?: string
  autorizacao_hash?: string
  autorizacao_data?: string
  aprovado_por?: string
  aprovado_em?: string
  reprovado_por?: string
  reprovado_em?: string
  reprovado_motivo?: string
  despublicado_por?: string
  despublicado_em?: string
  despublicado_motivo?: string
  ip_origem?: string
  user_agent?: string
  created?: string
  updated?: string
  collectionId?: string
  collectionName?: string
}

export function normalizeInstagramHandle(raw: string): string {
  if (!raw) return ''
  let clean = raw.trim().replace(/^@+/, '')
  clean = clean.replace(/https?:\/\/(www\.)?instagram\.com\//i, '')
  clean = clean
    .split('/')[0]
    .split('?')[0]
    .replace(/[^a-zA-Z0-9._]/g, '')
  return clean
}

export function buildInstagramUrl(handle: string): string {
  const clean = normalizeInstagramHandle(handle)
  return clean ? `https://instagram.com/${clean}` : ''
}

export function getTestimonialPhotoUrl(item: SiteTestimonial): string | null {
  if (!item.foto) return null
  return pb.files.getUrl(item, item.foto)
}

/**
 * Busca depoimentos públicos aprovados para exibição na vitrine.
 * Filtro rigoroso: status = "Aprovado"
 */
export async function getPublicApprovedTestimonials(): Promise<SiteTestimonial[]> {
  try {
    const list = await pb.collection('site_testimonials').getFullList<SiteTestimonial>({
      filter: 'status = "Aprovado"',
      sort: '-created',
      requestKey: null,
    })
    return list
  } catch (error) {
    console.error('Erro ao buscar depoimentos públicos aprovados:', error)
    return []
  }
}

/**
 * Envio público de depoimento pelo cliente/visitante.
 * Salva com status forçado para "Pendente de Aprovação" e requer autorização LGPD.
 */
export async function submitPublicTestimonial(formData: FormData): Promise<SiteTestimonial> {
  return await pb.collection('site_testimonials').create<SiteTestimonial>(formData)
}

/**
 * Busca administrativa de todos os depoimentos (Pendente, Aprovado, Reprovado, Despublicado).
 */
export async function getAllTestimonialsAdmin(filter?: string): Promise<SiteTestimonial[]> {
  const options: Record<string, any> = {
    sort: '-created',
    requestKey: null,
  }
  if (filter) {
    options.filter = filter
  }
  return await pb.collection('site_testimonials').getFullList<SiteTestimonial>(options)
}

export async function approveTestimonial(
  id: string,
  params: { aprovadorNome: string; verificado: boolean },
): Promise<SiteTestimonial> {
  const payload = {
    status: 'Aprovado' as TestimonialStatus,
    verificado: Boolean(params.verificado),
    aprovado_por: params.aprovadorNome,
    aprovado_em: new Date().toISOString(),
    // Limpa eventuais motivos anteriores
    reprovado_motivo: '',
  }
  return await pb.collection('site_testimonials').update<SiteTestimonial>(id, payload)
}

export async function rejectTestimonial(
  id: string,
  params: { reprovadorNome: string; motivo: string },
): Promise<SiteTestimonial> {
  const payload = {
    status: 'Reprovado' as TestimonialStatus,
    reprovado_por: params.reprovadorNome,
    reprovado_em: new Date().toISOString(),
    reprovado_motivo: params.motivo.trim(),
  }
  return await pb.collection('site_testimonials').update<SiteTestimonial>(id, payload)
}

export async function unpublishTestimonial(
  id: string,
  params: { responsavelNome: string; motivo?: string },
): Promise<SiteTestimonial> {
  const payload = {
    status: 'Despublicado' as TestimonialStatus,
    despublicado_por: params.responsavelNome,
    despublicado_em: new Date().toISOString(),
    despublicado_motivo: (params.motivo || '').trim(),
  }
  return await pb.collection('site_testimonials').update<SiteTestimonial>(id, payload)
}

export async function deleteTestimonialAdmin(id: string): Promise<boolean> {
  return await pb.collection('site_testimonials').delete(id)
}

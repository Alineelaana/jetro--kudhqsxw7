import pb from '@/lib/pocketbase/client'

export interface PrivacyRequestData {
  nome: string
  email: string
  empresa?: string
  telefone?: string
  tipo_solicitacao: string
  mensagem: string
}

export const createPrivacyRequest = (data: PrivacyRequestData) =>
  pb.collection('privacy_requests').create(data)

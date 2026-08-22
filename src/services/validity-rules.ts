import pb from '@/lib/pocketbase/client'
import type { ValidityRule, CorporateDocument } from '@/lib/validity-types'

export async function getValidityRules(): Promise<ValidityRule[]> {
  return pb.collection('validity_rules').getFullList({ sort: 'module,name' }) as Promise<
    ValidityRule[]
  >
}

export async function createValidityRule(data: Partial<ValidityRule>): Promise<ValidityRule> {
  return pb.collection('validity_rules').create(data) as Promise<ValidityRule>
}

export async function createValidityRuleFormData(formData: FormData): Promise<ValidityRule> {
  return pb.collection('validity_rules').create(formData) as Promise<ValidityRule>
}

export async function updateValidityRule(
  id: string,
  data: Partial<ValidityRule>,
): Promise<ValidityRule> {
  return pb.collection('validity_rules').update(id, data) as Promise<ValidityRule>
}

export async function updateValidityRuleFormData(
  id: string,
  formData: FormData,
): Promise<ValidityRule> {
  return pb.collection('validity_rules').update(id, formData) as Promise<ValidityRule>
}

export async function deleteValidityRule(id: string): Promise<void> {
  await pb.collection('validity_rules').delete(id)
}

export async function getCorporateDocuments(): Promise<CorporateDocument[]> {
  return pb.collection('corporate_documents').getFullList({ sort: '-validade' }) as Promise<
    CorporateDocument[]
  >
}

export async function createCorporateDocument(
  data: Partial<CorporateDocument>,
): Promise<CorporateDocument> {
  return pb.collection('corporate_documents').create(data) as Promise<CorporateDocument>
}

export async function updateCorporateDocument(
  id: string,
  data: Partial<CorporateDocument>,
): Promise<CorporateDocument> {
  return pb.collection('corporate_documents').update(id, data) as Promise<CorporateDocument>
}

export async function deleteCorporateDocument(id: string): Promise<void> {
  await pb.collection('corporate_documents').delete(id)
}

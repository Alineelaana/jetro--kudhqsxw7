import pb from '@/lib/pocketbase/client'

export interface AlcadaProfile {
  percent: number
  valor: number
}

export interface AlcadasConfig {
  cobrador: AlcadaProfile
  supervisor: AlcadaProfile
  gerente: AlcadaProfile
}

export interface PriorizacaoRule {
  key: string
  label: string
  weight: number
  order: number
}

export interface PriorizacaoConfig {
  rules: PriorizacaoRule[]
}

export interface CobrancaTemplate {
  id: string
  name: string
  subject?: string
  body: string
  category?: string
  cobranca_tipo: string
  destinatarios: string
  canais: string
  active: boolean
}

export async function getAlcadasConfig(): Promise<AlcadasConfig> {
  try {
    const records = await pb.collection('system_parameters').getFullList({
      filter: 'module = "collection_center" && key = "alcadas_desconto" && active != false',
    })
    if (records.length > 0) {
      return JSON.parse((records[0] as any).value || '{}')
    }
  } catch {
    /* intentionally ignored */
  }
  return {
    cobrador: { percent: 5, valor: 5000 },
    supervisor: { percent: 15, valor: 20000 },
    gerente: { percent: 30, valor: 50000 },
  }
}

export async function saveAlcadasConfig(config: AlcadasConfig): Promise<void> {
  const records = await pb.collection('system_parameters').getFullList({
    filter: 'module = "collection_center" && key = "alcadas_desconto"',
  })
  const user = pb.authStore.record as any
  if (records.length > 0) {
    const rec = records[0] as any
    await pb.collection('system_parameters').update(rec.id, {
      previous_value: rec.value,
      value: JSON.stringify(config),
      changed_by: user?.id || '',
      active: true,
    })
  } else {
    await pb.collection('system_parameters').create({
      module: 'collection_center',
      key: 'alcadas_desconto',
      label: 'Alçadas de Desconto por Perfil',
      value: JSON.stringify(config),
      value_type: 'json',
      active: true,
      changed_by: user?.id || '',
    })
  }
}

export async function getPriorizacaoConfig(): Promise<PriorizacaoConfig> {
  try {
    const records = await pb.collection('system_parameters').getFullList({
      filter: 'module = "collection_center" && key = "fila_priorizacao" && active != false',
    })
    if (records.length > 0) {
      return JSON.parse((records[0] as any).value || '{"rules":[]}')
    }
  } catch {
    /* intentionally ignored */
  }
  return { rules: [] }
}

export async function savePriorizacaoConfig(config: PriorizacaoConfig): Promise<void> {
  const records = await pb.collection('system_parameters').getFullList({
    filter: 'module = "collection_center" && key = "fila_priorizacao"',
  })
  const user = pb.authStore.record as any
  if (records.length > 0) {
    const rec = records[0] as any
    await pb.collection('system_parameters').update(rec.id, {
      previous_value: rec.value,
      value: JSON.stringify(config),
      changed_by: user?.id || '',
      active: true,
    })
  } else {
    await pb.collection('system_parameters').create({
      module: 'collection_center',
      key: 'fila_priorizacao',
      label: 'Regras de Priorização da Fila',
      value: JSON.stringify(config),
      value_type: 'json',
      active: true,
      changed_by: user?.id || '',
    })
  }
}

export async function getCobrancaTemplates(): Promise<CobrancaTemplate[]> {
  try {
    return (await pb.collection('email_templates').getFullList({
      filter: 'cobranca_tipo != ""',
      sort: 'cobranca_tipo',
    })) as CobrancaTemplate[]
  } catch {
    return []
  }
}

export async function saveCobrancaTemplate(
  id: string,
  data: Partial<CobrancaTemplate>,
): Promise<void> {
  await pb.collection('email_templates').update(id, data)
}

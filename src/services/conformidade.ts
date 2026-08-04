import pb from '@/lib/pocketbase/client'

export interface ConformidadeAlert {
  type: string
  severity: 'Baixa' | 'Média' | 'Alta' | 'Crítica'
  employee_name?: string
  description: string
  module: 'RH' | 'DP' | 'SST'
}

export interface ConformidadeResult {
  alerts: ConformidadeAlert[]
  totalEmployees: number
  compliancePercentage: number
}

export async function getConformidadeData(): Promise<ConformidadeResult> {
  const safeList = (col: string, filter?: string) =>
    pb
      .collection(col)
      .getFullList(filter ? { filter } : {})
      .catch(() => [])

  const [
    employees,
    exams,
    asos,
    trainings,
    certificates,
    vacations,
    timeRecords,
    epis,
    mandatoryDocs,
    pgrs,
    actionPlans,
    psychosocial,
    nonConformities,
    positions,
    trainingParticipants,
  ] = await Promise.all([
    safeList(
      'rh_employees',
      'situacao = "Ativo" || situacao = "Em Experiência" || situacao = "Em Férias"',
    ),
    safeList('dp_occupational_exams'),
    safeList('sst_aso'),
    safeList('rh_trainings'),
    safeList('sst_certificates'),
    safeList('rh_vacations'),
    safeList('rh_time_records'),
    safeList('sst_epis'),
    safeList('dp_mandatory_docs'),
    safeList('sst_pgr'),
    safeList('sst_action_plans'),
    safeList('sst_psychosocial_assessments'),
    safeList('sst_non_conformities'),
    safeList('rh_positions'),
    safeList('rh_training_participants'),
  ])

  const alerts: ConformidadeAlert[] = []
  const now = new Date()
  const empArr = employees as any[]
  const totalEmployees = empArr.length

  for (const emp of empArr) {
    const name = emp.nome_completo || ''
    const empExams = (exams as any[]).filter((e) => e.employee_name === name)
    const validExam = empExams.find(
      (e) => e.situacao === 'Válido' || (e.data_validade && new Date(e.data_validade) >= now),
    )
    if (!validExam)
      alerts.push({
        type: 'exame_ocupacional',
        severity: 'Alta',
        employee_name: name,
        description: 'Colaborador sem exame ocupacional válido',
        module: 'DP',
      })

    const empAsos = (asos as any[]).filter((a) => a.employee_name === name)
    const validAso = empAsos.find(
      (a) => a.situacao === 'Válido' || (a.data_validade && new Date(a.data_validade) >= now),
    )
    if (!validAso)
      alerts.push({
        type: 'aso_vencido',
        severity: 'Alta',
        employee_name: name,
        description: 'ASO vencido ou inexistente',
        module: 'SST',
      })

    const empCerts = (certificates as any[]).filter((c) => c.employee_name === name)
    const expiredCert = empCerts.find(
      (c) => c.situacao === 'Vencido' || (c.data_validade && new Date(c.data_validade) < now),
    )
    if (expiredCert)
      alerts.push({
        type: 'certificado_vencido',
        severity: 'Média',
        employee_name: name,
        description: 'Certificado vencido',
        module: 'SST',
      })

    const empVacs = (vacations as any[]).filter((v) => v.employee_name === name)
    const overdueVac = empVacs.find((v) => v.situacao === 'Vencida')
    if (overdueVac)
      alerts.push({
        type: 'ferias_vencidas',
        severity: 'Média',
        employee_name: name,
        description: 'Férias vencidas',
        module: 'DP',
      })

    const empTime = (timeRecords as any[]).filter((t) => t.employee_name === name)
    const overtimeExcess = empTime.filter((t) => {
      const h = parseFloat(t.horas_extras) || 0
      return h > 2
    })
    if (overtimeExcess.length > 0)
      alerts.push({
        type: 'horas_extras',
        severity: 'Média',
        employee_name: name,
        description: 'Excesso de horas extras',
        module: 'DP',
      })

    const irregularBank = empTime.find((t) => (t.banco_horas || '').startsWith('-'))
    if (irregularBank)
      alerts.push({
        type: 'banco_horas_irregular',
        severity: 'Média',
        employee_name: name,
        description: 'Banco de horas irregular (negativo)',
        module: 'DP',
      })

    const empEpis = (epis as any[]).filter((e) => e.employee_name === name)
    if (empEpis.length === 0)
      alerts.push({
        type: 'sem_epi',
        severity: 'Alta',
        employee_name: name,
        description: 'Colaborador sem entrega de EPI registrada',
        module: 'SST',
      })

    const empDocs = (mandatoryDocs as any[]).filter((d) => d.employee_name === name)
    const expiredDoc = empDocs.find(
      (d) => d.situacao === 'Vencido' || (d.data_validade && new Date(d.data_validade) < now),
    )
    if (expiredDoc)
      alerts.push({
        type: 'doc_obrigatorio_vencido',
        severity: 'Média',
        employee_name: name,
        description: 'Documento obrigatório vencido',
        module: 'DP',
      })

    const empPositions = (positions as any[]).filter((p) => p.name === emp.cargo)
    for (const pos of empPositions) {
      let mandatory: any[] = []
      try {
        mandatory =
          typeof pos.treinamentos_obrigatorios === 'string'
            ? JSON.parse(pos.treinamentos_obrigatorios)
            : pos.treinamentos_obrigatorios || []
      } catch {
        /* intentionally ignored */
      }
      if (Array.isArray(mandatory) && mandatory.length > 0) {
        const empTrainingCount = (trainingParticipants as any[]).filter(
          (tp) => tp.employee_name === name,
        ).length
        if (empTrainingCount === 0)
          alerts.push({
            type: 'cargo_sem_treinamento',
            severity: 'Média',
            employee_name: name,
            description: `Cargo "${emp.cargo}" exige treinamentos obrigatórios não realizados`,
            module: 'RH',
          })
      }
    }
  }

  const expiredPgr = (pgrs as any[]).find(
    (p) => p.situacao === 'Vencido' || (p.data_validade && new Date(p.data_validade) < now),
  )
  if (expiredPgr)
    alerts.push({
      type: 'pgr_vencido',
      severity: 'Crítica',
      description: 'PGR vencido',
      module: 'SST',
    })

  const pendingActions = (actionPlans as any[]).filter((a) =>
    ['Pendente', 'Em Andamento'].includes(a.situacao),
  )
  pendingActions.forEach((a) =>
    alerts.push({
      type: 'plano_acao_pendente',
      severity: 'Média',
      description: `Plano de ação pendente: ${a.titulo}`,
      module: 'SST',
    }),
  )

  const pendingPsychosocial = (psychosocial as any[]).filter((p) => p.situacao === 'Pendente')
  pendingPsychosocial.forEach(() =>
    alerts.push({
      type: 'psicossocial_pendente',
      severity: 'Média',
      description: 'Avaliação psicossocial pendente',
      module: 'SST',
    }),
  )

  const openNCs = (nonConformities as any[]).filter((n) =>
    ['Aberta', 'Em Tratamento'].includes(n.situacao),
  )
  openNCs.forEach((n) =>
    alerts.push({
      type: 'nao_conformidade_aberta',
      severity: n.gravidade === 'Alta' ? 'Alta' : 'Média',
      description: `Não conformidade em aberto: ${n.descricao}`,
      module: 'SST',
    }),
  )

  const mandatoryTrainings = (trainings as any[]).filter((t) => t.obrigatorio)
  const overdueTrainings = mandatoryTrainings.filter((t) => {
    if (['Concluído', 'Cancelado'].includes(t.situacao)) return false
    if (t.data && new Date(t.data) < now) return true
    return false
  })
  overdueTrainings.forEach((t) =>
    alerts.push({
      type: 'treinamento_obrigatorio_vencido',
      severity: 'Média',
      description: `Treinamento obrigatório vencido: ${t.name}`,
      module: 'RH',
    }),
  )

  const compliancePercentage =
    totalEmployees > 0 ? Math.max(0, Math.round(100 - (alerts.length / totalEmployees) * 100)) : 100

  return { alerts, totalEmployees, compliancePercentage }
}

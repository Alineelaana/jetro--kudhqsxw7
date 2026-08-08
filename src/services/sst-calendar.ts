import { sstGetList } from '@/services/sst'
import { getLTCAT, getCIPA, getEmergencies } from '@/services/sst-enterprise'

export interface CalendarObligation {
  id: string
  titulo: string
  categoria: string
  tipo: string
  nr_ref: string
  data_prevista: string
  responsavel: string
  situacao: string
  source: string
}

interface Src {
  col?: string
  fn?: () => Promise<any[]>
  cat: string
  nr: string
  t: string
  d: string
  tp: string
  r: string
  s: string
  prefix?: string
}

const SRCS: Src[] = [
  {
    col: 'sst_obligations',
    cat: 'Obrigação',
    nr: '',
    t: 'titulo',
    d: 'data_prevista',
    tp: 'tipo_obrigacao',
    r: 'responsavel',
    s: 'situacao',
  },
  {
    col: 'dp_occupational_exams',
    cat: 'Exames',
    nr: 'NR-07',
    t: 'employee_name',
    d: 'data_validade',
    tp: 'tipo_exame',
    r: 'employee_name',
    s: 'situacao',
    prefix: 'Exame — ',
  },
  {
    col: 'sst_pgr',
    cat: 'PGR',
    nr: 'NR-01',
    t: 'documento',
    d: 'data_validade',
    tp: '',
    r: 'responsavel',
    s: 'situacao',
  },
  {
    fn: () => getLTCAT(),
    cat: 'LTCAT',
    nr: 'NR-09',
    t: 'documento',
    d: 'data_validade',
    tp: '',
    r: 'responsavel',
    s: 'situacao',
  },
  {
    fn: () => getCIPA(),
    cat: 'CIPA',
    nr: 'NR-05',
    t: 'documento',
    d: 'data_validade',
    tp: '',
    r: 'responsavel',
    s: 'situacao',
  },
  {
    col: 'rh_trainings',
    cat: 'Treinamentos',
    nr: '',
    t: 'name',
    d: 'data',
    tp: 'categoria',
    r: 'instrutor',
    s: 'situacao',
  },
  {
    col: 'sst_inspections',
    cat: 'Inspeções',
    nr: '',
    t: 'titulo',
    d: 'data',
    tp: 'tipo',
    r: 'inspetor',
    s: 'situacao',
  },
  {
    col: 'sst_documents',
    cat: 'Documentos',
    nr: '',
    t: 'titulo',
    d: 'data_revisao',
    tp: 'categoria',
    r: 'responsavel',
    s: 'situacao',
  },
  {
    fn: () => getEmergencies(),
    cat: 'Simulados',
    nr: 'NR-23',
    t: 'titulo',
    d: 'data',
    tp: 'tipo',
    r: 'responsavel',
    s: 'situacao',
  },
]

const getField = (r: any, k: string) => (k && r && r[k]) || ''

export async function getConsolidatedObligations(): Promise<CalendarObligation[]> {
  const settled = await Promise.allSettled(
    SRCS.map(async (src) => {
      const raw = src.fn ? await src.fn() : await sstGetList(src.col!)
      const recs = Array.isArray(raw) ? raw : []
      return recs.map((r: any) => ({
        id: `${src.cat}-${r.id}`,
        titulo: (src.prefix || '') + (getField(r, src.t) || src.cat),
        categoria: src.cat,
        tipo: getField(r, src.tp) || src.cat,
        nr_ref: src.nr,
        data_prevista: getField(r, src.d) || '',
        responsavel: getField(r, src.r) || '',
        situacao: getField(r, src.s) || 'Pendente',
        source: src.col || src.cat,
      }))
    }),
  )
  const all: CalendarObligation[] = []
  for (const res of settled) {
    if (res.status === 'fulfilled') all.push(...res.value)
  }
  return all
}

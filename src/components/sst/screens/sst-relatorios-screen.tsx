import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SstLoading, SstTable, SstStatusBadge } from '@/components/sst/sst-shared'
import { ExportActions } from '@/components/shared/export-actions'
import { sstGetList } from '@/services/sst'
import { useRealtime } from '@/hooks/use-realtime'
import {
  FileText,
  Search,
  Filter,
  AlertTriangle,
  FileCheck2,
  HardHat,
  Stethoscope,
  Shield,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react'

interface ReportCategory {
  id: string
  label: string
  collection: string
  icon: typeof FileText
  fields: { key: string; label: string }[]
  statusField?: string
}

const REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: 'acidentes',
    label: 'Acidentes de Trabalho (CAT / Afastamentos)',
    collection: 'sst_accidents',
    icon: AlertTriangle,
    fields: [
      { key: 'employee_name', label: 'Colaborador' },
      { key: 'tipo_acidente', label: 'Tipo Acidente' },
      { key: 'data_acidente', label: 'Data' },
      { key: 'local_exato', label: 'Local' },
      { key: 'houve_afastamento', label: 'Afastamento' },
      { key: 'dias_afastamento', label: 'Dias Perdidos' },
    ],
    statusField: 'situacao',
  },
  {
    id: 'cat',
    label: 'Comunicações de Acidente de Trabalho (CAT)',
    collection: 'sst_cat',
    icon: FileCheck2,
    fields: [
      { key: 'employee_name', label: 'Colaborador' },
      { key: 'numero_cat', label: 'Nº Protocolo CAT' },
      { key: 'tipo_cat', label: 'Tipo' },
      { key: 'data_acidente', label: 'Data Acidente' },
      { key: 'atestado_cid', label: 'CID' },
      { key: 'crm_medico', label: 'Médico / CRM' },
    ],
    statusField: 'situacao',
  },
  {
    id: 'incidentes',
    label: 'Incidentes e Quase Acidentes (Near Miss)',
    collection: 'sst_incidents',
    icon: Activity,
    fields: [
      { key: 'titulo', label: 'Título' },
      { key: 'setor', label: 'Setor' },
      { key: 'relator_nome', label: 'Relatado Por' },
      { key: 'potencial_gravidade', label: 'Gravidade' },
      { key: 'data_ocorrencia', label: 'Data' },
    ],
    statusField: 'situacao',
  },
  {
    id: 'aso',
    label: 'Atestados de Saúde Ocupacional (ASO / NR-7)',
    collection: 'sst_aso',
    icon: Stethoscope,
    fields: [
      { key: 'employee_name', label: 'Colaborador' },
      { key: 'tipo_aso', label: 'Tipo ASO' },
      { key: 'data_emissao', label: 'Emissão' },
      { key: 'data_validade', label: 'Validade' },
      { key: 'medico_crm', label: 'Médico CRM' },
    ],
    statusField: 'situacao',
  },
  {
    id: 'exames',
    label: 'Exames Médicos Ocupacionais Complementares',
    collection: 'sst_exams',
    icon: Stethoscope,
    fields: [
      { key: 'employee_name', label: 'Colaborador' },
      { key: 'tipo_exame', label: 'Tipo Exame' },
      { key: 'data_realizacao', label: 'Realização' },
      { key: 'data_vencimento', label: 'Vencimento' },
      { key: 'laboratorio', label: 'Laboratório' },
    ],
    statusField: 'situacao',
  },
  {
    id: 'epis',
    label: 'EPIs e Uniformes (NR-6)',
    collection: 'sst_epis',
    icon: HardHat,
    fields: [
      { key: 'nome_epi', label: 'EPI / Uniforme' },
      { key: 'ca_numero', label: 'Certificado CA' },
      { key: 'tipo_protecao', label: 'Proteção' },
      { key: 'fabricante', label: 'Fabricante' },
      { key: 'validade_ca', label: 'Validade CA' },
    ],
    statusField: 'situacao',
  },
  {
    id: 'treinamentos',
    label: 'Certificados e Treinamentos Obrigatórios',
    collection: 'sst_certificates',
    icon: Shield,
    fields: [
      { key: 'employee_name', label: 'Colaborador' },
      { key: 'curso_nome', label: 'Norma / Curso' },
      { key: 'data_emissao', label: 'Conclusão' },
      { key: 'data_validade', label: 'Reciclagem' },
      { key: 'entidade_formadora', label: 'Entidade Instrutora' },
    ],
    statusField: 'situacao',
  },
  {
    id: 'inspecoes',
    label: 'Inspeções e Auditorias Periódicas',
    collection: 'sst_inspections',
    icon: Layers,
    fields: [
      { key: 'setor_inspecionado', label: 'Setor Inspecionado' },
      { key: 'inspetor_nome', label: 'Inspetor' },
      { key: 'tipo_inspecao', label: 'Tipo' },
      { key: 'data_inspecao', label: 'Data' },
      { key: 'itens_conformes', label: 'Conformes' },
      { key: 'itens_nao_conformes', label: 'Não Conformes' },
    ],
    statusField: 'situacao',
  },
  {
    id: 'nao_conformidades',
    label: 'Não Conformidades e Desvios de Segurança',
    collection: 'sst_non_conformities',
    icon: AlertTriangle,
    fields: [
      { key: 'origem', label: 'Origem' },
      { key: 'setor', label: 'Setor' },
      { key: 'descricao_desvio', label: 'Desvio' },
      { key: 'responsavel_correcao', label: 'Responsável' },
      { key: 'prazo_resolucao', label: 'Prazo' },
    ],
    statusField: 'situacao',
  },
  {
    id: 'esocial_eventos',
    label: 'Eventos Transmitidos eSocial SST (S-2210 / S-2220 / S-2240)',
    collection: 'sst_esocial_sst_events',
    icon: FileText,
    fields: [
      { key: 'tipo_evento', label: 'Evento' },
      { key: 'employee_name', label: 'Colaborador' },
      { key: 'competencia', label: 'Competência' },
      { key: 'protocolo', label: 'Protocolo' },
      { key: 'recibo', label: 'Recibo' },
      { key: 'status_retorno', label: 'Retorno eSocial' },
    ],
    statusField: 'situacao',
  },
]

export function SstRelatoriosScreen() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('acidentes')
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const currentCategory = useMemo(
    () => REPORT_CATEGORIES.find((c) => c.id === selectedCategoryId) || REPORT_CATEGORIES[0],
    [selectedCategoryId],
  )

  const load = async () => {
    setLoading(true)
    try {
      const data = await sstGetList(currentCategory.collection)
      setRecords(data || [])
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSearch('')
    setStatusFilter('ALL')
    load()
  }, [currentCategory.collection])

  useRealtime(currentCategory.collection, () => load())

  const availableStatuses = useMemo(() => {
    const field = currentCategory.statusField || 'situacao'
    const set = new Set<string>()
    records.forEach((r) => {
      const val = r[field]
      if (val) set.add(String(val))
    })
    return Array.from(set)
  }, [records, currentCategory])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const field = currentCategory.statusField || 'situacao'

    return records.filter((r) => {
      if (statusFilter !== 'ALL' && String(r[field] || '') !== statusFilter) {
        return false
      }
      if (!q) return true
      return Object.values(r).some((val) =>
        String(val || '')
          .toLowerCase()
          .includes(q),
      )
    })
  }, [records, search, statusFilter, currentCategory])

  const exportHeaders = useMemo(() => {
    const headers = currentCategory.fields.map((f) => f.label)
    if (currentCategory.statusField) headers.push('Situação')
    return headers
  }, [currentCategory])

  const exportData = useMemo(() => {
    const sField = currentCategory.statusField || 'situacao'
    return filtered.map((r) => [
      ...currentCategory.fields.map((f) => r[f.key] ?? '—'),
      ...(currentCategory.statusField ? [r[sField] ?? '—'] : []),
    ])
  }, [filtered, currentCategory])

  const IconComp = currentCategory.icon

  return (
    <div className="space-y-4">
      {/* Cabeçalho com Seleção de Relatório e Exportação */}
      <Card className="border-2 border-[#005B2E]/20 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#005B2E]/10 flex items-center justify-center shrink-0">
                <IconComp className="w-5 h-5 text-[#005B2E]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Central de Relatórios SST</h3>
                <p className="text-xs text-muted-foreground">
                  Emissão analítica consolidada com filtros avançados e exportação em PDF e Excel
                </p>
              </div>
            </div>

            <ExportActions
              title={`Relatório SST — ${currentCategory.label}`}
              subtitle={`Total de registros: ${filtered.length} | Emitido em ${new Date().toLocaleDateString('pt-BR')}`}
              headers={exportHeaders}
              data={exportData}
              filenamePrefix={`relatorio_sst_${currentCategory.id}`}
            />
          </div>

          {/* Seletores de Relatório e Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border/60">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3 text-[#005B2E]" /> Tipo de Relatório
              </label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="h-9 text-xs focus:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#005B2E]" /> Situação / Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs focus:ring-[#005B2E]">
                  <SelectValue placeholder="Todas as situações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">
                    Todas as situações ({records.length})
                  </SelectItem>
                  {availableStatuses.map((st) => (
                    <SelectItem key={st} value={st} className="text-xs">
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Search className="w-3 h-3 text-[#005B2E]" /> Busca Rápida
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar por colaborador, código, norma, local..."
                  className="h-9 pl-9 text-xs focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Numérico Rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border border-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total no Banco</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{records.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Filtrados na Tela</p>
            <p className="text-xl font-bold text-[#005B2E] mt-0.5">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Situações Distintas</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{availableStatuses.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Formato de Saída</p>
            <p className="text-xs font-bold text-emerald-700 mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> PDF A4 + XLSX
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Listagem */}
      {loading ? (
        <SstLoading />
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed py-14 text-center">
          <CardContent>
            <IconComp className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
            <p className="font-bold text-base text-foreground">
              Nenhum registro encontrado para este relatório
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Tente alterar os filtros de busca ou selecione outro tipo de relatório na barra acima.
            </p>
          </CardContent>
        </Card>
      ) : (
        <SstTable
          headers={[
            ...currentCategory.fields.map((f) => f.label),
            ...(currentCategory.statusField ? ['Situação'] : []),
          ]}
        >
          {filtered.map((row) => (
            <tr key={row.id} className="border-b border-border hover:bg-[#005B2E]/5">
              {currentCategory.fields.map((f) => (
                <td key={f.key} className="px-3 py-3 text-xs">
                  {row[f.key] !== undefined && row[f.key] !== null && row[f.key] !== ''
                    ? String(row[f.key])
                    : '—'}
                </td>
              ))}
              {currentCategory.statusField && (
                <td className="px-3 py-3">
                  <SstStatusBadge status={row[currentCategory.statusField || 'situacao']} />
                </td>
              )}
            </tr>
          ))}
        </SstTable>
      )}
    </div>
  )
}

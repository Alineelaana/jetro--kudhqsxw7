import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type PartnerRecord } from '@/components/partner-shared'
import { RESTRICTION_ALERT_TEXT } from '@/lib/partner-constants'
import { formatCpf, formatCnpj } from '@/lib/partner-utils'
import { Pencil, AlertTriangle } from 'lucide-react'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'

interface Props {
  partners: PartnerRecord[]
  onEdit: (partner: PartnerRecord) => void
  screenId?: string
}

export function PartnerListTable({
  partners,
  onEdit,
  screenId = 'cadastros.clientes.parceiros',
}: Props) {
  const columns: JetroColumnDef<PartnerRecord>[] = [
    {
      id: 'code',
      header: 'Código',
      dataType: 'text',
      defaultWidth: 100,
      getSortValue: (row) => row.code || row.id.slice(0, 8),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.code || row.id.slice(0, 8)}</span>
      ),
    },
    {
      id: 'name',
      header: 'Razão Social / Nome',
      dataType: 'text',
      defaultWidth: 240,
      getSortValue: (row) => (row.person_type === 'PF' ? row.full_name : row.company_name) || '',
      cell: ({ row }) => {
        const isPF = row.person_type === 'PF'
        const name = isPF ? row.full_name : row.company_name
        return (
          <div>
            <div className="font-semibold text-foreground truncate">{name || '—'}</div>
            {row.trade_name && (
              <div className="text-xs text-muted-foreground truncate">{row.trade_name}</div>
            )}
          </div>
        )
      },
    },
    {
      id: 'person_type',
      header: 'Tipo',
      accessorKey: 'person_type',
      dataType: 'text',
      defaultWidth: 80,
      align: 'center',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px]">
          {row.person_type || 'PJ'}
        </Badge>
      ),
    },
    {
      id: 'document',
      header: 'CPF / CNPJ',
      dataType: 'text',
      defaultWidth: 160,
      getSortValue: (row) => (row.person_type === 'PF' ? row.cpf || '' : row.cnpj || ''),
      cell: ({ row }) => {
        const isPF = row.person_type === 'PF'
        const doc = isPF ? formatCpf(row.cpf || '') : formatCnpj(row.cnpj || '')
        return <span className="font-mono text-xs">{doc || '—'}</span>
      },
    },
    {
      id: 'city_uf',
      header: 'Cidade / UF',
      dataType: 'text',
      defaultWidth: 150,
      getSortValue: (row) =>
        row.address_city && row.address_state
          ? `${row.address_city}/${row.address_state}`
          : row.address_city || row.address_state || '',
      cell: ({ row }) => (
        <span className="text-xs">
          {row.address_city && row.address_state
            ? `${row.address_city}/${row.address_state}`
            : row.address_city || row.address_state || '—'}
        </span>
      ),
    },
    {
      id: 'active',
      header: 'Status',
      accessorKey: 'active',
      dataType: 'boolean',
      defaultWidth: 100,
      cell: ({ row }) => (
        <Badge
          variant={row.active ? 'default' : 'secondary'}
          className={
            row.active
              ? 'bg-[#005B2E] hover:bg-[#004222] text-white text-[10px]'
              : 'bg-muted text-muted-foreground text-[10px]'
          }
        >
          {row.active ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      id: 'restriction',
      header: 'Restrição',
      dataType: 'boolean',
      defaultWidth: 120,
      getSortValue: (row) => Boolean(row.financial_restriction),
      cell: ({ row }) => {
        const isRestricted = row.financial_restriction === true
        return isRestricted ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3" /> Restrito
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Normal</span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      align: 'right',
      sortable: false,
      hideable: false,
      resizable: false,
      draggable: false,
      defaultWidth: 100,
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-[#005B2E]/30 text-[#005B2E] hover:bg-[#005B2E]/10"
          onClick={() => onEdit(row)}
        >
          <Pencil className="w-3 h-3 mr-1" /> Editar
        </Button>
      ),
    },
  ]

  return (
    <JetroTable
      screenId={screenId}
      columns={columns}
      data={partners}
      emptyMessage="Nenhum parceiro encontrado."
      exportTitle="Cadastro de Clientes e Parceiros — Jetro ERP"
      exportFilename="clientes-parceiros-jetro.xlsx"
    />
  )
}

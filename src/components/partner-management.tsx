import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { getPartners } from '@/services/partners'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { PartnerListTable } from '@/components/partner-list-table'
import { PartnerFormDialog } from '@/components/partner-form-dialog'
import { PartnerTypeManager } from '@/components/partner-type-manager'
import { type PartnerRecord } from '@/components/partner-shared'
import { UserPlus, Search, Loader2 } from 'lucide-react'

export function PartnerManagement() {
  const { userRole } = useAuth()
  const [partners, setPartners] = useState<PartnerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [personFilter, setPersonFilter] = useState('all')
  const [editingPartner, setEditingPartner] = useState<PartnerRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadPartners = async () => {
    try {
      const data = await getPartners()
      setPartners(data as unknown as PartnerRecord[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPartners()
  }, [])
  useRealtime('partners', () => loadPartners())

  const filtered = useMemo(() => {
    return partners.filter((p) => {
      const term = search.toLowerCase().trim()
      const matchesSearch =
        !term ||
        (p.full_name || '').toLowerCase().includes(term) ||
        (p.company_name || '').toLowerCase().includes(term) ||
        (p.cpf || '').toLowerCase().includes(term) ||
        (p.cnpj || '').toLowerCase().includes(term) ||
        (p.email || '').toLowerCase().includes(term)
      const matchesType = typeFilter === 'all' || p.partner_type === typeFilter
      const matchesPerson = personFilter === 'all' || p.person_type === personFilter
      return matchesSearch && matchesType && matchesPerson
    })
  }, [partners, search, typeFilter, personFilter])

  const handleNew = () => {
    setEditingPartner(null)
    setDialogOpen(true)
  }
  const handleEdit = (p: PartnerRecord) => {
    setEditingPartner(p)
    setDialogOpen(true)
  }

  const partnerTypeOptions = useMemo(() => {
    const types = new Set(partners.map((p) => p.partner_type).filter(Boolean))
    return Array.from(types)
  }, [partners])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-black text-foreground">Gestão de Parceiros</h2>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Novo Parceiro
        </Button>
      </div>

      <PartnerTypeManager onTypesChange={loadPartners} />

      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, CPF, CNPJ, e-mail..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="all">Todos os tipos</option>
              {partnerTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              className="border border-border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="all">PF e PJ</option>
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>
          </div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} parceiro(s) encontrado(s)
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : (
        <PartnerListTable partners={filtered} onEdit={handleEdit} />
      )}

      <PartnerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        partner={editingPartner}
        onSuccess={loadPartners}
      />
    </div>
  )
}

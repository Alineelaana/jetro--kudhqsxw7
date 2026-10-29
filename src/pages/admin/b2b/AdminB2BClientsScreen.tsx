import React, { useEffect, useState } from 'react'
import { pb } from '@/lib/pocketbase/client'
import { b2bService } from '@/lib/b2b/b2b-service'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Search,
  Users,
  ShieldCheck,
  CreditCard,
  Building,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'

interface B2BAdminClient {
  id: string
  partner_id: string
  company_name: string
  trade_name: string
  cnpj: string
  email: string
  phone: string
  active: boolean
  b2b_ativo: boolean
  b2b_status: string
  exibir_limite_credito: boolean
  limite_credito?: string
  limite_credito_disponivel?: string
  created: string
}

export const AdminB2BClientsScreen: React.FC = () => {
  const { toast } = useToast()
  const [clients, setClients] = useState<B2BAdminClient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      // Buscar parceiros cadastrados como Cliente no ERP
      const records = await pb.collection('partners').getFullList({
        filter: 'partner_type = "Cliente"',
        sort: '-created',
      })

      const mapped: B2BAdminClient[] = records.map((r) => ({
        id: r.id,
        partner_id: r.id,
        company_name: r.company_name || r.name || 'Sem Razão Social',
        trade_name: r.trade_name || r.company_name || '',
        cnpj: r.cnpj || '',
        email: r.email || '',
        phone: r.phone || '',
        active: r.active !== false,
        b2b_ativo: r.b2b_ativo === true,
        b2b_status: r.b2b_status || (r.b2b_ativo ? 'ativo' : 'inativo'),
        exibir_limite_credito: r.exibir_limite_credito === true,
        limite_credito: r.limite_credito,
        limite_credito_disponivel: r.limite_credito_disponivel,
        created: r.created,
      }))

      setClients(mapped)
    } catch (err) {
      console.error('Erro ao carregar clientes B2B:', err)
      toast({
        title: 'Erro ao carregar clientes',
        description: 'Não foi possível listar os clientes do portal B2B.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // DECISÃO 3: Alternar flag exibir_limite_credito
  const handleToggleCreditFlag = async (partnerId: string, currentVal: boolean) => {
    const nextVal = !currentVal
    const token = pb.authStore.token
    if (!token) {
      toast({
        title: 'Operação não autorizada',
        description: 'Faça login no painel para executar esta ação.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUpdatingId(partnerId)
      await b2bService.adminToggleCreditFlag(partnerId, nextVal, token)

      setClients((prev) =>
        prev.map((c) =>
          c.partner_id === partnerId ? { ...c, exibir_limite_credito: nextVal } : c,
        ),
      )

      toast({
        title: nextVal ? 'Limite de Crédito Visível' : 'Limite de Crédito Ocultado',
        description: `O limite de crédito ${nextVal ? 'agora é visível' : 'foi ocultado'} no portal para este cliente.`,
      })
    } catch (err: unknown) {
      console.error(err)
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar flag.'
      toast({
        title: 'Erro ao alterar flag',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  // Ativar ou desativar acesso B2B
  const handleToggleB2BAccess = async (partnerId: string, currentActive: boolean) => {
    const nextActive = !currentActive
    const token = pb.authStore.token
    if (!token) return

    try {
      setUpdatingId(partnerId)
      await b2bService.adminToggleClientStatus({ partnerId, active: nextActive }, token)

      setClients((prev) =>
        prev.map((c) =>
          c.partner_id === partnerId
            ? { ...c, b2b_ativo: nextActive, b2b_status: nextActive ? 'ativo' : 'bloqueado' }
            : c,
        ),
      )

      toast({
        title: nextActive ? 'Acesso B2B Ativado' : 'Acesso B2B Bloqueado',
        description: `O cliente ${nextActive ? 'pode' : 'não pode mais'} efetuar pedidos pelo Portal B2B.`,
      })
    } catch (err: unknown) {
      console.error(err)
      const msg = err instanceof Error ? err.message : 'Falha ao alterar status de acesso.'
      toast({
        title: 'Erro',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredClients = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.company_name.toLowerCase().includes(q) ||
      c.trade_name.toLowerCase().includes(q) ||
      c.cnpj.includes(q) ||
      c.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Portal B2B • Gestão de Clientes e Acessos
          </h1>
          <p className="text-sm text-slate-500">
            Controle de ativação de clientes no portal e governança de exibição do limite de crédito
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <a href="/portal/login" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-indigo-600 border-indigo-200"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Portal do Cliente
            </Button>
          </a>
        </div>
      </div>

      {/* Regra de Governança de Crédito em Destaque */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs sm:text-sm text-indigo-900 flex items-start gap-3">
        <CreditCard className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-indigo-950">
            Política de Exibição de Limite de Crédito (Decisão 3)
          </p>
          <p className="text-indigo-800 text-xs mt-1">
            Por padrão, nenhum cliente visualiza o limite de crédito no portal (default desligado).
            Ative a chave &quot;Exibir Limite&quot; apenas quando o limite do parceiro estiver
            revisado e atualizado pela controladoria/financeiro.
          </p>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold text-slate-800">
            Clientes Cadastrados ({clients.length})
          </CardTitle>
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Buscar por CNPJ, Razão ou E-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa / Razão Social</TableHead>
                  <TableHead>CNPJ / Contato</TableHead>
                  <TableHead className="text-center">Acesso B2B</TableHead>
                  <TableHead className="text-center">Exibir Limite de Crédito</TableHead>
                  <TableHead className="text-right">Limite Cadastrado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                      Carregando clientes...
                    </TableCell>
                  </TableRow>
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => {
                    const isUpdating = updatingId === client.partner_id
                    return (
                      <TableRow key={client.id} className="hover:bg-slate-50/70">
                        <TableCell>
                          <div className="font-semibold text-slate-900 text-sm">
                            {client.company_name}
                          </div>
                          {client.trade_name && client.trade_name !== client.company_name && (
                            <div className="text-xs text-slate-500">{client.trade_name}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs text-slate-800 font-medium">
                            {client.cnpj || 'Sem CNPJ'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {client.email || client.phone}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={client.b2b_ativo}
                              disabled={isUpdating}
                              onCheckedChange={() =>
                                handleToggleB2BAccess(client.partner_id, client.b2b_ativo)
                              }
                            />
                            <Badge
                              variant="outline"
                              className={
                                client.b2b_ativo
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600'
                              }
                            >
                              {client.b2b_ativo ? 'Liberado' : 'Suspenso'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={client.exibir_limite_credito}
                                disabled={isUpdating}
                                onCheckedChange={() =>
                                  handleToggleCreditFlag(
                                    client.partner_id,
                                    client.exibir_limite_credito,
                                  )
                                }
                              />
                              <span
                                className={`text-xs font-semibold ${
                                  client.exibir_limite_credito
                                    ? 'text-emerald-700'
                                    : 'text-slate-400'
                                }`}
                              >
                                {client.exibir_limite_credito ? 'Sim (Visível)' : 'Não (Oculto)'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {client.exibir_limite_credito
                                ? 'Cliente vê saldo no portal'
                                : 'Padrão do sistema'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-xs font-bold text-slate-800 block">
                            {client.limite_credito ? `R$ ${client.limite_credito}` : 'R$ 0,00'}
                          </span>
                          {client.limite_credito_disponivel && (
                            <span className="text-[10px] text-emerald-600 block">
                              Disp: R$ {client.limite_credito_disponivel}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Shield,
  ShieldCheck,
  Search,
  Plus,
  Pencil,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  FolderTree,
  SlidersHorizontal,
  Info,
  CheckSquare,
  Square,
  RefreshCw,
  TableProperties,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  getAllSystemMenus,
  getAllSystemScreens,
  getPerfisPermissoes,
  savePerfilPermissao,
  deletePerfilPermissao,
  loadProfilesCache,
  checkProfileScreenAccess,
  type PerfilPermissaoRecord,
  type ProfilePermissionsData,
  type ScreenPermission,
  type SystemMenuItem,
  type SystemScreenItem,
} from '@/lib/profile-permissions'
import { useAuth } from '@/hooks/use-auth'

const DEFAULT_PERM: ScreenPermission = { v: true, c: false, e: false, d: false }

export function PerfisPermissoesUnifiedScreen() {
  const { userRole, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'gestao' | 'matriz' | 'gaps'>('gestao')
  const [profiles, setProfiles] = useState<PerfilPermissaoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')

  // Estados dos filtros da Matriz Comparativa (lendo do banco real)
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('')
  const [matrixModuleFilter, setMatrixModuleFilter] = useState('TODOS')

  // Estados dos filtros do Relatório de Gaps (lendo do banco real)
  const [gapProfileFilter, setGapProfileFilter] = useState('TODOS')
  const [gapModuleFilter, setGapModuleFilter] = useState('TODOS')
  const [gapSeverityFilter, setGapSeverityFilter] = useState<'TODOS' | 'alta' | 'media' | 'baixa'>(
    'TODOS',
  )

  // Modal de criação / edição de perfil
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)

  // Menus selecionados para acesso do perfil
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set())

  // Permissões por tela pontual específica { [route]: { v, c, e, d } }
  const [screenPermissions, setScreenPermissions] = useState<Record<string, ScreenPermission>>({})

  // Busca global de telas
  const [screenSearchQuery, setScreenSearchQuery] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('TODOS')

  // Dados do sistema derivados
  const systemMenus = useMemo(() => getAllSystemMenus(), [])
  const systemScreens = useMemo(() => getAllSystemScreens(), [])

  // Lista de categorias/módulos para filtro rápido
  const screenCategories = useMemo(() => {
    const cats = Array.from(new Set(systemScreens.map((s) => s.group))).sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    )
    return ['TODOS', ...cats]
  }, [systemScreens])

  // Carregar perfis do banco
  const loadProfiles = async () => {
    setLoading(true)
    try {
      const list = await getPerfisPermissoes()
      setProfiles(list)
      await loadProfilesCache(true)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao carregar perfis',
        description: 'Não foi possível carregar os perfis de permissão do banco de dados.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  // Iniciar criação de novo perfil
  const handleOpenCreate = () => {
    setEditingProfileId(null)
    setName('')
    setCode('')
    setDescription('')
    setActive(true)
    setSelectedMenus(new Set())
    setScreenPermissions({})
    setScreenSearchQuery('')
    setSelectedCategoryFilter('TODOS')
    setDialogOpen(true)
  }

  // Iniciar edição de perfil existente
  const handleOpenEdit = (p: PerfilPermissaoRecord) => {
    setEditingProfileId(p.id)
    setName(p.name || '')
    setCode(p.code || '')
    setDescription(p.description || '')
    setActive(p.active !== false)

    const rawPerms = (p.permissions || {}) as ProfilePermissionsData

    // Se for SUP, por regra ele tem acesso irrestrito a todos os menus e telas com V/C/E/D
    const isSup = p.code?.toUpperCase() === 'SUP'

    if (isSup) {
      // Pré-marcar todos os menus
      const allM = new Set(systemMenus.allItems.map((m) => m.route))
      setSelectedMenus(allM)
      // Pré-marcar todas as telas com V/C/E/D
      const allScreensPerm: Record<string, ScreenPermission> = {}
      systemScreens.forEach((s) => {
        allScreensPerm[s.route] = { v: true, c: true, e: true, d: true }
      })
      setScreenPermissions(allScreensPerm)
    } else {
      const allowed = new Set<string>(rawPerms.allowedMenus || [])
      setSelectedMenus(allowed)
      setScreenPermissions(rawPerms.screens || {})
    }

    setScreenSearchQuery('')
    setSelectedCategoryFilter('TODOS')
    setDialogOpen(true)
  }

  // Toggle de seleção de menu individual
  const toggleMenu = (route: string) => {
    if (code.toUpperCase() === 'SUP') return // SUP sempre tem todos os acessos
    setSelectedMenus((prev) => {
      const next = new Set(prev)
      if (next.has(route)) {
        next.delete(route)
      } else {
        next.add(route)
      }
      return next
    })
  }

  // Marcar todos os menus de um grupo
  const toggleMenuGroup = (groupItems: SystemMenuItem[]) => {
    if (code.toUpperCase() === 'SUP') return
    const allRoutes = groupItems.map((i) => i.route)
    const allSelected = allRoutes.every((r) => selectedMenus.has(r))

    setSelectedMenus((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        allRoutes.forEach((r) => next.delete(r))
      } else {
        allRoutes.forEach((r) => next.add(r))
      }
      return next
    })
  }

  // Marcar todos os menus do sistema
  const handleSelectAllMenus = () => {
    if (code.toUpperCase() === 'SUP') return
    const all = new Set(systemMenus.allItems.map((m) => m.route))
    setSelectedMenus(all)
  }

  // Desmarcar todos os menus do sistema
  const handleDeselectAllMenus = () => {
    if (code.toUpperCase() === 'SUP') return
    setSelectedMenus(new Set())
  }

  // Adicionar ou alternar operação de tela pontual (V, C, E, D)
  const toggleScreenOp = (route: string, op: 'v' | 'c' | 'e' | 'd') => {
    if (code.toUpperCase() === 'SUP') return
    setScreenPermissions((prev) => {
      const current = prev[route] || { ...DEFAULT_PERM }
      const updated = {
        ...current,
        [op]: !current[op],
      }
      return {
        ...prev,
        [route]: updated,
      }
    })
  }

  // Atribuir acesso total (V, C, E, D) para uma tela específica
  const setScreenAllOps = (route: string, grantAll: boolean) => {
    if (code.toUpperCase() === 'SUP') return
    setScreenPermissions((prev) => {
      const next = { ...prev }
      if (grantAll) {
        next[route] = { v: true, c: true, e: true, d: true }
      } else {
        delete next[route]
      }
      return next
    })
  }

  // Salvar perfil
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome do perfil de permissão.',
        variant: 'destructive',
      })
      return
    }
    if (!code.trim()) {
      toast({
        title: 'Código obrigatório',
        description: 'Informe o código do perfil (ex.: GESTAO, ANALISTA, SUP).',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    const upperCode = code.trim().toUpperCase()
    const isSup = upperCode === 'SUP'

    const permissionsPayload: ProfilePermissionsData = isSup
      ? {
          // SUP sempre total
          all_access: true,
          allowedMenus: systemMenus.allItems.map((m) => m.route),
          screens: systemScreens.reduce<Record<string, ScreenPermission>>((acc, s) => {
            acc[s.route] = { v: true, c: true, e: true, d: true }
            return acc
          }, {}),
        }
      : {
          allowedMenus: Array.from(selectedMenus),
          screens: screenPermissions,
        }

    try {
      await savePerfilPermissao(editingProfileId, {
        name: name.trim(),
        code: upperCode,
        description: description.trim(),
        active,
        permissions: permissionsPayload,
      })

      toast({
        title: editingProfileId ? 'Perfil atualizado' : 'Perfil criado',
        description: `O perfil "${name}" e suas permissões foram salvos com sucesso no banco.`,
      })
      setDialogOpen(false)
      await loadProfiles()
    } catch (err: unknown) {
      console.error(err)
      const errorMsg =
        err instanceof Error ? err.message : 'Não foi possível salvar o perfil no banco.'
      toast({
        title: 'Erro ao salvar perfil',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Exclusão de perfil
  const handleDelete = async (p: PerfilPermissaoRecord) => {
    if (p.code.toUpperCase() === 'SUP') {
      toast({
        title: 'Ação não permitida',
        description: 'O perfil SUP é o administrador máster do sistema e não pode ser excluído.',
        variant: 'destructive',
      })
      return
    }

    if (!confirm(`Tem certeza que deseja excluir o perfil "${p.name}" (${p.code})?`)) {
      return
    }

    try {
      await deletePerfilPermissao(p.id, p.code)
      toast({
        title: 'Perfil excluído',
        description: `Perfil "${p.name}" removido com sucesso.`,
      })
      await loadProfiles()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao excluir perfil.'
      toast({
        title: 'Erro ao excluir',
        description: errorMsg,
        variant: 'destructive',
      })
    }
  }

  // Filtragem dos perfis cadastrados na tabela
  const filteredProfiles = useMemo(() => {
    const q = filterQuery.toLowerCase().trim()
    if (!q) return profiles
    return profiles.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    )
  }, [profiles, filterQuery])

  // Filtragem na área de busca de telas específicas
  const filteredScreens = useMemo(() => {
    const q = screenSearchQuery.toLowerCase().trim()
    return systemScreens.filter((s) => {
      const matchesCategory =
        selectedCategoryFilter === 'TODOS' || s.group === selectedCategoryFilter
      const matchesQuery =
        !q ||
        s.label.toLowerCase().includes(q) ||
        s.route.toLowerCase().includes(q) ||
        (s.parentLabel && s.parentLabel.toLowerCase().includes(q))
      return matchesCategory && matchesQuery
    })
  }, [systemScreens, screenSearchQuery, selectedCategoryFilter])

  // Filtragem das telas para a Matriz Comparativa (calculada em tempo real com base no banco)
  const filteredMatrixScreens = useMemo(() => {
    const q = matrixSearchQuery.toLowerCase().trim()
    return systemScreens.filter((s) => {
      const matchesMod = matrixModuleFilter === 'TODOS' || s.group === matrixModuleFilter
      const matchesQ =
        !q ||
        s.label.toLowerCase().includes(q) ||
        s.route.toLowerCase().includes(q) ||
        (s.parentLabel && s.parentLabel.toLowerCase().includes(q))
      return matchesMod && matchesQ
    })
  }, [systemScreens, matrixSearchQuery, matrixModuleFilter])

  // Gaps calculados dinamicamente a partir dos perfis e dados reais gravados no banco
  const calculatedGaps = useMemo(() => {
    // Para cada perfil ativo (exceto SUP, que tem 100%), analisar discrepâncias operacionais
    const gaps: Array<{
      id: string
      profileCode: string
      profileName: string
      module: string
      screenTitle: string
      route: string
      severity: 'alta' | 'media' | 'baixa'
      issue: string
      recommendation: string
    }> = []

    profiles.forEach((p) => {
      const pCode = (p.code || '').toUpperCase()
      if (pCode === 'SUP') return // SUP é irrestrito por especificação Huram

      systemScreens.forEach((s) => {
        const canV = checkProfileScreenAccess(pCode, s.route, 'v', profiles)
        const canC = checkProfileScreenAccess(pCode, s.route, 'c', profiles)
        const canE = checkProfileScreenAccess(pCode, s.route, 'e', profiles)
        const canD = checkProfileScreenAccess(pCode, s.route, 'd', profiles)

        // Cenário 1: Pode excluir ou editar mas NÃO pode visualizar a tela
        if (!canV && (canD || canE || canC)) {
          gaps.push({
            id: `${pCode}-${s.route}-inconsistent-ops`,
            profileCode: pCode,
            profileName: p.name || pCode,
            module: s.group,
            screenTitle: s.label,
            route: s.route,
            severity: 'alta',
            issue:
              'Inconsistência operacional: perfil possui direito de criar/editar/excluir sem ter visualização permitida da tela.',
            recommendation:
              'Conceda o acesso de Visualização (V) ou revogue as permissões pontuais de escrita.',
          })
        }

        // Cenário 2: Perfil tático tem acesso a módulos sensíveis (Configurações, Auditoria, Segurança)
        const isSensitiveRoute =
          s.route.startsWith('/admin/configuracoes') ||
          s.route.startsWith('/admin/auditoria') ||
          s.route.startsWith('/admin/usuarios') ||
          s.route.includes('/seguranca') ||
          s.route.includes('/parametros')

        if (isSensitiveRoute && (canD || canE)) {
          if (pCode !== 'GESTAO' && pCode !== 'PADRAO') {
            gaps.push({
              id: `${pCode}-${s.route}-sensitive-access`,
              profileCode: pCode,
              profileName: p.name || pCode,
              module: s.group,
              screenTitle: s.label,
              route: s.route,
              severity: canD ? 'alta' : 'media',
              issue: `Permissão sensível em módulo crítico: perfil possui autorização de ${canD ? 'Exclusão (D)' : 'Edição (E)'} em área administrativa restrita.`,
              recommendation:
                'Reavaliar necessidade de privilégios administrativos neste perfil operacional.',
            })
          }
        }

        // Cenário 3: Exclusão liberada em cadastros-chave ou financeiro para perfil não-gestor
        const isCriticalFinancial =
          s.route.startsWith('/admin/financeiro') ||
          s.route.startsWith('/admin/contabil') ||
          s.route.startsWith('/admin/fiscal')

        if (
          isCriticalFinancial &&
          canD &&
          pCode !== 'FINANCEIRO' &&
          pCode !== 'GESTAO' &&
          pCode !== 'PADRAO'
        ) {
          gaps.push({
            id: `${pCode}-${s.route}-fin-delete`,
            profileCode: pCode,
            profileName: p.name || pCode,
            module: s.group,
            screenTitle: s.label,
            route: s.route,
            severity: 'alta',
            issue:
              'Risco de compliance: perfil não-financeiro possui permissão de Exclusão (D) no módulo Financeiro/Fiscal.',
            recommendation:
              'Restringir a permissão de exclusão exclusivamente para perfis financeiros/gestores autorizados.',
          })
        }
      })
    })

    return gaps
  }, [profiles, systemScreens])

  // Filtragem dos gaps
  const filteredGaps = useMemo(() => {
    return calculatedGaps.filter((g) => {
      const matchProf = gapProfileFilter === 'TODOS' || g.profileCode === gapProfileFilter
      const matchMod = gapModuleFilter === 'TODOS' || g.module === gapModuleFilter
      const matchSev = gapSeverityFilter === 'TODOS' || g.severity === gapSeverityFilter
      return matchProf && matchMod && matchSev
    })
  }, [calculatedGaps, gapProfileFilter, gapModuleFilter, gapSeverityFilter])

  const isSupEditing = code.trim().toUpperCase() === 'SUP'

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="border-2 border-[#063D30]/20 shadow-xs">
        <CardHeader className="bg-gradient-to-r from-[#063D30] to-[#0A5241] text-white rounded-t-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-white/10 text-[#C69B45] border border-[#C69B45]/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight text-white">
                  Perfis e Permissões do Sistema
                </CardTitle>
                <p className="text-xs text-white/80 mt-0.5">
                  Gestão integrada de perfis, acesso a menus e autorizações pontuais por tela (V, C,
                  E, D)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadProfiles}
                disabled={loading}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <RefreshCw className={cn('w-4 h-4 mr-1.5', loading && 'animate-spin')} /> Atualizar
              </Button>
              <Button
                onClick={handleOpenCreate}
                className="bg-[#C69B45] hover:bg-[#B38A3A] text-[#063D30] font-bold shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Criar Novo Perfil
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Barra de Abas Internas da Tela Consolidada */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-border bg-[#F8FAF9] dark:bg-muted/20">
          <button
            type="button"
            onClick={() => setActiveTab('gestao')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer',
              activeTab === 'gestao'
                ? 'border-[#063D30] text-[#063D30] dark:text-emerald-400 dark:border-emerald-400 bg-white dark:bg-card rounded-t-md shadow-xs'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Gestão de Perfis & Edição</span>
            <Badge
              variant="secondary"
              className="text-[10px] h-4 px-1 bg-[#063D30]/10 text-[#063D30]"
            >
              {profiles.length}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matriz')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer',
              activeTab === 'matriz'
                ? 'border-[#063D30] text-[#063D30] dark:text-emerald-400 dark:border-emerald-400 bg-white dark:bg-card rounded-t-md shadow-xs'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <TableProperties className="w-4 h-4" />
            <span>Matriz Comparativa (Banco Real)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gaps')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer',
              activeTab === 'gaps'
                ? 'border-[#063D30] text-[#063D30] dark:text-emerald-400 dark:border-emerald-400 bg-white dark:bg-card rounded-t-md shadow-xs'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <AlertTriangle className="w-4 h-4 text-[#E87517]" />
            <span>Relatório de Gaps & Auditoria</span>
            {calculatedGaps.length > 0 && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1 bg-[#E87517] text-white">
                {calculatedGaps.length}
              </Badge>
            )}
          </button>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* ABA 1: GESTÃO DE PERFIS & EDIÇÃO (FONTE DE VERDADE) */}
          {activeTab === 'gestao' && (
            <>
              {/* Informação sobre perfil SUP */}
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-[#C69B45]/40 rounded-lg text-xs text-amber-900 dark:text-amber-200">
                <Info className="w-4 h-4 text-[#C69B45] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Regra Institucional Huram:</span> O perfil{' '}
                  <strong className="text-[#063D30] font-black">SUP (Superusuário)</strong> possui
                  acesso pleno e irrestrito a todas as telas do sistema (Visualizar, Criar, Editar e
                  Excluir). A tela de gestão permanece totalmente editável para personalizações
                  necessárias, mantendo a integridade sem divergências.
                </div>
              </div>

              {/* Barra de busca de perfis */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar perfis por nome, código ou descrição..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="pl-9 h-9 text-sm focus-visible:ring-[#063D30]"
                  />
                </div>
              </div>

              {/* Tabela de Perfis */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#063D30] text-white">
                    <tr>
                      <th className="text-left px-4 py-3 font-bold">Perfil</th>
                      <th className="text-left px-4 py-3 font-bold">Código</th>
                      <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">
                        Descrição
                      </th>
                      <th className="text-center px-4 py-3 font-bold">Menus Liberados</th>
                      <th className="text-center px-4 py-3 font-bold">Telas Pontuais</th>
                      <th className="text-center px-4 py-3 font-bold">Status</th>
                      <th className="text-right px-4 py-3 font-bold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-[#063D30]" />
                            Carregando perfis cadastrados...
                          </div>
                        </td>
                      </tr>
                    ) : filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          Nenhum perfil encontrado com o filtro informado.
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((p) => {
                        const isSup = p.code.toUpperCase() === 'SUP'
                        const pData = (p.permissions || {}) as ProfilePermissionsData
                        const allowedCount = isSup
                          ? 'Todos (100%)'
                          : pData.allowedMenus?.length
                            ? `${pData.allowedMenus.length} menus`
                            : 'Padrão'
                        const specificCount = isSup
                          ? 'Todas'
                          : pData.screens
                            ? `${Object.keys(pData.screens).length} telas`
                            : '0'

                        return (
                          <tr
                            key={p.id}
                            className="border-b border-border/60 hover:bg-[#063D30]/5 transition-colors"
                          >
                            <td className="px-4 py-3 font-semibold text-foreground">
                              <div className="flex items-center gap-2">
                                {isSup ? (
                                  <ShieldCheck className="w-4 h-4 text-[#C69B45]" />
                                ) : (
                                  <Shield className="w-4 h-4 text-[#063D30]" />
                                )}
                                <span>{p.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'font-mono text-xs font-bold',
                                  isSup
                                    ? 'bg-[#C69B45]/20 text-[#063D30] border border-[#C69B45]/50'
                                    : 'bg-[#063D30]/10 text-[#063D30]',
                                )}
                              >
                                {p.code}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs max-w-xs truncate">
                              {p.description || '—'}
                            </td>
                            <td className="px-4 py-3 text-center text-xs font-medium text-foreground">
                              {allowedCount}
                            </td>
                            <td className="px-4 py-3 text-center text-xs font-medium text-foreground">
                              {specificCount}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={cn(
                                  'text-[11px] font-bold px-2 py-0.5 rounded-full',
                                  p.active !== false
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
                                )}
                              >
                                {p.active !== false ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenEdit(p)}
                                  className="h-8 px-2.5 text-[#063D30] hover:bg-[#063D30]/10"
                                  title="Editar menus e permissões do perfil"
                                >
                                  <Pencil className="w-4 h-4 mr-1" /> Editar
                                </Button>
                                {!isSup && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(p)}
                                    className="h-8 px-2 text-rose-600 hover:bg-rose-50"
                                    title="Excluir perfil"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ABA 2: MATRIZ COMPARATIVA (CONECTADA AO BANCO REAL) */}
          {activeTab === 'matriz' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Matriz Dinâmica Baseada no Banco:</span> Esta matriz
                  reflete com exatidão o estado gravado na coleção{' '}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded font-mono">
                    perfis_permissoes
                  </code>
                  . As colunas mostram cada perfil ativo cadastrado e as linhas correspondem a todas
                  as telas do sistema.
                </div>
              </div>

              {/* Filtros da Matriz */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar telas da matriz por nome ou rota..."
                    value={matrixSearchQuery}
                    onChange={(e) => setMatrixSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs focus-visible:ring-[#063D30]"
                  />
                </div>
                <div>
                  <select
                    value={matrixModuleFilter}
                    onChange={(e) => setMatrixModuleFilter(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:ring-[#063D30]"
                  >
                    {screenCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'TODOS' ? 'Todos os Módulos' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tabela de Matriz Comparativa */}
              <div className="border border-border rounded-lg overflow-x-auto max-h-[550px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#063D30] text-white sticky top-0 z-10">
                    <tr>
                      <th className="text-left px-3 py-2.5 font-bold min-w-[220px]">
                        Tela / Módulo
                      </th>
                      {profiles.map((p) => (
                        <th key={p.id} className="text-center px-2 py-2.5 font-bold min-w-[110px]">
                          <div className="truncate font-bold">{p.name}</div>
                          <span className="text-[10px] font-mono text-[#C69B45]">{p.code}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMatrixScreens.length === 0 ? (
                      <tr>
                        <td
                          colSpan={profiles.length + 1}
                          className="px-3 py-8 text-center text-muted-foreground"
                        >
                          Nenhuma tela encontrada para o filtro selecionado.
                        </td>
                      </tr>
                    ) : (
                      filteredMatrixScreens.map((s) => (
                        <tr
                          key={s.route}
                          className="border-b border-border/50 hover:bg-[#063D30]/5 transition-colors"
                        >
                          <td className="px-3 py-2">
                            <div className="font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                              {s.parentLabel ? (
                                <span className="text-muted-foreground font-normal mr-1">
                                  {s.parentLabel} &gt;
                                </span>
                              ) : null}
                              {s.label}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono truncate">
                              {s.route}
                            </div>
                          </td>

                          {profiles.map((p) => {
                            const pCode = (p.code || '').toUpperCase()
                            const canV = checkProfileScreenAccess(pCode, s.route, 'v', profiles)
                            const canC = checkProfileScreenAccess(pCode, s.route, 'c', profiles)
                            const canE = checkProfileScreenAccess(pCode, s.route, 'e', profiles)
                            const canD = checkProfileScreenAccess(pCode, s.route, 'd', profiles)

                            return (
                              <td key={p.id} className="px-2 py-2 text-center">
                                {canV ? (
                                  <div className="inline-flex items-center justify-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                                    <span className="text-emerald-700 dark:text-emerald-300">
                                      V
                                    </span>
                                    {canC && <span className="text-blue-600">C</span>}
                                    {canE && <span className="text-amber-600">E</span>}
                                    {canD && <span className="text-rose-600">D</span>}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground/50 text-[11px]">—</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold">Legenda de Permissões:</span>
                  <span className="text-emerald-700 font-bold">V: Visualizar</span>
                  <span className="text-blue-600 font-bold">C: Criar</span>
                  <span className="text-amber-600 font-bold">E: Editar</span>
                  <span className="text-rose-600 font-bold">D: Excluir</span>
                </div>
                <span>
                  Exibindo {filteredMatrixScreens.length} de {systemScreens.length} telas
                  cadastradas
                </span>
              </div>
            </div>
          )}

          {/* ABA 3: RELATÓRIO DE GAPS & AUDITORIA (CONECTADO AO BANCO REAL) */}
          {activeTab === 'gaps' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#E87517] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Auditoria Dinâmica de Gaps de Segurança:</span> Este
                  relatório analisa as regras reais persistidas no banco para detectar
                  inconsistências operacionais (ex.: permissão de gravação sem leitura) e acessos de
                  risco a áreas administrativas sensíveis.
                </div>
              </div>

              {/* Filtros de Gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Filtrar por Perfil
                  </label>
                  <select
                    value={gapProfileFilter}
                    onChange={(e) => setGapProfileFilter(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:ring-[#063D30]"
                  >
                    <option value="TODOS">Todos os Perfis</option>
                    {profiles
                      .filter((p) => p.code.toUpperCase() !== 'SUP')
                      .map((p) => (
                        <option key={p.id} value={p.code}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Filtrar por Módulo
                  </label>
                  <select
                    value={gapModuleFilter}
                    onChange={(e) => setGapModuleFilter(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:ring-[#063D30]"
                  >
                    {screenCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'TODOS' ? 'Todos os Módulos' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Severidade
                  </label>
                  <select
                    value={gapSeverityFilter}
                    onChange={(e) =>
                      setGapSeverityFilter(e.target.value as 'TODOS' | 'alta' | 'media' | 'baixa')
                    }
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:ring-[#063D30]"
                  >
                    <option value="TODOS">Todas as Severidades</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
              </div>

              {/* Tabela de Gaps */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#063D30] text-white">
                    <tr>
                      <th className="text-left px-3 py-2.5 font-bold">Severidade</th>
                      <th className="text-left px-3 py-2.5 font-bold">Perfil</th>
                      <th className="text-left px-3 py-2.5 font-bold">Módulo / Tela</th>
                      <th className="text-left px-3 py-2.5 font-bold">Inconsistência Detectada</th>
                      <th className="text-left px-3 py-2.5 font-bold hidden md:table-cell">
                        Recomendação
                      </th>
                      <th className="text-right px-3 py-2.5 font-bold">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGaps.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1" />
                            <span className="font-bold text-foreground">Nenhum gap detectado!</span>
                            <span className="text-xs">
                              As permissões gravadas no banco estão consistentes de acordo com os
                              critérios analisados.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredGaps.map((g) => {
                        const targetProfile = profiles.find(
                          (p) => p.code.toUpperCase() === g.profileCode.toUpperCase(),
                        )

                        return (
                          <tr
                            key={g.id}
                            className="border-b border-border/60 hover:bg-muted/40 transition-colors"
                          >
                            <td className="px-3 py-2.5">
                              <Badge
                                variant={
                                  g.severity === 'alta'
                                    ? 'destructive'
                                    : g.severity === 'media'
                                      ? 'default'
                                      : 'secondary'
                                }
                                className={cn(
                                  'uppercase text-[10px] font-bold',
                                  g.severity === 'alta' && 'bg-rose-600 text-white',
                                  g.severity === 'media' && 'bg-[#E87517] text-white',
                                  g.severity === 'baixa' && 'bg-amber-100 text-amber-900',
                                )}
                              >
                                {g.severity}
                              </Badge>
                            </td>
                            <td className="px-3 py-2.5 font-semibold">
                              <div>{g.profileName}</div>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {g.profileCode}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="font-semibold text-foreground">{g.screenTitle}</div>
                              <span className="text-[10px] text-muted-foreground font-mono truncate block">
                                {g.module} • {g.route}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-foreground max-w-xs">{g.issue}</td>
                            <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell max-w-xs">
                              {g.recommendation}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              {targetProfile && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    handleOpenEdit(targetProfile)
                                    setScreenSearchQuery(g.screenTitle)
                                  }}
                                  className="h-7 px-2 text-xs border-[#063D30] text-[#063D30] hover:bg-[#063D30]/10"
                                >
                                  Ajustar Perfil
                                </Button>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIÁLOGO INTEGRADO: CRIAR OU EDITAR PERFIL COM MENUS E BUSCA GLOBAL DE TELAS */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-5 bg-gradient-to-r from-[#063D30] to-[#0A5241] text-white shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg text-white font-black">
              {editingProfileId ? (
                <>
                  <Pencil className="w-5 h-5 text-[#C69B45]" /> Editar Perfil & Permissões:{' '}
                  {name || code}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-[#C69B45]" /> Criar Novo Perfil & Configurar
                  Permissões
                </>
              )}
            </DialogTitle>
            <p className="text-xs text-white/80">
              Marque os menus visíveis no painel lateral e defina autorizações pontuais (V, C, E, D)
              em qualquer tela do ERP Huram.
            </p>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* BLOCO 1: DADOS BÁSICOS DO PERFIL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#F8FAF9] dark:bg-card border border-border rounded-lg">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-[#063D30]">Nome do Perfil *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex.: Financeiro Júnior, Gestor Comercial, Auditor..."
                    className="focus-visible:ring-[#063D30] h-9"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#063D30]">Código Identificador *</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex.: FIN_JR, COMERCIAL, SUP"
                    className="focus-visible:ring-[#063D30] font-mono h-9"
                    disabled={isSupEditing}
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-[#063D30]">Descrição do Papel</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Finalidade deste perfil no ERP..."
                    className="focus-visible:ring-[#063D30] h-9"
                  />
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-3 sm:pt-6">
                  <Label className="text-xs font-bold">Perfil Ativo</Label>
                  <Switch
                    checked={active}
                    onCheckedChange={setActive}
                    disabled={isSupEditing}
                    className="data-[state=checked]:bg-[#063D30]"
                  />
                </div>
              </div>

              {isSupEditing && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-[#C69B45] rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#C69B45] shrink-0" />
                  <span>
                    <strong>Perfil SUP:</strong> Superusuário possui acesso a 100% dos menus e todas
                    as telas com direitos totais (V, C, E, D) por definição do sistema.
                  </span>
                </div>
              )}

              {/* BLOCO 2: SELEÇÃO DE MENUS DO SISTEMA (REQUISITO 1) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-5 h-5 text-[#063D30]" />
                    <div>
                      <h3 className="text-sm font-black text-[#063D30]">
                        Menus do Sistema Permitidos
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Marque quais menus este perfil poderá visualizar na barra lateral do ERP.
                      </p>
                    </div>
                  </div>
                  {!isSupEditing && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleSelectAllMenus}
                        className="text-xs h-7 px-2.5 border-[#063D30] text-[#063D30]"
                      >
                        Marcar Todos
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleDeselectAllMenus}
                        className="text-xs h-7 px-2 text-muted-foreground"
                      >
                        Desmarcar Todos
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                  {systemMenus.groups.map((grp) => {
                    const allInGroupSelected = grp.items.every((it) => selectedMenus.has(it.route))
                    const someInGroupSelected =
                      grp.items.some((it) => selectedMenus.has(it.route)) && !allInGroupSelected

                    return (
                      <div
                        key={grp.name}
                        className="border border-border/80 rounded-lg p-3 bg-white dark:bg-card"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <button
                            type="button"
                            onClick={() => toggleMenuGroup(grp.items)}
                            disabled={isSupEditing}
                            className="flex items-center gap-2 font-bold text-xs text-[#063D30] hover:underline cursor-pointer"
                          >
                            {allInGroupSelected || isSupEditing ? (
                              <CheckSquare className="w-4 h-4 text-[#063D30]" />
                            ) : someInGroupSelected ? (
                              <div className="w-4 h-4 rounded border-2 border-[#063D30] bg-[#063D30]/20 flex items-center justify-center">
                                <span className="w-2 h-0.5 bg-[#063D30]" />
                              </div>
                            ) : (
                              <Square className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span>{grp.name}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              ({grp.items.length} itens)
                            </span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pl-6">
                          {grp.items.map((item) => {
                            const isChecked = selectedMenus.has(item.route) || isSupEditing
                            return (
                              <label
                                key={item.route}
                                className={cn(
                                  'flex items-center gap-2 p-1.5 rounded border text-xs cursor-pointer select-none transition-colors',
                                  isChecked
                                    ? 'bg-[#063D30]/10 border-[#063D30]/40 text-[#063D30] font-medium'
                                    : 'border-border/60 text-muted-foreground hover:bg-muted/40',
                                  isSupEditing && 'cursor-not-allowed opacity-90',
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleMenu(item.route)}
                                  disabled={isSupEditing}
                                  className="w-3.5 h-3.5 rounded text-[#063D30] focus:ring-[#063D30] cursor-pointer"
                                />
                                <span className="truncate">
                                  {item.parentLabel ? `${item.parentLabel} > ` : ''}
                                  {item.label}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* BLOCO 3: BUSCA GLOBAL DE TELAS ESPECÍFICAS COM V, C, E, D (REQUISITOS 2 E 3) */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#C69B45]" />
                    <div>
                      <h3 className="text-sm font-black text-[#063D30]">
                        Permissões Pontuais por Tela (V, C, E, D)
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Busque qualquer tela do sistema para conceder acesso cirúrgico e definir
                        operações: <strong>V (Visualizar)</strong>, <strong>C (Criar)</strong>,{' '}
                        <strong>E (Editar)</strong> ou <strong>D (Excluir)</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filtros de busca de tela */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar tela em todo o sistema (ex: Contratos, Relatórios, Clientes, DRE...)"
                      value={screenSearchQuery}
                      onChange={(e) => setScreenSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs focus-visible:ring-[#063D30]"
                    />
                  </div>
                  <div>
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:ring-[#063D30]"
                    >
                      {screenCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === 'TODOS' ? 'Todos os Módulos' : cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tabela de telas com operações V, C, E, D */}
                <div className="border border-border rounded-lg overflow-hidden max-h-[320px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F1F4F2] dark:bg-muted text-[#063D30] sticky top-0 z-10 border-b border-border">
                      <tr>
                        <th className="text-left px-3 py-2 font-bold">Tela</th>
                        <th className="text-left px-3 py-2 font-bold hidden sm:table-cell">
                          Módulo
                        </th>
                        <th className="text-center px-2 py-2 font-bold w-12" title="Visualizar">
                          V
                        </th>
                        <th className="text-center px-2 py-2 font-bold w-12" title="Criar">
                          C
                        </th>
                        <th className="text-center px-2 py-2 font-bold w-12" title="Editar">
                          E
                        </th>
                        <th className="text-center px-2 py-2 font-bold w-12" title="Excluir">
                          D
                        </th>
                        <th className="text-right px-3 py-2 font-bold w-28">Ação Rápida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScreens.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                            Nenhuma tela encontrada para o termo pesquisado.
                          </td>
                        </tr>
                      ) : (
                        filteredScreens.map((s) => {
                          const perm = isSupEditing
                            ? { v: true, c: true, e: true, d: true }
                            : screenPermissions[s.route] || {
                                v: false,
                                c: false,
                                e: false,
                                d: false,
                              }
                          const hasAny = perm.v || perm.c || perm.e || perm.d

                          return (
                            <tr
                              key={s.route}
                              className={cn(
                                'border-b border-border/50 hover:bg-muted/40 transition-colors',
                                hasAny && 'bg-[#063D30]/5',
                              )}
                            >
                              <td className="px-3 py-2 font-medium">
                                <div className="truncate max-w-xs sm:max-w-md">
                                  {s.parentLabel ? (
                                    <span className="text-muted-foreground mr-1">
                                      {s.parentLabel} &gt;
                                    </span>
                                  ) : null}
                                  <span className="text-foreground font-semibold">{s.label}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono truncate">
                                  {s.route}
                                </div>
                              </td>
                              <td className="px-3 py-2 hidden sm:table-cell text-muted-foreground">
                                {s.group}
                              </td>

                              {/* V: Visualizar */}
                              <td className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleScreenOp(s.route, 'v')}
                                  disabled={isSupEditing}
                                  className={cn(
                                    'w-7 h-7 rounded font-bold text-xs transition-colors flex items-center justify-center mx-auto',
                                    perm.v
                                      ? 'bg-emerald-600 text-white font-black'
                                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                                    isSupEditing && 'cursor-default',
                                  )}
                                  title="Permissão: Visualizar (V)"
                                >
                                  V
                                </button>
                              </td>

                              {/* C: Criar */}
                              <td className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleScreenOp(s.route, 'c')}
                                  disabled={isSupEditing}
                                  className={cn(
                                    'w-7 h-7 rounded font-bold text-xs transition-colors flex items-center justify-center mx-auto',
                                    perm.c
                                      ? 'bg-blue-600 text-white font-black'
                                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                                    isSupEditing && 'cursor-default',
                                  )}
                                  title="Permissão: Criar (C)"
                                >
                                  C
                                </button>
                              </td>

                              {/* E: Editar */}
                              <td className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleScreenOp(s.route, 'e')}
                                  disabled={isSupEditing}
                                  className={cn(
                                    'w-7 h-7 rounded font-bold text-xs transition-colors flex items-center justify-center mx-auto',
                                    perm.e
                                      ? 'bg-amber-600 text-white font-black'
                                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                                    isSupEditing && 'cursor-default',
                                  )}
                                  title="Permissão: Editar (E)"
                                >
                                  E
                                </button>
                              </td>

                              {/* D: Excluir */}
                              <td className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleScreenOp(s.route, 'd')}
                                  disabled={isSupEditing}
                                  className={cn(
                                    'w-7 h-7 rounded font-bold text-xs transition-colors flex items-center justify-center mx-auto',
                                    perm.d
                                      ? 'bg-rose-600 text-white font-black'
                                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                                    isSupEditing && 'cursor-default',
                                  )}
                                  title="Permissão: Excluir (D)"
                                >
                                  D
                                </button>
                              </td>

                              {/* Ação Rápida: Conceder Tudo / Revogar */}
                              <td className="px-3 py-2 text-right">
                                {!isSupEditing ? (
                                  hasAny ? (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setScreenAllOps(s.route, false)}
                                      className="text-[10px] h-6 px-1.5 text-rose-600 hover:bg-rose-50"
                                    >
                                      Remover
                                    </Button>
                                  ) : (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setScreenAllOps(s.route, true)}
                                      className="text-[10px] h-6 px-1.5 border-[#063D30] text-[#063D30]"
                                    >
                                      Conceder VCED
                                    </Button>
                                  )
                                ) : (
                                  <span className="text-[10px] text-[#063D30] font-bold">
                                    Total
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-[9px]">
                        V
                      </span>{' '}
                      Visualizar
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[9px]">
                        C
                      </span>{' '}
                      Criar
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded bg-amber-600 text-white font-bold flex items-center justify-center text-[9px]">
                        E
                      </span>{' '}
                      Editar
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded bg-rose-600 text-white font-bold flex items-center justify-center text-[9px]">
                        D
                      </span>{' '}
                      Excluir
                    </span>
                  </div>
                  <span>
                    Exibindo {filteredScreens.length} de {systemScreens.length} telas registradas
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 bg-[#F8FAF9] dark:bg-card border-t border-border shrink-0 flex items-center justify-between sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#063D30] hover:bg-[#0A5241] text-white font-bold"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" /> Salvar Perfil & Permissões
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default PerfisPermissoesUnifiedScreen

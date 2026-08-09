import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { canViewAdaptaGovernance } from '@/lib/ai-permissions'
import { getGovernanceConfig, saveGovernanceConfig } from '@/services/adapta-governance'
import type { GovernanceConfig } from '@/lib/adapta-governance-types'
import { GovernanceOverview } from '@/components/adapta-governance/governance-overview'
import { GovernanceModules } from '@/components/adapta-governance/governance-modules'
import { GovernanceDataTypes } from '@/components/adapta-governance/governance-data-types'
import { GovernanceActions } from '@/components/adapta-governance/governance-actions'
import { GovernanceProfiles } from '@/components/adapta-governance/governance-profiles'
import { GovernancePolicies } from '@/components/adapta-governance/governance-policies'
import { toast } from 'sonner'

export default function AdaptaGovernance() {
  const { isAuthenticated, loading, user } = useAuth()
  const [config, setConfig] = useState<GovernanceConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const canEdit = (user?.role as string) === 'SUP'

  useEffect(() => {
    if (isAuthenticated) {
      getGovernanceConfig()
        .then((c) => setConfig(c))
        .catch(() => setConfig(null))
        .finally(() => setConfigLoading(false))
    } else {
      setConfigLoading(false)
    }
  }, [isAuthenticated])

  const handleSave = async (partial: Partial<GovernanceConfig>) => {
    if (!config) return
    setSaving(true)
    try {
      const updated = { ...config, ...partial }
      await saveGovernanceConfig(updated)
      setConfig(updated)
      toast.success('Configuração salva')
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  if (loading || configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <AdminLogin />

  if (!canViewAdaptaGovernance(user?.role as string)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-bold">Acesso negado</p>
        <p className="text-sm text-muted-foreground">
          Você não tem permissão para acessar este módulo.
        </p>
        <Button variant="ghost" asChild className="mt-4 text-[#005B2E]">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao painel
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">Governança da ADAPTA</h2>
        </div>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="data-types">Tipos de Dados</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
          <TabsTrigger value="profiles">Perfis</TabsTrigger>
          <TabsTrigger value="policies">Políticas</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          {config && <GovernanceOverview config={config} />}
        </TabsContent>
        <TabsContent value="modules" className="mt-4">
          {config && (
            <GovernanceModules
              config={config}
              onSave={handleSave}
              canEdit={canEdit}
              saving={saving}
            />
          )}
        </TabsContent>
        <TabsContent value="data-types" className="mt-4">
          {config && (
            <GovernanceDataTypes
              config={config}
              onSave={handleSave}
              canEdit={canEdit}
              saving={saving}
            />
          )}
        </TabsContent>
        <TabsContent value="actions" className="mt-4">
          {config && (
            <GovernanceActions
              config={config}
              onSave={handleSave}
              canEdit={canEdit}
              saving={saving}
            />
          )}
        </TabsContent>
        <TabsContent value="profiles" className="mt-4">
          <GovernanceProfiles canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="policies" className="mt-4">
          {config && (
            <GovernancePolicies
              config={config}
              onSave={handleSave}
              canEdit={canEdit}
              saving={saving}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

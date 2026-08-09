import { useState } from 'react'
import { BlueprintDashboard } from '@/components/blueprint/blueprint-dashboard'
import { BlueprintVolumes } from '@/components/blueprint/blueprint-volumes'
import { BlueprintChapters } from '@/components/blueprint/blueprint-chapters'
import { BlueprintEditor } from '@/components/blueprint/blueprint-editor'
import { BlueprintVersions } from '@/components/blueprint/blueprint-versions'
import { BlueprintDecisionCenter } from '@/components/blueprint/blueprint-decision-center'
import { BlueprintWorkflow } from '@/components/blueprint/blueprint-workflow'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { canViewBlueprint, canEditBlueprint } from '@/lib/blueprint-permissions'
import { ShieldAlert, BookOpen } from 'lucide-react'

type TabKey =
  | 'dashboard'
  | 'volumes'
  | 'chapters'
  | 'editor'
  | 'versions'
  | 'decisions'
  | 'workflow'

export default function Blueprint() {
  const { user } = useAuth()
  const [tab, setTab] = useState<TabKey>('dashboard')

  if (!canViewBlueprint(user?.role as string)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-lg font-bold">Acesso Restrito</p>
          <p className="text-sm text-muted-foreground">
            Você não tem permissão para acessar o Blueprint.
          </p>
        </div>
      </div>
    )
  }

  const canEdit = canEditBlueprint(user?.role as string)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-[#005B2E]" />
        <div>
          <h1 className="text-2xl font-black text-[#005B2E]">Business Blueprint</h1>
          <p className="text-sm text-muted-foreground">
            Governança de conhecimento · Single Source of Truth
          </p>
        </div>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="volumes">Volumes</TabsTrigger>
          <TabsTrigger value="chapters">Capítulos</TabsTrigger>
          {canEdit && <TabsTrigger value="editor">Editor</TabsTrigger>}
          <TabsTrigger value="versions">Versões</TabsTrigger>
          <TabsTrigger value="decisions">Centro de Decisão</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-4">
          <BlueprintDashboard />
        </TabsContent>
        <TabsContent value="volumes" className="mt-4">
          <BlueprintVolumes />
        </TabsContent>
        <TabsContent value="chapters" className="mt-4">
          <BlueprintChapters />
        </TabsContent>
        {canEdit && (
          <TabsContent value="editor" className="mt-4">
            <BlueprintEditor />
          </TabsContent>
        )}
        <TabsContent value="versions" className="mt-4">
          <BlueprintVersions />
        </TabsContent>
        <TabsContent value="decisions" className="mt-4">
          <BlueprintDecisionCenter />
        </TabsContent>
        <TabsContent value="workflow" className="mt-4">
          <BlueprintWorkflow />
        </TabsContent>
      </Tabs>
    </div>
  )
}

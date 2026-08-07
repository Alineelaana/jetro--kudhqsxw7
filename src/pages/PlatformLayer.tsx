import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  Activity,
  Calendar,
  GitBranch,
  Search,
  FileText,
  Bell,
  Cog,
  BarChart3,
} from 'lucide-react'
import { PlatformMonitoringPanel } from '@/components/platform/platform-monitoring-panel'
import { PlatformWorkflowPanel } from '@/components/platform/platform-workflow-panel'
import { PlatformAgendaPanel } from '@/components/platform/platform-agenda-panel'

const SHARED_SERVICES = [
  {
    name: 'RBAC & Permissões',
    status: 'Ativo',
    icon: Shield,
    desc: 'Matriz de permissões por role × módulo × ação',
  },
  {
    name: 'Auditoria',
    status: 'Ativo',
    icon: Activity,
    desc: 'audit_logs — mecanismo único de auditoria',
  },
  { name: 'Notificações', status: 'Ativo', icon: Bell, desc: 'Notification Center consolidado' },
  { name: 'Busca Global', status: 'Ativo', icon: Search, desc: 'Global Search Engine unificado' },
  {
    name: 'Document Engine',
    status: 'Ativo',
    icon: FileText,
    desc: 'PDF, XLS, CSV, gráficos — corporativo',
  },
  {
    name: 'Workflow Engine',
    status: 'Ativo',
    icon: GitBranch,
    desc: 'Motor único de fluxos e aprovações',
  },
  {
    name: 'BI Enterprise 360',
    status: 'Ativo',
    icon: BarChart3,
    desc: 'Única camada de analytics',
  },
  {
    name: 'Configurações',
    status: 'Ativo',
    icon: Cog,
    desc: 'Configurações corporativas centralizadas',
  },
  {
    name: 'Agenda Corporativa',
    status: 'Ativo',
    icon: Calendar,
    desc: 'Agenda única multi-módulo',
  },
]

export default function PlatformLayer() {
  const [tab, setTab] = useState('overview')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-[#005B2E]" />
        <h1 className="text-2xl font-black text-foreground">Platform Layer Corporativa</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardHeader>
              <CardTitle className="text-[#005B2E]">Serviços Compartilhados Oficiais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SHARED_SERVICES.map((svc) => {
                  const Icon = svc.icon
                  return (
                    <div
                      key={svc.name}
                      className="flex items-start gap-3 p-3 rounded-lg border border-[#005B2E]/10 bg-[#005B2E]/5"
                    >
                      <Icon className="w-5 h-5 text-[#005B2E] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{svc.name}</p>
                        <p className="text-xs text-muted-foreground">{svc.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#C89B3C]/20">
            <CardHeader>
              <CardTitle className="text-[#C89B3C]">
                Estrutura: Platform Layer → Governance → Infrastructure → Business Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                {`Platform Layer
├── Governance
│   ├── RBAC (permissions.ts, auth-model.ts)
│   ├── Company/Branch Scope (use-authorization.tsx)
│   ├── Auditing (audit_logs — REUSED, no parallel)
│   ├── Approvals (platform_workflows)
│   └── Versioning (existing collections)
├── Infrastructure
│   ├── Notification Center (notifications — EXTENDED)
│   ├── Document Engine (pdf-generator, report-pdf, csv-export)
│   ├── Global Search (enterprise-search)
│   ├── Integration Hub (integrations, integration_logs)
│   ├── Scheduler (centralized cron registry)
│   └── Monitoring (platform_monitoring)
├── Corporate Services
│   ├── Corporate Agenda (platform_agenda_events)
│   └── Workflow Engine (platform_workflows)
└── Intelligence
    └── BI Enterprise 360 (sole analytics layer)`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <PlatformMonitoringPanel />
        </TabsContent>
        <TabsContent value="workflows">
          <PlatformWorkflowPanel />
        </TabsContent>
        <TabsContent value="agenda">
          <PlatformAgendaPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

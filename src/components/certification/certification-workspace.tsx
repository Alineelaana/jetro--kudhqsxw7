import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Lock, CheckCircle2, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminLogin } from '@/components/admin-login'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { canViewAuditLogs } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import { getArtifacts, createArtifact, saveArtifact } from '@/services/certification'
import { BUILDS, BUILD_16_DEFAULT_ITEMS } from '@/lib/certification-builds'
import { STATUS_LABELS, STATUS_COLORS, type CertificationArtifact } from '@/lib/certification-types'
import { BuildEditor } from '@/components/certification/build-editor'

interface Props {
  domain: string
  domainName: string
}

export function CertificationWorkspace({ domain, domainName }: Props) {
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const [artifacts, setArtifacts] = useState<CertificationArtifact[]>([])
  const [selectedBuild, setSelectedBuild] = useState(1)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      let data = await getArtifacts(domain)
      if (data.length === 0) {
        for (const build of BUILDS) {
          const content =
            build.number === 16
              ? { items: BUILD_16_DEFAULT_ITEMS, summary: '' }
              : { items: [], summary: '' }
          await createArtifact({
            domain,
            build_number: build.number,
            build_name: build.name,
            status: 'pendente',
            content,
            review_checklist: build.reviewChecklist.map((l) => ({
              label: l,
              checked: false,
              notes: '',
            })),
            review_notes: '',
            completed_at: '',
            reviewer: '',
          })
        }
        data = await getArtifacts(domain)
      }
      setArtifacts(data)
    } catch {
      /* noop */
    } finally {
      setLoading(false)
    }
  }, [domain])

  useEffect(() => {
    if (isAuthenticated) loadData()
    else setLoading(false)
  }, [isAuthenticated, loadData])

  useRealtime(
    'certification_artifacts',
    () => {
      loadData()
    },
    isAuthenticated,
  )

  const handleSave = async (id: string, data: Partial<CertificationArtifact>) => {
    await saveArtifact(id, data)
    setArtifacts((prev) =>
      prev.map((a) => (a.id === id ? ({ ...a, ...data } as CertificationArtifact) : a)),
    )
  }
  const handleStatusChange = async (id: string, updates: Partial<CertificationArtifact>) => {
    await saveArtifact(id, updates)
    setArtifacts((prev) =>
      prev.map((a) => (a.id === id ? ({ ...a, ...updates } as CertificationArtifact) : a)),
    )
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return <AdminLogin />
  if (!canViewAuditLogs(user?.role as string)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-bold">Acesso negado</p>
        <p className="text-sm text-muted-foreground">
          Você não tem permissão para acessar a certificação.
        </p>
        <Button variant="ghost" asChild className="mt-4 text-[#005B2E]">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Link>
        </Button>
      </div>
    )
  }

  const completedCount = artifacts.filter((a) => a.status === 'concluido').length
  const progress = Math.round((completedCount / BUILDS.length) * 100)
  const currentArtifact = artifacts.find((a) => a.build_number === selectedBuild)
  const currentBuild = BUILDS.find((b) => b.number === selectedBuild)!
  const prevArtifact = artifacts.find((a) => a.build_number === selectedBuild - 1)
  const isLocked = selectedBuild > 1 && prevArtifact?.status !== 'concluido'
  const userName = (user?.name as string) || (user?.email as string) || ''

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Painel
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-foreground">
            Certificação Domínio 01 — {domainName}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1 max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#005B2E] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">
              {completedCount}/{BUILDS.length} concluídas
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-72 shrink-0">
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle className="text-sm">Epic Certificação Domínio 01</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 max-h-[70vh] overflow-y-auto">
              {BUILDS.map((build) => {
                const artifact = artifacts.find((a) => a.build_number === build.number)
                const status = artifact?.status || 'pendente'
                const prev = artifacts.find((a) => a.build_number === build.number - 1)
                const locked = build.number > 1 && prev?.status !== 'concluido'
                const isSelected = selectedBuild === build.number
                return (
                  <button
                    key={build.number}
                    onClick={() => !locked && setSelectedBuild(build.number)}
                    disabled={locked}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                      isSelected ? 'bg-[#005B2E] text-white' : 'hover:bg-muted',
                      locked && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <span className="font-mono text-xs shrink-0">
                      {String(build.number).padStart(2, '0')}
                    </span>
                    <span className="flex-1 truncate">{build.name}</span>
                    {locked ? (
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                    ) : status === 'concluido' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-500" />
                    ) : null}
                    {!locked && status !== 'concluido' && (
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] px-1.5 py-0', STATUS_COLORS[status])}
                      >
                        {STATUS_LABELS[status]}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 min-w-0">
          {currentArtifact && currentBuild && (
            <BuildEditor
              key={currentArtifact.id}
              artifact={currentArtifact}
              build={currentBuild}
              isLocked={isLocked}
              userName={userName}
              onSave={handleSave}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}

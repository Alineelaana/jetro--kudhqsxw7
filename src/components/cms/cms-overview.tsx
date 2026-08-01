import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  getPublicationState,
  getPendingChangesCount,
  publishAllSections,
  discardAllDrafts,
} from '@/services/cms'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import {
  ExternalLink,
  Eye,
  Rocket,
  Undo2,
  RefreshCw,
  Image,
  Palette,
  FileText,
  Package,
  PanelBottom,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react'

export function CmsOverview() {
  const { user } = useAuth()
  const [pubState, setPubState] = useState<Record<string, unknown> | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  const load = async () => {
    try {
      const [pub, pending] = await Promise.all([getPublicationState(), getPendingChangesCount()])
      setPubState(pub as Record<string, unknown> | null)
      setPendingCount(pending)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('cms_content', () => load())
  useRealtime('cms_publication', () => load())

  const handleDiscard = async () => {
    if (!confirm('Descartar todas as alterações não publicadas? Esta ação não pode ser desfeita.'))
      return
    try {
      await discardAllDrafts()
      toast.success('Alterações descartadas com sucesso!')
      await load()
    } catch {
      toast.error('Erro ao descartar alterações.')
    }
  }

  const handleRestore = () => {
    toast.info('Use a aba "Publicação" para selecionar e restaurar uma versão anterior.')
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await publishAllSections((user?.id as string) || '')
      toast.success('Alterações publicadas com sucesso!')
      await load()
    } catch {
      toast.error('Erro ao publicar alterações.')
    }
    setPublishing(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const lastPub = pubState?.last_published_at as string
  const status = (pubState?.status as string) || 'published'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-[#005B2E]/30">
          <CardContent className="py-4 px-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#005B2E]/10 flex items-center justify-center">
                {status === 'published' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-orange-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Status do Site</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {status === 'published' ? 'Publicado' : 'Pendente'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#C89B3C]/30">
          <CardContent className="py-4 px-5">
            <p className="text-sm font-bold text-foreground">Última Atualização</p>
            <p className="text-xs text-muted-foreground">
              {lastPub ? new Date(lastPub).toLocaleString('pt-BR') : '—'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/30">
          <CardContent className="py-4 px-5">
            <p className="text-sm font-bold text-foreground">Responsável</p>
            <p className="text-xs text-muted-foreground">
              {(user?.name as string) || (user?.email as string) || '—'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-orange-300/50">
          <CardContent className="py-4 px-5">
            <p className="text-sm font-bold text-foreground">Alterações Pendentes</p>
            <p className="text-2xl font-black text-orange-600">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          asChild
          variant="outline"
          className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-bold"
        >
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" /> Visualizar Site
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-bold"
        >
          <a href="/?preview=true" target="_blank" rel="noopener noreferrer">
            <Eye className="w-4 h-4 mr-2" /> Visualizar Prévia
          </a>
        </Button>
        <Button
          onClick={handlePublish}
          disabled={publishing || pendingCount === 0}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          {publishing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Rocket className="w-4 h-4 mr-2" />
          )}
          Publicar Alterações
        </Button>
        <Button
          onClick={handleDiscard}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 font-bold"
        >
          <Undo2 className="w-4 h-4 mr-2" /> Descartar Alterações
        </Button>
        <Button
          onClick={handleRestore}
          variant="outline"
          className="border-[#C89B3C] text-[#C89B3C] hover:bg-[#C89B3C]/10 font-bold"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Restaurar Versão Anterior
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: Image,
            title: 'Alterar Banner Principal',
            desc: 'Edite imagens e textos do banner principal',
          },
          { icon: Palette, title: 'Alterar Logomarca', desc: 'Gerencie logos e identidade visual' },
          {
            icon: FileText,
            title: 'Editar Título Principal',
            desc: 'Modifique títulos e subtítulos do site',
          },
          { icon: Package, title: 'Editar Serviços', desc: 'Configure serviços exibidos no site' },
          {
            icon: PanelBottom,
            title: 'Editar Rodapé',
            desc: 'Atualize informações de contato e links',
          },
        ].map((card) => (
          <Card
            key={card.title}
            className="border-2 border-[#005B2E]/20 hover:border-[#005B2E] transition-colors cursor-pointer group"
          >
            <CardContent className="py-5 px-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#005B2E]/10 flex items-center justify-center group-hover:bg-[#005B2E] transition-colors">
                <card.icon className="w-6 h-6 text-[#005B2E] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{card.title}</p>
                <p className="text-xs text-muted-foreground">{card.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

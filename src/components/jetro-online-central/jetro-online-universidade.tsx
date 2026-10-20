import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import {
  GraduationCap,
  Plus,
  Search,
  Youtube,
  ExternalLink,
  Edit2,
  Trash2,
  Play,
  Eye,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getJetroUniversidadeVideos, type JetroUniversidadeVideo } from '@/services/jetro-online'

const MODULOS_DISPONIVEIS = [
  'Geral',
  'Cadastros',
  'Comercial',
  'Financeiro',
  'Fiscal',
  'Controladoria',
  'Estoque',
  'Logística',
  'Indústria',
  'DP & RH',
  'Administração',
]

function extractYoutubeId(url: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export function JetroOnlineUniversidadeScreen() {
  const [videos, setVideos] = useState<JetroUniversidadeVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedModulo, setSelectedModulo] = useState<string>('todos')

  // Estado do Modal de Cadastro / Edição
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [descricao, setDescricao] = useState('')
  const [modulo, setModulo] = useState('Cadastros')
  const [assunto, setAssunto] = useState('')
  const [palavrasChave, setPalavrasChave] = useState('')
  const [rotaRelacionada, setRotaRelacionada] = useState('')
  const [permissaoNecessaria, setPermissaoNecessaria] = useState('')
  const [ordem, setOrdem] = useState(1)
  const [ativo, setAtivo] = useState(true)
  const [saving, setSaving] = useState(false)

  // Preview embed antes de salvar
  const [previewId, setPreviewId] = useState<string | null>(null)

  // Modal para assistir
  const [watchModalOpen, setWatchModalOpen] = useState(false)
  const [watchingVideo, setWatchingVideo] = useState<JetroUniversidadeVideo | null>(null)

  const { toast } = useToast()

  const loadVideos = async () => {
    setLoading(true)
    try {
      const records = await getJetroUniversidadeVideos()
      setVideos(records)
    } catch {
      toast({ title: 'Erro ao carregar vídeos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [])

  // Validação dinâmica do YouTube
  useEffect(() => {
    if (youtubeUrl) {
      const yid = extractYoutubeId(youtubeUrl)
      setPreviewId(yid)
    } else {
      setPreviewId(null)
    }
  }, [youtubeUrl])

  const handleOpenCreate = () => {
    setEditingId(null)
    setTitulo('')
    setYoutubeUrl('')
    setDescricao('')
    setModulo('Cadastros')
    setAssunto('')
    setPalavrasChave('')
    setRotaRelacionada('')
    setPermissaoNecessaria('')
    setOrdem((videos.length || 0) + 1)
    setAtivo(true)
    setPreviewId(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (v: JetroUniversidadeVideo) => {
    setEditingId(v.id)
    setTitulo(v.titulo)
    setYoutubeUrl(v.youtube_url)
    setDescricao(v.descricao || '')
    setModulo(v.modulo)
    setAssunto(v.assunto || '')
    setPalavrasChave(v.palavras_chave || '')
    setRotaRelacionada(v.rota_relacionada || '')
    setPermissaoNecessaria(v.permissao_necessaria || '')
    setOrdem(v.ordem || 1)
    setAtivo(v.ativo)
    setPreviewId(v.youtube_id || extractYoutubeId(v.youtube_url))
    setModalOpen(true)
  }

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanUrl = youtubeUrl.trim()
    const yid = extractYoutubeId(cleanUrl)

    if (!yid) {
      toast({
        title: 'Link inválido do YouTube',
        description:
          'Por favor, insira uma URL válida do YouTube (ex: https://www.youtube.com/watch?v=...)',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const payload = {
        titulo: titulo.trim(),
        youtube_url: cleanUrl,
        youtube_id: yid,
        descricao: descricao.trim(),
        modulo,
        assunto: assunto.trim(),
        palavras_chave: palavrasChave.trim(),
        rota_relacionada: rotaRelacionada.trim(),
        permissao_necessaria: permissaoNecessaria.trim(),
        ordem: Number(ordem) || 1,
        ativo,
      }

      if (editingId) {
        await pb.collection('jetro_universidade_videos').update(editingId, payload)
        toast({ title: 'Vídeo atualizado com sucesso!' })
      } else {
        await pb.collection('jetro_universidade_videos').create({
          ...payload,
          visualizacoes: 0,
          recomendacoes_count: 0,
        })
        toast({ title: 'Vídeo cadastrado na Universidade HURAM!' })
      }

      setModalOpen(false)
      loadVideos()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar vídeo',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteVideo = async (id: string, nome: string) => {
    if (!window.confirm(`Deseja realmente remover o vídeo "${nome}" da Universidade HURAM?`)) return
    try {
      await pb.collection('jetro_universidade_videos').delete(id)
      toast({ title: 'Vídeo excluído com sucesso' })
      loadVideos()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir vídeo', description: err.message, variant: 'destructive' })
    }
  }

  const filteredVideos = videos.filter((v) => {
    const matchesModulo = selectedModulo === 'todos' || v.modulo === selectedModulo
    if (!matchesModulo) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      v.titulo.toLowerCase().includes(q) ||
      (v.descricao && v.descricao.toLowerCase().includes(q)) ||
      (v.palavras_chave && v.palavras_chave.toLowerCase().includes(q)) ||
      (v.assunto && v.assunto.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-6">
      {/* Banner da Universidade HURAM */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-900 to-[#00381C] text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#C9A227]" />
                <h2 className="text-base font-bold">
                  Universidade HURAM — Biblioteca de Treinamento
                </h2>
              </div>
              <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                Vídeos oficiais recomendados de forma inteligente pela IA do HURAM On-line com base
                na tela e contexto do usuário.
              </p>
            </div>
            <Button
              onClick={handleOpenCreate}
              className="bg-[#C9A227] hover:bg-[#b5901f] text-gray-900 font-bold text-xs h-9 px-4 shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Cadastrar Novo Vídeo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Barra de Filtros e Busca */}
      <Card className="border shadow-2xs">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, assunto, palavras-chave ou descrição..."
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedModulo}
              onChange={(e) => setSelectedModulo(e.target.value)}
              className="text-xs h-9 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-[#005B2E]"
            >
              <option value="todos">Todos os Módulos</option>
              {MODULOS_DISPONIVEIS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Vídeos */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-xs">
          Carregando vídeos da Universidade HURAM...
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-xs text-gray-400 space-y-2">
          <GraduationCap className="w-8 h-8 mx-auto text-gray-300" />
          <p>Nenhum vídeo encontrado com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((vid) => (
            <Card
              key={vid.id}
              className="border shadow-2xs flex flex-col justify-between overflow-hidden group"
            >
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${vid.youtube_id || 'dQw4w9WgXcQ'}/hqdefault.jpg`}
                  alt={vid.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <button
                  type="button"
                  onClick={() => {
                    setWatchingVideo(vid)
                    setWatchModalOpen(true)
                  }}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                  title="Assistir vídeo"
                >
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </button>
                <div className="absolute top-2 left-2">
                  <Badge className="bg-black/80 text-white text-[10px] uppercase font-bold backdrop-blur-xs">
                    {vid.modulo}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge
                    className={
                      vid.ativo
                        ? 'bg-emerald-600 text-white text-[10px]'
                        : 'bg-gray-600 text-white text-[10px]'
                    }
                  >
                    {vid.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                    {vid.titulo}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {vid.descricao}
                  </p>
                </div>

                <div className="pt-2 border-t space-y-1.5">
                  {vid.palavras_chave && (
                    <div className="text-[10px] text-gray-400 truncate">
                      <span className="font-semibold text-gray-500">Palavras-chave:</span>{' '}
                      {vid.palavras_chave}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>
                      Recomendações:{' '}
                      <strong className="text-gray-900">{vid.recomendacoes_count || 0}</strong>
                    </span>
                    <span>
                      Visualizações:{' '}
                      <strong className="text-gray-900">{vid.visualizacoes || 0}</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={vid.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      YouTube
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(vid)}
                        className="h-7 w-7 p-0 text-gray-600 hover:text-[#005B2E]"
                        title="Editar cadastro"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVideo(vid.id, vid.titulo)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        title="Excluir da Universidade"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO DE VÍDEO COM EMBED DE PRÉ-VISUALIZAÇÃO */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center gap-2 text-[#005B2E]">
              <Youtube className="w-5 h-5 text-red-600" />
              <DialogTitle className="text-base font-bold text-gray-900">
                {editingId
                  ? 'Editar Vídeo da Universidade HURAM'
                  : 'Cadastrar Vídeo de Treinamento'}
              </DialogTitle>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Aceita apenas links válidos do YouTube. O vídeo poderá ser recomendado pelo assistente
              HURAM On-line.
            </p>
          </DialogHeader>

          <form onSubmit={handleSaveVideo} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Título do Treinamento *</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Como cadastrar clientes"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Link do YouTube *</Label>
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                className="h-9 text-xs font-mono"
                required
              />
              <p className="text-[11px] text-gray-400">
                Insira a URL completa do vídeo público ou não-listado.
              </p>
            </div>

            {/* PREVIEW EMBED MANDATÓRIO */}
            <div className="border rounded-xl p-3 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#005B2E]" />
                  Visualização Prévia (Embed):
                </span>
                {previewId ? (
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Vídeo Válido (ID: {previewId})
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Aguardando link válido
                  </span>
                )}
              </div>

              {previewId ? (
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner">
                  <iframe
                    src={`https://www.youtube.com/embed/${previewId}`}
                    title="Pré-visualização do Treinamento"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                  Insira uma URL do YouTube acima para visualizar antes de salvar.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Módulo Relacionado *</Label>
                <select
                  value={modulo}
                  onChange={(e) => setModulo(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#005B2E]"
                >
                  {MODULOS_DISPONIVEIS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Assunto / Tópico</Label>
                <Input
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Ex: Cadastro de Clientes e Limite de Crédito"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Descrição do Conteúdo</Label>
              <Textarea
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Passo a passo ensinado no vídeo..."
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Palavras-chave para recomendação da IA
              </Label>
              <Input
                value={palavrasChave}
                onChange={(e) => setPalavrasChave(e.target.value)}
                placeholder="cadastrar cliente, limite de credito, parceiro comercial, cnpj (separadas por vírgula)"
                className="h-9 text-xs"
              />
              <p className="text-[11px] text-gray-400">
                A IA analisa estes termos quando o usuário perguntar como fazer algo no ERP.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                  Rota da Tela Associada
                </Label>
                <Input
                  value={rotaRelacionada}
                  onChange={(e) => setRotaRelacionada(e.target.value)}
                  placeholder="/admin/cadastros/clientes"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Ordem de Exibição</Label>
                <Input
                  type="number"
                  value={ordem}
                  onChange={(e) => setOrdem(Number(e.target.value))}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Status</Label>
                <select
                  value={ativo ? 'true' : 'false'}
                  onChange={(e) => setAtivo(e.target.value === 'true')}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#005B2E]"
                >
                  <option value="true">Ativo (visível e recomendável)</option>
                  <option value="false">Inativo (oculto)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving || !previewId}
                className="bg-[#005B2E] hover:bg-[#004724] text-white text-xs font-bold"
              >
                {saving ? 'Gravando...' : editingId ? 'Atualizar Vídeo' : 'Cadastrar Vídeo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL PARA ASSISTIR VÍDEO COMPLETO */}
      <Dialog open={watchModalOpen} onOpenChange={setWatchModalOpen}>
        <DialogContent className="max-w-3xl p-6">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold text-gray-900">
              {watchingVideo?.titulo}
            </DialogTitle>
            <p className="text-xs text-gray-500">
              Módulo: {watchingVideo?.modulo}{' '}
              {watchingVideo?.assunto ? `· ${watchingVideo?.assunto}` : ''}
            </p>
          </DialogHeader>

          {watchingVideo && (
            <div className="space-y-3 pt-2">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner">
                <iframe
                  src={`https://www.youtube.com/embed/${watchingVideo.youtube_id || extractYoutubeId(watchingVideo.youtube_url)}`}
                  title={watchingVideo.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
              <p className="text-xs text-gray-700 leading-relaxed bg-slate-50 p-3 rounded-lg border">
                {watchingVideo.descricao}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

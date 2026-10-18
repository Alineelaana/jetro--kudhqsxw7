import { useState, useEffect, useRef } from 'react'
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Instagram,
  Upload,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  getAllSiteClientsAdmin,
  createSiteClient,
  updateSiteClient,
  deleteSiteClient,
  getSiteClientLogoUrl,
  resolveSiteClientLogoUrl,
  type SiteClient,
} from '@/services/site-clients'
import { normalizeInstagramHandle, buildInstagramUrl } from '@/services/site-testimonials'

export default function SiteClientsAdmin() {
  const { toast } = useToast()
  const { userRole } = useAuth()
  const [clients, setClients] = useState<SiteClient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Dialog Form (Novo / Editar)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<SiteClient | null>(null)
  const [nome, setNome] = useState('')
  const [site, setSite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [ordem, setOrdem] = useState<number>(1)
  const [ativo, setAtivo] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Dialog Confirmação de Exclusão
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAllSiteClientsAdmin()
      setClients(data)
    } catch (err) {
      console.error('Erro ao carregar clientes do site:', err)
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível buscar a lista de clientes.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreateDialog = () => {
    setEditingClient(null)
    setNome('')
    setSite('')
    setInstagram('')
    setOrdem(clients.length + 1)
    setAtivo(true)
    setLogoFile(null)
    setLogoPreview(null)
    setDialogOpen(true)
  }

  const openEditDialog = (c: SiteClient) => {
    setEditingClient(c)
    setNome(c.nome)
    setSite(c.site || '')
    setInstagram(c.instagram || '')
    setOrdem(c.ordem || 1)
    setAtivo(c.ativo !== false)
    setLogoFile(null)
    setLogoPreview(resolveSiteClientLogoUrl(c))
    setDialogOpen(true)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowed.includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Selecione uma imagem JPG, PNG, WEBP ou SVG.',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O logotipo deve ter no máximo 5MB.',
        variant: 'destructive',
      })
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe o nome da empresa parceira.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('nome', nome.trim())
      formData.append('site', site.trim())
      formData.append('instagram', normalizeInstagramHandle(instagram))
      formData.append('ordem', String(ordem || 1))
      formData.append('ativo', String(ativo))

      if (logoFile) {
        formData.append('logo', logoFile)
      }

      if (editingClient) {
        await updateSiteClient(editingClient.id, formData)
        toast({
          title: 'Cliente atualizado',
          description: `As alterações em "${nome}" já refletem no site institucional.`,
        })
      } else {
        await createSiteClient(formData)
        toast({
          title: 'Cliente cadastrado',
          description: `A empresa "${nome}" foi incluída na vitrine com sucesso.`,
        })
      }

      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err)
      toast({
        title: 'Erro ao salvar',
        description: err?.message || 'Falha ao gravar informações do cliente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (c: SiteClient) => {
    try {
      const novoStatus = !c.ativo
      await updateSiteClient(c.id, { ativo: novoStatus })
      setClients((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, ativo: novoStatus } : item)),
      )
      toast({
        title: novoStatus ? 'Exibição ativada' : 'Exibição pausada',
        description: `${c.nome} foi ${novoStatus ? 'ativado' : 'desativado'} da vitrine pública.`,
      })
    } catch (err) {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível alterar a visibilidade.',
        variant: 'destructive',
      })
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteSiteClient(deleteId)
      toast({
        title: 'Cliente removido',
        description: 'O registro foi excluído da base e da vitrine do site.',
      })
      setDeleteId(null)
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível remover este cliente.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const filteredClients = clients.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.instagram && c.instagram.toLowerCase().includes(search.toLowerCase())) ||
      (c.site && c.site.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho da página administrativa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-2xl p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#005B2E]/10 text-[#005B2E]">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Clientes do Site Institucional
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gerencie os parceiros e empresas exibidos na seção "Nossos Clientes" do site (/site). As
            alterações refletem automaticamente.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-10 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            type="button"
            onClick={openCreateDialog}
            className="h-10 bg-[#005B2E] hover:bg-[#004824] text-white font-bold text-xs px-4 rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Cadastrar Empresa
          </Button>
        </div>
      </div>

      {/* Barra de Busca e Métricas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar empresa por nome, site ou instagram..."
            className="pl-9 h-11 text-xs sm:text-sm bg-card"
          />
        </div>
        <div className="flex items-center justify-around bg-card border rounded-xl px-4 py-2 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">
              Total
            </span>
            <span className="text-base font-extrabold text-foreground">{clients.length}</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">
              Ativos
            </span>
            <span className="text-base font-extrabold text-emerald-600">
              {clients.filter((c) => c.ativo !== false).length}
            </span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">
              Pausados
            </span>
            <span className="text-base font-extrabold text-amber-600">
              {clients.filter((c) => c.ativo === false).length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de Empresas */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-muted/50 border-b text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Ordem</th>
                <th className="py-3.5 px-4 w-20">Logo</th>
                <th className="py-3.5 px-4">Empresa</th>
                <th className="py-3.5 px-4">Site Oficial</th>
                <th className="py-3.5 px-4">Instagram</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#005B2E]" />
                    Carregando empresas cadastradas...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Nenhuma empresa encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const logoUrl = resolveSiteClientLogoUrl(client)
                  const isAtivo = client.ativo !== false
                  const instaUrl = client.instagram ? buildInstagramUrl(client.instagram) : ''

                  return (
                    <tr key={client.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Ordem */}
                      <td className="py-3 px-4 text-center font-bold text-muted-foreground">
                        <Badge variant="outline" className="font-mono text-xs">
                          #{client.ordem ?? 1}
                        </Badge>
                      </td>

                      {/* Logotipo */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-lg bg-black/5 dark:bg-white/5 border flex items-center justify-center p-1 overflow-hidden">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={client.nome}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-muted-foreground/60" />
                          )}
                        </div>
                      </td>

                      {/* Nome da Empresa */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground text-sm">{client.nome}</div>
                        <div className="text-[11px] text-muted-foreground">
                          ID: <span className="font-mono">{client.id}</span>
                        </div>
                      </td>

                      {/* Site */}
                      <td className="py-3 px-4">
                        {client.site ? (
                          <a
                            href={client.site}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#005B2E] hover:underline font-medium text-xs truncate max-w-[200px]"
                          >
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {client.site.replace(/^https?:\/\//, '')}
                            </span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">
                            Não informado
                          </span>
                        )}
                      </td>

                      {/* Instagram */}
                      <td className="py-3 px-4">
                        {client.instagram ? (
                          <a
                            href={instaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-400 hover:underline font-medium text-xs"
                          >
                            <Instagram className="w-3.5 h-3.5 shrink-0" />
                            <span>@{client.instagram.replace(/^@/, '')}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">—</span>
                        )}
                      </td>

                      {/* Status / Switch */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(client)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            isAtivo
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200'
                          }`}
                          title="Clique para alternar a visibilidade no site"
                        >
                          {isAtivo ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-600" />
                              Ativo no Site
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-zinc-500" />
                              Pausado
                            </>
                          )}
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(client)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Editar empresa"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(client.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Remover empresa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastrar / Editar Empresa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#005B2E]" />
              {editingClient ? 'Editar Empresa Parceira' : 'Cadastrar Nova Empresa'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Preencha os dados da empresa para exibição na seção "Nossos Clientes" do site
              institucional.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            {/* Nome da Empresa */}
            <div className="space-y-1.5">
              <Label htmlFor="cliente-nome" className="text-xs font-semibold">
                Nome da Empresa *
              </Label>
              <Input
                id="cliente-nome"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: DEC Eldorado"
                className="h-10 text-sm"
              />
            </div>

            {/* Logotipo com Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Logotipo Oficial</span>
                <span className="text-[11px] text-muted-foreground">JPG, PNG, WEBP ou SVG</span>
              </Label>
              <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20">
                <div className="w-16 h-16 rounded-lg border bg-background flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Prévia logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-muted-foreground/50" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="cliente-logo"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 text-xs font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1 text-[#005B2E]" />
                      {logoPreview ? 'Substituir logo' : 'Enviar logo'}
                    </Button>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLogoFile(null)
                          setLogoPreview(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Se nenhum logotipo for enviado, será exibido o nome com tipografia elegante.
                  </p>
                </div>
              </div>
            </div>

            {/* Grid Site e Instagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cliente-site" className="text-xs font-semibold">
                  Site Institucional
                </Label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="cliente-site"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    placeholder="https://empresa.com.br"
                    className="pl-9 h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cliente-insta" className="text-xs font-semibold">
                  Instagram Oficial
                </Label>
                <div className="relative">
                  <Instagram className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="cliente-insta"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@nomedaempresa"
                    className="pl-9 h-10 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Grid Ordem e Ativo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="cliente-ordem" className="text-xs font-semibold">
                  Ordem de Exibição
                </Label>
                <Input
                  id="cliente-ordem"
                  type="number"
                  min={1}
                  value={ordem}
                  onChange={(e) => setOrdem(Number(e.target.value))}
                  className="h-10 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                  <span className="text-xs font-semibold text-foreground">Exibição pública</span>
                  <Switch checked={ativo} onCheckedChange={setAtivo} />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#005B2E] hover:bg-[#004824] text-white font-bold text-xs px-5 shadow-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Empresa'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Exclusão */}
      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Remover Empresa da Vitrine
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Esta ação removerá a empresa da vitrine pública do site institucional. Deseja
              confirmar a exclusão?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              disabled={deleting}
              className="text-xs font-bold"
            >
              {deleting ? 'Excluindo...' : 'Confirmar Remoção'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

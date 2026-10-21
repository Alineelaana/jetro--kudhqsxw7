import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { useBrand, getFileUrl } from '@/hooks/use-brand'
import { listConfig, updateConfig, createConfig } from '@/services/configuracoes'
import { updateCadastroFormData } from '@/services/cadastros'
import {
  Loader2,
  Save,
  Building2,
  Plus,
  Palette,
  Upload,
  Lock,
  User,
  Eye,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { logoHuramDark, HURAM_PALETTE } from '@/lib/brand-assets'

const EMPRESA_FIELDS = [
  { name: 'razao_social', label: 'Razão Social' },
  { name: 'nome_fantasia', label: 'Nome Fantasia' },
  { name: 'cnpj', label: 'CNPJ' },
  { name: 'inscricao_estadual', label: 'Inscrição Estadual' },
  { name: 'inscricao_municipal', label: 'Inscrição Municipal' },
  { name: 'regime_tributario', label: 'Regime Tributário' },
  { name: 'address', label: 'Endereço' },
  { name: 'city', label: 'Cidade' },
  { name: 'state', label: 'Estado' },
  { name: 'cep', label: 'CEP' },
  { name: 'phone', label: 'Telefone' },
  { name: 'email', label: 'E-mail' },
  { name: 'site', label: 'Site' },
  { name: 'responsavel_legal', label: 'Responsável Legal' },
  { name: 'contador', label: 'Contador' },
  { name: 'moeda_padrao', label: 'Moeda Padrão' },
  { name: 'fuso_horario', label: 'Fuso Horário' },
  { name: 'formato_data', label: 'Formato de Data' },
]

export function EmpresaScreen() {
  const { user } = useAuth()
  const [empresas, setEmpresas] = useState<any[]>([])
  const [filiais, setFiliais] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState<Record<string, string | boolean>>({})
  const { refreshBrand } = useBrand()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'empresa' | 'marca' | 'filiais'>('empresa')

  // Estado da aba Marca
  const [marcaNomeExibicao, setMarcaNomeExibicao] = useState('')
  const [marcaCorPrimaria, setMarcaCorPrimaria] = useState(HURAM_PALETTE.green)
  const [marcaCorSecundaria, setMarcaCorSecundaria] = useState(HURAM_PALETTE.gold)
  const [marcaPadrao, setMarcaPadrao] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      const emp = await listConfig('empresas', 'name')
      setEmpresas(emp)
      const fil = await listConfig('filiais', 'name')
      setFiliais(fil)
      if (emp.length && !selectedId) setSelectedId(emp[0].id)
    } catch {
      setEmpresas([])
      setFiliais([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('empresas', () => load())
  useRealtime('filiais', () => load())

  useEffect(() => {
    if (selectedId) {
      const emp = empresas.find((e) => e.id === selectedId)
      if (emp) {
        setForm({ ...emp })
        setMarcaNomeExibicao(emp.marca_nome_exibicao || emp.nome_fantasia || emp.name || '')
        setMarcaCorPrimaria(emp.marca_cor_primaria || HURAM_PALETTE.green)
        setMarcaCorSecundaria(emp.marca_cor_secundaria || HURAM_PALETTE.gold)
        setMarcaPadrao(!!emp.padrao)
        setLogoFile(null)
        if (emp.marca_logo) {
          setLogoPreviewUrl(getFileUrl('empresas', emp.id, emp.marca_logo))
        } else if (emp.logo) {
          setLogoPreviewUrl(getFileUrl('empresas', emp.id, emp.logo))
        } else {
          setLogoPreviewUrl('')
        }
      }
    }
  }, [selectedId, empresas])

  const handleSave = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      await updateConfig('empresas', selectedId, form)
      await refreshBrand()
      toast({ title: 'Dados da empresa atualizados!' })
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const preview = URL.createObjectURL(file)
      setLogoPreviewUrl(preview)
    }
  }

  const handleResetMarcaPadrao = () => {
    const emp = empresas.find((e) => e.id === selectedId)
    setMarcaNomeExibicao(emp?.nome_fantasia || emp?.name || 'HURAM')
    setMarcaCorPrimaria(HURAM_PALETTE.green)
    setMarcaCorSecundaria(HURAM_PALETTE.gold)
    setLogoFile(null)
    setLogoPreviewUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSaveMarca = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('marca_nome_exibicao', marcaNomeExibicao.trim())
      fd.append('marca_cor_primaria', marcaCorPrimaria.trim())
      fd.append('marca_cor_secundaria', marcaCorSecundaria.trim())
      fd.append('padrao', String(marcaPadrao))

      if (logoFile) {
        fd.append('marca_logo', logoFile)
      }

      await updateCadastroFormData('empresas', selectedId, fd)
      await refreshBrand()
      await load()
      toast({ title: 'Marca personalizada salva com sucesso!' })
    } catch {
      toast({ title: 'Erro ao salvar personalização de marca', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleNewFilial = async () => {
    try {
      await createConfig('filiais', {
        name: 'Nova Filial',
        empresa_name: form.name || '',
        active: true,
        responsible_user: (user?.name as string) || 'Sistema',
      })
      toast({ title: 'Filial criada' })
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-foreground flex items-center gap-2">
        <Building2 className="w-5 h-5 text-[#005B2E]" /> Dados da Empresa
      </h2>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={tab === 'empresa' ? 'default' : 'outline'}
          onClick={() => setTab('empresa')}
          className={
            tab === 'empresa'
              ? 'bg-[#005B2E] text-white font-bold'
              : 'border-[#005B2E] text-[#005B2E]'
          }
        >
          <Building2 className="w-4 h-4 mr-1.5" /> Empresa
        </Button>
        <Button
          size="sm"
          variant={tab === 'marca' ? 'default' : 'outline'}
          onClick={() => setTab('marca')}
          className={
            tab === 'marca'
              ? 'bg-[#005B2E] text-white font-bold'
              : 'border-[#005B2E] text-[#005B2E]'
          }
        >
          <Palette className="w-4 h-4 mr-1.5" /> Marca & Identidade
        </Button>
        <Button
          size="sm"
          variant={tab === 'filiais' ? 'default' : 'outline'}
          onClick={() => setTab('filiais')}
          className={
            tab === 'filiais'
              ? 'bg-[#005B2E] text-white font-bold'
              : 'border-[#005B2E] text-[#005B2E]'
          }
        >
          Filiais
        </Button>
      </div>
      {tab === 'empresa' && (
        <>
          <Select_placeholder value={selectedId} onChange={setSelectedId} empresas={empresas} />
          {selectedId && (
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {EMPRESA_FIELDS.map((f) => (
                    <div key={f.name} className="space-y-1">
                      <Label className="text-sm font-semibold">{f.label}</Label>
                      <Input
                        value={String(form[f.name] || '')}
                        onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                        className="focus-visible:ring-[#005B2E]"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={form.active !== false}
                      onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
                      className="data-[state=checked]:bg-[#005B2E]"
                    />
                    <Label className="font-semibold">
                      {form.active !== false ? 'Ativo' : 'Inativo'}
                    </Label>
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}{' '}
                  Salvar
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {tab === 'marca' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">
                Empresa selecionada:
              </span>
              <Select_placeholder value={selectedId} onChange={setSelectedId} empresas={empresas} />
            </div>
            <div className="text-xs text-muted-foreground">
              Personalize o logo, cores e nome para conferir ao cliente a sensação de sistema
              próprio.
            </div>
          </div>

          {selectedId && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Formulário de Configuração de Marca */}
              <Card className="lg:col-span-6 border-2 border-[#005B2E]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-[#005B2E]">
                    <Palette className="w-4 h-4" /> Configuração da Marca
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Estes dados definem o visual da tela de login e os destaques do ERP para esta
                    empresa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Nome de Exibição */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">
                      Nome de Exibição da Marca (Curto)
                    </Label>
                    <Input
                      value={marcaNomeExibicao}
                      onChange={(e) => setMarcaNomeExibicao(e.target.value)}
                      placeholder="Ex: DEC ELDORADO ou GRAN ROMANO"
                      className="focus-visible:ring-[#005B2E]"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Aparece no cabeçalho do login, no título da janela e nas áreas de boas-vindas.
                    </p>
                  </div>

                  {/* Upload do Logo */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Logomarca da Empresa</Label>
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="marca-logo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-[#005B2E]/40 text-[#005B2E] hover:bg-[#005B2E]/5"
                      >
                        <Upload className="w-4 h-4 mr-2" /> Escolher Logo...
                      </Button>
                      {logoFile ? (
                        <span className="text-xs text-emerald-600 font-semibold truncate max-w-[200px]">
                          {logoFile.name}
                        </span>
                      ) : logoPreviewUrl ? (
                        <span className="text-xs text-muted-foreground font-medium">
                          Logo configurado
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Nenhum logo enviado</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Formatos recomendados: PNG transparente ou SVG, altura mínima de 80px.
                    </p>
                  </div>

                  {/* Cores: Primária e Secundária */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Cor Primária</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={marcaCorPrimaria.startsWith('#') ? marcaCorPrimaria : '#063D30'}
                          onChange={(e) => setMarcaCorPrimaria(e.target.value)}
                          className="w-10 h-10 p-0.5 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={marcaCorPrimaria}
                          onChange={(e) => setMarcaCorPrimaria(e.target.value)}
                          placeholder="#063D30"
                          className="font-mono text-xs uppercase focus-visible:ring-[#005B2E]"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Usada nos botões principais, cabeçalho e destaques.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Cor Secundária</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={
                            marcaCorSecundaria.startsWith('#') ? marcaCorSecundaria : '#C69B45'
                          }
                          onChange={(e) => setMarcaCorSecundaria(e.target.value)}
                          className="w-10 h-10 p-0.5 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={marcaCorSecundaria}
                          onChange={(e) => setMarcaCorSecundaria(e.target.value)}
                          placeholder="#C69B45"
                          className="font-mono text-xs uppercase focus-visible:ring-[#005B2E]"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Usada em bordas douradas/destaque, badges e ícones de ênfase.
                      </p>
                    </div>
                  </div>

                  {/* Paletas Sugeridas */}
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Sugestões de Paleta Rápidas:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMarcaCorPrimaria('#063D30')
                          setMarcaCorSecundaria('#C69B45')
                        }}
                        className="px-2 py-1 text-xs border rounded-md flex items-center gap-1.5 hover:bg-muted"
                      >
                        <span className="w-3 h-3 rounded-full bg-[#063D30]" />
                        <span className="w-3 h-3 rounded-full bg-[#C69B45]" />
                        <span>HURAM Oficial</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMarcaCorPrimaria('#0F4C81')
                          setMarcaCorSecundaria('#F5A623')
                        }}
                        className="px-2 py-1 text-xs border rounded-md flex items-center gap-1.5 hover:bg-muted"
                      >
                        <span className="w-3 h-3 rounded-full bg-[#0F4C81]" />
                        <span className="w-3 h-3 rounded-full bg-[#F5A623]" />
                        <span>Azul Clássico</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMarcaCorPrimaria('#7C2D12')
                          setMarcaCorSecundaria('#FBBF24')
                        }}
                        className="px-2 py-1 text-xs border rounded-md flex items-center gap-1.5 hover:bg-muted"
                      >
                        <span className="w-3 h-3 rounded-full bg-[#7C2D12]" />
                        <span className="w-3 h-3 rounded-full bg-[#FBBF24]" />
                        <span>Terracota & Ouro</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMarcaCorPrimaria('#1E293B')
                          setMarcaCorSecundaria('#06B6D4')
                        }}
                        className="px-2 py-1 text-xs border rounded-md flex items-center gap-1.5 hover:bg-muted"
                      >
                        <span className="w-3 h-3 rounded-full bg-[#1E293B]" />
                        <span className="w-3 h-3 rounded-full bg-[#06B6D4]" />
                        <span>Grafite & Ciano</span>
                      </button>
                    </div>
                  </div>

                  {/* Empresa Padrão do Sistema */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-[#F8FAF9]">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#005B2E]" /> Definir como Empresa
                        Padrão
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Sua marca será aplicada na tela de login quando o visitante não estiver
                        identificado.
                      </p>
                    </div>
                    <Switch
                      checked={marcaPadrao}
                      onCheckedChange={setMarcaPadrao}
                      className="data-[state=checked]:bg-[#005B2E]"
                    />
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResetMarcaPadrao}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restaurar Padrão HURAM
                    </Button>
                    <Button
                      onClick={handleSaveMarca}
                      disabled={saving}
                      className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Salvar Marca
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview ao Vivo da Tela de Login */}
              <div className="lg:col-span-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                    <Eye className="w-4 h-4 text-[#005B2E]" /> Preview ao Vivo — Tela de Login
                  </h3>
                  <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Simulação em tempo real
                  </span>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gradient-to-b from-gray-50 to-white shadow-inner flex flex-col items-center justify-center min-h-[460px]">
                  {/* Card Simulado da Tela de Login */}
                  <div className="w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200 bg-white">
                    {/* Header do Card com cor primária e secundária */}
                    <div
                      className="p-5 text-center flex flex-col items-center transition-colors duration-200"
                      style={{
                        backgroundColor: marcaCorPrimaria || HURAM_PALETTE.green,
                        borderBottom: `2px solid ${marcaCorSecundaria || HURAM_PALETTE.gold}`,
                        color: '#FFFFFF',
                      }}
                    >
                      <div className="relative mb-2">
                        <img
                          src={logoPreviewUrl || logoHuramDark}
                          alt="Logo da Marca"
                          className="h-16 w-auto max-w-[180px] object-contain rounded-xl p-1 bg-black/20 shadow-md"
                        />
                      </div>
                      <h4 className="text-base font-bold flex items-center justify-center gap-1.5 mt-1">
                        <Lock
                          className="w-4 h-4"
                          style={{ color: marcaCorSecundaria || HURAM_PALETTE.gold }}
                        />
                        Acesso ao Sistema — {marcaNomeExibicao || 'HURAM'}
                      </h4>
                      <p className="text-[11px] opacity-85 mt-0.5 font-medium">
                        Sistema Inteligente de Gestão
                      </p>
                    </div>

                    {/* Conteúdo simulado do login */}
                    <div className="p-4 space-y-3">
                      <div className="space-y-1 text-left">
                        <span className="text-[11px] font-semibold text-gray-700">
                          Usuário ou E-mail
                        </span>
                        <div className="relative">
                          <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <div className="pl-8 h-8 rounded-md border border-gray-200 bg-gray-50 text-xs flex items-center text-gray-400">
                            exemplo@empresa.com.br
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <span className="text-[11px] font-semibold text-gray-700">Senha</span>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <div className="pl-8 h-8 rounded-md border border-gray-200 bg-gray-50 text-xs flex items-center text-gray-400">
                            ••••••••••••
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled
                        className="w-full text-white font-bold text-xs py-2 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-default mt-2"
                        style={{
                          backgroundColor: marcaCorPrimaria || HURAM_PALETTE.green,
                        }}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Entrar no Sistema
                      </button>

                      <div className="text-center pt-1">
                        <span
                          className="text-[10px] font-semibold cursor-default"
                          style={{ color: marcaCorPrimaria || HURAM_PALETTE.green }}
                        >
                          Esqueceu a senha?
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground mt-3 text-center">
                    Visualização de como seus colaboradores e clientes verão a identidade da empresa
                    ao acessar.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'filiais' && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Filiais</h3>
              <Button
                size="sm"
                onClick={handleNewFilial}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                <Plus className="w-4 h-4 mr-1" /> Nova Filial
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#01361D] text-white">
                    <th className="text-left px-3 py-2 font-bold">Nome</th>
                    <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Empresa</th>
                    <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Cidade</th>
                    <th className="text-left px-3 py-2 font-bold">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {filiais.map((f) => (
                    <tr key={f.id} className="border-b hover:bg-[#005B2E]/5">
                      <td className="px-3 py-2 font-medium">{f.name || '—'}</td>
                      <td className="px-3 py-2 hidden md:table-cell">{f.empresa_name || '—'}</td>
                      <td className="px-3 py-2 hidden md:table-cell">{f.city || '—'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded',
                            f.active !== false
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600',
                          )}
                        >
                          {f.active !== false ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Select_placeholder({
  value,
  onChange,
  empresas,
}: {
  value: string
  onChange: (v: string) => void
  empresas: any[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:w-64 h-9 rounded-md border border-gray-200 px-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#005B2E]"
    >
      {empresas.map((e) => (
        <option key={e.id} value={e.id}>
          {e.name || e.razao_social || 'Sem nome'}
        </option>
      ))}
    </select>
  )
}

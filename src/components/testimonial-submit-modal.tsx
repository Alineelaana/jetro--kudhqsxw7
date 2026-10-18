import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  X,
  Camera,
  ShieldCheck,
  Building2,
  AtSign,
} from 'lucide-react'
import { submitPublicTestimonial, normalizeInstagramHandle } from '@/services/site-testimonials'

interface TestimonialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TestimonialSubmitModal({ open, onOpenChange }: TestimonialModalProps) {
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')
  const [depoimento, setDepoimento] = useState('')
  const [autorizacao, setAutorizacao] = useState(false)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

  // Honeypot anti-spam (invisível para humanos)
  const [honeypot, setHoneypot] = useState('')

  const [termosOpen, setTermosOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erroMsg, setErroMsg] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo MIME
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setErroMsg('Por favor, anexe uma imagem nos formatos JPG, JPEG, PNG ou WEBP.')
      return
    }

    // Limite de 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErroMsg('A foto deve ter no máximo 5MB.')
      return
    }

    setErroMsg(null)
    setFotoFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setFotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setFotoFile(null)
    setFotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const isFormValid =
    nome.trim().length >= 3 &&
    empresa.trim().length >= 2 &&
    email.trim().includes('@') &&
    instagram.trim().length >= 2 &&
    depoimento.trim().length >= 10 &&
    autorizacao

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || loading) return

    setLoading(true)
    setErroMsg(null)

    try {
      const formData = new FormData()
      formData.append('nome_autor', nome.trim())
      formData.append('empresa', empresa.trim())
      formData.append('email', email.trim().toLowerCase())
      formData.append('instagram', normalizeInstagramHandle(instagram))
      formData.append('depoimento', depoimento.trim())
      formData.append('autorizacao_confirmada', 'true')
      formData.append('autorizacao_versao', 'v1.0-2026')
      formData.append('autorizacao_data', new Date().toISOString())

      // Campo de proteção spam honeypot
      if (honeypot) {
        formData.append('website_trap', honeypot)
      }

      if (fotoFile) {
        formData.append('foto', fotoFile)
      }

      await submitPublicTestimonial(formData)
      setSucesso(true)
    } catch (err: any) {
      console.error('Falha ao enviar depoimento:', err)
      setErroMsg(
        err?.message ||
          'Não foi possível registrar seu depoimento no momento. Por favor, tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNome('')
    setEmpresa('')
    setEmail('')
    setInstagram('')
    setDepoimento('')
    setAutorizacao(false)
    setFotoFile(null)
    setFotoPreview(null)
    setHoneypot('')
    setErroMsg(null)
    setSucesso(false)
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) resetForm()
          onOpenChange(v)
        }}
      >
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[#001c10] border border-[#C9A227]/40 text-white p-6 sm:p-8 rounded-2xl shadow-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />
              Deixe seu depoimento sobre o Jetro
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs sm:text-sm">
              Sua opinião e experiência como parceiro fortalecem a comunidade de clientes do Jetro.
              Preencha os campos abaixo.
            </DialogDescription>
          </DialogHeader>

          {sucesso ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Depoimento recebido com sucesso!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                Obrigado por compartilhar sua experiência com o Jetro! Seu depoimento foi recebido e
                será analisado pela nossa equipe antes da publicação.
              </p>
              <div className="pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    resetForm()
                    onOpenChange(false)
                  }}
                  className="bg-[#005B2E] hover:bg-[#004824] text-white font-bold px-8 h-10 shadow-lg"
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {erroMsg && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{erroMsg}</span>
                </div>
              )}

              {/* Honeypot invisível para bots */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website_trap"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Grid: Nome e Empresa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="depoimento-nome" className="text-xs font-semibold text-slate-200">
                    Nome completo *
                  </Label>
                  <Input
                    id="depoimento-nome"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="bg-black/40 border-white/15 focus:border-[#C9A227] text-white placeholder:text-slate-500 h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="depoimento-empresa"
                    className="text-xs font-semibold text-slate-200"
                  >
                    Nome da empresa *
                  </Label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="depoimento-empresa"
                      required
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      placeholder="Empresa parceira"
                      className="bg-black/40 border-white/15 focus:border-[#C9A227] text-white placeholder:text-slate-500 h-10 text-sm pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Grid: E-mail e Instagram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="depoimento-email"
                      className="text-xs font-semibold text-slate-200"
                    >
                      E-mail *
                    </Label>
                    <span className="text-[10px] text-slate-400">Nunca público</span>
                  </div>
                  <Input
                    id="depoimento-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className="bg-black/40 border-white/15 focus:border-[#C9A227] text-white placeholder:text-slate-500 h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="depoimento-instagram"
                    className="text-xs font-semibold text-slate-200"
                  >
                    Instagram da empresa *
                  </Label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="depoimento-instagram"
                      required
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@minhaempresa ou link"
                      className="bg-black/40 border-white/15 focus:border-[#C9A227] text-white placeholder:text-slate-500 h-10 text-sm pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Caixa de Texto do Depoimento */}
              <div className="space-y-1.5">
                <Label htmlFor="depoimento-texto" className="text-xs font-semibold text-slate-200">
                  Seu depoimento sobre o Jetro *
                </Label>
                <Textarea
                  id="depoimento-texto"
                  required
                  rows={4}
                  value={depoimento}
                  onChange={(e) => setDepoimento(e.target.value)}
                  placeholder="Compartilhe como o Jetro transformou a rotina, processos ou tomada de decisão na sua empresa..."
                  className="bg-black/40 border-white/15 focus:border-[#C9A227] text-white placeholder:text-slate-500 text-sm resize-none"
                />
              </div>

              {/* Anexar Foto com Prévia */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Anexar foto (sua ou da equipe)</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG ou WEBP até 5MB</span>
                </Label>

                <div className="flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-white/15">
                  {fotoPreview ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#C9A227] shrink-0">
                      <img
                        src={fotoPreview}
                        alt="Prévia da foto"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white"
                        title="Remover foto"
                      >
                        <X className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="depoimento-foto"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 text-xs border-white/20 bg-white/5 hover:bg-white/10 text-white"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5 text-[#C9A227]" />
                        {fotoFile ? 'Alterar foto' : 'Selecionar arquivo'}
                      </Button>
                      {fotoFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removePhoto}
                          className="h-8 text-xs text-red-300 hover:text-red-200 hover:bg-red-500/10"
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                    {fotoFile && (
                      <p className="text-[11px] text-slate-300 truncate mt-1">
                        {fotoFile.name} ({(fotoFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkbox de Autorização de Publicação (LGPD) */}
              <div className="pt-2 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="depoimento-autorizacao"
                    checked={autorizacao}
                    onCheckedChange={(checked) => setAutorizacao(Boolean(checked))}
                    className="mt-0.5 border-[#C9A227] data-[state=checked]:bg-[#005B2E] data-[state=checked]:border-[#C9A227]"
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="depoimento-autorizacao"
                      className="text-xs text-slate-200 leading-snug cursor-pointer select-none font-medium block"
                    >
                      Autorizo a publicação do meu depoimento, nome, empresa, foto enviada e perfil
                      de Instagram no site institucional do Jetro, conforme a Política de
                      Privacidade e os termos de autorização apresentados.
                    </label>
                    <button
                      type="button"
                      onClick={() => setTermosOpen(true)}
                      className="text-[11px] text-[#f6d77c] hover:underline font-semibold flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-[#C9A227]" />
                      Consultar condições completas da autorização
                    </button>
                  </div>
                </div>
              </div>

              {/* Botão de Envio */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="text-xs text-slate-300 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="h-11 px-6 bg-[#005B2E] hover:bg-[#004824] disabled:bg-white/10 disabled:text-slate-500 text-white font-bold text-sm shadow-xl transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#C9A227]" />
                      Gravando depoimento...
                    </>
                  ) : (
                    'Enviar Depoimento'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal com as condições completas de autorização LGPD */}
      <Dialog open={termosOpen} onOpenChange={setTermosOpen}>
        <DialogContent className="sm:max-w-lg bg-[#001c10] border border-[#C9A227]/40 text-white p-6 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
              Condições de Autorização para Depoimento (LGPD)
            </DialogTitle>
          </DialogHeader>
          <div className="text-xs text-slate-300 space-y-3 max-h-[60vh] overflow-y-auto pr-2 leading-relaxed">
            <p>
              <strong>1. Finalidade:</strong> Os dados fornecidos (nome, empresa, foto, depoimento e
              identificador de Instagram) serão utilizados exclusivamente para divulgação
              institucional da experiência de clientes e parceiros no site do Jetro.
            </p>
            <p>
              <strong>2. Alcance público:</strong> Ao autorizar, você concorda que o seu depoimento,
              nome, empresa, foto e perfil de Instagram ficarão visíveis publicamente a visitantes
              do site institucional do Jetro após moderação prévia.
            </p>
            <p>
              <strong>3. Proteção do e-mail:</strong> O seu endereço de e-mail é coletado
              estritamente para confirmação administrativa, prevenção contra abusos e eventual
              contato direto da equipe Jetro. Ele <em>nunca</em> será divulgado publicamente nem
              repassado a terceiros.
            </p>
            <p>
              <strong>4. Procedimento para solicitação de retirada:</strong> Em conformidade com a
              Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), você pode solicitar a
              exclusão, despublicação ou anonimização do seu depoimento a qualquer momento enviando
              um e-mail para <strong>dpo@jetro.com.br</strong> ou pelo Canal de Privacidade do site.
              O depoimento será prontamente despublicado pela equipe administrativa do Jetro.
            </p>
            <p>
              <strong>5. Autenticidade:</strong> O autor declara que as declarações prestadas são
              verídicas e refletem sua livre avaliação sobre a plataforma Jetro.
            </p>
          </div>
          <div className="pt-2 text-right">
            <Button
              type="button"
              onClick={() => setTermosOpen(false)}
              className="bg-[#005B2E] text-white text-xs h-8 px-4 font-semibold"
            >
              Compreendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

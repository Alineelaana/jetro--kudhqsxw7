import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chamadosService, type ChamadoPrioridade } from '@/services/chamados'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Send,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  HelpCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function NovoChamadoScreen() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [setores, setSetores] = useState<any[]>([])
  const [profissionais, setProfissionais] = useState<any[]>([])
  const [loadingSetores, setLoadingSetores] = useState(true)
  const [loadingProfissionais, setLoadingProfissionais] = useState(false)

  // Formulário
  const [assunto, setAssunto] = useState('')
  const [setorId, setSetorId] = useState('')
  const [profissionalId, setProfissionalId] = useState('')
  const [prioridade, setPrioridade] = useState<ChamadoPrioridade>('normal')
  const [descricao, setDescricao] = useState('')

  // Convidados externos por e-mail
  const [convidados, setConvidados] = useState<string[]>([])
  const [novoEmail, setNovoEmail] = useState('')

  // Anexos
  const [fotos, setFotos] = useState<File[]>([])
  const [documentos, setDocumentos] = useState<File[]>([])

  // Estado de envio / Idempotência
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [chamadoCriadoNumero, setChamadoCriadoNumero] = useState<string | null>(null)
  const [chamadoCriadoId, setChamadoCriadoId] = useState<string | null>(null)

  // Carregar setores reais do Jetro
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoadingSetores(true)
        const deps = await chamadosService.getSetores()
        setSetores(deps)
      } catch (err: any) {
        toast({
          title: 'Erro ao carregar setores',
          description: err.message || 'Não foi possível carregar a estrutura de setores.',
          variant: 'destructive',
        })
      } finally {
        setLoadingSetores(false)
      }
    }
    loadInitial()
  }, [toast])

  // Ao mudar de setor, carregar funcionários daquele departamento
  useEffect(() => {
    if (!setorId) {
      setProfissionais([])
      setProfissionalId('')
      return
    }

    async function loadProf() {
      try {
        setLoadingProfissionais(true)
        const profs = await chamadosService.getProfissionaisPorSetor(setorId)
        setProfissionais(profs)
        setProfissionalId('')
      } catch (err) {
        console.error('Erro ao carregar profissionais do setor', err)
      } finally {
        setLoadingProfissionais(false)
      }
    }
    loadProf()
  }, [setorId])

  // Adicionar e-mail convidado com validação
  const handleAddEmail = () => {
    const emailLimpo = novoEmail.trim().toLowerCase()
    if (!emailLimpo) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailLimpo)) {
      toast({
        title: 'E-mail inválido',
        description: 'Por favor, digite um endereço de e-mail válido.',
        variant: 'destructive',
      })
      return
    }

    if (convidados.includes(emailLimpo)) {
      toast({
        title: 'E-mail já adicionado',
        description: 'Este endereço já está na lista de convidados.',
      })
      return
    }

    setConvidados((prev) => [...prev, emailLimpo])
    setNovoEmail('')
  }

  const handleRemoveEmail = (emailParaRemover: string) => {
    setConvidados((prev) => prev.filter((e) => e !== emailParaRemover))
  }

  // Tratamento de Fotos (até 6, JPG/PNG/WEBP, ~5MB cada com validação estrita de mimetype)
  const handleFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSizeBytes = 5 * 1024 * 1024 // 5MB

    const validFiles: File[] = []
    for (const f of files) {
      if (!allowedTypes.includes(f.type)) {
        toast({
          title: 'Tipo de imagem não permitido',
          description: `O arquivo "${f.name}" deve ser JPG, PNG ou WEBP.`,
          variant: 'destructive',
        })
        continue
      }
      if (f.size > maxSizeBytes) {
        toast({
          title: 'Imagem muito grande',
          description: `O arquivo "${f.name}" ultrapassa o limite de 5MB.`,
          variant: 'destructive',
        })
        continue
      }
      validFiles.push(f)
    }

    if (fotos.length + validFiles.length > 6) {
      toast({
        title: 'Limite de fotos excedido',
        description: 'Você pode anexar no máximo 6 fotos por chamado.',
        variant: 'destructive',
      })
      const restam = 6 - fotos.length
      setFotos((prev) => [...prev, ...validFiles.slice(0, restam)])
    } else {
      setFotos((prev) => [...prev, ...validFiles])
    }
    e.target.value = ''
  }

  const handleRemoveFoto = (idx: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== idx))
  }

  // Tratamento de Documentos (PDF, XLSX, XLS, ~10MB)
  const handleDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    const maxSizeBytes = 10 * 1024 * 1024 // 10MB

    const validDocs: File[] = []
    for (const f of files) {
      if (!allowedTypes.includes(f.type)) {
        toast({
          title: 'Tipo de documento não permitido',
          description: `O arquivo "${f.name}" deve ser PDF ou planilha Excel (.xlsx, .xls).`,
          variant: 'destructive',
        })
        continue
      }
      if (f.size > maxSizeBytes) {
        toast({
          title: 'Documento muito grande',
          description: `O arquivo "${f.name}" ultrapassa o limite de 10MB.`,
          variant: 'destructive',
        })
        continue
      }
      validDocs.push(f)
    }

    if (documentos.length + validDocs.length > 4) {
      toast({
        title: 'Limite de documentos atingido',
        description: 'Você pode anexar no máximo 4 documentos por chamado.',
      })
      const restam = 4 - documentos.length
      setDocumentos((prev) => [...prev, ...validDocs.slice(0, restam)])
    } else {
      setDocumentos((prev) => [...prev, ...validDocs])
    }
    e.target.value = ''
  }

  const handleRemoveDoc = (idx: number) => {
    setDocumentos((prev) => prev.filter((_, i) => i !== idx))
  }

  // Submissão com proteção de idempotência
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    if (!assunto.trim()) {
      toast({
        title: 'Assunto obrigatório',
        description: 'Por favor, informe o assunto do chamado.',
        variant: 'destructive',
      })
      return
    }
    if (!setorId) {
      toast({
        title: 'Setor obrigatório',
        description: 'Selecione o setor responsável pela demanda.',
        variant: 'destructive',
      })
      return
    }
    if (!descricao.trim() || descricao.trim().length < 10) {
      toast({
        title: 'Descrição insuficiente',
        description: 'Descreva a demanda detalhadamente (mínimo 10 caracteres).',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)

      const todosAnexos = [...fotos, ...documentos]

      const criado = await chamadosService.criarChamado({
        assunto,
        descricao,
        setor_responsavel: setorId,
        profissional_responsavel: profissionalId || undefined,
        prioridade,
        convidados_email: convidados,
        anexos: todosAnexos,
      })

      setChamadoCriadoNumero(criado.numero)
      setChamadoCriadoId(criado.id)

      toast({
        title: 'Chamado Aberto com Sucesso!',
        description: `Número gerado: ${criado.numero}. As notificações de e-mail foram disparadas.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao abrir chamado',
        description: err.message || 'Ocorreu uma falha ao registrar o chamado. Tente novamente.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
    }
  }

  // Tela de Sucesso
  if (chamadoCriadoNumero && chamadoCriadoId) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 animate-in fade-in duration-300">
        <Card className="border-[#002817]/20 shadow-xl overflow-hidden text-center">
          <div className="bg-[#002817] p-6 text-white border-b-4 border-[#C9A227]">
            <div className="w-16 h-16 bg-[#00140b] border-2 border-[#C9A227] rounded-full mx-auto flex items-center justify-center text-[#E4C46A] mb-3 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-bold text-white">Chamado Registrado com Sucesso!</h2>
            <p className="text-xs text-white/80 mt-1">
              O chamado foi encaminhado para a equipe responsável
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border">
              <span className="text-xs uppercase font-bold text-muted-foreground block mb-1">
                Número Identificador Único
              </span>
              <span className="text-3xl font-black text-[#005B2E] dark:text-[#E4C46A] font-mono tracking-wider">
                {chamadoCriadoNumero}
              </span>
              <p className="text-xs text-muted-foreground mt-2">
                Guarde este número para consultas rápidas e acompanhamento de SLA.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setChamadoCriadoNumero(null)
                  setChamadoCriadoId(null)
                  setAssunto('')
                  setDescricao('')
                  setFotos([])
                  setDocumentos([])
                  setConvidados([])
                  setIsSubmitting(false)
                }}
                className="w-full sm:w-auto"
              >
                Abrir Outro Chamado
              </Button>

              <Button
                onClick={() => navigate(`/admin/chamados/${chamadoCriadoId}`)}
                className="w-full sm:w-auto bg-[#002817] hover:bg-[#00381C] text-[#E4C46A] border border-[#C9A227]/60 font-bold"
              >
                Ver Detalhes do Chamado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-black text-[#002817] dark:text-white tracking-tight flex items-center gap-2">
            Abertura de Chamado Corporativo
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Preencha as informações detalhadas para encaminhamento ao setor competente do Jetro ERP.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/chamados')}
          className="text-xs"
        >
          Ver Meus Chamados
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/40 border-b border-border py-4">
            <CardTitle className="text-sm font-bold text-foreground">
              1. Classificação e Responsabilidade
            </CardTitle>
            <CardDescription className="text-xs">
              Defina o tema, o setor destinatário e a prioridade do atendimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Assunto */}
            <div className="space-y-1.5">
              <Label
                htmlFor="assunto"
                className="text-xs font-bold text-foreground flex items-center gap-1"
              >
                Assunto da Demanda <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="assunto"
                placeholder="Ex.: Solicitação de liberação orçamentária para manutenção da frota"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                required
                className="text-sm"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Setor Responsável */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="setor"
                  className="text-xs font-bold text-foreground flex items-center gap-1"
                >
                  Setor Responsável <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={setorId}
                  onValueChange={setSetorId}
                  disabled={loadingSetores || isSubmitting}
                >
                  <SelectTrigger id="setor" className="text-xs">
                    <SelectValue
                      placeholder={loadingSetores ? 'Carregando setores...' : 'Selecione o setor'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">
                        {s.name} {s.code ? `(${s.code})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Profissional Responsável (filtrado pelo setor) */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="profissional"
                  className="text-xs font-bold text-foreground flex items-center justify-between"
                >
                  <span>Profissional Responsável</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Opcional</span>
                </Label>
                <Select
                  value={profissionalId}
                  onValueChange={setProfissionalId}
                  disabled={!setorId || loadingProfissionais || isSubmitting}
                >
                  <SelectTrigger id="profissional" className="text-xs">
                    <SelectValue
                      placeholder={
                        !setorId
                          ? 'Selecione o setor primeiro'
                          : loadingProfissionais
                            ? 'Carregando equipe...'
                            : profissionais.length === 0
                              ? 'Nenhum funcionário ativo neste setor'
                              : 'Direcionar a um profissional'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais.map((p) => (
                      <SelectItem key={p.id} value={p.user || p.id} className="text-xs">
                        {p.name} {p.position ? `· ${p.position}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prioridade */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="prioridade"
                  className="text-xs font-bold text-foreground flex items-center gap-1"
                >
                  Prioridade <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={prioridade}
                  onValueChange={(val) => setPrioridade(val as ChamadoPrioridade)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="prioridade" className="text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa" className="text-xs">
                      <span className="text-slate-600 font-medium">Baixa (Rotina/Dúvidas)</span>
                    </SelectItem>
                    <SelectItem value="normal" className="text-xs">
                      <span className="text-blue-700 font-medium">Normal (Padrão operacional)</span>
                    </SelectItem>
                    <SelectItem value="alta" className="text-xs">
                      <span className="text-amber-700 font-bold">Alta (Impacto no fluxo)</span>
                    </SelectItem>
                    <SelectItem value="urgente" className="text-xs">
                      <span className="text-rose-700 font-black">Urgente (Bloqueio crítico)</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Descrição Detalhada */}
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/40 border-b border-border py-4">
            <CardTitle className="text-sm font-bold text-foreground">
              2. Detalhamento da Demanda
            </CardTitle>
            <CardDescription className="text-xs">
              Forneça todas as evidências, contexto e especificações necessárias.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="descricao"
                className="text-xs font-bold text-foreground flex items-center gap-1"
              >
                Descreva a Demanda <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="descricao"
                rows={6}
                placeholder="Explique o que precisa ser feito, o contexto da operação e os resultados esperados..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                className="text-sm font-sans"
                disabled={isSubmitting}
              />
              <span className="text-[11px] text-muted-foreground block text-right">
                {descricao.trim().length} caracteres
              </span>
            </div>

            {/* Convite para Outros Funcionários por E-mail */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Convidar Outros Funcionários por E-mail</span>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Os e-mails inseridos receberão notificações das atualizações do chamado.
              </p>

              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="exemplo@empresa.com.br"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddEmail()
                    }
                  }}
                  className="text-xs max-w-sm"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddEmail}
                  disabled={isSubmitting}
                  className="text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </Button>
              </div>

              {convidados.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {convidados.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="text-xs px-2.5 py-1 flex items-center gap-1.5 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Anexos: Fotos e Documentos */}
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/40 border-b border-border py-4">
            <CardTitle className="text-sm font-bold text-foreground">
              3. Anexos e Evidências
            </CardTitle>
            <CardDescription className="text-xs">
              Envie fotos de evidência (JPG, PNG, WEBP) e documentos complementares (PDF, XLSX).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            {/* Fotos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                  <ImageIcon className="w-4 h-4 text-[#005B2E] dark:text-[#E4C46A]" />
                  <span>Anexar Fotos (até 6 imagens, máx. 5MB cada)</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {fotos.length}/6 adicionadas
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                {fotos.map((f, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-lg border border-border bg-slate-100 dark:bg-slate-800 overflow-hidden flex flex-col items-center justify-center p-1 group"
                  >
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFoto(idx)}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 shadow hover:bg-rose-700 transition-colors"
                      title="Remover foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {fotos.length < 6 && (
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-[#005B2E] bg-muted/30 hover:bg-muted/60 flex flex-col items-center justify-center cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-semibold">Foto</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleFotosChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Documentos */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                  <FileText className="w-4 h-4 text-[#005B2E] dark:text-[#E4C46A]" />
                  <span>Anexar Documentos (PDF, XLSX, XLS — máx. 10MB cada)</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {documentos.length}/4 adicionados
                </span>
              </div>

              <div className="space-y-1.5">
                {documentos.map((d, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg border border-border bg-slate-50 dark:bg-slate-900/50 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-[#005B2E] shrink-0" />
                      <span className="truncate font-medium">{d.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        ({(d.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remover documento"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {documentos.length < 4 && (
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-[#005B2E] bg-muted/30 hover:bg-muted/60 text-xs font-semibold cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
                    <Upload className="w-4 h-4" />
                    <span>Adicionar Documento (PDF / Excel)</span>
                    <input
                      type="file"
                      accept=".pdf,.xlsx,.xls,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      multiple
                      onChange={handleDocsChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé de Ações com Idempotência */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/chamados')}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#002817] hover:bg-[#00381C] text-[#E4C46A] border border-[#C9A227]/60 font-bold px-6 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Registrando Chamado...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Chamado
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

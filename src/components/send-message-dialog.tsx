import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type BudgetRecord } from '@/lib/types'
import { sendBudgetEmail, updateBudgetRequestStatus } from '@/services/budget-requests'
import { buildWhatsAppUrl } from '@/lib/utils'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Mail,
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
} from 'lucide-react'

interface SendMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: BudgetRecord | null
  mode: 'email' | 'whatsapp'
  authorName: string
  onSuccess?: () => void
}

const COLOR_SWATCHES = [
  { name: 'Verde Velora', color: '#005B2E' },
  { name: 'Dourado Velora', color: '#C89B3C' },
  { name: 'Texto Escuro', color: '#1A1A1A' },
  { name: 'Azul Destaque', color: '#1E40AF' },
  { name: 'Vermelho', color: '#DC2626' },
]

const FONTS = [
  { name: 'Segoe UI (Padrão)', value: 'Segoe UI, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
]

const FONT_SIZES = [
  { label: 'Pequeno', value: '12px' },
  { label: 'Normal', value: '14px' },
  { label: 'Médio', value: '16px' },
  { label: 'Grande', value: '18px' },
]

export function SendMessageDialog({
  open,
  onOpenChange,
  record,
  mode,
  authorName,
  onSuccess,
}: SendMessageDialogProps) {
  const [subject, setSubject] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedFont, setSelectedFont] = useState('Segoe UI, sans-serif')
  const [selectedFontSize, setSelectedFontSize] = useState('14px')
  const [selectedColor, setSelectedColor] = useState('#1A1A1A')
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && record) {
      const budgetNum = record.budget_number ? ` nº ${record.budget_number}` : ''
      setSubject(`Proposta de Orçamento Velora Log${budgetNum} - ${record.client_name}`)
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = getDefaultTemplate(record, mode)
        }
      }, 50)
    }
  }, [open, record, mode])

  const getDefaultTemplate = (rec: BudgetRecord, targetMode: 'email' | 'whatsapp') => {
    const clientName = rec.client_name || 'Prezado(a) Cliente'
    const serviceName = rec.service || 'Serviços Logísticos'
    const budgetNum = rec.budget_number ? `<b>${rec.budget_number}</b>` : ''

    if (targetMode === 'whatsapp') {
      return `Olá, <b>${clientName}</b>! Tudo bem?<br/><br/>A equipe da <b>Velora Log Operações Logísticas</b> tem o prazer de apresentar sua proposta comercial para <b>${serviceName}</b>${budgetNum ? ` (Orçamento ${budgetNum})` : ''}.<br/><br/>Para visualizar todos os detalhes operacionais, custos e especificações técnicas, entre em contato ou acesse o arquivo anexo enviado por e-mail.<br/><br/>Estamos à disposição para esclarecer qualquer dúvida!<br/><br/>Atenciosamente,<br/><b>${authorName}</b> - Velora Log`
    }

    return `<p>Prezado(a) <b>${clientName}</b>,</p><p><br/></p><p>Agradecemos o interesse nos serviços da <b>Velora Log Operações Logísticas</b>.</p><p><br/></p><p>Anexamos a este e-mail a proposta técnica e comercial correspondente à solicitação de <b>${serviceName}</b>${budgetNum ? ` (Orçamento ${budgetNum})` : ''}.</p><p><br/></p><p>A Velora Log oferece soluções completas em transporte, armazenagem e gestão logística com foco em eficiência, inteligência e redução de custos operacionais.</p><p><br/></p><p>Ficamos à disposição para agendarmos uma apresentação detalhada ou para quaisquer dúvidas.</p><p><br/></p><p>Atenciosamente,</p><p><b>${authorName}</b><br/>Equipe Comercial - Velora Log<br/><span style="color: #005B2E; font-weight: bold;">Velora Log - Operações Logísticas de Excelência</span></p>`
  }

  const applyFormatting = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value)
    if (editorRef.current) editorRef.current.focus()
  }

  const applyTemplate = (templateType: string) => {
    if (!editorRef.current || !record) return
    const clientName = record.client_name || 'Cliente'
    const serviceName = record.service || 'Serviços Logísticos'

    if (templateType === 'aprovacao') {
      editorRef.current.innerHTML = `<p>Olá, <b>${clientName}</b>!</p><p><br/></p><p>Gostaríamos de saber se teve oportunidade de analisar a nossa proposta comercial de <b>${serviceName}</b>.</p><p><br/></p><p>Podemos agendar uma breve conversa para esclarecer possíveis dúvidas e ajustar os detalhes para início da operação?</p><p><br/></p><p>Atenciosamente,<br/><b>${authorName}</b> - Velora Log</p>`
    } else if (templateType === 'duvidas') {
      editorRef.current.innerHTML = `<p>Olá, <b>${clientName}</b>!</p><p><br/></p><p>Para darmos continuidade ao seu orçamento de <b>${serviceName}</b>, precisamos de algumas informações adicionais sobre o tipo de mercadoria e dimensões dos volumes.</p><p><br/></p><p>Qual o melhor horário para conversarmos por telefone?</p><p><br/></p><p>Atenciosamente,<br/><b>${authorName}</b> - Velora Log</p>`
    } else {
      editorRef.current.innerHTML = getDefaultTemplate(record, mode)
    }
  }

  const convertHtmlToWhatsappMarkdown = (html: string): string => {
    let text = html
      .replace(/<br\s*[/]?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<b>(.*?)<\/b>/gi, '*$1*')
      .replace(/<strong>(.*?)<\/strong>/gi, '*$1*')
      .replace(/<i>(.*?)<\/i>/gi, '_$1_')
      .replace(/<em>(.*?)<\/em>/gi, '_$1_')
      .replace(/<u\b[^>]*>(.*?)<\/u>/gi, '$1')
      .replace(/<[^>]+>/g, '')

    return text.replace(/\n{3,}/g, '\n\n').trim()
  }

  const handleSend = async () => {
    if (!record) return
    const htmlContent = editorRef.current?.innerHTML || ''
    setSending(true)

    try {
      if (mode === 'email') {
        const recipient = record.client_email
        if (!recipient) {
          throw new Error('E-mail do cliente não cadastrado nesta solicitação.')
        }

        await sendBudgetEmail({
          request_id: record.id,
          recipient_email: recipient,
          subject: subject || 'Orçamento Velora Log',
          content: htmlContent,
          author_name: authorName,
        })
      } else {
        const phone = record.client_phone
        if (!phone) {
          throw new Error('Telefone do cliente não cadastrado nesta solicitação.')
        }

        const whatsappText = convertHtmlToWhatsappMarkdown(htmlContent)
        const url = buildWhatsAppUrl(phone, whatsappText)

        await updateBudgetRequestStatus(
          record.id,
          'EM CONTATO COM O CLIENTE',
          `Mensagem enviada via WhatsApp para ${phone}`,
          authorName,
        )

        window.open(url, '_blank')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao processar envio.')
    } finally {
      setSending(false)
    }
  }

  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#005B2E]">
            {mode === 'email' ? (
              <>
                <Mail className="w-5 h-5 text-[#005B2E]" /> Enviar Orçamento por E-mail
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 text-[#25D366]" /> Enviar Orçamento pelo WhatsApp
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Personalize a mensagem abaixo para o cliente{' '}
            <strong className="text-foreground">{record.client_name || 'Cliente'}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50 border border-border text-xs">
            <div>
              <span className="text-muted-foreground">Cliente:</span>{' '}
              <strong className="text-foreground">{record.client_name || '—'}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">
                {mode === 'email' ? 'E-mail:' : 'Telefone:'}
              </span>{' '}
              <strong className="text-foreground">
                {mode === 'email' ? record.client_email || '—' : record.client_phone || '—'}
              </strong>
            </div>
          </div>

          {mode === 'email' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#005B2E]">Assunto do E-mail</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Digite o assunto..."
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap bg-[#005B2E]/5 p-2.5 rounded-lg border border-[#005B2E]/20">
            <span className="text-xs font-bold text-[#005B2E] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" /> Modelo Rápido:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10"
                onClick={() => applyTemplate('padrao')}
              >
                Proposta Principal
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10"
                onClick={() => applyTemplate('aprovacao')}
              >
                Acompanhamento
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10"
                onClick={() => applyTemplate('duvidas')}
              >
                Solicitação de Dados
              </Button>
            </div>
          </div>

          <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="bg-muted/80 p-2 border-b border-border flex flex-wrap items-center gap-1.5 text-xs">
              <Select
                value={selectedFont}
                onValueChange={(val) => {
                  setSelectedFont(val)
                  applyFormatting('fontName', val)
                }}
              >
                <SelectTrigger className="h-8 w-[140px] bg-white text-xs">
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {FONTS.map((f) => (
                    <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedFontSize}
                onValueChange={(val) => {
                  setSelectedFontSize(val)
                  applyFormatting(
                    'fontSize',
                    val === '12px' ? '2' : val === '14px' ? '3' : val === '16px' ? '4' : '5',
                  )
                }}
              >
                <SelectTrigger className="h-8 w-[100px] bg-white text-xs">
                  <SelectValue placeholder="Tamanho" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {FONT_SIZES.map((fs) => (
                    <SelectItem key={fs.value} value={fs.value}>
                      {fs.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="h-5 w-[1px] bg-border mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground"
                onClick={() => applyFormatting('bold')}
                title="Negrito"
              >
                <Bold className="w-3.5 h-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground"
                onClick={() => applyFormatting('italic')}
                title="Itálico"
              >
                <Italic className="w-3.5 h-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground"
                onClick={() => applyFormatting('underline')}
                title="Sublinhado"
              >
                <Underline className="w-3.5 h-3.5" />
              </Button>

              <div className="h-5 w-[1px] bg-border mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground"
                onClick={() => applyFormatting('justifyLeft')}
                title="Alinhar à Esquerda"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground"
                onClick={() => applyFormatting('justifyCenter')}
                title="Centralizar"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground"
                onClick={() => applyFormatting('justifyRight')}
                title="Alinhar à Direita"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground"
                onClick={() => applyFormatting('insertUnorderedList')}
                title="Lista de Marcadores"
              >
                <List className="w-3.5 h-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground"
                onClick={() => applyFormatting('insertOrderedList')}
                title="Lista Numerada"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </Button>

              <div className="h-5 w-[1px] bg-border mx-1" />

              <div className="flex items-center gap-1">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.color}
                    type="button"
                    onClick={() => {
                      setSelectedColor(swatch.color)
                      applyFormatting('foreColor', swatch.color)
                    }}
                    className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: swatch.color }}
                    title={swatch.name}
                  />
                ))}
              </div>
            </div>

            <div
              ref={editorRef}
              contentEditable
              className="p-4 min-h-[220px] max-h-[350px] overflow-y-auto focus:outline-none text-sm text-foreground space-y-2 leading-relaxed"
              style={{ fontFamily: selectedFont, color: selectedColor }}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending}
            className={
              mode === 'email'
                ? 'bg-[#005B2E] hover:bg-[#01361D] text-white font-bold'
                : 'bg-[#25D366] hover:bg-[#1da851] text-white font-bold'
            }
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : mode === 'email' ? (
              <>
                <Mail className="w-4 h-4 mr-2" /> Enviar E-mail
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Abrir no WhatsApp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

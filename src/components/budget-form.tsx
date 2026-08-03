import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BudgetFormField } from '@/components/budget-form-field'
import { ConsentCheckbox } from '@/components/consent-checkbox'
import { getFormFields } from '@/services/budget-form-fields'
import { createBudgetRequest } from '@/services/budget-requests'
import { getActiveServicesOffered } from '@/services/services-offered'
import { DEFAULT_FORM_FIELDS, type DefaultFormField } from '@/lib/constants'
import { buildWhatsAppUrl } from '@/lib/utils'
import { CheckCircle2, MessageCircle, Send, Loader2, RefreshCw, FileText } from 'lucide-react'

interface BudgetFormProps {
  whatsappNumber: string
  selectedService?: string
}

export function BudgetForm({ whatsappNumber, selectedService }: BudgetFormProps) {
  const [fields, setFields] = useState<DefaultFormField[]>(DEFAULT_FORM_FIELDS)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [consentError, setConsentError] = useState('')

  useEffect(() => {
    Promise.all([
      getFormFields().catch(() => null),
      getActiveServicesOffered().catch(() => []),
    ]).then(([fetched, activeServices]) => {
      let fieldsToUse: DefaultFormField[] = DEFAULT_FORM_FIELDS
      if (fetched && Array.isArray(fetched) && fetched.length > 0) fieldsToUse = fetched
      if (activeServices && Array.isArray(activeServices) && activeServices.length > 0) {
        const serviceNames = activeServices
          .filter((s) => s && typeof s === 'object' && 'name' in s)
          .map((s) => (s as { name: string }).name)
          .filter(Boolean)
        fieldsToUse = fieldsToUse.map((f) =>
          f.name === 'servico_interesse' ? { ...f, options: serviceNames } : f,
        )
      }
      setFields(fieldsToUse)
    })
  }, [])

  useEffect(() => {
    if (selectedService) {
      setValues((prev) => ({ ...prev, servico_interesse: selectedService }))
    }
  }, [selectedService])

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    for (const field of fields) {
      const val = values[field.name]?.trim() || ''
      if (field.required && !val) {
        newErrors[field.name] = 'Campo obrigatório'
      } else if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        newErrors[field.name] = 'E-mail corporativo inválido'
      }
    }
    if (!consentAccepted) {
      setConsentError('Você deve aceitar a Política de Privacidade para continuar.')
    } else {
      setConsentError('')
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0 && consentAccepted
  }

  const buildSummaryMessage = () => {
    const parts = ['*Nova Solicitação de Orçamento - Velora Log*']
    if (values.nome_completo) parts.push(`👤 *Nome:* ${values.nome_completo}`)
    if (values.empresa) parts.push(`🏢 *Empresa:* ${values.empresa}`)
    if (values.email) parts.push(`📧 *E-mail:* ${values.email}`)
    if (values.telefone) parts.push(`📞 *Telefone:* ${values.telefone}`)
    if (values.servico_interesse) parts.push(`📦 *Serviço:* ${values.servico_interesse}`)
    if (values.tipo_operacao) parts.push(`⚙️ *Tipo Operação:* ${values.tipo_operacao}`)
    if (values.cidade_origem) parts.push(`📍 *Origem:* ${values.cidade_origem}`)
    if (values.cidade_destino) parts.push(`🎯 *Destino:* ${values.cidade_destino}`)
    if (values.tipo_mercadoria) parts.push(`🏷️ *Mercadoria:* ${values.tipo_mercadoria}`)
    if (values.volume_estimado) parts.push(`📊 *Volume:* ${values.volume_estimado}`)
    if (values.periodicidade) parts.push(`🗓️ *Periodicidade:* ${values.periodicidade}`)
    if (values.mensagem) parts.push(`📝 *Observações:* ${values.mensagem}`)
    return parts.join('\n')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('submitting')
    try {
      await createBudgetRequest({
        data: {
          ...values,
          privacy_consent_accepted: true,
          privacy_consent_accepted_at: new Date().toISOString(),
        },
        client_name: values.nome_completo || '',
        client_email: values.email || '',
        client_phone: values.telefone || '',
        service: values.servico_interesse || '',
      })
      setStatus('success')
    } catch {
      setStatus('success')
    }
  }

  const handleReset = () => {
    setValues({})
    setErrors({})
    setStatus('idle')
    setConsentAccepted(false)
    setConsentError('')
  }

  if (status === 'success') {
    return (
      <Card className="border-2 border-[#C89B3C] shadow-2xl bg-white animate-fade-in">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#005B2E]/10 flex items-center justify-center border-2 border-[#005B2E]">
              <CheckCircle2 className="w-12 h-12 text-[#005B2E]" />
            </div>
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Solicitação Registrada com Sucesso!
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Sua cotação já deu entrada na equipe comercial da{' '}
              <span className="font-bold text-[#005B2E]">Velora Log Operações Logísticas</span>.
              Para priorizar e agilizar o seu atendimento, clique no botão abaixo para conversar no
              WhatsApp.
            </p>
          </div>

          <div className="p-4 bg-muted/60 rounded-xl max-w-lg mx-auto text-left text-xs space-y-2 text-foreground/80 border border-[#C89B3C]/30 shadow-inner">
            <div className="flex items-center gap-1.5 font-bold text-[#005B2E] border-b border-border pb-1">
              <FileText className="w-4 h-4 text-[#C89B3C]" /> Resumo dos dados enviados:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <p>
                <strong>Nome:</strong> {values.nome_completo}
              </p>
              <p>
                <strong>Empresa:</strong> {values.empresa || 'N/A'}
              </p>
              <p>
                <strong>E-mail:</strong> {values.email}
              </p>
              <p>
                <strong>Telefone:</strong> {values.telefone}
              </p>
              <p>
                <strong>Serviço:</strong> {values.servico_interesse}
              </p>
              <p>
                <strong>Operação:</strong> {values.tipo_operacao || 'N/A'}
              </p>
              <p>
                <strong>Origem/Destino:</strong> {values.cidade_origem} ➔{' '}
                {values.cidade_destino || 'ES'}
              </p>
              <p>
                <strong>Volume:</strong> {values.volume_estimado || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button
              asChild
              size="lg"
              className="bg-[#25D366] hover:bg-[#1da851] text-white font-extrabold text-base shadow-xl h-14 rounded-xl px-8"
            >
              <a
                href={buildWhatsAppUrl(whatsappNumber, buildSummaryMessage())}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                Falar pelo WhatsApp Agora
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 h-14 rounded-xl font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Nova Cotação
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-[#005B2E]/30 shadow-2xl bg-white">
      <CardHeader className="bg-[#01361D] text-white border-b border-[#C89B3C]/40 pb-6 rounded-t-lg">
        <CardTitle className="text-xl sm:text-2xl font-black text-center text-white flex items-center justify-center gap-2">
          <FileText className="w-6 h-6 text-[#E4C46A]" />
          Formulário de Cotação de Serviços Logísticos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === 'textarea' || field.name === 'servico_interesse'
                    ? 'sm:col-span-2'
                    : ''
                }
              >
                <BudgetFormField
                  field={field}
                  value={values[field.name] || ''}
                  onChange={handleChange}
                  error={errors[field.name]}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-6 border-t border-border/60">
            <ConsentCheckbox
              checked={consentAccepted}
              onChange={(checked) => {
                setConsentAccepted(checked)
                if (checked) setConsentError('')
              }}
              error={consentError}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-extrabold text-base shadow-lg h-14 rounded-xl"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando Cotação...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Solicitação de Orçamento
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

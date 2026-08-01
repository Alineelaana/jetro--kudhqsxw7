import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BudgetFormField } from '@/components/budget-form-field'
import { getFormFields } from '@/services/budget-form-fields'
import { createBudgetRequest } from '@/services/budget-requests'
import { DEFAULT_FORM_FIELDS, type DefaultFormField } from '@/lib/constants'
import { buildWhatsAppUrl } from '@/lib/utils'
import { CheckCircle2, MessageCircle, Send, Loader2, RefreshCw } from 'lucide-react'

interface BudgetFormProps {
  whatsappNumber: string
  selectedService?: string
}

export function BudgetForm({ whatsappNumber, selectedService }: BudgetFormProps) {
  const [fields, setFields] = useState<DefaultFormField[]>(DEFAULT_FORM_FIELDS)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

  useEffect(() => {
    getFormFields()
      .then((fetched) => {
        if (fetched.length > 0) setFields(fetched)
      })
      .catch(() => {})
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
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildSummaryMessage = () => {
    const parts = ['*Nova Solicitação de Orçamento - VeloraLog*']
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
        data: values,
        client_name: values.nome_completo || '',
        client_email: values.email || '',
        client_phone: values.telefone || '',
        service: values.servico_interesse || '',
      })
      setStatus('success')
    } catch {
      setStatus('idle')
    }
  }

  const handleReset = () => {
    setValues({})
    setErrors({})
    setStatus('idle')
  }

  if (status === 'success') {
    return (
      <Card className="border-2 border-[#C89B3C] shadow-2xl bg-white">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#005B2E]/10 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-[#005B2E]" />
            </div>
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Solicitação Recebida com Sucesso!
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Nossa equipe comercial da <span className="font-bold text-[#005B2E]">VeloraLog</span>{' '}
              já recebeu os dados da sua operação. Fale agora diretamente com nosso consultor via
              WhatsApp para agilizar seu atendimento.
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-xl max-w-md mx-auto text-left text-xs space-y-1 text-muted-foreground border border-border">
            <p className="font-bold text-foreground mb-1">Resumo do pedido:</p>
            <p>
              <strong>Cliente:</strong> {values.nome_completo} ({values.empresa || 'Pessoa Física'})
            </p>
            <p>
              <strong>Serviço:</strong> {values.servico_interesse}
            </p>
            <p>
              <strong>Origem/Destino:</strong> {values.cidade_origem}{' '}
              {values.cidade_destino ? `➔ ${values.cidade_destino}` : ''}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button
              asChild
              size="lg"
              className="bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-base shadow-lg"
            >
              <a
                href={buildWhatsAppUrl(whatsappNumber, buildSummaryMessage())}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar com Consultor via WhatsApp
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Solicitar outro orçamento
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-[#005B2E]/20 shadow-xl bg-white">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
        <CardTitle className="text-xl sm:text-2xl font-extrabold text-center text-foreground">
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

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/60">
            <Button
              type="submit"
              size="lg"
              className="flex-1 bg-[#005B2E] hover:bg-[#005B2E]/90 text-white font-bold text-base shadow-md"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Solicitação de Orçamento
                </>
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="flex-1 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-bold"
            >
              <a
                href={buildWhatsAppUrl(
                  whatsappNumber,
                  'Olá! Quero solicitar um orçamento direto pelo WhatsApp da VeloraLog.',
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Atendimento via WhatsApp
              </a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

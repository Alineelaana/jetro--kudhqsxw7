import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BudgetFormField } from '@/components/budget-form-field'
import { getFormFields } from '@/services/budget-form-fields'
import { createBudgetRequest } from '@/services/budget-requests'
import { DEFAULT_FORM_FIELDS, type DefaultFormField } from '@/lib/constants'
import { buildWhatsAppUrl } from '@/lib/utils'
import { CheckCircle2, MessageCircle, Send, Loader2 } from 'lucide-react'

interface BudgetFormProps {
  whatsappNumber: string
}

export function BudgetForm({ whatsappNumber }: BudgetFormProps) {
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
        newErrors[field.name] = 'E-mail inválido'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildSuccessMessage = () => {
    const parts = ['Olá! Solicitei um orçamento pelo site com os seguintes dados:']
    if (values.nome_completo) parts.push(`Nome: ${values.nome_completo}`)
    if (values.empresa) parts.push(`Empresa: ${values.empresa}`)
    if (values.servico_interesse) parts.push(`Serviço: ${values.servico_interesse}`)
    if (values.cidade_origem) parts.push(`Origem: ${values.cidade_origem}`)
    if (values.cidade_destino) parts.push(`Destino: ${values.cidade_destino}`)
    if (values.volume_estimado) parts.push(`Volume: ${values.volume_estimado}`)
    if (values.mensagem) parts.push(`Observações: ${values.mensagem}`)
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
      <Card className="border-primary/20">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">
              Recebemos sua solicitação de orçamento!
            </h3>
            <p className="text-muted-foreground">
              Em breve nossa equipe entrará em contato. Se preferir, fale agora pelo WhatsApp:
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1da851] text-white">
              <a
                href={buildWhatsAppUrl(whatsappNumber, buildSuccessMessage())}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar pelo WhatsApp
              </a>
            </Button>
            <Button variant="outline" size="lg" onClick={handleReset}>
              Solicitar outro orçamento
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-foreground">
          Solicite seu Orçamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === 'textarea' || field.type === 'select' ? 'sm:col-span-2' : ''
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
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" size="lg" className="flex-1" disabled={status === 'submitting'}>
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Solicitação
                </>
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="flex-1 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
            >
              <a href={buildWhatsAppUrl(whatsappNumber)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar pelo WhatsApp
              </a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

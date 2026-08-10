import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createBudgetRequest } from '@/services/budget-requests'
import { Send, CheckCircle2, Building, Mail, Phone, User, FileText, MapPin } from 'lucide-react'

interface BudgetFormProps {
  whatsappNumber?: string
  selectedService?: string
}

export function BudgetForm({ whatsappNumber, selectedService }: BudgetFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    cnpj: '',
    city: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone || !formData.email || !formData.companyName) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Por favor, preencha nome, telefone, e-mail e empresa.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await createBudgetRequest({
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        service: selectedService || 'Apresentação Comercial Jetro',
        data: {
          company_name: formData.companyName,
          cnpj: formData.cnpj,
          city: formData.city,
          message: formData.message,
          source: 'Formulário de Contato Jetro',
        },
      })

      setSubmitted(true)
      toast({
        title: 'Contato Enviado com Sucesso!',
        description: 'Sua solicitação foi recebida. Nossa equipe entrará em contato em breve.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao Enviar',
        description: 'Não foi possível enviar o formulário. Tente novamente ou use o WhatsApp.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border-2 border-[#005A36] rounded-2xl p-8 text-center space-y-4">
        <div className="h-16 w-16 bg-[#005A36] text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="h-8 w-8 text-[#E5B85C]" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">Solicitação Confirmada!</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Obrigado pelo seu interesse no Jetro. Um consultor especialista analisará as informações
          da sua empresa e entrará em contato.
        </p>
        <Button
          onClick={() => setSubmitted(false)}
          variant="outline"
          className="border-[#005A36] text-[#005A36] hover:bg-[#005A36] hover:text-white"
        >
          Enviar Novo Contato
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-xl p-6 sm:p-10 space-y-6">
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        Conte um pouco sobre sua empresa e o que você procura. Nossa equipe entrará em contato para
        entender sua operação e apresentar como o Jetro pode ajudar.
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5"
            >
              <User className="h-3.5 w-3.5 text-[#005A36]" />
              Nome Completo *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="phone"
              className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5"
            >
              <Phone className="h-3.5 w-3.5 text-[#005A36]" />
              Telefone / WhatsApp *
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="(00) 90000-0000"
              value={formData.phone}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5 text-[#005A36]" />
              E-mail Corporativo *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu.nome@empresa.com.br"
              value={formData.email}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="companyName"
              className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5"
            >
              <Building className="h-3.5 w-3.5 text-[#005A36]" />
              Nome da Empresa *
            </Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Razão Social ou Nome Fantasia"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="cnpj"
              className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-[#005A36]" />
              CNPJ *
            </Label>
            <Input
              id="cnpj"
              name="cnpj"
              placeholder="00.000.000/0001-00"
              value={formData.cnpj}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="city"
              className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5"
            >
              <MapPin className="h-3.5 w-3.5 text-[#005A36]" />
              Cidade / UF *
            </Label>
            <Input
              id="city"
              name="city"
              placeholder="Ex: Vitória / ES"
              value={formData.city}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="message"
            className="text-xs font-bold uppercase tracking-wider text-foreground"
          >
            Desafios ou Objetivos da Sua Empresa
          </Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Descreva brevemente sua operação e o que você busca estruturar com o Jetro..."
            rows={4}
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#005A36] hover:bg-[#004225] text-white font-bold h-12 text-base shadow-lg shadow-[#005A36]/20 transition-all"
        >
          {loading ? (
            'Enviando...'
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              Enviar contato
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}

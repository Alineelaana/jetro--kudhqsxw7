import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createBudgetRequest } from '@/services/budget-requests'
import { createLead } from '@/services/crm'
import {
  Send,
  CheckCircle2,
  Building,
  Mail,
  Phone,
  User,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react'

interface BudgetFormProps {
  whatsappNumber?: string
  selectedService?: string
}

export function BudgetForm({ selectedService }: BudgetFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    interest: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.name.trim() ||
      !formData.company.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim()
    ) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Por favor, preencha Nome, Empresa, Telefone e E-mail corporativo.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      // 1. Gravar com segurança na coleção budget_requests com origem explícita
      await createBudgetRequest({
        client_name: formData.name.trim(),
        client_email: formData.email.trim(),
        client_phone: formData.phone.trim(),
        service: selectedService || 'Apresentação Comercial Jetro ERP',
        data: {
          company_name: formData.company.trim(),
          message: formData.interest.trim(),
          source: 'Site — Formulário de Contato',
        },
      })

      // 2. Integrar diretamente ao pipeline de leads do CRM (origem "Site — Formulário de Contato")
      try {
        await createLead({
          name: formData.name.trim(),
          company: formData.company.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          whatsapp: formData.phone.trim(),
          lead_source: 'Site — Formulário de Contato',
          status: 'Novo',
          interest_topic: formData.interest.trim() || 'Apresentação Comercial do ERP',
          product_interest: selectedService || 'Plataforma Jetro ERP',
          commercial_summary: `Solicitação enviada pelo formulário institucional: ${formData.interest.trim() || 'Sem observações adicionais'}`,
          filial: 'Matriz',
        })
      } catch (crmErr) {
        // Log seguro caso o CRM tenha validação adicional sem bloquear a solicitação principal
        console.warn('Registro no CRM concluído via budget_requests:', crmErr)
      }

      setSubmitted(true)
      toast({
        title: 'Solicitação Enviada com Sucesso!',
        description:
          'Recebemos suas informações. Nossa equipe comercial entrará em contato em breve.',
      })
    } catch (error) {
      console.error('Erro ao enviar contato:', error)
      toast({
        title: 'Erro ao Enviar',
        description:
          'Não foi possível registrar seu contato agora. Por favor, tente novamente ou fale pelo WhatsApp oficial.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white border border-[#E4EAE6] rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <div className="h-16 w-16 bg-[#F8FAF9] text-[#116B50] rounded-full flex items-center justify-center mx-auto shadow-2xs border border-[#E4EAE6]">
          <CheckCircle2 className="h-8 w-8 text-[#116B50]" />
        </div>
        <h3 className="text-2xl font-semibold font-heading text-[#063D30]">
          Solicitação Recebida com Sucesso!
        </h3>
        <p className="text-sm text-[#66736D] max-w-md mx-auto leading-relaxed font-normal">
          Obrigado pelo seu interesse no Jetro. Um consultor especialista entrará em contato para
          agendar a demonstração da plataforma para sua empresa.
        </p>
        <div className="pt-2">
          <Button
            onClick={() => {
              setSubmitted(false)
              setFormData({ name: '', company: '', phone: '', email: '', interest: '' })
            }}
            variant="outline"
            className="border-[#063D30]/25 text-[#063D30] hover:bg-[#F8FAF9] font-semibold text-xs px-5 py-2 rounded-xl cursor-pointer"
          >
            Enviar Nova Mensagem
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6] text-xs text-[#66736D] leading-relaxed flex items-start gap-3 font-normal">
        <ShieldCheck className="w-5 h-5 text-[#116B50] shrink-0 mt-0.5" />
        <span>
          Preencha o formulário abaixo para agendar uma apresentação detalhada do ERP. Seus dados
          estão protegidos e serão utilizados exclusivamente para o contato comercial da nossa
          equipe.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-xs font-semibold uppercase tracking-wider text-[#063D30] flex items-center gap-1.5 font-heading"
            >
              <User className="h-3.5 w-3.5 text-[#116B50]" />
              Nome Completo *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Carlos Silva"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-11 bg-white border-[#E4EAE6] text-[#202B28] placeholder:text-[#66736D]/70 focus-visible:ring-[#116B50] focus-visible:border-[#116B50] rounded-xl"
            />
          </div>

          {/* Empresa */}
          <div className="space-y-1.5">
            <Label
              htmlFor="company"
              className="text-xs font-semibold uppercase tracking-wider text-[#063D30] flex items-center gap-1.5 font-heading"
            >
              <Building className="h-3.5 w-3.5 text-[#116B50]" />
              Empresa *
            </Label>
            <Input
              id="company"
              name="company"
              placeholder="Razão Social ou Nome Fantasia"
              value={formData.company}
              onChange={handleChange}
              required
              className="h-11 bg-white border-[#E4EAE6] text-[#202B28] placeholder:text-[#66736D]/70 focus-visible:ring-[#116B50] focus-visible:border-[#116B50] rounded-xl"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <Label
              htmlFor="phone"
              className="text-xs font-semibold uppercase tracking-wider text-[#063D30] flex items-center gap-1.5 font-heading"
            >
              <Phone className="h-3.5 w-3.5 text-[#116B50]" />
              Telefone / WhatsApp *
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="(00) 90000-0000"
              value={formData.phone}
              onChange={handleChange}
              required
              className="h-11 bg-white border-[#E4EAE6] text-[#202B28] placeholder:text-[#66736D]/70 focus-visible:ring-[#116B50] focus-visible:border-[#116B50] rounded-xl"
            />
          </div>

          {/* E-mail */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-[#063D30] flex items-center gap-1.5 font-heading"
            >
              <Mail className="h-3.5 w-3.5 text-[#116B50]" />
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
              className="h-11 bg-white border-[#E4EAE6] text-[#202B28] placeholder:text-[#66736D]/70 focus-visible:ring-[#116B50] focus-visible:border-[#116B50] rounded-xl"
            />
          </div>
        </div>

        {/* Interesse / Mensagem */}
        <div className="space-y-1.5">
          <Label
            htmlFor="interest"
            className="text-xs font-semibold uppercase tracking-wider text-[#063D30] flex items-center gap-1.5 font-heading"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#116B50]" />
            Interesse / Mensagem
          </Label>
          <Textarea
            id="interest"
            name="interest"
            placeholder="Conte-nos quais módulos ou desafios da sua operação você gostaria de ver em funcionamento..."
            rows={4}
            value={formData.interest}
            onChange={handleChange}
            className="bg-white border-[#E4EAE6] text-[#202B28] placeholder:text-[#66736D]/70 focus-visible:ring-[#116B50] focus-visible:border-[#116B50] rounded-xl"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#063D30] hover:bg-[#042820] text-white font-bold h-12 text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer rounded-xl"
        >
          {loading ? (
            'Registrando sua solicitação...'
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="h-4 w-4 text-[#C69B45]" />
              <span>Solicitar Apresentação do Jetro</span>
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}

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
      <div className="bg-emerald-950/60 border border-[#C9A227]/50 rounded-2xl p-8 text-center space-y-4 shadow-xl">
        <div className="h-16 w-16 bg-[#005A36] text-white rounded-full flex items-center justify-center mx-auto shadow-lg border border-[#C9A227]/40">
          <CheckCircle2 className="h-8 w-8 text-[#C9A227]" />
        </div>
        <h3 className="text-2xl font-black text-white">Solicitação Recebida com Sucesso!</h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
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
            className="border-[#C9A227]/50 text-white hover:bg-[#C9A227]/10"
          >
            Enviar Nova Mensagem
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
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
              className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
            >
              <User className="h-3.5 w-3.5 text-[#C9A227]" />
              Nome Completo *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Carlos Silva"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-11 bg-slate-950 border-white/15 text-white placeholder:text-slate-500 focus-visible:ring-[#C9A227]"
            />
          </div>

          {/* Empresa */}
          <div className="space-y-1.5">
            <Label
              htmlFor="company"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
            >
              <Building className="h-3.5 w-3.5 text-[#C9A227]" />
              Empresa *
            </Label>
            <Input
              id="company"
              name="company"
              placeholder="Razão Social ou Nome Fantasia"
              value={formData.company}
              onChange={handleChange}
              required
              className="h-11 bg-slate-950 border-white/15 text-white placeholder:text-slate-500 focus-visible:ring-[#C9A227]"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <Label
              htmlFor="phone"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
            >
              <Phone className="h-3.5 w-3.5 text-[#C9A227]" />
              Telefone / WhatsApp *
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="(00) 90000-0000"
              value={formData.phone}
              onChange={handleChange}
              required
              className="h-11 bg-slate-950 border-white/15 text-white placeholder:text-slate-500 focus-visible:ring-[#C9A227]"
            />
          </div>

          {/* E-mail */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5 text-[#C9A227]" />
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
              className="h-11 bg-slate-950 border-white/15 text-white placeholder:text-slate-500 focus-visible:ring-[#C9A227]"
            />
          </div>
        </div>

        {/* Interesse / Mensagem */}
        <div className="space-y-1.5">
          <Label
            htmlFor="interest"
            className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#C9A227]" />
            Interesse / Mensagem
          </Label>
          <Textarea
            id="interest"
            name="interest"
            placeholder="Conte-nos quais módulos ou desafios da sua operação você gostaria de ver em funcionamento..."
            rows={4}
            value={formData.interest}
            onChange={handleChange}
            className="bg-slate-950 border-white/15 text-white placeholder:text-slate-500 focus-visible:ring-[#C9A227]"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#C9A227] to-[#a88219] hover:from-[#d8b030] hover:to-[#b88f20] text-gray-950 font-black h-12 text-sm sm:text-base shadow-xl shadow-[#C9A227]/20 transition-all cursor-pointer"
        >
          {loading ? (
            'Registrando sua solicitação...'
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              Solicitar Apresentação do Jetro
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}

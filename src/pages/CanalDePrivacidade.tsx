import { useState } from 'react'
import { PolicyLayout } from '@/components/policy-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { CheckCircle2, Mail, ShieldCheck, FileText } from 'lucide-react'
import { createPrivacyRequest } from '@/services/privacy-requests'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'

const REQUEST_TYPES = [
  'Correção',
  'Exclusão',
  'Acesso',
  'Portabilidade',
  'Revogação',
  'Reclamação',
  'Outros',
] as const

export default function CanalDePrivacidade() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    empresa: '',
    telefone: '',
    tipo_solicitacao: '',
    mensagem: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const setField = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }))
    setErrors((p) => ({ ...p, [k]: '' }))
  }

  const validate = (): FieldErrors => {
    const e: FieldErrors = {}
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório'
    if (!form.email.trim()) e.email = 'E-mail é obrigatório'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    if (!form.tipo_solicitacao) e.tipo_solicitacao = 'Selecione o tipo de solicitação'
    if (!form.mensagem.trim()) e.mensagem = 'Mensagem é obrigatória'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length > 0) {
      setErrors(v)
      return
    }
    setSubmitting(true)
    try {
      await createPrivacyRequest(form)
      setSuccess(true)
    } catch (err) {
      setErrors(extractFieldErrors(err))
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSuccess(false)
    setForm({ nome: '', email: '', empresa: '', telefone: '', tipo_solicitacao: '', mensagem: '' })
  }

  if (success) {
    return (
      <PolicyLayout title="Canal de Privacidade (DPO)" lastUpdated="10 de agosto de 2026">
        <div className="flex flex-col items-center text-center py-12 gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#005B2E]/10">
            <CheckCircle2 className="h-8 w-8 text-[#005B2E]" />
          </div>
          <h2 className="text-2xl font-bold text-[#005B2E]">Solicitação enviada com sucesso</h2>
          <p>
            Sua solicitação foi registrada e será analisada pela nossa equipe de proteção de dados.
            Entraremos em contato através do canal informado dentro do prazo legal estabelecido pela
            LGPD.
          </p>
          <Button onClick={resetForm} className="bg-[#005B2E] text-white hover:bg-[#004A24]">
            Nova solicitação
          </Button>
        </div>
      </PolicyLayout>
    )
  }

  return (
    <PolicyLayout title="Canal de Privacidade (DPO)" lastUpdated="10 de agosto de 2026">
      <h2 className="text-xl font-bold text-[#005B2E] pt-4">Encarregado de Dados (DPO)</h2>
      <p>
        A{' '}
        <strong className="text-[#005B2E]">
          Jetro — Plataforma Inteligente de Gestão Empresarial
        </strong>{' '}
        designa um Encarregado de Dados (DPO) responsável por garantir a conformidade com a Lei
        Geral de Proteção de Dados (LGPD) e atender às solicitações dos titulares de dados pessoais.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 not-prose">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005B2E]/10 text-[#005B2E] mb-3">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground mb-1">
            Responsável pelo tratamento de dados
          </h3>
          <p className="text-sm text-muted-foreground">
            O DPO da Jetro atua como canal de comunicação entre a empresa, os titulares de dados e a
            ANPD, garantindo transparência e conformidade.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005B2E]/10 text-[#005B2E] mb-3">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground mb-1">Canal de contato</h3>
          <p className="text-sm text-muted-foreground">
            E-mail: dpo@jetro.com.br
            <br />
            Telefone: +55 (27) 99999-9999
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005B2E]/10 text-[#005B2E] mb-3">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground mb-1">Solicitações LGPD</h3>
          <p className="text-sm text-muted-foreground">
            Exerça seus direitos como titular de dados através do formulário abaixo.
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-[#005B2E] pt-8">Formulário de Solicitação</h2>
      <p>Preencha os campos abaixo para enviar sua solicitação ao Encarregado de Dados.</p>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mt-4 not-prose">
        <div className="space-y-2">
          <Label htmlFor="nome" className="font-semibold text-sm">
            Nome *
          </Label>
          <Input
            id="nome"
            value={form.nome}
            onChange={(e) => setField('nome', e.target.value)}
            placeholder="Digite seu nome completo"
          />
          {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold text-sm">
            E-mail *
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="exemplo@email.com"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="empresa" className="font-semibold text-sm">
              Empresa
            </Label>
            <Input
              id="empresa"
              value={form.empresa}
              onChange={(e) => setField('empresa', e.target.value)}
              placeholder="Nome da empresa (opcional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone" className="font-semibold text-sm">
              Telefone
            </Label>
            <Input
              id="telefone"
              value={form.telefone}
              onChange={(e) => setField('telefone', e.target.value)}
              placeholder="(27) 99999-9999"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="font-semibold text-sm">Tipo de solicitação *</Label>
          <Select
            value={form.tipo_solicitacao}
            onValueChange={(v) => setField('tipo_solicitacao', v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o tipo de solicitação" />
            </SelectTrigger>
            <SelectContent>
              {REQUEST_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tipo_solicitacao && (
            <p className="text-sm text-red-500">{errors.tipo_solicitacao}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mensagem" className="font-semibold text-sm">
            Mensagem *
          </Label>
          <Textarea
            id="mensagem"
            value={form.mensagem}
            onChange={(e) => setField('mensagem', e.target.value)}
            placeholder="Descreva sua solicitação..."
            rows={5}
          />
          {errors.mensagem && <p className="text-sm text-red-500">{errors.mensagem}</p>}
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-[#005B2E] text-white hover:bg-[#004A24] disabled:opacity-50 px-8 py-6 text-base font-bold rounded-xl shadow-lg"
        >
          {submitting ? 'Enviando...' : 'Enviar solicitação'}
        </Button>
      </form>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Jetro — Plataforma Inteligente de Gestão Empresarial.
        </p>
      </div>
    </PolicyLayout>
  )
}

import { useState } from 'react'
import { PolicyLayout } from '@/components/policy-layout'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const LGPD_RIGHTS = [
  { id: 'acesso', label: 'Acesso aos dados' },
  { id: 'correcao', label: 'Correção de dados' },
  { id: 'exclusao', label: 'Exclusão de dados' },
  { id: 'anonimizacao', label: 'Anonimização' },
  { id: 'portabilidade', label: 'Portabilidade' },
  { id: 'revogacao', label: 'Revogação de consentimento' },
  { id: 'compartilhamento', label: 'Informações sobre compartilhamento' },
]

export default function CentralDePrivacidade() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [selectedRights, setSelectedRights] = useState<string[]>([])
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')

  const toggleRight = (id: string) => {
    setSelectedRights((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setTimeout(() => {
      setSubmitted(false)
      setSelectedRights([])
      setName('')
      setContact('')
      setMessage('')
    }, 300)
  }

  return (
    <PolicyLayout title="Central de Privacidade (LGPD)" lastUpdated="10 de agosto de 2026">
      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. Objetivo</h2>
      <p>
        A <strong className="text-[#005B2E]">Central de Privacidade (LGPD)</strong> da{' '}
        <strong className="text-[#005B2E]">
          Jetro — Plataforma Inteligente de Gestão Empresarial
        </strong>{' '}
        é o canal dedicado que reúne todos os direitos do titular de dados pessoais previstos na Lei
        nº 13.709/2018 (Lei Geral de Proteção de Dados).
      </p>
      <p>
        Aqui você encontra, de forma transparente e acessível, a relação dos direitos que você pode
        exercer e o meio para solicitar o atendimento da sua demanda junto à Jetro.
      </p>
      <p>
        Nossa equipe responsável analisará cada solicitação e responderá dentro dos prazos legais
        estabelecidos pela LGPD.
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">2. Direitos do titular</h2>
      <p>
        Nos termos da LGPD, você pode solicitar o exercício dos seguintes direitos em relação aos
        seus dados pessoais:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {LGPD_RIGHTS.map((right) => (
          <div
            key={right.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-4 transition-colors',
              selectedRights.includes(right.id)
                ? 'border-[#005B2E] bg-[#005B2E]/5'
                : 'border-border bg-card',
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#005B2E]/10 text-[#005B2E]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-foreground">{right.label}</span>
          </div>
        ))}
      </div>
      <p className="pt-4">
        Para exercer qualquer um desses direitos, utilize o botão abaixo para iniciar uma
        solicitação de atendimento LGPD.
      </p>

      <div className="pt-4">
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#005B2E] text-white hover:bg-[#004A24] text-base font-bold px-8 py-6 rounded-xl shadow-lg"
        >
          Solicitar atendimento LGPD
        </Button>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => (open ? setDialogOpen(true) : handleCloseDialog())}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {submitted ? (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#005B2E]/10">
                <CheckCircle2 className="h-8 w-8 text-[#005B2E]" />
              </div>
              <h3 className="text-xl font-bold text-[#005B2E]">Solicitação registrada</h3>
              <p className="text-muted-foreground text-sm">
                Sua solicitação de atendimento LGPD foi registrada com sucesso. Nossa equipe
                responsável analisará a demanda e entrará em contato dentro do prazo legal
                estabelecido pela LGPD.
              </p>
              <Button
                onClick={handleCloseDialog}
                className="bg-[#005B2E] text-white hover:bg-[#004A24]"
              >
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#005B2E]">Solicitar atendimento LGPD</DialogTitle>
                <DialogDescription>
                  Preencha o formulário abaixo para exercer os seus direitos de titular de dados.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">Direitos que deseja exercer *</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {LGPD_RIGHTS.map((right) => (
                      <div key={right.id} className="flex items-center gap-3">
                        <Checkbox
                          id={right.id}
                          checked={selectedRights.includes(right.id)}
                          onCheckedChange={() => toggleRight(right.id)}
                        />
                        <Label htmlFor={right.id} className="text-sm cursor-pointer">
                          {right.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lgpd-name" className="font-semibold text-sm">
                    Nome completo *
                  </Label>
                  <Input
                    id="lgpd-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Digite seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lgpd-contact" className="font-semibold text-sm">
                    E-mail ou telefone *
                  </Label>
                  <Input
                    id="lgpd-contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                    placeholder="exemplo@email.com ou (27) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lgpd-message" className="font-semibold text-sm">
                    Mensagem
                  </Label>
                  <Textarea
                    id="lgpd-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva sua solicitação..."
                    rows={4}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={selectedRights.length === 0 || !name || !contact}
                  className="w-full bg-[#005B2E] text-white hover:bg-[#004A24] disabled:opacity-50"
                >
                  Enviar solicitação
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Jetro — Plataforma Inteligente de Gestão Empresarial.
        </p>
      </div>
    </PolicyLayout>
  )
}

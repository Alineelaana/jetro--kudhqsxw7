import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PartnerPfFields } from '@/components/partner-pf-fields'
import { PartnerPjFields } from '@/components/partner-pj-fields'
import { type PartnerFieldProps } from '@/components/partner-shared'
import { EMPTY_PARTNER_FORM, type PartnerFormState } from '@/lib/partner-types'
import { preRegisterPartner } from '@/services/partners'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { CheckCircle2, Loader2, UserPlus, ArrowLeft, AlertCircle } from 'lucide-react'

export default function ClientRegister() {
  const [form, setForm] = useState<PartnerFormState>({ ...EMPTY_PARTNER_FORM, active: false })
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const update = (field: keyof PartnerFormState, value: string) =>
    setForm((p) => ({ ...p, [field]: value }))
  const setFile = (field: string, file: File | null) => setFiles((p) => ({ ...p, [field]: file }))

  const fieldProps: PartnerFieldProps = {
    form,
    update,
    onFileChange: setFile,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('partner_type', 'Cliente')
      formData.append('person_type', form.person_type)
      formData.append('active', 'false')
      formData.append('blocked', 'false')
      const { password, ...fields } = form
      Object.entries(fields).forEach(([k, v]) => {
        if (typeof v === 'boolean') formData.append(k, v ? 'true' : 'false')
        else if (v !== undefined && v !== null && v !== '') formData.append(k, String(v))
      })
      Object.entries(files).forEach(([k, f]) => {
        if (f) formData.append(k, f)
      })
      await preRegisterPartner(formData)
      setSuccess(true)
    } catch (err) {
      setError(getErrorMessage(err))
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-2 border-[#005B2E]/30 shadow-2xl text-center">
          <CardHeader className="bg-[#01361D] text-white border-b border-[#C89B3C]/40 pb-6 rounded-t-lg">
            <CardTitle className="text-xl font-black text-white flex items-center justify-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#E4C46A]" /> Pré-cadastro Enviado!
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Seu pré-cadastro foi recebido com sucesso! Você será notificado por e-mail assim que
              seu cadastro for validado pela equipe Velora Log.
            </p>
            <Button
              asChild
              className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-bold h-12 rounded-xl"
            >
              <Link to="/cliente/login">Voltar para o login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] px-4 py-12">
      <div className="container mx-auto max-w-4xl">
        <Link
          to="/cliente/login"
          className="inline-flex items-center gap-2 text-sm text-[#005B2E] hover:underline font-bold mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o login
        </Link>
        <Card className="border-2 border-[#005B2E]/30 shadow-xl">
          <CardHeader className="bg-[#01361D] text-white border-b border-[#C89B3C]/40 pb-6 rounded-t-lg">
            <CardTitle className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-[#E4C46A]" /> Pré-cadastro
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Tipo de Pessoa *</Label>
                <Select value={form.person_type} onValueChange={(v) => update('person_type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">Pessoa Física</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.person_type === 'PF' && <PartnerPfFields {...fieldProps} />}
              {form.person_type === 'PJ' && <PartnerPjFields {...fieldProps} />}

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/30">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-extrabold text-base shadow-lg h-12 rounded-xl"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

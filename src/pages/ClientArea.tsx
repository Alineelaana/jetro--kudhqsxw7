import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClientAuth } from '@/hooks/use-client-auth'
import pbClient from '@/lib/pocketbase/client-client'
import { getFileUrl } from '@/lib/partner-utils'
import { RESTRICTION_ALERT_TEXT } from '@/lib/partner-constants'
import { LogOut, FileText, AlertTriangle, User, Loader2 } from 'lucide-react'

interface PartnerData {
  id: string
  full_name: string
  company_name: string
  person_type: string
  email: string
  phone: string
  cpf: string
  cnpj: string
  address: string
  address_number: string
  address_district: string
  address_city: string
  address_state: string
  partner_type: string
  observations: string
  financial_restriction: boolean
  income_proof: string
  address_proof: string
  rg_cnh_doc: string
}

export default function ClientArea() {
  const navigate = useNavigate()
  const { client, clientLogout } = useClientAuth()
  const [partner, setPartner] = useState<PartnerData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!client) {
      navigate('/cliente/login')
      return
    }
    const partnerId = (client as Record<string, unknown>).partner_id as string
    if (!partnerId) {
      setLoading(false)
      return
    }
    pbClient
      .collection('partners')
      .getOne(partnerId)
      .then((r) => setPartner(r as unknown as PartnerData))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [client, navigate])

  const handleLogout = () => {
    clientLogout()
    navigate('/cliente/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center border-2 border-[#005B2E]/20">
          <CardContent className="py-12 space-y-4">
            <User className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-lg font-bold">Nenhum dado de parceiro vinculado encontrado.</p>
            <Button
              onClick={handleLogout}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const name = partner.person_type === 'PF' ? partner.full_name : partner.company_name
  const isRestricted = partner.financial_restriction === true
  const docs = [
    { label: 'Comprovante de Renda', file: partner.income_proof },
    { label: 'Comprovante de Endereço', file: partner.address_proof },
    { label: 'Documento RG/CNH', file: partner.rg_cnh_doc },
  ].filter((d) => d.file)

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-gray-50">
      <header className="bg-[#01361D] text-white py-4 px-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-black">Área do Cliente — Velora Log</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {isRestricted && (
          <div className="flex items-center gap-3 bg-red-50 border-2 border-red-400 rounded-lg p-4 text-red-800">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <span className="font-bold text-sm">{RESTRICTION_ALERT_TEXT}</span>
          </div>
        )}
        <Card
          className={`border-2 ${isRestricted ? 'border-red-400 bg-red-50' : 'border-[#005B2E]/20'}`}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-[#005B2E]" /> Meus Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Nome</p>
                <p className="font-semibold">{name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-semibold">{partner.partner_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-semibold">{partner.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="font-semibold">{partner.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CPF/CNPJ</p>
                <p className="font-semibold">{partner.cpf || partner.cnpj || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Endereço</p>
                <p className="font-semibold text-sm">
                  {partner.address}
                  {partner.address_number ? `, ${partner.address_number}` : ''}
                  {partner.address_district ? ` - ${partner.address_district}` : ''}
                  {partner.address_city ? `, ${partner.address_city}` : ''}
                  {partner.address_state ? ` - ${partner.address_state}` : ''}
                </p>
              </div>
            </div>
            {partner.observations && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">Observações</p>
                <p className="text-sm">{partner.observations}</p>
              </div>
            )}
          </CardContent>
        </Card>
        {docs.length > 0 && (
          <Card className="border-2 border-[#005B2E]/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#005B2E]" /> Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {docs.map((d) => (
                <a
                  key={d.label}
                  href={getFileUrl(partner.id, d.file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-[#005B2E]/5 transition-colors"
                >
                  <FileText className="w-5 h-5 text-[#005B2E]" />
                  <span className="text-sm font-medium flex-1">{d.label}</span>
                  <span className="text-xs text-[#005B2E] font-bold">Visualizar</span>
                </a>
              ))}
            </CardContent>
          </Card>
        )}
        <div className="text-center pt-4 flex items-center justify-center gap-4">
          <Link to="/site" className="text-sm text-[#005B2E] hover:underline font-bold">
            Voltar ao site
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            to={client ? '/cliente' : '/cliente/login'}
            className="text-sm text-muted-foreground hover:text-[#005B2E] hover:underline"
          >
            Área do cliente
          </Link>{' '}
        </div>
      </main>
    </div>
  )
}

import React from 'react'
import { useB2B } from '@/lib/b2b/b2b-context'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building, MapPin, Phone, Mail, CreditCard, ShieldCheck } from 'lucide-react'

export const B2BProfileScreen: React.FC = () => {
  const { client, partner } = useB2B()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Dados Cadastrais da Empresa
        </h1>
        <p className="text-sm text-slate-500">
          Informações corporativas registradas no ERP para faturamento e emissão de NF-e
        </p>
      </div>

      {/* DECISÃO 3: Saldo e Limite de Crédito SOMENTE se exibir_limite_credito === true */}
      {partner && partner.exibir_limite_credito && (
        <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-emerald-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Linha de Crédito e Faturamento B2B Aprovada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-xs">
                <span className="text-xs text-slate-500 block">Limite Total Aprovado</span>
                <span className="text-lg font-bold text-slate-900 block mt-0.5">
                  {partner.limite_credito ? `R$ ${partner.limite_credito}` : 'R$ 0,00'}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-xs">
                <span className="text-xs text-slate-500 block">Limite Disponível para Pedidos</span>
                <span className="text-lg font-bold text-emerald-700 block mt-0.5">
                  {partner.limite_credito_disponivel
                    ? `R$ ${partner.limite_credito_disponivel}`
                    : partner.limite_credito
                      ? `R$ ${partner.limite_credito}`
                      : 'R$ 0,00'}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-xs">
                <span className="text-xs text-slate-500 block">Situação de Crédito</span>
                <span className="text-sm font-semibold text-emerald-800 block mt-1">
                  {partner.situacao_credito || 'Regular / Liberado'}
                </span>
              </div>
            </div>
            <p className="text-xs text-emerald-700 mt-3">
              * O limite é consumido automaticamente conforme pedidos são submetidos e aprovados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dados Principais da PJ */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              Identificação Empresarial
            </CardTitle>
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100">
              Cliente Ativo B2B
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Razão Social</span>
              <span className="font-semibold text-slate-800 block">
                {partner?.company_name || client?.company_name}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Nome Fantasia</span>
              <span className="font-medium text-slate-800 block">
                {partner?.trade_name || partner?.company_name || client?.company_name}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">CNPJ</span>
              <span className="font-mono font-semibold text-slate-800 block">
                {partner?.cnpj || client?.cnpj}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">E-mail Cadastrado</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {client?.email || partner?.email}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Telefone de Contato</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {partner?.phone || client?.phone || 'Não informado'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço de Entrega Cadastrado */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            Endereço Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {partner?.address ? (
            <div className="space-y-1 text-sm text-slate-700">
              <p>
                <strong>Logradouro:</strong> {partner.address}, {partner.address_number || 'S/N'}
              </p>
              <p>
                <strong>Bairro:</strong> {partner.address_district || 'Não informado'}
              </p>
              <p>
                <strong>Município / UF:</strong> {partner.address_city || ''} -{' '}
                {partner.address_state || ''}
              </p>
              <p>
                <strong>CEP:</strong> {partner.cep || 'Não informado'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Nenhum endereço físico registrado na ficha principal. O endereço de entrega pode ser
              indicado ao finalizar pedidos.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-slate-500 p-3 bg-slate-100 rounded-lg">
        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>
          Para solicitar alteração de razão social, endereço de entrega ou inclusão de novos
          compradores, contate nossa equipe comercial interna.
        </span>
      </div>
    </div>
  )
}

import React from 'react'
import { Outlet } from 'react-router-dom'
import { JETRO_ONLINE_AVATAR_URL } from '@/lib/jetro-online-assets'
import { Sparkles, ShieldCheck } from 'lucide-react'

export function JetroOnlineLayout() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho Oficial da Central */}
      <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full overflow-hidden border-2 border-[#C9A227] shadow-md bg-[#002613] shrink-0">
              <img
                src={JETRO_ONLINE_AVATAR_URL}
                alt="Assistente Jetro On-line"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  Central de Configurações do Jetro On-line
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#005B2E]/10 text-[#005B2E] border border-[#005B2E]/20 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-[#C9A227]" />
                  Assistente ERP
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Gestão operacional, treinamento via Universidade Jetro, auditoria e personalização do
            assistente interno do ERP.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-[#005B2E] px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#005B2E]" />
          <span className="font-semibold">Ambiente Auditado & Restrito (Admin/SUP)</span>
        </div>
      </div>

      {/* Conteúdo direto da tela ativa. A navegação entre as telas é feita exclusivamente pelo menu lateral global. */}
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  )
}

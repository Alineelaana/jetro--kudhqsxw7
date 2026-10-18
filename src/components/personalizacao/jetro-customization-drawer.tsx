import React, { useState } from 'react'
import {
  Settings,
  X,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  Type,
  Eye,
  Sliders,
  Sparkles,
  Table,
  Accessibility,
  Check,
  ChevronDown,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  Globe,
  UserCheck,
} from 'lucide-react'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function useJetroCustomization() {
  const { isCustomizerOpen, setIsCustomizerOpen } = useUserPreferences()
  return { isCustomizerOpen, setIsCustomizerOpen }
}

export function JetroCustomizationDrawer() {
  const { isAuthenticated } = useAuth()
  const {
    preferences,
    updatePreference,
    adjustTextScale,
    restoreDefaults,
    isCustomizerOpen,
    setIsCustomizerOpen,
    isSaving,
  } = useUserPreferences()

  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'aparencia' | 'layout' | 'textos' | 'tabelas' | 'ia' | 'acessibilidade'
  >('aparencia')

  // Permitir acesso a personalizações tanto para usuários autenticados quanto no modo visitante/site
  // (preferências locais salvas em localStorage para visitantes)

  const handleReset = async () => {
    await restoreDefaults()
    setConfirmResetOpen(false)
  }

  return (
    <>
      {/* Elemento oculto de âncora/compatibilidade para tours ou testes que busquem o seletor */}
      <span id="jetro-customization-trigger" className="hidden" aria-hidden="true" />

      {/* BACKDROP QUANDO O PAINEL ESTIVER ABERTO (MOBILE) */}
      {isCustomizerOpen && (
        <div
          onClick={() => setIsCustomizerOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 md:hidden"
        />
      )}

      {/* ============================================================== */}
      {/* PAINEL LATERAL DE PERSONALIZAÇÃO — IDENTIDADE JETRO            */}
      {/* ============================================================== */}
      <aside
        aria-label="Central de Personalização Jetro"
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 bg-background shadow-2xl border-l border-border flex flex-col transition-transform duration-300 ease-in-out',
          'w-full sm:w-[420px] md:w-[440px]',
          isCustomizerOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* CABEÇALHO DO PAINEL — PADRÃO JETRO (VERDE-ESCURO + DOURADO) */}
        <div className="bg-[#002817] text-white p-4 shrink-0 border-b border-[#C9A227]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#00140b] border border-[#C9A227]/50 flex items-center justify-center text-[#E4C46A] shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wide text-white">Personalização</h2>
                <Badge className="bg-[#C9A227] text-slate-950 font-black text-[10px] px-1.5 py-0 h-4 uppercase">
                  Individual
                </Badge>
              </div>
              <p className="text-xs text-white/70">Configure o Jetro do seu jeito.</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(false)}
              className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Fechar painel de personalização"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO POR ABAS/GRUPOS (BASEADO NA IMAGEM DE REFERÊNCIA) */}
        <div className="border-b border-border bg-muted/40 p-1 shrink-0 overflow-x-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('aparencia')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
              activeTab === 'aparencia'
                ? 'bg-card text-[#005B2E] dark:text-[#E4C46A] shadow-2xs font-bold border border-border/80'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Aparência</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
              activeTab === 'layout'
                ? 'bg-card text-[#005B2E] dark:text-[#E4C46A] shadow-2xs font-bold border border-border/80'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layout</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('textos')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
              activeTab === 'textos'
                ? 'bg-card text-[#005B2E] dark:text-[#E4C46A] shadow-2xs font-bold border border-border/80'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Textos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tabelas')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
              activeTab === 'tabelas'
                ? 'bg-card text-[#005B2E] dark:text-[#E4C46A] shadow-2xs font-bold border border-border/80'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tabelas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ia')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
              activeTab === 'ia'
                ? 'bg-card text-[#005B2E] dark:text-[#E4C46A] shadow-2xs font-bold border border-border/80'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Jetro On-line</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('acessibilidade')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
              activeTab === 'acessibilidade'
                ? 'bg-card text-[#005B2E] dark:text-[#E4C46A] shadow-2xs font-bold border border-border/80'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span>Acessibilidade</span>
          </button>
        </div>

        {/* CORPO DE CONTROLE COM ROLAGEM */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-foreground">
          {/* ============================================================== */}
          {/* 1. ABA APARÊNCIA & TEMAS                                        */}
          {/* ============================================================== */}
          {activeTab === 'aparencia' && (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block mb-2">
                  TEMA DO SISTEMA
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Tema Claro */}
                  <button
                    type="button"
                    onClick={() => updatePreference('theme', 'light')}
                    className={cn(
                      'p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer',
                      preferences.theme === 'light'
                        ? 'border-[#005B2E] bg-[#005B2E]/5 ring-2 ring-[#005B2E]/30 font-bold text-foreground'
                        : 'border-border hover:bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-amber-500 shadow-2xs">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Claro</p>
                      <p className="text-[10px] text-muted-foreground">Para ambientes iluminados</p>
                    </div>
                  </button>

                  {/* Tema Escuro */}
                  <button
                    type="button"
                    onClick={() => updatePreference('theme', 'dark')}
                    className={cn(
                      'p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer',
                      preferences.theme === 'dark'
                        ? 'border-[#C9A227] bg-[#01361D] text-white ring-2 ring-[#C9A227]/40 font-bold'
                        : 'border-border hover:bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 shadow-2xs">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Escuro</p>
                      <p className="text-[10px] text-muted-foreground">Ambientes com pouca luz</p>
                    </div>
                  </button>

                  {/* Automático */}
                  <button
                    type="button"
                    onClick={() => updatePreference('theme', 'auto')}
                    className={cn(
                      'p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer',
                      preferences.theme === 'auto'
                        ? 'border-[#005B2E] bg-[#005B2E]/5 ring-2 ring-[#005B2E]/30 font-bold text-foreground'
                        : 'border-border hover:bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-emerald-600 shadow-2xs">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Automático</p>
                      <p className="text-[10px] text-muted-foreground">Segue o dispositivo</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Alto Contraste */}
              <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#C9A227]" />
                    <span className="text-xs font-bold">Modo Alto Contraste</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Linhas de borda nítidas e separação cromática acentuada.
                  </p>
                </div>
                <Switch
                  checked={preferences.highContrast}
                  onCheckedChange={(checked) => updatePreference('highContrast', checked)}
                />
              </div>

              {/* Indicador de persistência imediata */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#005B2E] dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-950 dark:text-emerald-200 leading-tight">
                  <span className="font-bold">Sincronizado na sua conta:</span> suas escolhas são
                  aplicadas na hora e preservadas no seu usuário autenticado.
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. ABA LAYOUT (IGUAL REFERÊNCIA: ANIMAÇÕES, FIXAR, MENU, ETC)  */}
          {/* ============================================================== */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              {/* ANIMAÇÕES */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                  ANIMAÇÕES
                </span>
                <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">Ativar animações</span>
                    <p className="text-[11px] text-muted-foreground">
                      Transições fluidas de telas, menus e janelas modais.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.animationsEnabled}
                    onCheckedChange={(checked) => updatePreference('animationsEnabled', checked)}
                  />
                </div>
              </div>

              {/* FIXAR CABEÇALHO E RODAPÉ */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                  FIXAR ELEMENTOS
                </span>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold">Cabeçalho</span>
                      <p className="text-[11px] text-muted-foreground">
                        Mantém a barra superior visível ao rolar as páginas.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.fixHeader}
                      onCheckedChange={(checked) => updatePreference('fixHeader', checked)}
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold">Rodapé</span>
                      <p className="text-[11px] text-muted-foreground">
                        Mantém o rodapé institucional fixado na base da tela.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.fixFooter}
                      onCheckedChange={(checked) => updatePreference('fixFooter', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* MENU LATERAL */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                  MENU LATERAL
                </span>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold">Expandido por padrão</span>
                      <p className="text-[11px] text-muted-foreground">
                        Padrão do sistema para novos usuários é recolhido (ícones).
                      </p>
                    </div>
                    <Switch
                      checked={preferences.sidebarExpanded}
                      onCheckedChange={(checked) => updatePreference('sidebarExpanded', checked)}
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold">Largura do menu expandido</span>
                      <p className="text-[11px] text-muted-foreground">
                        Largura padrão (256px) ou compacta (220px).
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => updatePreference('sidebarWidth', 'compact')}
                        className={cn(
                          'px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer',
                          preferences.sidebarWidth === 'compact'
                            ? 'bg-card text-foreground shadow-2xs'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        Compacto
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePreference('sidebarWidth', 'normal')}
                        className={cn(
                          'px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer',
                          preferences.sidebarWidth === 'normal'
                            ? 'bg-card text-foreground shadow-2xs'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        Normal
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* DENSIDADE DE ESPAÇAMENTO DA INTERFACE */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                  ESPAÇAMENTO GERAL DA INTERFACE
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updatePreference('spacingDensity', 'compact')}
                    className={cn(
                      'p-2.5 rounded-xl border text-center transition-all cursor-pointer',
                      preferences.spacingDensity === 'compact'
                        ? 'border-[#005B2E] bg-[#005B2E]/10 font-bold text-foreground'
                        : 'border-border hover:bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <p className="text-xs font-bold">Compacto</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Mais conteúdo</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePreference('spacingDensity', 'comfortable')}
                    className={cn(
                      'p-2.5 rounded-xl border text-center transition-all cursor-pointer',
                      preferences.spacingDensity === 'comfortable'
                        ? 'border-[#005B2E] bg-[#005B2E]/10 font-bold text-foreground'
                        : 'border-border hover:bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <p className="text-xs font-bold">Confortável</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Equilibrado</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePreference('spacingDensity', 'spacious')}
                    className={cn(
                      'p-2.5 rounded-xl border text-center transition-all cursor-pointer',
                      preferences.spacingDensity === 'spacious'
                        ? 'border-[#005B2E] bg-[#005B2E]/10 font-bold text-foreground'
                        : 'border-border hover:bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <p className="text-xs font-bold">Amplo</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Respira mais</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. ABA TEXTOS (REPRODUÇÃO FIEL DA REFERÊNCIA − / ↻ / +)         */}
          {/* ============================================================== */}
          {activeTab === 'textos' && (
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                TAMANHO DOS TEXTOS
              </span>

              {/* CONTROLE IDÊNTICO À IMAGEM: "Tamanho dos Textos [ - | ↻ | + ]" */}
              <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3 shadow-2xs">
                <div>
                  <span className="text-sm font-bold text-foreground block">
                    Tamanho dos Textos
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Ajuste fino progressivo (
                    {preferences.textScaleStep === 0
                      ? '100% Padrão'
                      : `${preferences.textScaleStep > 0 ? '+' : ''}${preferences.textScaleStep * 8}%`}
                    )
                  </span>
                </div>

                {/* Bloco triplo com estilo idêntico à imagem de referência */}
                <div className="flex items-center rounded-lg bg-[#002817] text-white p-0.5 shadow-xs border border-[#C9A227]/40">
                  <button
                    type="button"
                    onClick={() => adjustTextScale('decrease')}
                    disabled={preferences.textScaleStep <= -2}
                    title="Diminuir textos"
                    className="p-1.5 hover:bg-white/20 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                  </button>
                  <div className="w-[1px] h-4 bg-white/20" />
                  <button
                    type="button"
                    onClick={() => adjustTextScale('reset')}
                    title="Restaurar tamanho padrão (100%)"
                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors cursor-pointer text-[#E4C46A]"
                  >
                    <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <div className="w-[1px] h-4 bg-white/20" />
                  <button
                    type="button"
                    onClick={() => adjustTextScale('increase')}
                    disabled={preferences.textScaleStep >= 2}
                    title="Aumentar textos"
                    className="p-1.5 hover:bg-white/20 disabled:opacity-30 rounded-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* OPÇÕES PREDEFINIDAS: COMPACTO / NORMAL / GRANDE */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block mb-2">
                  OPÇÕES PREDEFINIDAS
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updatePreference('textSize', 'compact')
                      updatePreference('textScaleStep', -1)
                    }}
                    className={cn(
                      'p-3 rounded-xl border text-center transition-all cursor-pointer',
                      preferences.textSize === 'compact'
                        ? 'border-[#005B2E] bg-[#005B2E]/10 font-bold text-foreground'
                        : 'border-border hover:bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <p className="text-xs font-bold">Compacto</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Mais dados</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updatePreference('textSize', 'normal')
                      updatePreference('textScaleStep', 0)
                    }}
                    className={cn(
                      'p-3 rounded-xl border text-center transition-all cursor-pointer',
                      preferences.textSize === 'normal' && preferences.textScaleStep === 0
                        ? 'border-[#005B2E] bg-[#005B2E]/10 font-bold text-foreground'
                        : 'border-border hover:bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <p className="text-xs font-bold">Normal</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Padrão</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updatePreference('textSize', 'large')
                      updatePreference('textScaleStep', 1)
                    }}
                    className={cn(
                      'p-3 rounded-xl border text-center transition-all cursor-pointer',
                      preferences.textSize === 'large'
                        ? 'border-[#005B2E] bg-[#005B2E]/10 font-bold text-foreground'
                        : 'border-border hover:bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <p className="text-xs font-bold">Grande</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Alta leitura</p>
                  </button>
                </div>
              </div>

              {/* Demonstração visual ao vivo do tamanho */}
              <div className="p-3.5 rounded-xl border border-dashed border-border bg-muted/20 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Pré-visualização do texto
                </span>
                <p className="text-sm font-bold text-foreground">
                  JETRO — Plataforma Inteligente de Gestão Empresarial
                </p>
                <p className="text-xs text-muted-foreground">
                  Demonstração da tipografia com proporções harmônicas preservadas em títulos,
                  formulários e tabelas.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. ABA TABELAS                                                  */}
          {/* ============================================================== */}
          {activeTab === 'tabelas' && (
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                PREFERÊNCIAS GLOBAIS DE TABELA
              </span>

              {/* Linhas por página */}
              <div className="p-3 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Linhas por página (padrão)</span>
                  <Badge variant="outline" className="text-xs font-bold">
                    {preferences.tableRowsPerPage} linhas
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 25, 50, 100].map((rows) => (
                    <button
                      key={rows}
                      type="button"
                      onClick={() =>
                        updatePreference('tableRowsPerPage', rows as 10 | 25 | 50 | 100)
                      }
                      className={cn(
                        'py-1.5 text-xs rounded-lg font-bold border transition-colors cursor-pointer',
                        preferences.tableRowsPerPage === rows
                          ? 'bg-[#005B2E] text-white border-[#005B2E]'
                          : 'border-border bg-background hover:bg-muted text-muted-foreground',
                      )}
                    >
                      {rows}
                    </button>
                  ))}
                </div>
              </div>

              {/* Densidade das linhas da tabela */}
              <div className="p-3 rounded-xl border border-border bg-card space-y-2">
                <span className="text-xs font-bold block">Densidade das linhas</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updatePreference('tableDensity', 'compact')}
                    className={cn(
                      'py-1.5 text-xs rounded-lg font-semibold border transition-colors cursor-pointer',
                      preferences.tableDensity === 'compact'
                        ? 'bg-[#005B2E] text-white border-[#005B2E]'
                        : 'border-border bg-background hover:bg-muted text-muted-foreground',
                    )}
                  >
                    Compacta
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePreference('tableDensity', 'comfortable')}
                    className={cn(
                      'py-1.5 text-xs rounded-lg font-semibold border transition-colors cursor-pointer',
                      preferences.tableDensity === 'comfortable'
                        ? 'bg-[#005B2E] text-white border-[#005B2E]'
                        : 'border-border bg-background hover:bg-muted text-muted-foreground',
                    )}
                  >
                    Confortável
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePreference('tableDensity', 'spacious')}
                    className={cn(
                      'py-1.5 text-xs rounded-lg font-semibold border transition-colors cursor-pointer',
                      preferences.tableDensity === 'spacious'
                        ? 'bg-[#005B2E] text-white border-[#005B2E]'
                        : 'border-border bg-background hover:bg-muted text-muted-foreground',
                    )}
                  >
                    Ampla
                  </button>
                </div>
              </div>

              {/* Toggles de tabela */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">Linhas alternadas (Zebra)</span>
                    <p className="text-[11px] text-muted-foreground">
                      Contraste de cor suave linha sim, linha não.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.tableStripedRows}
                    onCheckedChange={(checked) => updatePreference('tableStripedRows', checked)}
                  />
                </div>

                <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">Fixar cabeçalho da tabela</span>
                    <p className="text-[11px] text-muted-foreground">
                      Mantém o cabeçalho verde sempre visível ao rolar dados.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.tableStickyHeader}
                    onCheckedChange={(checked) => updatePreference('tableStickyHeader', checked)}
                  />
                </div>

                <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">Linhas divisórias verticais</span>
                    <p className="text-[11px] text-muted-foreground">
                      Bordas verticais para facilitar a leitura de colunas extensas.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.tableDividers}
                    onCheckedChange={(checked) => updatePreference('tableDividers', checked)}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground">Nota:</span> a personalização individual
                de colunas (ordem, largura e visibilidade) por tela continua preservada de forma
                independente.
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 5. ABA JETRO ON-LINE (EXPERIÊNCIA VISUAL)                      */}
          {/* ============================================================== */}
          {activeTab === 'ia' && (
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                EXPERIÊNCIA DO JETRO ON-LINE
              </span>

              <div className="space-y-2">
                <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">Sugestões inteligentes</span>
                    <p className="text-[11px] text-muted-foreground">
                      Exibir perguntas sugeridas e atalhos na tela inicial do chat.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.jetroOnlineSuggestions}
                    onCheckedChange={(checked) =>
                      updatePreference('jetroOnlineSuggestions', checked)
                    }
                  />
                </div>

                <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">Efeito de digitação suave</span>
                    <p className="text-[11px] text-muted-foreground">
                      Animação de digitação em tempo real na saudação do assistente.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.jetroOnlineTypingEffect}
                    onCheckedChange={(checked) =>
                      updatePreference('jetroOnlineTypingEffect', checked)
                    }
                  />
                </div>

                <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">Notificações visuais</span>
                    <p className="text-[11px] text-muted-foreground">
                      Ponto pulsante e indicador de disponibilidade no botão lateral.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.jetroOnlineVisualNotifications}
                    onCheckedChange={(checked) =>
                      updatePreference('jetroOnlineVisualNotifications', checked)
                    }
                  />
                </div>

                <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">Modo de resposta</span>
                    <p className="text-[11px] text-muted-foreground">
                      Preferência visual para respostas sintetizadas ou detalhadas.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => updatePreference('jetroOnlineResponseMode', 'compact')}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer',
                        preferences.jetroOnlineResponseMode === 'compact'
                          ? 'bg-card text-foreground shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Compacto
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePreference('jetroOnlineResponseMode', 'detailed')}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer',
                        preferences.jetroOnlineResponseMode === 'detailed'
                          ? 'bg-card text-foreground shadow-2xs'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Detalhado
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200">
                <span className="font-bold">Segurança e Governança:</span> estas configurações
                afetam apenas a sua experiência de navegação e visualização. As instruções internas,
                permissões e integridade de dados da IA continuam inalteradas.
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 6. ABA ACESSIBILIDADE                                           */}
          {/* ============================================================== */}
          {activeTab === 'acessibilidade' && (
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                ACESSIBILIDADE UNIVERSAL
              </span>

              <div className="space-y-2">
                <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">Redução forçada de movimentos</span>
                    <p className="text-[11px] text-muted-foreground">
                      Desativa animações mesmo que o sistema operacional permita.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.reducedMotion}
                    onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
                  />
                </div>

                <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">Destaque de foco por teclado</span>
                    <p className="text-[11px] text-muted-foreground">
                      Borda dourada reforçada de 3px em elementos selecionados por Tab.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.focusHighlight}
                    onCheckedChange={(checked) => updatePreference('focusHighlight', checked)}
                  />
                </div>

                <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">Alvos de toque ampliados</span>
                    <p className="text-[11px] text-muted-foreground">
                      Botões e campos com altura mínima de 44px para facilitar o toque.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.largeTouchTargets}
                    onCheckedChange={(checked) => updatePreference('largeTouchTargets', checked)}
                  />
                </div>
              </div>

              {/* FUSO HORÁRIO E TRATAMENTO PESSOAL */}
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                  LOCALIZAÇÃO E SAUDAÇÃO PESSOAL
                </span>

                {/* Tratamento */}
                <div className="p-3 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#005B2E]" />
                    <span className="text-xs font-bold">Forma de Tratamento</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Define como o ERP se dirige a você nas boas-vindas da tela inicial.
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { val: 'masculino', label: 'Bem-vindo' },
                      { val: 'feminino', label: 'Bem-vinda' },
                      { val: 'neutro', label: 'Neutro' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() =>
                          updatePreference(
                            'tratamento',
                            item.val as 'masculino' | 'feminino' | 'neutro',
                          )
                        }
                        className={cn(
                          'py-1.5 text-xs rounded-lg font-semibold border transition-colors cursor-pointer',
                          (preferences.tratamento || 'neutro') === item.val
                            ? 'bg-[#005B2E] text-white border-[#005B2E]'
                            : 'border-border bg-background hover:bg-muted text-muted-foreground',
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuso Horário */}
                <div className="p-3 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#005B2E]" />
                    <span className="text-xs font-bold">Fuso Horário Oficial</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Utilizado no cálculo exato da saudação e dos compromissos da agenda.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { val: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
                      { val: 'America/Manaus', label: 'Manaus (GMT-4)' },
                      { val: 'America/Cuiaba', label: 'Cuiabá (GMT-4)' },
                      { val: 'America/Belem', label: 'Belém (GMT-3)' },
                    ].map((tz) => (
                      <button
                        key={tz.val}
                        type="button"
                        onClick={() => {
                          updatePreference('timezone', tz.val)
                          updatePreference('fuso_horario', tz.val)
                        }}
                        className={cn(
                          'p-2 text-xs text-left rounded-lg font-semibold border transition-colors cursor-pointer',
                          (preferences.fuso_horario ||
                            preferences.timezone ||
                            'America/Sao_Paulo') === tz.val
                            ? 'bg-[#005B2E] text-white border-[#005B2E]'
                            : 'border-border bg-background hover:bg-muted text-muted-foreground',
                        )}
                      >
                        {tz.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ DO PAINEL COM BOTÃO RESTAURAR PADRÃO */}
        <div className="p-4 border-t border-border bg-muted/20 shrink-0 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirmResetOpen(true)}
            className="text-xs h-9 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Restaurar Padrão
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setIsCustomizerOpen(false)}
            className="text-xs h-9 bg-[#005B2E] hover:bg-[#004724] text-white font-semibold px-4"
          >
            Concluir
          </Button>
        </div>
      </aside>

      {/* DIÁLOGO DE CONFIRMAÇÃO PARA RESTAURAR PADRÕES */}
      <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <DialogTitle className="text-base font-bold text-foreground">
                Restaurar preferências de interface?
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Todas as personalizações visuais (tema, tamanhos de texto, cabeçalho fixo, animações e
              tabelas) serão redefinidas para os padrões de fábrica do ERP Jetro para o seu usuário.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border">
            <p>
              <strong>Fique tranquilo:</strong> nenhum dado, relatório, venda, permissão de acesso
              ou cadastro será alterado.
            </p>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmResetOpen(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleReset}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
            >
              Confirmar e Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

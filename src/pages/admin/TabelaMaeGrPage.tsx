import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  FileSpreadsheet,
  Upload,
  Download,
  RotateCcw,
  RefreshCw,
  Save,
  HelpCircle,
  AlertCircle,
  Database,
  FileCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { JetroSpreadsheet } from '@/components/spreadsheet/JetroSpreadsheet'
import { ImportTabelaMaeDialog } from '@/components/spreadsheet/ImportTabelaMaeDialog'
import { getWorkbookBySlug, saveWorkbook } from '@/services/spreadsheet-storage'
import { exportWorkbookToExcel } from '@/lib/spreadsheet-file-utils'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import type { SheetData, WorkbookData } from '@/types/spreadsheet'
import { colIndexToLetter } from '@/lib/spreadsheet-formula-engine'

/**
 * Cria um Workbook inicial limpo para a Tabela Mãe GR
 * ATENÇÃO: Nenhuma linha de produtos é embutida no código. Nasce 100% vazia pronta para importação pelo usuário.
 */
function createInitialTabelaMaeWorkbook(): WorkbookData {
  const defaultCols = Array.from({ length: 15 }, (_, i) => ({
    id: colIndexToLetter(i),
    width: i === 0 ? 220 : 130,
    title: i === 0 ? 'Item / Código' : undefined,
  }))

  const initialSheet: SheetData = {
    id: 'sheet-tabela-mae-1',
    name: 'Tabela Mãe GR',
    cells: {},
    columns: defaultCols,
    rowsCount: 60,
    order: 0,
  }

  return {
    sheets: [initialSheet],
    activeSheetIndex: 0,
  }
}

export default function TabelaMaeGrPage() {
  const { userRole, currentUser } = useAuth()
  const { toast } = useToast()

  // Permissões RBAC Jetro: quem pode editar (SUP, COMERCIAL, FINANCEIRO)
  const canEdit = useMemo(() => {
    return ['SUP', 'COMERCIAL', 'FINANCEIRO'].includes(userRole || '')
  }, [userRole])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workbook, setWorkbook] = useState<WorkbookData>(createInitialTabelaMaeWorkbook())
  const [currentVersion, setCurrentVersion] = useState<number>(1)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Carrega snapshot existente do banco de dados
  const loadTabelaMae = useCallback(async () => {
    try {
      setLoading(true)
      const record = await getWorkbookBySlug('tabela-mae-gr')
      if (record && record.workbook_data) {
        setWorkbook(record.workbook_data)
        setCurrentVersion(record.version)
      } else {
        const clean = createInitialTabelaMaeWorkbook()
        setWorkbook(clean)
      }
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error('Erro ao carregar Tabela Mãe GR:', err)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar a Tabela Mãe do banco.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadTabelaMae()
  }, [loadTabelaMae])

  // Salvar workbook
  const handleSave = async (wbToSave: WorkbookData) => {
    if (!canEdit) {
      toast({
        title: 'Permissão insuficiente',
        description: 'Seu perfil de usuário não tem permissão para editar a planilha.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const res = await saveWorkbook({
        slug: 'tabela-mae-gr',
        titulo: 'Tabela Mãe GR',
        workbookData: wbToSave,
        expectedVersion: currentVersion,
        authorId: currentUser?.id,
        authorName: currentUser?.name || 'Administrador',
        authorEmail: currentUser?.email,
        changeSummary: 'Alterações salvas na grade da Tabela Mãe GR',
      })

      if (res.conflictDetected) {
        toast({
          title: 'Conflito de versão detectado',
          description: `Outro usuário salvou a versão #${res.serverVersion}. Atualize a página para mesclar.`,
          variant: 'destructive',
        })
        return
      }

      setWorkbook(wbToSave)
      setCurrentVersion(res.record.version)
      setHasUnsavedChanges(false)
      toast({
        title: 'Tabela Mãe salva com sucesso',
        description: `Versão #${res.record.version} persistida no banco do Jetro.`,
      })
    } catch (err) {
      console.error('Erro ao salvar Tabela Mãe GR:', err)
      toast({
        title: 'Erro ao salvar',
        description: 'Falha ao persistir alterações no Skip Cloud.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Autosave seguro em segundo plano
  const handleAutoSave = async (wbToSave: WorkbookData) => {
    if (!canEdit) return
    try {
      await saveWorkbook({
        slug: 'tabela-mae-gr',
        titulo: 'Tabela Mãe GR',
        workbookData: wbToSave,
        authorId: currentUser?.id,
        authorName: currentUser?.name || 'Administrador',
        changeSummary: 'Autosave periódico em segundo plano',
        isAutosave: true,
      })
    } catch (err) {
      console.warn('Erro silencioso no autosave:', err)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* CABEÇALHO DO MÓDULO */}
      <header className="bg-white border-b border-gray-200 px-5 py-3 shrink-0 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#005B2E]/10 text-[#005B2E] flex items-center justify-center shrink-0 border border-[#005B2E]/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#005B2E] uppercase tracking-wider">
                  Planilhas Convertidas
                </span>
                <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-300">
                  Gran Romano
                </Badge>
                <Badge className="bg-emerald-600 text-white text-[10px]">
                  Versão #{currentVersion}
                </Badge>
              </div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Tabela Mãe GR</h1>
              <p className="text-xs text-gray-500">
                Planilha mestre editável com múltiplas abas, fórmulas, histórico de versões e
                importação de Excel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              disabled={!canEdit || loading}
              className="text-xs h-8 bg-emerald-50 text-[#005B2E] border-emerald-300 hover:bg-emerald-100"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Importar Planilha Excel (.xlsx)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                exportWorkbookToExcel(workbook, 'TABELA_MAE_GR.xlsx')
                toast({
                  title: 'Exportação concluída',
                  description: 'Arquivo TABELA_MAE_GR.xlsx gerado com todas as abas e fórmulas.',
                })
              }}
              className="text-xs h-8 text-gray-700"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Exportar Excel
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadTabelaMae}
              disabled={loading}
              className="text-xs h-8 text-gray-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-[#005B2E] rounded border border-emerald-200 text-xs">
                  <Database className="w-3.5 h-3.5" />
                  <span>Persistência Ativa</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                As alterações realizadas nas células são salvas no banco de dados e recuperadas em
                logins futuros.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* PLANILHA INTERATIVA JETRO SPREADSHEET */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
            Carregando estrutura da Tabela Mãe...
          </div>
        ) : (
          <JetroSpreadsheet
            slug="tabela-mae-gr"
            title="Tabela Mãe GR"
            initialWorkbook={workbook}
            canEdit={canEdit}
            canRestore={canEdit}
            onSave={handleSave}
            onAutoSave={handleAutoSave}
            hasUnsavedChanges={hasUnsavedChanges}
            saving={saving}
            onCustomImportClick={() => setIsImportModalOpen(true)}
          />
        )}
      </div>

      {/* DIÁLOGO DE IMPORTAÇÃO MULTI-ABA TOLERANTE */}
      <ImportTabelaMaeDialog
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        currentWorkbook={workbook}
        currentVersion={currentVersion}
        onImportSuccess={async (newWb, newVer) => {
          setWorkbook(newWb)
          setCurrentVersion(newVer)
          setHasUnsavedChanges(false)
        }}
      />
    </div>
  )
}

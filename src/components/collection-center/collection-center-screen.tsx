import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useCollectionCenter } from '@/hooks/use-collection-center'
import { useAuth } from '@/hooks/use-auth'
import { canViewCollectionCenter, canExportCollection } from '@/lib/collection-center-permissions'
import { CollectionExecutiveHeader } from './collection-executive-header'
import { CollectionQueue } from './collection-queue'
import { CollectionClientPanel } from './collection-client-panel'
import { CollectionRightPanel } from './collection-right-panel'
import { CollectionFilterBar } from './collection-filter-bar'
import {
  ContactDialog,
  PromiseDialog,
  DisputeDialog,
  SendCollectionDialog,
} from './collection-dialogs'
import { CollectionNegotiationDialog } from './collection-negotiation-dialog'
import { CollectionNextActionDialog } from './collection-next-action-dialog'
import {
  exportCarteiraCsv,
  exportClientCsv,
  downloadCsv,
  getBoletosByClient,
  getPixByClient,
} from '@/services/collection-center-extended'
import { logSendCollection } from '@/services/collection-center'
import { checkProfileScreenAccess } from '@/lib/profile-permissions'
import { toast } from 'sonner'

export function CollectionCenterScreen() {
  const { userRole } = useAuth()
  const isSup = userRole?.toUpperCase() === 'SUP'
  const canView = isSup || checkProfileScreenAccess(userRole, '/admin/cobranca', 'v')
  const canExport = isSup || checkProfileScreenAccess(userRole, '/admin/cobranca', 'e')

  const cc = useCollectionCenter()
  const [dialog, setDialog] = useState<string | null>(null)
  const closeDialog = () => setDialog(null)
  const onSaved = () => {
    cc.refresh()
    closeDialog()
  }

  if (!canView)
    return (
      <p className="text-center text-muted-foreground py-8">
        Sem permissão para acessar a Central de Cobrança
      </p>
    )

  const client = cc.selectedClient
  const selectedTitleObjs =
    client?.receivables?.filter((r) => cc.selectedTitleIds.includes(r.id)) || []

  const handleAction = async (key: string) => {
    if (key === 'history') return
    if (key === 'whatsapp' || key === 'email') {
      setDialog('send')
      return
    }
    if (key === 'second_copy') {
      if (!client) return
      const boletos = await getBoletosByClient(client.cliente)
      if (boletos.length > 0) toast.info(`${boletos.length} boleto(s) encontrado(s)`)
      else toast.info('Nenhum boleto encontrado')
      return
    }
    if (key === 'copy_pix') {
      if (!client) return
      const pix = await getPixByClient(client.cliente)
      if (pix.length > 0 && pix[0].chave_pix) {
        navigator.clipboard.writeText(pix[0].chave_pix)
        toast.success('PIX copiado')
      } else toast.info('Nenhum PIX encontrado')
      return
    }
    if (key === 'escalate') {
      if (!client) return
      await logSendCollection(
        client.cliente,
        'Escalonamento',
        'Cliente escalado para vendedor/gerente',
      )
      toast.success('Vendedor acionado')
      cc.refresh()
      return
    }
    setDialog(key)
  }

  const handleExportCarteira = () => {
    if (!canExport) {
      toast.error('Sem permissão para exportar')
      return
    }
    downloadCsv('carteira-cobranca.csv', exportCarteiraCsv(cc.queueItems))
    toast.success('Carteira exportada')
  }

  const handleExportClient = () => {
    if (!canExport || !client) {
      toast.error('Sem permissão ou cliente não selecionado')
      return
    }
    downloadCsv(`cliente-${client.cliente}.csv`, exportClientCsv(client))
    toast.success('Cliente exportado')
  }

  return (
    <div className="space-y-3">
      <CollectionExecutiveHeader stats={cc.stats} onCardClick={cc.applyCardFilter} />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#005B2E]">Central de Cobrança</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExportCarteira}>
            <Download className="w-4 h-4 mr-1" /> Carteira
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportClient} disabled={!client}>
            <Download className="w-4 h-4 mr-1" /> Cliente
          </Button>
        </div>
      </div>
      <CollectionFilterBar
        filters={cc.filters}
        onFilterChange={cc.setFilters}
        filterOptions={cc.filterOptions}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-3">
          <CollectionQueue
            items={cc.queueItems}
            loading={cc.loading}
            sortBy={cc.sortBy}
            onSortChange={cc.setSortBy}
            filters={cc.filters}
            onFilterChange={cc.setFilters}
            selectedCliente={client?.cliente || null}
            onSelectClient={cc.selectClient}
          />
        </div>
        <div className="lg:col-span-5">
          <CollectionClientPanel
            client={client}
            selectedTitleIds={cc.selectedTitleIds}
            onToggleTitle={cc.toggleTitle}
          />
        </div>
        <div className="lg:col-span-4">
          <CollectionRightPanel
            client={client}
            queueItems={cc.queueItems}
            onAction={handleAction}
          />
        </div>
      </div>
      {client && (
        <>
          <ContactDialog
            open={dialog === 'contact'}
            onOpenChange={(v) => (v ? null : closeDialog())}
            cliente={client.cliente}
            onSaved={onSaved}
          />
          <PromiseDialog
            open={dialog === 'promise'}
            onOpenChange={(v) => (v ? null : closeDialog())}
            cliente={client.cliente}
            selectedTitles={selectedTitleObjs}
            onSaved={onSaved}
          />
          <CollectionNegotiationDialog
            open={dialog === 'negotiate'}
            onOpenChange={(v) => (v ? null : closeDialog())}
            cliente={client.cliente}
            selectedTitles={selectedTitleObjs}
            onSaved={onSaved}
          />
          <SendCollectionDialog
            open={dialog === 'send'}
            onOpenChange={(v) => (v ? null : closeDialog())}
            cliente={client.cliente}
            phone=""
            totalVencido={client.valorVencido}
            onSaved={onSaved}
          />
          <DisputeDialog
            open={dialog === 'dispute'}
            onOpenChange={(v) => (v ? null : closeDialog())}
            cliente={client.cliente}
            onSaved={onSaved}
          />
          <CollectionNextActionDialog
            open={dialog === 'task'}
            onOpenChange={(v) => (v ? null : closeDialog())}
            cliente={client.cliente}
            onSaved={onSaved}
          />
        </>
      )}
    </div>
  )
}

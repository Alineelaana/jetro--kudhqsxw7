import { useState } from 'react'
import { CmsVitrineList } from '@/components/cms/cms-vitrine-list'
import { CmsVitrineForm } from '@/components/cms/cms-vitrine-form'
import { CmsVitrinePreview } from '@/components/cms/cms-vitrine-preview'
import type { VitrineItem } from '@/lib/vitrine-types'

export function CmsVitrine() {
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [previewItem, setPreviewItem] = useState<VitrineItem | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleEdit = (id: string) => {
    setEditingId(id)
    setView('form')
  }
  const handleCreate = () => {
    setEditingId(null)
    setView('form')
  }
  const handleBack = () => {
    setView('list')
    setEditingId(null)
  }
  const handlePreview = (item: VitrineItem) => {
    setPreviewItem(item)
    setPreviewOpen(true)
  }

  if (view === 'form') {
    return <CmsVitrineForm itemId={editingId} onBack={handleBack} onPreview={handlePreview} />
  }

  return (
    <>
      <CmsVitrineList onEdit={handleEdit} onCreate={handleCreate} onPreview={handlePreview} />
      <CmsVitrinePreview item={previewItem} open={previewOpen} onOpenChange={setPreviewOpen} />
    </>
  )
}

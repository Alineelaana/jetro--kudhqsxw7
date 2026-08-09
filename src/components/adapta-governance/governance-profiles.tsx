import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Pencil, Shield } from 'lucide-react'
import { getAiProfiles } from '@/services/adapta-governance'
import { useRealtime } from '@/hooks/use-realtime'
import type { AiProfile } from '@/lib/adapta-governance-types'
import { ProfileEditDialog } from '@/components/adapta-governance/profile-edit-dialog'

export function GovernanceProfiles({ canEdit }: { canEdit: boolean }) {
  const [profiles, setProfiles] = useState<AiProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<AiProfile | null>(null)

  const load = async () => {
    try {
      setProfiles(await getAiProfiles())
    } catch {
      setProfiles([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  useRealtime('adapta_ai_profiles', () => load())

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Perfis de acesso configuráveis para a IA ADAPTA. Cada perfil estende o RBAC existente
            com um conjunto específico de permissões. A IA nunca pode ver além do que o usuário
            logado tem acesso.
          </p>
        </CardContent>
      </Card>
      {profiles.map((p) => (
        <Card key={p.id} className="border-2 border-[#005B2E]/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#005B2E]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#005B2E]" />
              </div>
              <div>
                <p className="font-bold text-sm">{p.profile_name}</p>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={
                  p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }
              >
                {p.active ? 'Ativo' : 'Inativo'}
              </Badge>
              {canEdit && (
                <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {editing && (
        <ProfileEditDialog
          profile={editing}
          onClose={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}

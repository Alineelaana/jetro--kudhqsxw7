import { PerformanceLayout } from '@/components/performance/performance-layout'
import { PerformanceDashboard } from '@/components/performance/performance-dashboard'
import { PerformanceCenter } from '@/components/performance/performance-center'
import { PerformanceGamification } from '@/components/performance/performance-gamification'
import { PerformanceConfigPanel } from '@/components/performance/performance-config'
import { PerformanceChat } from '@/components/performance/performance-chat'
import { MODULE_LABELS } from '@/lib/performance-types'

interface PerformanceProps {
  screen?: string
}

export default function Performance({ screen = 'dashboard' }: PerformanceProps) {
  if (screen === 'dashboard') {
    return (
      <PerformanceLayout title="Dashboard Corporativo">
        <PerformanceDashboard />
      </PerformanceLayout>
    )
  }
  if (screen === 'gamification') {
    return (
      <PerformanceLayout title="Gamificação">
        <PerformanceGamification />
      </PerformanceLayout>
    )
  }
  if (screen === 'config') {
    return (
      <PerformanceLayout title="Configurações">
        <PerformanceConfigPanel />
      </PerformanceLayout>
    )
  }
  if (screen === 'chat') {
    return (
      <PerformanceLayout title="Chat IA — Centro de Inteligência">
        <PerformanceChat />
      </PerformanceLayout>
    )
  }
  const label = MODULE_LABELS[screen] || 'Performance'
  return (
    <PerformanceLayout title={label}>
      <PerformanceCenter module={screen} />
    </PerformanceLayout>
  )
}

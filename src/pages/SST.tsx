import { SstLayout } from '@/components/sst/sst-shared'
import { SstDashboard } from '@/components/sst/sst-dashboard'
import { SstReports } from '@/components/sst/sst-reports'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { SST_SCREEN_CONFIGS } from '@/lib/sst-types'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard SST',
  reports: 'Relatórios SST',
}

export default function SST({ screen }: { screen: string }) {
  const title = TITLES[screen] || SST_SCREEN_CONFIGS[screen]?.title || 'SST'

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <SstDashboard />
      case 'reports':
        return <SstReports />
      default: {
        const config = SST_SCREEN_CONFIGS[screen]
        if (config) return <RhGenericScreen config={config} />
        return <SstDashboard />
      }
    }
  }

  return <SstLayout title={title}>{renderScreen()}</SstLayout>
}

import { CopLayout } from '@/components/cop/cop-layout'

export default function COP({ screen }: { screen?: string }) {
  return <CopLayout screen={screen || 'cockpit'} />
}

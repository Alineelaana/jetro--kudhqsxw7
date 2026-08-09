import { StrategicCrudScreen } from './strategic-crud-screen'
import {
  INITIATIVES_CONFIG,
  BUSINESS_CASES_CONFIG,
  GROWTH_CONFIG,
  MARKET_INTEL_CONFIG,
  DECISIONS_CONFIG,
  INDICATORS_CONFIG,
} from '@/lib/strategic-types'

export function StrategicInitiatives() {
  return <StrategicCrudScreen config={INITIATIVES_CONFIG} />
}
export function BusinessCases() {
  return <StrategicCrudScreen config={BUSINESS_CASES_CONFIG} />
}
export function GrowthExperiments() {
  return <StrategicCrudScreen config={GROWTH_CONFIG} />
}
export function MarketIntelligenceScreen() {
  return <StrategicCrudScreen config={MARKET_INTEL_CONFIG} />
}
export function StrategicDecisionsScreen() {
  return <StrategicCrudScreen config={DECISIONS_CONFIG} />
}
export function StrategicIndicatorsScreen() {
  return <StrategicCrudScreen config={INDICATORS_CONFIG} />
}

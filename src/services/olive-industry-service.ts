// src/services/olive-industry-service.ts
// Serviços do Módulo Industrial de Azeitonas HURAM
import pb from '@/lib/pocketbase/client'

export interface AgriculturalProducer {
  id: string
  name: string
  code?: string
  document_cpf_cnpj?: string
  property_name: string
  property_location?: string
  cadpro_car?: string
  partner_id?: string
  contact_phone?: string
  contact_email?: string
  olive_varieties?: string[]
  total_hectares?: number
  active?: boolean
  empresa_id?: string
  filial_id?: string
  created?: string
  updated?: string
  expand?: {
    partner_id?: { id: string; name?: string; razao_social?: string }
  }
}

export interface OliveHarvestTicket {
  id: string
  ticket_number: string
  date_time: string
  producer_id: string
  raw_material_product_id?: string
  vehicle_plate?: string
  driver_name?: string
  variety?: string
  gross_weight_kg: number
  tare_weight_kg: number
  net_weight_kg: number
  caliber_size?: string
  maturation_index?: number
  maturation_stage?: string
  defect_percentage?: number
  dirt_impurity_percentage?: number
  quality_grade?: 'A' | 'B' | 'C' | 'DESCARTE'
  price_per_ton: number
  deductions_amount?: number
  final_payable_amount: number
  payment_status?: 'pendente' | 'titulo_gerado' | 'pago' | 'cancelado'
  financial_payable_id?: string
  stock_lot_number?: string
  stock_movement_id?: string
  status: 'em_pesagem' | 'classificado' | 'fechado' | 'cancelado'
  inspector_id?: string
  notes?: string
  empresa_id?: string
  filial_id?: string
  created?: string
  updated?: string
  expand?: {
    producer_id?: AgriculturalProducer
    raw_material_product_id?: { id: string; name: string; code?: string }
  }
}

export interface CuringTank {
  id: string
  code: string
  name: string
  capacity_kg: number
  capacity_liters?: number
  tank_type: 'fibra' | 'inox' | 'polietileno' | 'alvenaria_epoxi'
  location_sector?: string
  current_status:
    | 'vazio'
    | 'em_cura'
    | 'pronto_para_processamento'
    | 'em_processamento'
    | 'manutencao'
    | 'higienizacao'
  current_batch_id?: string
  active?: boolean
  notes?: string
  empresa_id?: string
  filial_id?: string
  created?: string
  updated?: string
}

export interface CuringBatch {
  id: string
  batch_code: string
  tank_id: string
  harvest_ticket_id?: string
  raw_material_product_id?: string
  entry_date: string
  initial_weight_kg: number
  current_weight_kg?: number
  brine_type: 'salmoura_natural' | 'estilo_sevilhano_soda' | 'estilo_californiano' | 'cura_seca_sal'
  initial_salt_concentration_percent?: number
  initial_ph?: number
  target_curing_days?: number
  expected_completion_date?: string
  actual_completion_date?: string
  fermentation_loss_percentage?: number
  fermentation_loss_kg?: number
  status: 'em_cura' | 'pronto_para_processamento' | 'processado' | 'descartado'
  destination_production_order_id?: string
  responsible_technician?: string
  notes?: string
  empresa_id?: string
  filial_id?: string
  created?: string
  updated?: string
  expand?: {
    tank_id?: CuringTank
    harvest_ticket_id?: OliveHarvestTicket
    raw_material_product_id?: { id: string; name: string }
    destination_production_order_id?: { id: string; order_number?: string }
  }
}

export interface CuringMeasurement {
  id: string
  batch_id: string
  tank_id: string
  measurement_date: string
  salt_concentration_percent: number
  ph: number
  temperature_celsius: number
  acidity_free_percentage?: number
  observed_loss_kg?: number
  corrective_action?: string
  alert_raised?: boolean
  alert_reason?: string
  analyst_name?: string
  empresa_id?: string
  filial_id?: string
  created?: string
  updated?: string
}

export interface ProductionLineLoss {
  id: string
  production_order_id: string
  phase_name: string
  loss_type:
    | 'refugo'
    | 'descarte'
    | 'fora_de_padrao'
    | 'avaria_embalagem'
    | 'vazamento_salmoura'
    | 'polpa_machucada'
  quantity: number
  unit: string
  reason: string
  responsible_name: string
  unit_cost_estimated?: number
  total_cost_impact?: number
  loss_date: string
  destination?: 'compostagem' | 'descarte_sanitario' | 'coproduto_oleo' | 'retrabalho'
  notes?: string
  empresa_id?: string
  filial_id?: string
  created?: string
  updated?: string
  expand?: {
    production_order_id?: { id: string; order_number?: string; product_id?: string }
  }
}

export interface LaboratoryAnalysisPlan {
  id: string
  code: string
  title: string
  target_type:
    | 'fruta_in_natura'
    | 'tanque_cura'
    | 'produto_acabado'
    | 'salmoura_cobertura'
    | 'agua_processo'
  parameters?: Array<{
    name: string
    unit: string
    min_limit?: number
    max_limit?: number
    mandatory?: boolean
    method?: string
  }>
  mapa_normative_reference?: string
  active?: boolean
  notes?: string
  empresa_id?: string
  filial_id?: string
  created?: string
  updated?: string
}

export interface LaboratoryAnalysis {
  id: string
  analysis_number: string
  plan_id?: string
  sample_type: 'tanque_cura' | 'lote_acabado' | 'recebimento_safra' | 'salmoura'
  tank_id?: string
  curing_batch_id?: string
  production_order_id?: string
  lot_number: string
  collection_date: string
  analysis_date: string
  analyst_name: string
  results_data?: Array<{
    parameter: string
    result_value: number | string
    unit?: string
    min_limit?: number
    max_limit?: number
    compliant: boolean
  }>
  overall_compliance: 'conforme' | 'nao_conforme' | 'em_analise' | 'aprovado_com_restricao'
  non_conformity_reason?: string
  batch_release_authorized?: boolean
  authorized_by?: string
  notes?: string
  empresa_id?: string
  filial_id?: string
  created?: string
  updated?: string
  expand?: {
    plan_id?: LaboratoryAnalysisPlan
    tank_id?: CuringTank
    curing_batch_id?: CuringBatch
    production_order_id?: { id: string; order_number?: string }
  }
}

export interface LaboratoryLaudo {
  id: string
  laudo_number: string
  analysis_id?: string
  lot_number: string
  product_id?: string
  production_order_id?: string
  package_type?: string
  manufacturing_date?: string
  expiry_date?: string
  drained_weight_target_g?: number
  drained_weight_measured_g?: number
  net_weight_target_g?: number
  net_weight_measured_g?: number
  mapa_registration_number?: string
  rdc_label_compliance?: boolean
  technical_responsible_crq?: string
  verdict: 'liberado' | 'retido_quarentena' | 'reprovado_descarte'
  emission_date: string
  digital_signature_hash?: string
  pdf_notes?: string
  empresa_id?: string
  filial_id?: string
  created?: string
  updated?: string
  expand?: {
    analysis_id?: LaboratoryAnalysis
    product_id?: { id: string; name: string }
    production_order_id?: { id: string; order_number?: string }
  }
}

// ---------------------------------------------------------------------------
// CRUD E OPERAÇÕES — PRODUTORES
// ---------------------------------------------------------------------------
export async function getAgriculturalProducers(): Promise<AgriculturalProducer[]> {
  try {
    return (await pb.collection('agricultural_producers').getFullList({
      sort: 'name',
      expand: 'partner_id',
    })) as unknown as AgriculturalProducer[]
  } catch {
    return []
  }
}

export async function createAgriculturalProducer(
  data: Partial<AgriculturalProducer>,
): Promise<AgriculturalProducer> {
  return (await pb
    .collection('agricultural_producers')
    .create(data)) as unknown as AgriculturalProducer
}

export async function updateAgriculturalProducer(
  id: string,
  data: Partial<AgriculturalProducer>,
): Promise<AgriculturalProducer> {
  return (await pb
    .collection('agricultural_producers')
    .update(id, data)) as unknown as AgriculturalProducer
}

// ---------------------------------------------------------------------------
// CRUD E OPERAÇÕES — TICKETS DE RECEBIMENTO DE SAFRA
// ---------------------------------------------------------------------------
export async function getHarvestTickets(): Promise<OliveHarvestTicket[]> {
  try {
    return (await pb.collection('olive_harvest_tickets').getFullList({
      sort: '-date_time',
      expand: 'producer_id,raw_material_product_id',
    })) as unknown as OliveHarvestTicket[]
  } catch {
    return []
  }
}

export async function createHarvestTicket(
  data: Partial<OliveHarvestTicket>,
): Promise<OliveHarvestTicket> {
  return (await pb
    .collection('olive_harvest_tickets')
    .create(data)) as unknown as OliveHarvestTicket
}

export async function updateHarvestTicket(
  id: string,
  data: Partial<OliveHarvestTicket>,
): Promise<OliveHarvestTicket> {
  return (await pb
    .collection('olive_harvest_tickets')
    .update(id, data)) as unknown as OliveHarvestTicket
}

export async function generateHarvestPayment(
  ticketId: string,
  dataVencimento?: string,
): Promise<{ ok: boolean; payable_id: string; valor: number }> {
  return await pb.send('/backend/v1/olive/harvest-ticket/pay', {
    method: 'POST',
    body: { ticket_id: ticketId, data_vencimento: dataVencimento },
  })
}

export async function generateHarvestStockIn(
  ticketId: string,
  productId?: string,
): Promise<{ ok: boolean; lot_number: string; movement_id: string; quantidade: number }> {
  return await pb.send('/backend/v1/olive/harvest-ticket/stock-in', {
    method: 'POST',
    body: { ticket_id: ticketId, product_id: productId },
  })
}

// ---------------------------------------------------------------------------
// CRUD E OPERAÇÕES — TANQUES E LOTES DE CURA
// ---------------------------------------------------------------------------
export async function getCuringTanks(): Promise<CuringTank[]> {
  try {
    return (await pb.collection('curing_tanks').getFullList({
      sort: 'code',
    })) as unknown as CuringTank[]
  } catch {
    return []
  }
}

export async function createCuringTank(data: Partial<CuringTank>): Promise<CuringTank> {
  return (await pb.collection('curing_tanks').create(data)) as unknown as CuringTank
}

export async function updateCuringTank(id: string, data: Partial<CuringTank>): Promise<CuringTank> {
  return (await pb.collection('curing_tanks').update(id, data)) as unknown as CuringTank
}

export async function getCuringBatches(tankId?: string): Promise<CuringBatch[]> {
  try {
    const filter = tankId ? `tank_id = "${tankId}"` : undefined
    return (await pb.collection('curing_batches').getFullList({
      sort: '-entry_date',
      filter,
      expand: 'tank_id,harvest_ticket_id,raw_material_product_id,destination_production_order_id',
    })) as unknown as CuringBatch[]
  } catch {
    return []
  }
}

export async function createCuringBatch(data: Partial<CuringBatch>): Promise<CuringBatch> {
  return (await pb.collection('curing_batches').create(data)) as unknown as CuringBatch
}

export async function updateCuringBatch(
  id: string,
  data: Partial<CuringBatch>,
): Promise<CuringBatch> {
  return (await pb.collection('curing_batches').update(id, data)) as unknown as CuringBatch
}

export async function getCuringMeasurements(batchId?: string): Promise<CuringMeasurement[]> {
  try {
    const filter = batchId ? `batch_id = "${batchId}"` : undefined
    return (await pb.collection('curing_measurements').getFullList({
      sort: '-measurement_date',
      filter,
    })) as unknown as CuringMeasurement[]
  } catch {
    return []
  }
}

export async function createCuringMeasurement(
  data: Partial<CuringMeasurement>,
): Promise<CuringMeasurement> {
  return (await pb.collection('curing_measurements').create(data)) as unknown as CuringMeasurement
}

export async function completeCuringBatch(
  batchId: string,
): Promise<{ ok: boolean; status: string; final_weight_kg: number; tank_code: string }> {
  return await pb.send('/backend/v1/olive/curing-batch/complete', {
    method: 'POST',
    body: { batch_id: batchId },
  })
}

export async function consumeCuringBatch(
  batchId: string,
  productionOrderId: string,
): Promise<{ ok: boolean; order_id: string; batch_status: string }> {
  return await pb.send('/backend/v1/olive/curing-batch/consume', {
    method: 'POST',
    body: { batch_id: batchId, production_order_id: productionOrderId },
  })
}

// ---------------------------------------------------------------------------
// CRUD E OPERAÇÕES — PERDAS NA LINHA
// ---------------------------------------------------------------------------
export async function getProductionLineLosses(orderId?: string): Promise<ProductionLineLoss[]> {
  try {
    const filter = orderId ? `production_order_id = "${orderId}"` : undefined
    return (await pb.collection('production_line_losses').getFullList({
      sort: '-loss_date',
      filter,
      expand: 'production_order_id',
    })) as unknown as ProductionLineLoss[]
  } catch {
    return []
  }
}

export async function createProductionLineLoss(
  data: Partial<ProductionLineLoss>,
): Promise<ProductionLineLoss> {
  return (await pb
    .collection('production_line_losses')
    .create(data)) as unknown as ProductionLineLoss
}

export async function deleteProductionLineLoss(id: string): Promise<boolean> {
  try {
    await pb.collection('production_line_losses').delete(id)
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// CRUD E OPERAÇÕES — LABORATÓRIO E LAUDOS
// ---------------------------------------------------------------------------
export async function getLaboratoryAnalysisPlans(): Promise<LaboratoryAnalysisPlan[]> {
  try {
    return (await pb.collection('laboratory_analysis_plans').getFullList({
      sort: 'code',
    })) as unknown as LaboratoryAnalysisPlan[]
  } catch {
    return []
  }
}

export async function createLaboratoryAnalysisPlan(
  data: Partial<LaboratoryAnalysisPlan>,
): Promise<LaboratoryAnalysisPlan> {
  return (await pb
    .collection('laboratory_analysis_plans')
    .create(data)) as unknown as LaboratoryAnalysisPlan
}

export async function getLaboratoryAnalyses(lotNumber?: string): Promise<LaboratoryAnalysis[]> {
  try {
    const filter = lotNumber ? `lot_number = "${lotNumber}"` : undefined
    return (await pb.collection('laboratory_analyses').getFullList({
      sort: '-analysis_date',
      filter,
      expand: 'plan_id,tank_id,curing_batch_id,production_order_id',
    })) as unknown as LaboratoryAnalysis[]
  } catch {
    return []
  }
}

export async function createLaboratoryAnalysis(
  data: Partial<LaboratoryAnalysis>,
): Promise<LaboratoryAnalysis> {
  return (await pb.collection('laboratory_analyses').create(data)) as unknown as LaboratoryAnalysis
}

export async function updateLaboratoryAnalysis(
  id: string,
  data: Partial<LaboratoryAnalysis>,
): Promise<LaboratoryAnalysis> {
  return (await pb
    .collection('laboratory_analyses')
    .update(id, data)) as unknown as LaboratoryAnalysis
}

export async function getLaboratoryLaudos(lotNumber?: string): Promise<LaboratoryLaudo[]> {
  try {
    const filter = lotNumber ? `lot_number = "${lotNumber}"` : undefined
    return (await pb.collection('laboratory_laudos').getFullList({
      sort: '-emission_date',
      filter,
      expand: 'analysis_id,product_id,production_order_id',
    })) as unknown as LaboratoryLaudo[]
  } catch {
    return []
  }
}

export async function createLaboratoryLaudo(
  data: Partial<LaboratoryLaudo>,
): Promise<LaboratoryLaudo> {
  return (await pb.collection('laboratory_laudos').create(data)) as unknown as LaboratoryLaudo
}

// ---------------------------------------------------------------------------
// RASTREABILIDADE BIDIRECIONAL COMPLETA (CAMPO → TANQUE → LOTE → EMBALAGEM)
// ---------------------------------------------------------------------------
export interface BidirectionalTraceabilityResult {
  originLot: string
  direction: 'reversa' | 'adiante'
  producer?: AgriculturalProducer
  harvestTicket?: OliveHarvestTicket
  curingTank?: CuringTank
  curingBatch?: CuringBatch
  curingMeasurements?: CuringMeasurement[]
  productionOrder?: {
    id: string
    order_number?: string
    status?: string
    quantity_planned?: number
    quantity_produced?: number
  }
  lineLosses?: ProductionLineLoss[]
  analysis?: LaboratoryAnalysis
  laudo?: LaboratoryLaudo
  finalLots?: string[]
}

export async function traceCompleteChain(
  searchTerm: string,
): Promise<BidirectionalTraceabilityResult> {
  const term = searchTerm.trim()
  const result: BidirectionalTraceabilityResult = {
    originLot: term,
    direction: 'reversa',
  }

  // 1. Tenta encontrar por Lote de Ticket de Safra ou Número do Ticket
  try {
    const tickets = await pb.collection('olive_harvest_tickets').getFullList({
      filter: `ticket_number = "${term}" || stock_lot_number = "${term}"`,
      expand: 'producer_id,raw_material_product_id',
    })
    if (tickets && tickets.length > 0) {
      const t = tickets[0] as unknown as OliveHarvestTicket
      result.direction = 'adiante'
      result.harvestTicket = t
      if (t.expand?.producer_id) result.producer = t.expand.producer_id

      // Busca lote de cura associado ao ticket
      const batches = await pb.collection('curing_batches').getFullList({
        filter: `harvest_ticket_id = "${t.id}"`,
        expand: 'tank_id,destination_production_order_id',
      })
      if (batches.length > 0) {
        const b = batches[0] as unknown as CuringBatch
        result.curingBatch = b
        if (b.expand?.tank_id) result.curingTank = b.expand.tank_id
        if (b.expand?.destination_production_order_id) {
          result.productionOrder = b.expand.destination_production_order_id as any
        }
      }
      return result
    }
  } catch {
    /* intentionally ignored */
  }

  // 2. Tenta encontrar por Lote de Cura ou Tanque
  try {
    const batches = await pb.collection('curing_batches').getFullList({
      filter: `batch_code = "${term}"`,
      expand: 'tank_id,harvest_ticket_id,destination_production_order_id',
    })
    if (batches.length > 0) {
      const b = batches[0] as unknown as CuringBatch
      result.curingBatch = b
      if (b.expand?.tank_id) result.curingTank = b.expand.tank_id
      if (b.expand?.harvest_ticket_id) {
        result.harvestTicket = b.expand.harvest_ticket_id
        if (b.expand.harvest_ticket_id.producer_id) {
          try {
            const p = await pb
              .collection('agricultural_producers')
              .getOne(b.expand.harvest_ticket_id.producer_id)
            result.producer = p as unknown as AgriculturalProducer
          } catch {
            /* intentionally ignored */
          }
        }
      }
      if (b.expand?.destination_production_order_id) {
        result.productionOrder = b.expand.destination_production_order_id as any
      }
      return result
    }
  } catch {
    /* intentionally ignored */
  }

  // 3. Tenta encontrar por Laudo Técnico ou Análise (busca reversa a partir do acabamento)
  try {
    const laudos = await pb.collection('laboratory_laudos').getFullList({
      filter: `laudo_number = "${term}" || lot_number = "${term}"`,
      expand: 'analysis_id,product_id,production_order_id',
    })
    if (laudos.length > 0) {
      const l = laudos[0] as unknown as LaboratoryLaudo
      result.laudo = l
      if (l.expand?.analysis_id) result.analysis = l.expand.analysis_id
      if (l.expand?.production_order_id) {
        result.productionOrder = l.expand.production_order_id as any
        const opId = l.expand.production_order_id.id
        // Busca perdas da OP
        try {
          result.lineLosses = await getProductionLineLosses(opId)
        } catch {
          /* intentionally ignored */
        }
        // Tenta achar OP e tanque vinculado
        try {
          const opRecord = await pb.collection('production_orders').getOne(opId)
          const cBatchId = opRecord.curing_batch_id
          if (cBatchId) {
            const batch = await pb.collection('curing_batches').getOne(cBatchId, {
              expand: 'tank_id,harvest_ticket_id',
            })
            result.curingBatch = batch as unknown as CuringBatch
            if (batch.expand?.tank_id) result.curingTank = batch.expand.tank_id
            if (batch.expand?.harvest_ticket_id) {
              result.harvestTicket = batch.expand.harvest_ticket_id
              if (batch.expand.harvest_ticket_id.producer_id) {
                const p = await pb
                  .collection('agricultural_producers')
                  .getOne(batch.expand.harvest_ticket_id.producer_id)
                result.producer = p as unknown as AgriculturalProducer
              }
            }
          }
        } catch {
          /* intentionally ignored */
        }
      }
      return result
    }
  } catch {
    /* intentionally ignored */
  }

  // 4. Fallback: busca por Ordem de Produção
  try {
    const orders = await pb.collection('production_orders').getFullList({
      filter: `order_number = "${term}" || id = "${term}"`,
    })
    if (orders.length > 0) {
      const op = orders[0]
      result.productionOrder = {
        id: op.id,
        order_number: op.order_number,
        status: op.status,
        quantity_planned: op.quantity_planned,
        quantity_produced: op.quantity_produced,
      }
      result.lineLosses = await getProductionLineLosses(op.id)
      if (op.curing_batch_id) {
        try {
          const b = await pb.collection('curing_batches').getOne(op.curing_batch_id, {
            expand: 'tank_id,harvest_ticket_id',
          })
          result.curingBatch = b as unknown as CuringBatch
          if (b.expand?.tank_id) result.curingTank = b.expand.tank_id
          if (b.expand?.harvest_ticket_id) {
            result.harvestTicket = b.expand.harvest_ticket_id
            if (b.expand.harvest_ticket_id.producer_id) {
              const p = await pb
                .collection('agricultural_producers')
                .getOne(b.expand.harvest_ticket_id.producer_id)
              result.producer = p as unknown as AgriculturalProducer
            }
          }
        } catch {
          /* intentionally ignored */
        }
      }
    }
  } catch {
    /* intentionally ignored */
  }

  return result
}

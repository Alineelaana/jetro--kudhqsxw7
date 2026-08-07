import pb from '@/lib/pocketbase/client'
import type {
  SpecGroup,
  SpecAttribute,
  SpecValue,
  UnitConversion,
  BomVersion,
  BomComponent,
  ProductionResource,
  ProductionRoute,
  ProductionRouteOperation,
  IndustrialCost,
} from '@/lib/industry-types'

export const getSpecGroups = () =>
  pb.collection('spec_groups').getFullList({ sort: 'name' }) as Promise<SpecGroup[]>

export const createSpecGroup = (data: Partial<SpecGroup>) =>
  pb.collection('spec_groups').create(data) as Promise<SpecGroup>

export const updateSpecGroup = (id: string, data: Partial<SpecGroup>) =>
  pb.collection('spec_groups').update(id, data) as Promise<SpecGroup>

export const deleteSpecGroup = (id: string) => pb.collection('spec_groups').delete(id)

export const getSpecAttributes = (groupId?: string) =>
  pb.collection('spec_attributes').getFullList({
    sort: 'order',
    filter: groupId ? `group_id = "${groupId}"` : undefined,
    expand: 'group_id',
  }) as Promise<SpecAttribute[]>

export const createSpecAttribute = (data: Partial<SpecAttribute>) =>
  pb.collection('spec_attributes').create(data) as Promise<SpecAttribute>

export const updateSpecAttribute = (id: string, data: Partial<SpecAttribute>) =>
  pb.collection('spec_attributes').update(id, data) as Promise<SpecAttribute>

export const deleteSpecAttribute = (id: string) => pb.collection('spec_attributes').delete(id)

export const getSpecValues = (itemId?: string) =>
  pb.collection('spec_values').getFullList({
    sort: '-version',
    filter: itemId ? `item_id = "${itemId}"` : undefined,
    expand: 'item_id,attribute_id',
  }) as Promise<SpecValue[]>

export const createSpecValue = (data: Partial<SpecValue>) =>
  pb.collection('spec_values').create(data) as Promise<SpecValue>

export const updateSpecValue = (id: string, data: Partial<SpecValue>) =>
  pb.collection('spec_values').update(id, data) as Promise<SpecValue>

export const getUnitConversions = (scope?: string) =>
  pb.collection('unit_conversions').getFullList({
    sort: '-created',
    filter: scope ? `scope = "${scope}"` : undefined,
  }) as Promise<UnitConversion[]>

export const createUnitConversion = (data: Partial<UnitConversion>) =>
  pb.collection('unit_conversions').create(data) as Promise<UnitConversion>

export const updateUnitConversion = (id: string, data: Partial<UnitConversion>) =>
  pb.collection('unit_conversions').update(id, data) as Promise<UnitConversion>

export const deleteUnitConversion = (id: string) => pb.collection('unit_conversions').delete(id)

export const getBomVersions = (productId?: string) =>
  pb.collection('bom_versions').getFullList({
    sort: '-version',
    filter: productId ? `product_id = "${productId}"` : undefined,
    expand: 'product_id',
  }) as Promise<BomVersion[]>

export const createBomVersion = (data: Partial<BomVersion>) =>
  pb.collection('bom_versions').create(data) as Promise<BomVersion>

export const updateBomVersion = (id: string, data: Partial<BomVersion>) =>
  pb.collection('bom_versions').update(id, data) as Promise<BomVersion>

export const getBomComponents = (bomVersionId: string) =>
  pb.collection('bom_components').getFullList({
    sort: 'ordem',
    filter: `bom_version_id = "${bomVersionId}"`,
    expand: 'item_id',
  }) as Promise<BomComponent[]>

export const createBomComponent = (data: Partial<BomComponent>) =>
  pb.collection('bom_components').create(data) as Promise<BomComponent>

export const deleteBomComponent = (id: string) => pb.collection('bom_components').delete(id)

export const getProductionResources = () =>
  pb.collection('production_resources').getFullList({ sort: 'name' }) as Promise<
    ProductionResource[]
  >

export const createProductionResource = (data: Partial<ProductionResource>) =>
  pb.collection('production_resources').create(data) as Promise<ProductionResource>

export const updateProductionResource = (id: string, data: Partial<ProductionResource>) =>
  pb.collection('production_resources').update(id, data) as Promise<ProductionResource>

export const deleteProductionResource = (id: string) =>
  pb.collection('production_resources').delete(id)

export const getProductionRoutes = (productId?: string) =>
  pb.collection('production_routes').getFullList({
    sort: '-version',
    filter: productId ? `product_id = "${productId}"` : undefined,
    expand: 'product_id',
  }) as Promise<ProductionRoute[]>

export const createProductionRoute = (data: Partial<ProductionRoute>) =>
  pb.collection('production_routes').create(data) as Promise<ProductionRoute>

export const getRouteOperations = (routeId: string) =>
  pb.collection('production_route_operations').getFullList({
    sort: 'order',
    filter: `route_id = "${routeId}"`,
    expand: 'resource_id',
  }) as Promise<ProductionRouteOperation[]>

export const createRouteOperation = (data: Partial<ProductionRouteOperation>) =>
  pb.collection('production_route_operations').create(data) as Promise<ProductionRouteOperation>

export const deleteRouteOperation = (id: string) =>
  pb.collection('production_route_operations').delete(id)

export const getIndustrialCosts = (itemId?: string) =>
  pb.collection('industrial_costs').getFullList({
    sort: '-version',
    filter: itemId ? `item_id = "${itemId}"` : undefined,
    expand: 'item_id',
  }) as Promise<IndustrialCost[]>

export const createIndustrialCost = (data: Partial<IndustrialCost>) =>
  pb.collection('industrial_costs').create(data) as Promise<IndustrialCost>

export const updateIndustrialCost = (id: string, data: Partial<IndustrialCost>) =>
  pb.collection('industrial_costs').update(id, data) as Promise<IndustrialCost>

export const getIndustrialItems = () =>
  pb.collection('products').getFullList({
    sort: '-created',
    filter: 'is_industrial = true',
  })

export type DevelopmentPressure = 'low' | 'medium' | 'high'
export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type ProjectProfile = {
  projectName: string
  projectType: string
  location: string
  district: string
  state: 'Madhya Pradesh'
  projectLengthKm: number
  projectAreaSqKm: number
  budgetCrore: number | null
  timelineMonths: number | null
  developmentObjective: string
  environmentalInformation: string
  ecologicalInformation: string
  infrastructureInformation: string
  constraints: string[]
  source: 'Project Plan PDF' | 'PoC Simulation Fallback'
  extractionNotes: string[]
}

export type Coordinate = [longitude: number, latitude: number]
export type PolygonCoordinates = Coordinate[][]

export type SpatialContext = {
  corridorName: string
  projectLocation: string
  projectLengthKm: number
  projectAreaSqKm: number
  projectType: string
  route: Coordinate[]
  center: Coordinate
  developmentPressure: number
  source: 'Project Plan PDF + PoC Simulation Dataset'
}

export type WeightedFactor = {
  key: string
  label: string
  score: number
  weight: number
  contribution: number
  rationale: string
}

export type EnvironmentalAssessment = {
  score: number
  factors: WeightedFactor[]
  explanation: string[]
}

export type ConnectivityAssessment = {
  importanceScore: number
  disruptionRisk: number
  factors: WeightedFactor[]
  developmentPressure: number
  explanation: string[]
}

export type RiskAssessment = {
  overallScore: number
  band: RiskBand
  categories: WeightedFactor[]
}

export type SimulationZoneInput = {
  id: string
  label: string
  geometry: PolygonCoordinates
  routeSegment: Coordinate[]
  habitatSensitivity: number
  environmentalProximity: number
  waterSensitivity: number
  landUseSensitivity: number
  humanActivity: number
  infrastructurePressure: number
  habitatConnectivity: number
  patchProximity: number
  corridorContinuity: number
  developmentIntersection: number
}

export type PriorityZone = {
  id: string
  label: string
  geometry: PolygonCoordinates
  environmentalSensitivity: number
  connectivityImportance: number
  connectivityDisruption: number
  humanActivity: number
  infrastructurePressure: number
  developmentImpact: number
  overallRisk: number
  priorityScore: number
  band: RiskBand
  reasons: string[]
}

export type HabitatPatch = {
  id: string
  name: string
  geometry: PolygonCoordinates
  sensitivity: number
}

export type MapPoint = {
  id: string
  name: string
  coordinate: Coordinate
  intensity: number
}

export type SimulationLayers = {
  sensitivityZones: PolygonCoordinates[]
  habitatPatches: HabitatPatch[]
  connectivityCorridors: Coordinate[][]
  settlements: MapPoint[]
  infrastructurePressure: MapPoint[]
}

export type Stage3Analysis = {
  scenario: DevelopmentPressure
  profile: ProjectProfile
  spatialContext: SpatialContext
  environmentalAssessment: EnvironmentalAssessment
  connectivityAssessment: ConnectivityAssessment
  riskAssessment: RiskAssessment
  priorityZones: PriorityZone[]
  layers: SimulationLayers
  generatedAt: string
  dataNotice: 'PoC Simulation Data — Not field-validated'
}

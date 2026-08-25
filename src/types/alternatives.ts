import type { Coordinate, RiskBand } from './analysis'

export type SangamScenario =
  | 'sustainable-construction'
  | 'sustainable-tourism'
  | 'shared-resource-development'

export type AlternativeKind =
  | 'proposed'
  | 'ecology-optimised'
  | 'balanced'
  | 'cost-optimised'

export type McdaScores = {
  environmentalCompatibility: number
  connectivityPreservation: number
  humanSafety: number
  relativeCost: number
  engineeringFeasibility: number
  sustainability: number
}

export type SpatialOverlap = {
  zoneId: string
  overlapPercent: number
  environmentalExposure: number
  connectivityExposure: number
  humanExposure: number
  infrastructureExposure: number
}

export type AlternativeOption = {
  id: string
  name: string
  kind: AlternativeKind
  configurationType: string
  actionTitle: string
  currentLocationLabel: string
  alternativeLocationLabel: string
  originPlace: string
  destinationPlace: string
  viaPlace: string
  issueSummary: string
  approximateLengthKm: number
  estimatedCostCrore: number
  costDifferenceCrore: number
  costBasis: 'Project Plan Budget' | 'Deterministic PoC Scenario Baseline'
  whyBetter: string
  objective: string
  geometry: Coordinate[]
  geometryNotice: 'PoC Simulation Geometry'
  spatialOverlap: SpatialOverlap[]
  environmentalImpact: number
  connectivityImpact: number
  humanSafetyRisk: number
  infrastructureImpact: number
  riskScore: number
  riskBand: RiskBand
  costIndex: number
  detourPercent: number
  scores: McdaScores
  overallScore: number
  feasible: boolean
  feasibilityNotes: string[]
  tradeOff: string
  rank: number
}

export type AlternativeAnalysis = {
  scenario: SangamScenario
  configurationLabel: string
  proposedSuitable: boolean
  proposedOptionId: string
  recommendedOptionId: string
  options: AlternativeOption[]
  decisionStatement: string
  comparativeStatement: string
  dataNotice: 'PoC Simulation — Simulated Scores and Geometry'
}

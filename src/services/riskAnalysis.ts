import type {
  ConnectivityZoneResult,
} from './connectivityAnalysis'
import type { EnvironmentalZoneResult } from './environmentalAnalysis'
import type {
  PriorityZone,
  RiskAssessment,
  RiskBand,
  SimulationZoneInput,
  WeightedFactor,
} from '../types/analysis'

export const RISK_WEIGHTS = {
  environmentalRisk: 0.3,
  connectivityRisk: 0.3,
  humanSafetyRisk: 0.2,
  developmentImpact: 0.2,
} as const

const round = (value: number) => Math.round(value)
const clamp = (value: number) => Math.max(0, Math.min(100, value))

export function getRiskBand(score: number): RiskBand {
  if (score < 35) return 'LOW'
  if (score < 55) return 'MEDIUM'
  if (score < 75) return 'HIGH'
  return 'CRITICAL'
}

function category(
  key: keyof typeof RISK_WEIGHTS,
  label: string,
  score: number,
  rationale: string,
): WeightedFactor {
  const value = clamp(score)
  const weight = RISK_WEIGHTS[key]
  return {
    key,
    label,
    score: round(value),
    weight,
    contribution: round(value * weight),
    rationale,
  }
}

export function calculatePriorityZones(
  inputs: SimulationZoneInput[],
  environments: EnvironmentalZoneResult[],
  connectivity: ConnectivityZoneResult[],
  developmentPressure: number,
): PriorityZone[] {
  return inputs.map((zone) => {
    const environment = environments.find((item) => item.zoneId === zone.id)
    const connection = connectivity.find((item) => item.zoneId === zone.id)
    const environmentalSensitivity = environment?.score ?? 0
    const connectivityImportance = connection?.importanceScore ?? 0
    const connectivityDisruption = connection?.disruptionRisk ?? 0
    const infrastructurePressure = clamp(
      zone.infrastructurePressure * 0.55 + developmentPressure * 0.45,
    )
    const humanSafetyRisk = clamp(
      zone.humanActivity * 0.65 + developmentPressure * 0.35,
    )
    const developmentImpact = clamp(
      zone.developmentIntersection * 0.5 +
        infrastructurePressure * 0.3 +
        developmentPressure * 0.2,
    )
    const overallRisk = clamp(
      environmentalSensitivity * RISK_WEIGHTS.environmentalRisk +
        connectivityDisruption * RISK_WEIGHTS.connectivityRisk +
        humanSafetyRisk * RISK_WEIGHTS.humanSafetyRisk +
        developmentImpact * RISK_WEIGHTS.developmentImpact,
    )
    const priorityScore = clamp(
      overallRisk * 0.55 +
        environmentalSensitivity * 0.2 +
        connectivityImportance * 0.15 +
        infrastructurePressure * 0.1,
    )
    const reasons = [
      environmentalSensitivity >= 65
        ? `High environmental sensitivity (${round(environmentalSensitivity)}/100)`
        : null,
      connectivityImportance >= 65
        ? `High connectivity importance (${round(connectivityImportance)}/100)`
        : null,
      connectivityDisruption >= 55
        ? `Development may disrupt simulated ecological linkage (${round(connectivityDisruption)}/100)`
        : null,
      infrastructurePressure >= 65
        ? `High combined infrastructure pressure (${round(infrastructurePressure)}/100)`
        : null,
      zone.humanActivity >= 65
        ? `Elevated human activity interface (${round(zone.humanActivity)}/100)`
        : null,
    ].filter((item): item is string => Boolean(item))

    return {
      id: zone.id,
      label: zone.label,
      geometry: zone.geometry,
      environmentalSensitivity: round(environmentalSensitivity),
      connectivityImportance: round(connectivityImportance),
      connectivityDisruption: round(connectivityDisruption),
      humanActivity: round(zone.humanActivity),
      infrastructurePressure: round(infrastructurePressure),
      developmentImpact: round(developmentImpact),
      overallRisk: round(overallRisk),
      priorityScore: round(priorityScore),
      band: getRiskBand(priorityScore),
      reasons: reasons.length ? reasons : ['Combined simulated factors remain below high-priority thresholds.'],
    }
  })
}

export function aggregateRiskAssessment(zones: PriorityZone[]): RiskAssessment {
  const average = (key: keyof PriorityZone) =>
    round(
      zones.reduce((sum, zone) => sum + Number(zone[key]), 0) / zones.length,
    )
  const categories = [
    category(
      'environmentalRisk',
      'Environmental risk',
      average('environmentalSensitivity'),
      'Corridor-average environmental sensitivity.',
    ),
    category(
      'connectivityRisk',
      'Connectivity risk',
      average('connectivityDisruption'),
      'Corridor-average ecological connectivity disruption.',
    ),
    category(
      'humanSafetyRisk',
      'Human safety risk',
      average('humanActivity'),
      'Simulated human activity at the development–habitat interface.',
    ),
    category(
      'developmentImpact',
      'Development impact',
      average('developmentImpact'),
      'Combined development footprint and infrastructure pressure.',
    ),
  ]
  const overallScore = clamp(categories.reduce((sum, item) => sum + item.contribution, 0))
  return { overallScore, band: getRiskBand(overallScore), categories }
}

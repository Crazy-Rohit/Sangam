import type {
  ConnectivityAssessment,
  SimulationZoneInput,
  WeightedFactor,
} from '../types/analysis'

export const CONNECTIVITY_WEIGHTS = {
  habitatConnectivity: 0.4,
  patchProximity: 0.3,
  corridorContinuity: 0.3,
} as const

export type ConnectivityZoneResult = {
  zoneId: string
  importanceScore: number
  disruptionRisk: number
  factors: WeightedFactor[]
}

const round = (value: number) => Math.round(value)
const clamp = (value: number) => Math.max(0, Math.min(100, value))

function factor(
  key: keyof typeof CONNECTIVITY_WEIGHTS,
  label: string,
  score: number,
  rationale: string,
): WeightedFactor {
  const value = clamp(score)
  const weight = CONNECTIVITY_WEIGHTS[key]
  return {
    key,
    label,
    score: round(value),
    weight,
    contribution: round(value * weight),
    rationale,
  }
}

export function assessZoneConnectivity(
  zone: SimulationZoneInput,
  developmentPressure: number,
): ConnectivityZoneResult {
  const factors = [
    factor(
      'habitatConnectivity',
      'Habitat connectivity',
      zone.habitatConnectivity,
      'Simulated ability of the zone to link adjacent habitat patches.',
    ),
    factor(
      'patchProximity',
      'Habitat patch proximity',
      zone.patchProximity,
      'Relative closeness of the proposed route to simulated habitat patches.',
    ),
    factor(
      'corridorContinuity',
      'Corridor continuity',
      zone.corridorContinuity,
      'Continuity of the simulated ecological linkage through this zone.',
    ),
  ]
  const importanceScore = clamp(factors.reduce((sum, item) => sum + item.contribution, 0))
  const intersectionPressure = clamp(
    developmentPressure * 0.55 +
      zone.developmentIntersection * 0.3 +
      zone.infrastructurePressure * 0.15,
  )
  // Transparent normalized product: ecological importance × development pressure.
  const disruptionRisk = clamp((importanceScore * intersectionPressure) / 100)

  return {
    zoneId: zone.id,
    importanceScore,
    disruptionRisk,
    factors,
  }
}

export function aggregateConnectivityAssessment(
  zones: ConnectivityZoneResult[],
  developmentPressure: number,
): ConnectivityAssessment {
  const importanceScore = round(
    zones.reduce((sum, zone) => sum + zone.importanceScore, 0) / zones.length,
  )
  const disruptionRisk = round(
    zones.reduce((sum, zone) => sum + zone.disruptionRisk, 0) / zones.length,
  )
  const factors = zones[0].factors.map((template) => {
    const score = round(
      zones.reduce((sum, zone) => {
        const match = zone.factors.find((item) => item.key === template.key)
        return sum + (match?.score ?? 0)
      }, 0) / zones.length,
    )
    return { ...template, score, contribution: round(score * template.weight) }
  })

  return {
    importanceScore,
    disruptionRisk,
    developmentPressure,
    factors,
    explanation: [
      `Connectivity importance is the weighted sum of habitat connectivity (40%), patch proximity (30%) and corridor continuity (30%).`,
      `Disruption risk is the normalized product of connectivity importance and combined development/intersection pressure.`,
    ],
  }
}

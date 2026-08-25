import type {
  EnvironmentalAssessment,
  ProjectProfile,
  SimulationZoneInput,
  WeightedFactor,
} from '../types/analysis'

export const ENVIRONMENTAL_WEIGHTS = {
  habitatSensitivity: 0.3,
  environmentalProximity: 0.2,
  waterSensitivity: 0.1,
  landUseSensitivity: 0.15,
  humanActivity: 0.1,
  infrastructurePressure: 0.15,
} as const

export type EnvironmentalZoneResult = {
  zoneId: string
  score: number
  factors: WeightedFactor[]
}

const round = (value: number) => Math.round(value)
const clamp = (value: number) => Math.max(0, Math.min(100, value))

function factor(
  key: keyof typeof ENVIRONMENTAL_WEIGHTS,
  label: string,
  score: number,
  rationale: string,
): WeightedFactor {
  const normalized = clamp(score)
  const weight = ENVIRONMENTAL_WEIGHTS[key]
  return {
    key,
    label,
    score: round(normalized),
    weight,
    contribution: round(normalized * weight),
    rationale,
  }
}

export function assessZoneEnvironment(
  zone: SimulationZoneInput,
  project: ProjectProfile,
  pressureAdjustment: number,
): EnvironmentalZoneResult {
  const lengthEffect = clamp((project.projectLengthKm - 20) * 0.18)
  const areaEffect = clamp((project.projectAreaSqKm - 3) * 0.7)
  const factors = [
    factor(
      'habitatSensitivity',
      'Habitat sensitivity',
      zone.habitatSensitivity + areaEffect * 0.25,
      'Simulated habitat quality and sensitivity within the corridor zone.',
    ),
    factor(
      'environmentalProximity',
      'Environmental proximity',
      zone.environmentalProximity,
      'Relative proximity to simulated forest and environmentally sensitive polygons.',
    ),
    factor(
      'waterSensitivity',
      'Water sensitivity',
      zone.waterSensitivity,
      'Simulated proximity and exposure to water-linked landscape features.',
    ),
    factor(
      'landUseSensitivity',
      'Land-use sensitivity',
      zone.landUseSensitivity + areaEffect,
      'Larger project areas increase the potential land-use interface.',
    ),
    factor(
      'humanActivity',
      'Human activity',
      zone.humanActivity + pressureAdjustment * 0.25,
      'Simulated settlement and human-activity intensity.',
    ),
    factor(
      'infrastructurePressure',
      'Infrastructure pressure',
      zone.infrastructurePressure + pressureAdjustment + lengthEffect,
      'Scenario pressure and longer footprints increase infrastructure exposure.',
    ),
  ]

  return {
    zoneId: zone.id,
    score: clamp(factors.reduce((sum, item) => sum + item.contribution, 0)),
    factors,
  }
}

export function aggregateEnvironmentalAssessment(
  zones: EnvironmentalZoneResult[],
): EnvironmentalAssessment {
  const score = round(zones.reduce((sum, zone) => sum + zone.score, 0) / zones.length)
  const factors = zones[0].factors.map((template) => {
    const factorScore = round(
      zones.reduce((sum, zone) => {
        const match = zone.factors.find((item) => item.key === template.key)
        return sum + (match?.score ?? 0)
      }, 0) / zones.length,
    )
    return {
      ...template,
      score: factorScore,
      contribution: round(factorScore * template.weight),
    }
  })

  return {
    score,
    factors,
    explanation: factors
      .filter((item) => item.score >= 65)
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3)
      .map((item) => `${item.label} is elevated (${item.score}/100) and contributes ${item.contribution} points.`),
  }
}

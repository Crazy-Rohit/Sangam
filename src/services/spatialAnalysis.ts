import {
  CONNECTIVITY_CORRIDORS,
  DEMONSTRATION_CENTER,
  DEMONSTRATION_CORRIDOR_NAME,
  DEMONSTRATION_ROUTE,
  HABITAT_PATCHES,
  INFRASTRUCTURE_PRESSURE_POINTS,
  SENSITIVITY_ZONES,
  SETTLEMENTS,
  SIMULATION_ZONES,
} from '../data/spatialSimulation'
import type {
  DevelopmentPressure,
  ProjectProfile,
  SpatialContext,
  Stage3Analysis,
} from '../types/analysis'
import {
  aggregateEnvironmentalAssessment,
  assessZoneEnvironment,
} from './environmentalAnalysis'
import {
  aggregateConnectivityAssessment,
  assessZoneConnectivity,
} from './connectivityAnalysis'
import { aggregateRiskAssessment, calculatePriorityZones } from './riskAnalysis'

const SCENARIO_PRESSURE: Record<DevelopmentPressure, number> = {
  low: 44,
  medium: 68,
  high: 88,
}

const SCENARIO_ADJUSTMENT: Record<DevelopmentPressure, number> = {
  low: -12,
  medium: 0,
  high: 14,
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))

export function calculateDevelopmentPressure(
  profile: ProjectProfile,
  scenario: DevelopmentPressure,
): number {
  const lengthEffect = Math.max(-5, Math.min(10, (profile.projectLengthKm - 32) * 0.35))
  const areaEffect = Math.max(-4, Math.min(8, (profile.projectAreaSqKm - 4.8) * 0.8))
  const typeEffect =
    profile.projectType === 'Industrial Development'
      ? 7
      : profile.projectType === 'Power Transmission Corridor'
        ? 3
        : profile.projectType === 'Canal / Water Infrastructure'
          ? 2
          : 0
  return Math.round(clamp(SCENARIO_PRESSURE[scenario] + lengthEffect + areaEffect + typeEffect))
}

export function createSpatialContext(
  profile: ProjectProfile,
  scenario: DevelopmentPressure,
): SpatialContext {
  return {
    corridorName: DEMONSTRATION_CORRIDOR_NAME,
    projectLocation: profile.location,
    projectLengthKm: profile.projectLengthKm,
    projectAreaSqKm: profile.projectAreaSqKm,
    projectType: profile.projectType,
    route: DEMONSTRATION_ROUTE,
    center: DEMONSTRATION_CENTER,
    developmentPressure: calculateDevelopmentPressure(profile, scenario),
    source: 'Project Plan PDF + PoC Simulation Dataset',
  }
}

export function runStage3Analysis(
  profile: ProjectProfile,
  scenario: DevelopmentPressure,
): Stage3Analysis {
  const spatialContext = createSpatialContext(profile, scenario)
  const pressureAdjustment = SCENARIO_ADJUSTMENT[scenario]
  const zoneEnvironments = SIMULATION_ZONES.map((zone) =>
    assessZoneEnvironment(zone, profile, pressureAdjustment),
  )
  const zoneConnectivity = SIMULATION_ZONES.map((zone) =>
    assessZoneConnectivity(zone, spatialContext.developmentPressure),
  )
  const priorityZones = calculatePriorityZones(
    SIMULATION_ZONES,
    zoneEnvironments,
    zoneConnectivity,
    spatialContext.developmentPressure,
  )

  return {
    scenario,
    profile,
    spatialContext,
    environmentalAssessment: aggregateEnvironmentalAssessment(zoneEnvironments),
    connectivityAssessment: aggregateConnectivityAssessment(
      zoneConnectivity,
      spatialContext.developmentPressure,
    ),
    riskAssessment: aggregateRiskAssessment(priorityZones),
    priorityZones,
    layers: {
      sensitivityZones: SENSITIVITY_ZONES,
      habitatPatches: HABITAT_PATCHES,
      connectivityCorridors: CONNECTIVITY_CORRIDORS,
      settlements: SETTLEMENTS,
      infrastructurePressure: INFRASTRUCTURE_PRESSURE_POINTS,
    },
    generatedAt: new Date().toISOString(),
    dataNotice: 'PoC Simulation Data — Not field-validated',
  }
}

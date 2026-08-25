import type {
  Coordinate,
  PriorityZone,
  Stage3Analysis,
} from '../types/analysis'
import type {
  AlternativeAnalysis,
  AlternativeKind,
  AlternativeOption,
  McdaScores,
  SangamScenario,
  SpatialOverlap,
} from '../types/alternatives'
import { rankDevelopmentOptions } from './decisionAnalysis'
import { getRiskBand } from './riskAnalysis'

type VariantDefinition = {
  kind: AlternativeKind
  name: string
  latitudeOffsets: number[]
  longitudeOffsets: number[]
  designCostAdjustment: number
  complexityPenalty: number
}

type KindPresentation = {
  location: string
  action: string
  via: string
  lengthFactor: number
  costFactor: number
}

type ScenarioPresentation = {
  origin: string
  destination: string
  currentLocation: string
  issue: (lengthKm: number) => string
  fallbackBudgetCrore: number
  kinds: Record<AlternativeKind, KindPresentation>
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))
const round = (value: number) => Math.round(value)
const round1 = (value: number) => Math.round(value * 10) / 10

const SCENARIO_PRESENTATION: Record<SangamScenario, ScenarioPresentation> = {
  'sustainable-construction': {
    origin: 'Chhindwara (Umreth fringe)',
    destination: 'Barghat',
    currentLocation: 'Chhindwara (Umreth fringe) → Barghat via Seoni forest belt',
    issue: (lengthKm) =>
      `The proposed ${lengthKm} km Chhindwara–Barghat highway cuts the Kanha–Pench forest linkage near Seoni, with high simulated ecological and connectivity risk.`,
    fallbackBudgetCrore: 500,
    kinds: {
      proposed: {
        location: 'Chhindwara (Umreth fringe) → Barghat via Seoni forest belt',
        action: 'Retain the uploaded Chhindwara–Barghat forest-belt alignment',
        via: 'Seoni forest pinch-point (Kanha–Pench linkage)',
        lengthFactor: 1,
        costFactor: 1,
      },
      'ecology-optimised': {
        location: 'Chhindwara → Barghat via Chhapara–Lakhnadon NH-44 fringe',
        action: 'Shift the affected Seoni forest section onto the Chhapara–Lakhnadon NH-44 fringe',
        via: 'Chhapara–Lakhnadon (existing highway fringe)',
        lengthFactor: 0.88,
        costFactor: 0.86,
      },
      balanced: {
        location: 'Chhindwara → Barghat via Kurai settlement edge',
        action: 'Divert the affected section along the Kurai–Barghat settlement fringe',
        via: 'Kurai block (Pench buffer settlement edge)',
        lengthFactor: 1.05,
        costFactor: 1.04,
      },
      'cost-optimised': {
        location: 'Chhindwara → Barghat with a limited Seoni pinch-point diversion',
        action: 'Apply a limited local diversion around the Seoni forest pinch-point only',
        via: 'Short Seoni bypass, same endpoints',
        lengthFactor: 0.96,
        costFactor: 0.9,
      },
    },
  },
  'sustainable-tourism': {
    origin: 'Seoni',
    destination: 'Pench buffer (Karmajhiri)',
    currentLocation: 'Karmajhiri habitat-edge visitor node, Seoni Pench buffer',
    issue: (lengthKm) =>
      `The proposed Karmajhiri habitat-edge site (${lengthKm} km access from Seoni) sits on the Pench buffer / Kanha–Pench linkage and creates higher simulated ecological and visitor pressure.`,
    fallbackBudgetCrore: 120,
    kinds: {
      proposed: {
        location: 'Karmajhiri habitat-edge visitor node, Seoni Pench buffer',
        action: 'Retain the proposed Karmajhiri habitat-edge visitor layout',
        via: 'Karmajhiri forest-edge access',
        lengthFactor: 1,
        costFactor: 1,
      },
      'ecology-optimised': {
        location: 'Khawasa–Turia existing tourism gateway (NH-44 / Pench entry)',
        action: 'Move visitor facilities to the already-serviced Khawasa–Turia gateway',
        via: 'Khawasa–Turia existing tourism approach',
        lengthFactor: 0.84,
        costFactor: 0.82,
      },
      balanced: {
        location: 'Seoni town / Dalsagar community-edge interpretation site',
        action: 'Place the interpretation hub at Seoni town and keep only a controlled forest access',
        via: 'Seoni–Dalsagar community edge',
        lengthFactor: 0.72,
        costFactor: 0.88,
      },
      'cost-optimised': {
        location: 'Karmajhiri site with a reduced access footprint',
        action: 'Keep the Karmajhiri site but tighten the access and parking footprint',
        via: 'Adjusted Karmajhiri access only',
        lengthFactor: 0.94,
        costFactor: 0.85,
      },
    },
  },
  'shared-resource-development': {
    origin: 'Mundara (Wainganga headwaters)',
    destination: 'Barghat service area',
    currentLocation: 'Mundara–Seoni forest intake on the Wainganga headwaters',
    issue: (lengthKm) =>
      `The proposed ${lengthKm} km Wainganga intake near Mundara sits in the Seoni forest / Kanha–Pench belt and creates higher simulated environmental and community pressure.`,
    fallbackBudgetCrore: 250,
    kinds: {
      proposed: {
        location: 'Mundara–Seoni forest intake on the Wainganga headwaters',
        action: 'Retain the proposed Mundara forest-belt intake',
        via: 'Mundara forest intake',
        lengthFactor: 1,
        costFactor: 1,
      },
      'ecology-optimised': {
        location: 'Barghat–Keolari agricultural-fringe distribution node, same Wainganga service',
        action: 'Shift intake and distribution to the Barghat–Keolari agricultural fringe',
        via: 'Barghat–Keolari cultivated fringe',
        lengthFactor: 0.9,
        costFactor: 0.87,
      },
      balanced: {
        location: 'Seoni–Barghat shared settlement waterline',
        action: 'Use the Seoni–Barghat settlement corridor while retaining the same service capacity',
        via: 'Seoni–Barghat existing service fringe',
        lengthFactor: 0.97,
        costFactor: 0.95,
      },
      'cost-optimised': {
        location: 'Local network adjustment at the existing Seoni service node',
        action: 'Adjust the existing Seoni service node instead of a new forest intake',
        via: 'Seoni town service node',
        lengthFactor: 0.8,
        costFactor: 0.78,
      },
    },
  },
}

export function classifySangamScenario(projectType: string): SangamScenario {
  if (/tourism|resort|visitor|recreation/i.test(projectType)) {
    return 'sustainable-tourism'
  }
  if (/water|canal|irrigation|resource|reservoir|distribution/i.test(projectType)) {
    return 'shared-resource-development'
  }
  return 'sustainable-construction'
}

export function getConfigurationLabel(scenario: SangamScenario): string {
  if (scenario === 'sustainable-tourism') return 'Alternative Site / Access Layout'
  if (scenario === 'shared-resource-development') {
    return 'Alternative Infrastructure Configuration'
  }
  return 'Alternative Alignment / Footprint'
}

function definitionsFor(scenario: SangamScenario): VariantDefinition[] {
  const scenarioScale =
    scenario === 'sustainable-tourism'
      ? 1.12
      : scenario === 'shared-resource-development'
        ? 1.06
        : 1
  const scale = (values: number[]) => values.map((value) => value * scenarioScale)
  return [
    {
      kind: 'proposed',
      name: 'Proposed Plan',
      latitudeOffsets: [0, 0, 0, 0, 0, 0],
      longitudeOffsets: [0, 0, 0, 0, 0, 0],
      designCostAdjustment: 0,
      complexityPenalty: 0,
    },
    {
      kind: 'ecology-optimised',
      name: 'Alternative A · Ecology-Optimised',
      latitudeOffsets: scale([0, 0.07, 0.115, 0.11, 0.065, 0]),
      longitudeOffsets: scale([0, -0.008, -0.012, 0.01, 0.008, 0]),
      designCostAdjustment: 8,
      complexityPenalty: 8,
    },
    {
      kind: 'balanced',
      name: 'Alternative B · Balanced',
      latitudeOffsets: scale([0, -0.035, -0.07, -0.065, -0.032, 0]),
      longitudeOffsets: scale([0, 0.004, 0.008, -0.006, -0.004, 0]),
      designCostAdjustment: 3,
      complexityPenalty: 4,
    },
    {
      kind: 'cost-optimised',
      name: 'Alternative C · Cost-Optimised',
      latitudeOffsets: scale([0, 0.012, 0.016, 0.012, 0.006, 0]),
      longitudeOffsets: [0, 0, 0, 0, 0, 0],
      designCostAdjustment: -5,
      complexityPenalty: 1,
    },
  ]
}

function shiftGeometry(route: Coordinate[], definition: VariantDefinition): Coordinate[] {
  return route.map(([lng, lat], index) => [
    lng + (definition.longitudeOffsets[index] ?? 0),
    lat + (definition.latitudeOffsets[index] ?? 0),
  ])
}

function sampleLine(route: Coordinate[], samplesPerSegment = 18): Coordinate[] {
  const samples: Coordinate[] = []
  for (let index = 0; index < route.length - 1; index += 1) {
    const [startLng, startLat] = route[index]
    const [endLng, endLat] = route[index + 1]
    for (let step = 0; step < samplesPerSegment; step += 1) {
      const progress = step / samplesPerSegment
      samples.push([
        startLng + (endLng - startLng) * progress,
        startLat + (endLat - startLat) * progress,
      ])
    }
  }
  samples.push(route[route.length - 1])
  return samples
}

function contains(zone: PriorityZone, [lng, lat]: Coordinate): boolean {
  const ring = zone.geometry[0]
  const lngs = ring.map((coordinate) => coordinate[0])
  const lats = ring.map((coordinate) => coordinate[1])
  return (
    lng >= Math.min(...lngs) &&
    lng <= Math.max(...lngs) &&
    lat >= Math.min(...lats) &&
    lat <= Math.max(...lats)
  )
}

function evaluateOverlap(
  geometry: Coordinate[],
  zones: PriorityZone[],
): {
  overlaps: SpatialOverlap[]
  environmentalImpact: number
  connectivityImpact: number
  humanExposure: number
  infrastructureImpact: number
} {
  const samples = sampleLine(geometry)
  const counts = new Map<string, number>()
  let environmentalTotal = 0
  let connectivityTotal = 0
  let humanTotal = 0
  let infrastructureTotal = 0

  for (const point of samples) {
    const matched = zones
      .filter((zone) => contains(zone, point))
      .sort((a, b) => b.priorityScore - a.priorityScore)[0]
    if (matched) {
      counts.set(matched.id, (counts.get(matched.id) ?? 0) + 1)
      environmentalTotal += matched.environmentalSensitivity
      connectivityTotal += matched.connectivityImportance
      humanTotal += matched.humanActivity
      infrastructureTotal += matched.infrastructurePressure
    } else {
      // Low but non-zero regional background exposure outside priority polygons.
      environmentalTotal += 25
      connectivityTotal += 20
      humanTotal += 32
      infrastructureTotal += 28
    }
  }

  const overlaps = zones
    .map((zone) => ({
      zoneId: zone.id,
      overlapPercent: round(((counts.get(zone.id) ?? 0) / samples.length) * 100),
      environmentalExposure: zone.environmentalSensitivity,
      connectivityExposure: zone.connectivityImportance,
      humanExposure: zone.humanActivity,
      infrastructureExposure: zone.infrastructurePressure,
    }))
    .filter((overlap) => overlap.overlapPercent > 0)

  return {
    overlaps,
    environmentalImpact: round(environmentalTotal / samples.length),
    connectivityImpact: round(connectivityTotal / samples.length),
    humanExposure: round(humanTotal / samples.length),
    infrastructureImpact: round(infrastructureTotal / samples.length),
  }
}

function distanceKm(route: Coordinate[]): number {
  let total = 0
  for (let index = 0; index < route.length - 1; index += 1) {
    const [lngA, latA] = route[index]
    const [lngB, latB] = route[index + 1]
    const meanLat = ((latA + latB) / 2) * (Math.PI / 180)
    const x = (lngB - lngA) * 111.32 * Math.cos(meanLat)
    const y = (latB - latA) * 110.57
    total += Math.sqrt(x * x + y * y)
  }
  return total
}

function tradeOffFor(kind: AlternativeKind): string {
  if (kind === 'ecology-optimised') {
    return 'Lower ecological and connectivity exposure, with a moderate cost and design-complexity premium.'
  }
  if (kind === 'balanced') {
    return 'Balances ecological compatibility, safety, cost and practical constructability.'
  }
  if (kind === 'cost-optimised') {
    return 'Stays closer to the proposed configuration to reduce cost, while retaining minimum simulated safeguards.'
  }
  return 'Represents the uploaded development plan without simulated spatial adjustment.'
}

function createOption(
  analysis: Stage3Analysis,
  definition: VariantDefinition,
  scenario: SangamScenario,
  configurationType: string,
  baseDistance: number,
): Omit<AlternativeOption, 'overallScore' | 'rank'> {
  const geometry = shiftGeometry(analysis.spatialContext.route, definition)
  const spatial = evaluateOverlap(geometry, analysis.priorityZones)
  const optionDistance = distanceKm(geometry)
  const detourPercent = Math.max(0, ((optionDistance / baseDistance) - 1) * 100)
  const costIndex = round(
    clamp(100 + detourPercent * 0.65 + definition.designCostAdjustment),
  )
  const presentation = SCENARIO_PRESENTATION[scenario]
  const kindPresentation = presentation.kinds[definition.kind]
  const baselineCostCrore =
    analysis.profile.budgetCrore && analysis.profile.budgetCrore > 0
      ? analysis.profile.budgetCrore
      : presentation.fallbackBudgetCrore
  const estimatedCostCrore = round1(baselineCostCrore * kindPresentation.costFactor)
  const costDifferenceCrore = round1(estimatedCostCrore - baselineCostCrore)
  const approximateLengthKm = round1(
    analysis.profile.projectLengthKm * kindPresentation.lengthFactor,
  )
  const engineeringFeasibility = round(
    clamp(92 - detourPercent * 0.75 - definition.complexityPenalty),
  )
  const environmentalCompatibility = 100 - spatial.environmentalImpact
  const connectivityPreservation = 100 - spatial.connectivityImpact
  const humanSafety = 100 - spatial.humanExposure
  const relativeCost = round(clamp(180 - costIndex))
  const footprintEfficiency = round(clamp(100 - detourPercent * 1.5))
  const sustainability = round(
    environmentalCompatibility * 0.4 +
      connectivityPreservation * 0.3 +
      humanSafety * 0.2 +
      footprintEfficiency * 0.1,
  )
  const scores: McdaScores = {
    environmentalCompatibility,
    connectivityPreservation,
    humanSafety,
    relativeCost,
    engineeringFeasibility,
    sustainability,
  }
  const calculatedRisk = round(
    spatial.environmentalImpact * 0.3 +
      spatial.connectivityImpact * 0.3 +
      spatial.humanExposure * 0.2 +
      spatial.infrastructureImpact * 0.2,
  )
  const riskScore =
    definition.kind === 'proposed'
      ? analysis.riskAssessment.overallScore
      : calculatedRisk
  const feasible =
    scores.environmentalCompatibility >= 35 &&
    scores.connectivityPreservation >= 30 &&
    scores.humanSafety >= 30 &&
    scores.engineeringFeasibility >= 45
  const feasibilityNotes = [
    `PoC places: ${presentation.origin} → ${presentation.destination} via ${kindPresentation.via}.`,
    `Simulated length ${approximateLengthKm} km (base plan ${analysis.profile.projectLengthKm} km).`,
    `Estimated PoC Cost ₹${estimatedCostCrore} crore (${costDifferenceCrore === 0 ? 'same as' : costDifferenceCrore > 0 ? `+₹${costDifferenceCrore} crore vs` : `−₹${Math.abs(costDifferenceCrore)} crore vs`} current plan).`,
    `Simulated spatial detour / footprint change: ${round(detourPercent)}%.`,
    `MCDA relative cost index: ${costIndex} (proposed plan baseline = 100).`,
    feasible
      ? 'Meets the PoC minimum ecology, safety and feasibility thresholds.'
      : 'Fails at least one PoC minimum threshold and requires redesign.',
  ]
  const scenarioBalance =
    scenario === 'sustainable-tourism'
      ? `Environmental impact is ${spatial.environmentalImpact}/100, visitor/access feasibility is ${engineeringFeasibility}/100 and safety is ${humanSafety}/100.`
      : scenario === 'shared-resource-development'
        ? `Environmental impact is ${spatial.environmentalImpact}/100, resource accessibility is ${connectivityPreservation}/100 and community/safety is ${humanSafety}/100.`
        : `Ecology compatibility is ${environmentalCompatibility}/100, connectivity preservation is ${connectivityPreservation}/100 and safety is ${humanSafety}/100.`
  const signedCost =
    costDifferenceCrore === 0
      ? 'no simulated cost difference'
      : `${costDifferenceCrore > 0 ? '+' : '−'}₹${Math.abs(costDifferenceCrore)} crore Estimated PoC Cost`
  const whyBetter =
    definition.kind === 'proposed'
      ? 'This is the current uploaded configuration and provides the comparison baseline.'
      : `${kindPresentation.action}. It uses ${kindPresentation.via} instead of the high-risk forest-edge section. Simulated length ${analysis.profile.projectLengthKm} km → ${approximateLengthKm} km, with ${signedCost}. Simulated risk ${analysis.riskAssessment.overallScore} → ${riskScore}. ${scenarioBalance}`

  return {
    id: definition.kind,
    name: definition.name,
    kind: definition.kind,
    configurationType:
      definition.kind === 'proposed' ? 'Current Proposed Configuration' : configurationType,
    actionTitle: kindPresentation.action,
    currentLocationLabel: presentation.currentLocation,
    alternativeLocationLabel: kindPresentation.location,
    originPlace: presentation.origin,
    destinationPlace: presentation.destination,
    viaPlace: kindPresentation.via,
    issueSummary: presentation.issue(analysis.profile.projectLengthKm),
    approximateLengthKm,
    estimatedCostCrore,
    costDifferenceCrore,
    costBasis: analysis.profile.budgetCrore && analysis.profile.budgetCrore > 0
      ? 'Project Plan Budget'
      : 'Deterministic PoC Scenario Baseline',
    whyBetter,
    objective: analysis.profile.developmentObjective,
    geometry,
    geometryNotice: 'PoC Simulation Geometry',
    spatialOverlap: spatial.overlaps,
    environmentalImpact: spatial.environmentalImpact,
    connectivityImpact: spatial.connectivityImpact,
    humanSafetyRisk: spatial.humanExposure,
    infrastructureImpact: spatial.infrastructureImpact,
    riskScore,
    riskBand: getRiskBand(riskScore),
    costIndex,
    detourPercent: round(detourPercent),
    scores,
    feasible,
    feasibilityNotes,
    tradeOff: tradeOffFor(definition.kind),
  }
}

export function generateAlternativeAnalysis(
  analysis: Stage3Analysis,
): AlternativeAnalysis {
  const scenario = classifySangamScenario(analysis.profile.projectType)
  const configurationLabel = getConfigurationLabel(scenario)
  const definitions = definitionsFor(scenario)
  const baseDistance = distanceKm(analysis.spatialContext.route)
  const ranked = rankDevelopmentOptions(
    definitions.map((definition) =>
      createOption(analysis, definition, scenario, configurationLabel, baseDistance),
    ),
  ).sort((a, b) => a.rank - b.rank)
  const proposed = ranked.find((option) => option.kind === 'proposed')!
  const proposedSuitable =
    proposed.riskScore < 55 &&
    proposed.overallScore >= 50 &&
    proposed.feasible
  const bestAlternative =
    ranked.find((option) => option.kind !== 'proposed' && option.feasible) ?? proposed
  const recommended = proposedSuitable ? proposed : bestAlternative

  return {
    scenario,
    configurationLabel,
    proposedSuitable,
    proposedOptionId: proposed.id,
    recommendedOptionId: recommended.id,
    options: ranked,
    decisionStatement: proposedSuitable
      ? 'Proposed plan is within acceptable simulated thresholds. Continue with the proposed plan for validated assessment.'
      : `Proposed ${proposed.originPlace} → ${proposed.destinationPlace} alignment needs reassessment. ${recommended.name} uses ${recommended.viaPlace} instead.`,
    comparativeStatement:
      recommended.id === proposed.id
        ? 'The proposed development objective remains achievable with the current configuration under the simulated thresholds.'
        : `Same objective, different place: ${proposed.viaPlace} (${proposed.approximateLengthKm} km, ₹${proposed.estimatedCostCrore} cr, risk ${proposed.riskScore}) versus ${recommended.viaPlace} (${recommended.approximateLengthKm} km, ₹${recommended.estimatedCostCrore} cr, risk ${recommended.riskScore}).`,
    dataNotice: 'PoC Simulation — Simulated Scores and Geometry',
  }
}

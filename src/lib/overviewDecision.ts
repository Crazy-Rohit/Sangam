import type { PriorityZone } from '../types/analysis'
import type { AlternativeAnalysis, AlternativeOption } from '../types/alternatives'

export type MetricDirection = 'higher' | 'lower'

export type ComparisonRow = {
  id: string
  label: string
  current: number
  recommended: number
  difference: number
  relativeChangePercent: number | null
  direction: MetricDirection
  improved: boolean
}

export type TradeOffChartRow = {
  criterion: string
  direction: string
  Current: number
  'Alt A': number
  'Alt B': number
  'Alt C': number
}

const CHART_KEYS = ['Current', 'Alt A', 'Alt B', 'Alt C'] as const

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function relativeChange(current: number, recommended: number): number | null {
  if (current === 0) return null
  return round1(((recommended - current) / current) * 100)
}

function metric(
  id: string,
  label: string,
  current: number,
  recommended: number,
  direction: MetricDirection,
): ComparisonRow {
  const difference = recommended - current
  const improved = direction === 'lower' ? recommended < current : recommended > current
  return {
    id,
    label,
    current,
    recommended,
    difference,
    relativeChangePercent: relativeChange(current, recommended),
    direction,
    improved,
  }
}

export function findProposed(analysis: AlternativeAnalysis): AlternativeOption | undefined {
  return analysis.options.find((option) => option.id === analysis.proposedOptionId)
}

export function findRecommended(analysis: AlternativeAnalysis): AlternativeOption | undefined {
  return analysis.options.find((option) => option.id === analysis.recommendedOptionId)
}

export function optionByKind(
  analysis: AlternativeAnalysis,
  kind: AlternativeOption['kind'],
): AlternativeOption | undefined {
  return analysis.options.find((option) => option.kind === kind)
}

export function buildComparisonRows(
  current: AlternativeOption,
  recommended: AlternativeOption,
): ComparisonRow[] {
  return [
    metric('risk', 'Risk', current.riskScore, recommended.riskScore, 'lower'),
    metric(
      'ecology',
      'Ecology',
      current.scores.environmentalCompatibility,
      recommended.scores.environmentalCompatibility,
      'higher',
    ),
    metric(
      'connectivity',
      'Connectivity',
      current.scores.connectivityPreservation,
      recommended.scores.connectivityPreservation,
      'higher',
    ),
    metric('safety', 'Safety', current.scores.humanSafety, recommended.scores.humanSafety, 'higher'),
    metric('length', 'Simulated length (km)', current.approximateLengthKm, recommended.approximateLengthKm, 'lower'),
    metric('cost', 'Estimated PoC Cost (₹ cr)', current.estimatedCostCrore, recommended.estimatedCostCrore, 'lower'),
    metric(
      'feasibility',
      'Feasibility',
      current.scores.engineeringFeasibility,
      recommended.scores.engineeringFeasibility,
      'higher',
    ),
    metric(
      'sustainability',
      'Sustainability',
      current.scores.sustainability,
      recommended.scores.sustainability,
      'higher',
    ),
    metric('overall', 'Overall score', current.overallScore, recommended.overallScore, 'higher'),
  ]
}

export function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value)
}

export function primaryRiskDriver(zone: PriorityZone): string {
  const drivers: Array<{ label: string; score: number }> = [
    { label: 'Ecology', score: zone.environmentalSensitivity },
    { label: 'Connectivity', score: zone.connectivityImportance },
    { label: 'Human activity', score: zone.humanActivity },
    { label: 'Infrastructure', score: zone.infrastructurePressure },
  ]
  return drivers.reduce((best, item) => (item.score > best.score ? item : best)).label
}

export function topPriorityZones(zones: PriorityZone[], count = 3): PriorityZone[] {
  return [...zones].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, count)
}

export function buildRecommendationReason(
  current: AlternativeOption,
  recommended: AlternativeOption,
  options: AlternativeOption[],
): string {
  if (recommended.id === current.id) {
    return `The current plan remains the recommended configuration on the existing evaluation (overall ${recommended.overallScore}/100; risk ${recommended.riskScore}, ${recommended.riskBand}).`
  }

  const maxOverall = Math.max(...options.map((option) => option.overallScore))
  const isHighestOverall = recommended.overallScore === maxOverall
  const balancedCriteria: string[] = []
  if (recommended.scores.environmentalCompatibility >= current.scores.environmentalCompatibility) {
    balancedCriteria.push('ecological compatibility')
  }
  if (recommended.scores.connectivityPreservation >= current.scores.connectivityPreservation) {
    balancedCriteria.push('connectivity')
  }
  if (recommended.scores.humanSafety >= current.scores.humanSafety) {
    balancedCriteria.push('safety')
  }
  if (recommended.scores.engineeringFeasibility >= current.scores.engineeringFeasibility) {
    balancedCriteria.push('feasibility')
  }
  if (recommended.scores.sustainability >= current.scores.sustainability) {
    balancedCriteria.push('sustainability')
  }

  const lead = isHighestOverall
    ? `Highest combined score among the evaluated options (${recommended.overallScore}/100 versus current plan ${current.overallScore}/100)`
    : `Combined score ${recommended.overallScore}/100 versus current plan ${current.overallScore}/100`

  if (balancedCriteria.length >= 3) {
    return `${lead}. Moves from ${current.viaPlace} to ${recommended.viaPlace} (${current.approximateLengthKm} km → ${recommended.approximateLengthKm} km; ₹${current.estimatedCostCrore} cr → ₹${recommended.estimatedCostCrore} cr), with risk ${recommended.riskScore} versus current ${current.riskScore}.`
  }

  return `${lead}. ${current.viaPlace} → ${recommended.viaPlace}. Risk ${current.riskScore} → ${recommended.riskScore}; length ${current.approximateLengthKm} km → ${recommended.approximateLengthKm} km; Estimated PoC Cost ₹${current.estimatedCostCrore} cr → ₹${recommended.estimatedCostCrore} cr.`
}

export function buildWhyBullets(
  current: AlternativeOption,
  recommended: AlternativeOption,
): string[] {
  if (recommended.id === current.id) {
    return [
      `Current plan remains recommended: ${current.originPlace} → ${current.destinationPlace} via ${current.viaPlace}.`,
      `Simulated length ${recommended.approximateLengthKm} km · Estimated PoC Cost ₹${recommended.estimatedCostCrore} crore · risk ${recommended.riskScore} (${recommended.riskBand}).`,
      `Ecology ${recommended.scores.environmentalCompatibility}, connectivity ${recommended.scores.connectivityPreservation}, safety ${recommended.scores.humanSafety}.`,
    ]
  }

  const bullets: string[] = [
    `Uses ${recommended.viaPlace} instead of ${current.viaPlace} (${current.originPlace} → ${current.destinationPlace}).`,
  ]

  if (recommended.approximateLengthKm !== current.approximateLengthKm) {
    bullets.push(
      `Simulated length ${current.approximateLengthKm} km → ${recommended.approximateLengthKm} km (PoC dummy length, difference ${signed(recommended.approximateLengthKm - current.approximateLengthKm)} km).`,
    )
  }

  if (recommended.estimatedCostCrore !== current.estimatedCostCrore) {
    bullets.push(
      `Estimated PoC Cost ₹${current.estimatedCostCrore} cr → ₹${recommended.estimatedCostCrore} cr (${signed(recommended.estimatedCostCrore - current.estimatedCostCrore)} crore). Not a real quotation.`,
    )
  }

  if (recommended.riskScore < current.riskScore) {
    bullets.push(
      `Lower overall risk than the current plan (${current.riskScore} → ${recommended.riskScore}, PoC score difference ${signed(recommended.riskScore - current.riskScore)}).`,
    )
  } else if (recommended.riskScore > current.riskScore) {
    bullets.push(
      `Higher overall risk than the current plan (${current.riskScore} → ${recommended.riskScore}, PoC score difference ${signed(recommended.riskScore - current.riskScore)}).`,
    )
  }

  const ecoGain =
    recommended.scores.environmentalCompatibility - current.scores.environmentalCompatibility
  const connGain =
    recommended.scores.connectivityPreservation - current.scores.connectivityPreservation
  if (ecoGain > 0 && connGain > 0) {
    bullets.push(
      `Stronger ecological and connectivity scores (${current.scores.environmentalCompatibility} → ${recommended.scores.environmentalCompatibility}; ${current.scores.connectivityPreservation} → ${recommended.scores.connectivityPreservation}).`,
    )
  } else if (ecoGain > 0) {
    bullets.push(
      `Stronger ecological score (${current.scores.environmentalCompatibility} → ${recommended.scores.environmentalCompatibility}, PoC score difference ${signed(ecoGain)}).`,
    )
  } else if (connGain > 0) {
    bullets.push(
      `Stronger connectivity score (${current.scores.connectivityPreservation} → ${recommended.scores.connectivityPreservation}, PoC score difference ${signed(connGain)}).`,
    )
  }

  const susGain = recommended.scores.sustainability - current.scores.sustainability
  const feasGain =
    recommended.scores.engineeringFeasibility - current.scores.engineeringFeasibility
  const costDrop = current.costIndex - recommended.costIndex
  if (susGain > 0 && feasGain > 0 && costDrop >= 0) {
    bullets.push(
      `Better evaluated balance between sustainability (${current.scores.sustainability} → ${recommended.scores.sustainability}), feasibility (${current.scores.engineeringFeasibility} → ${recommended.scores.engineeringFeasibility}) and cost index (${current.costIndex} → ${recommended.costIndex}).`,
    )
  } else if (susGain > 0 && feasGain > 0) {
    bullets.push(
      `Higher sustainability and feasibility scores (${current.scores.sustainability} → ${recommended.scores.sustainability}; ${current.scores.engineeringFeasibility} → ${recommended.scores.engineeringFeasibility}).`,
    )
  } else if (costDrop > 0) {
    bullets.push(
      `Lower cost index than the current plan (${current.costIndex} → ${recommended.costIndex}, PoC score difference ${signed(recommended.costIndex - current.costIndex)}).`,
    )
  }

  const overallGain = recommended.overallScore - current.overallScore
  if (overallGain > 0 && bullets.length < 3) {
    bullets.push(
      `Higher combined evaluation score (${current.overallScore} → ${recommended.overallScore}, PoC score difference ${signed(overallGain)}).`,
    )
  }

  const safetyGain = recommended.scores.humanSafety - current.scores.humanSafety
  if (safetyGain > 0 && bullets.length < 3) {
    bullets.push(
      `Higher safety score (${current.scores.humanSafety} → ${recommended.scores.humanSafety}, PoC score difference ${signed(safetyGain)}).`,
    )
  }

  return bullets.slice(0, 5)
}

export function buildPlainEnglishSummary(input: {
  projectType: string
  location: string
  developmentObjective: string
  current: AlternativeOption
  recommended: AlternativeOption
  overallRisk: number
  overallRiskBand: string
  priorityZoneCount: number
}): string {
  const { current, recommended } = input
  const objective = input.developmentObjective.replace(/\.$/, '')

  if (recommended.id === current.id) {
    return `Simply put, Sangam found that the proposed ${input.projectType} configuration in ${input.location} remains the recommended option among those evaluated. Overall Sangam risk is ${input.overallRiskBand} (${input.overallRisk}/100) across ${input.priorityZoneCount} priority areas, while continuing to address the original development objective: ${objective}.`
  }

  const riskClause =
    current.riskScore > recommended.riskScore
      ? 'carries higher risk in specific priority areas'
      : current.riskScore < recommended.riskScore
        ? 'has a different risk profile in the evaluated priority areas'
        : 'is weaker on the combined evaluation even where overall risk is similar'

  const performanceClause =
    recommended.overallScore > current.overallScore
      ? `The recommended configuration performs better across the combined Sangam criteria (overall ${current.overallScore} → ${recommended.overallScore})`
      : `The recommended configuration is selected from the existing ranking (overall ${recommended.overallScore} versus current ${current.overallScore})`

  return `Simply put, Sangam found that the proposed ${current.originPlace} → ${current.destinationPlace} configuration ${riskClause} via ${current.viaPlace}. ${performanceClause}, using ${recommended.viaPlace} (${current.approximateLengthKm} km → ${recommended.approximateLengthKm} km; ₹${current.estimatedCostCrore} cr → ₹${recommended.estimatedCostCrore} cr) while continuing to address the original development objective.`
}

export function buildTradeOffChartData(analysis: AlternativeAnalysis): TradeOffChartRow[] {
  const current = optionByKind(analysis, 'proposed')
  const altA = optionByKind(analysis, 'ecology-optimised')
  const altB = optionByKind(analysis, 'balanced')
  const altC = optionByKind(analysis, 'cost-optimised')
  if (!current || !altA || !altB || !altC) return []

  const row = (
    criterion: string,
    direction: string,
    pick: (option: AlternativeOption) => number,
  ): TradeOffChartRow => ({
    criterion,
    direction,
    Current: pick(current),
    'Alt A': pick(altA),
    'Alt B': pick(altB),
    'Alt C': pick(altC),
  })

  return [
    row('Ecology', 'Higher is better', (option) => option.scores.environmentalCompatibility),
    row('Connectivity', 'Higher is better', (option) => option.scores.connectivityPreservation),
    row('Safety', 'Higher is better', (option) => option.scores.humanSafety),
    row('Feasibility', 'Higher is better', (option) => option.scores.engineeringFeasibility),
    row('Sustainability', 'Higher is better', (option) => option.scores.sustainability),
    row('Length', 'Lower is better · km', (option) => option.approximateLengthKm),
    row('Est. cost', 'Lower is better · ₹ crore', (option) => option.estimatedCostCrore),
    row('Risk', 'Lower is better', (option) => option.riskScore),
  ]
}

export { CHART_KEYS }

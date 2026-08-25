import type { AlternativeOption, SangamScenario } from '../../types/alternatives'
import { signed } from '../../lib/overviewDecision'
import { StairFlow, type StairFlowStep } from './StairFlow'

const scenarioNoun: Record<SangamScenario, string> = {
  'sustainable-construction': 'alignment',
  'sustainable-tourism': 'site / access',
  'shared-resource-development': 'infrastructure configuration',
}

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(Math.abs(value))

export function ActionableRecommendationFlow({
  scenario,
  current,
  recommended,
  compact = false,
}: {
  scenario: SangamScenario
  current: AlternativeOption
  recommended: AlternativeOption
  compact?: boolean
}) {
  const sameOption = current.id === recommended.id
  const costDifference = recommended.estimatedCostCrore - current.estimatedCostCrore
  const riskDifference = recommended.riskScore - current.riskScore
  const overallDifference = recommended.overallScore - current.overallScore
  const steps: StairFlowStep[] = [
    {
      id: 'current',
      stage: 'Current plan',
      title: `${current.originPlace} → ${current.destinationPlace}`,
      caption: `Via ${current.viaPlace} · ${current.approximateLengthKm} km · Estimated PoC Cost ₹${money(current.estimatedCostCrore)} crore`,
      tone: 'current',
      accent: 'start',
      handoff: 'Risk check',
    },
    {
      id: 'issue',
      stage: 'Problem / risk',
      title: sameOption
        ? 'Current configuration remains within the simulated acceptance thresholds'
        : current.issueSummary,
      value: `Risk ${current.riskScore}/100`,
      caption: `Simulated risk band ${current.riskBand}`,
      tone: sameOption ? 'current' : 'risk',
      accent: 'process',
      handoff: sameOption ? 'No shift needed' : `Nearby ${scenarioNoun[scenario]}`,
    },
    {
      id: 'recommendation',
      stage: 'Sangam recommends',
      title: sameOption ? 'Retain current configuration' : recommended.actionTitle,
      caption: `Via ${recommended.viaPlace} · ${recommended.approximateLengthKm} km · ${recommended.alternativeLocationLabel}`,
      tone: 'good',
      accent: 'decision',
      handoff: 'Cost estimate',
    },
    {
      id: 'cost',
      stage: 'Estimated PoC Cost',
      title: `₹${money(recommended.estimatedCostCrore)} crore`,
      caption:
        costDifference === 0
          ? 'No simulated cost difference versus the current plan'
          : `${costDifference > 0 ? '+' : '−'}₹${money(costDifference)} crore versus the current plan`,
      tone: 'neutral',
      accent: 'process',
      handoff: 'Compared result',
    },
    {
      id: 'result',
      stage: 'Simulated result',
      title: `Risk ${current.riskScore} → ${recommended.riskScore}`,
      value: `Overall ${current.overallScore} → ${recommended.overallScore}`,
      caption: `Risk score difference ${signed(riskDifference)} · Overall score difference ${signed(overallDifference)}`,
      tone: 'good',
      accent: 'end',
    },
  ]

  return (
    <div className={`actionable-flow ${compact ? 'is-compact' : ''}`.trim()}>
      <StairFlow
        label="Current problem to Sangam recommendation"
        steps={steps}
        dense={compact}
      />
      <div className="action-flow-why">
        <span>Why this option?</span>
        <p>{recommended.whyBetter}</p>
      </div>
      <p className="action-flow-notice">
        Estimated PoC Cost · {recommended.costBasis}. Simulation values only—not a real project estimate
        or field-validated impact claim.
      </p>
    </div>
  )
}

import type { Stage3Analysis } from '../../types/analysis'
import type { AlternativeAnalysis } from '../../types/alternatives'
import type { ProjectProfile } from '../../types/analysis'
import { SANGAM_MCDA_WEIGHTS } from '../../services/decisionAnalysis'
import { findProposed, findRecommended } from '../../lib/overviewDecision'
import { StairFlow, type StairFlowAccent, type StairFlowTone } from './StairFlow'

type FlowNode = {
  id: string
  stage: string
  shape: StairFlowAccent
  title: string
  value: string
  caption: string
  tone?: StairFlowTone
  handoff?: string
}

const CRITERIA_COUNT = Object.keys(SANGAM_MCDA_WEIGHTS).length

const topWeightedCriterion = (): string => {
  const labels: Record<string, string> = {
    environmentalCompatibility: 'Ecology',
    connectivityPreservation: 'Connectivity',
    humanSafety: 'Safety',
    relativeCost: 'Cost',
    engineeringFeasibility: 'Feasibility',
    sustainability: 'Sustainability',
  }
  const [key, weight] = Object.entries(SANGAM_MCDA_WEIGHTS).reduce((best, entry) =>
    entry[1] > best[1] ? entry : best,
  )
  return `${labels[key] ?? key} ${Math.round(weight * 100)}%`
}

function buildNodes(
  profile: ProjectProfile | null,
  stage3: Stage3Analysis | null,
  alternatives: AlternativeAnalysis | null,
): FlowNode[] {
  const recommended = alternatives ? findRecommended(alternatives) : undefined
  const proposed = alternatives ? findProposed(alternatives) : undefined
  const highRisk =
    stage3?.riskAssessment.band === 'HIGH' || stage3?.riskAssessment.band === 'CRITICAL'
  const feasibleCount = alternatives?.options.filter((option) => option.feasible).length ?? 0

  return [
    {
      id: 'plan',
      stage: 'Input',
      shape: 'start',
      title: 'Project plan',
      value: profile ? profile.projectType : '—',
      caption: profile
        ? `${profile.projectLengthKm} km · ${profile.projectAreaSqKm} km² · ${profile.district}`
        : 'Awaiting project profile',
      handoff: profile ? profile.source : undefined,
    },
    {
      id: 'risk',
      stage: 'Process',
      shape: 'process',
      title: 'Risk analysis',
      value: stage3 ? `${stage3.riskAssessment.overallScore}/100` : '—',
      caption: stage3
        ? `${stage3.riskAssessment.band} band · ${stage3.priorityZones.length} priority zones`
        : 'Awaiting analysis',
      tone: highRisk ? 'warn' : 'neutral',
      handoff: stage3 ? `${stage3.priorityZones.length} zones` : undefined,
    },
    {
      id: 'alternatives',
      stage: 'Process',
      shape: 'process',
      title: 'Alternatives',
      value: alternatives ? `${alternatives.options.length} options` : '—',
      caption: alternatives
        ? `${feasibleCount} pass the simulated engineering check`
        : 'Awaiting generation',
      handoff: alternatives ? 'Scored options' : undefined,
    },
    {
      id: 'mcda',
      stage: 'Decision',
      shape: 'decision',
      title: 'MCDA',
      value: `${CRITERIA_COUNT} criteria`,
      caption: `Highest weight: ${topWeightedCriterion()}`,
      handoff: proposed && recommended ? `Rank 1 of ${alternatives?.options.length ?? 0}` : undefined,
    },
    {
      id: 'recommendation',
      stage: 'Output',
      shape: 'end',
      title: 'Recommendation',
      value: recommended ? `${recommended.overallScore}/100` : '—',
      caption: recommended
        ? `${recommended.name}${proposed && proposed.id === recommended.id ? ' · current plan retained' : ''}`
        : 'Awaiting ranking',
      tone: recommended ? 'good' : 'neutral',
    },
  ]
}

export function DecisionFlow({
  profile,
  stage3,
  alternatives,
}: {
  profile: ProjectProfile | null
  stage3: Stage3Analysis | null
  alternatives: AlternativeAnalysis | null
}) {
  const nodes = buildNodes(profile, stage3, alternatives)

  return (
    <StairFlow
      label="Sangam decision pipeline"
      steps={nodes.map((node) => ({
        id: node.id,
        stage: node.stage,
        title: node.title,
        value: node.value,
        caption: node.caption,
        tone: node.tone,
        accent: node.shape,
        handoff: node.handoff,
      }))}
    />
  )
}

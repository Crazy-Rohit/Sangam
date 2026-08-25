import { useState } from 'react'
import { AlternativeOptionsMap } from '../../components/map/AlternativeOptionsMap'
import { ActionableRecommendationFlow } from '../../components/dashboard/ActionableRecommendationFlow'
import { StairFlow } from '../../components/dashboard/StairFlow'
import { OptionComparisonGrid } from '../../components/dashboard/OptionComparisonGrid'
import { Card, SectionHeader } from '../../components/ui/Card'
import { useSangam } from '../../context/SangamContext'
import { SANGAM_MCDA_WEIGHTS } from '../../services/decisionAnalysis'
import type { AlternativeOption, SangamScenario } from '../../types/alternatives'

const LINEAGE_STEPS = [
  {
    id: 'risk',
    stage: 'Input',
    title: 'Risk analysis',
    caption: 'Combined simulated risk for the uploaded plan.',
  },
  {
    id: 'zones',
    stage: 'Input',
    title: 'Priority zones',
    caption: 'Ranked zones that the configurations are tested against.',
  },
  {
    id: 'generation',
    stage: 'Process',
    title: 'Alternative generation',
    caption: 'Deterministic configurations sharing the same endpoints.',
  },
  {
    id: 'spatial',
    stage: 'Process',
    title: 'Spatial evaluation',
    caption: 'Zone overlap and exposure per configuration.',
  },
  {
    id: 'engineering',
    stage: 'Process',
    title: 'Engineering evaluation',
    caption: 'Simulated feasibility, detour and cost index.',
  },
  {
    id: 'mcda',
    stage: 'Decision',
    title: 'Sangam MCDA',
    caption: 'One shared weighted formula ranks every option.',
  },
  {
    id: 'output',
    stage: 'Output',
    title: 'Recommended development configuration',
    caption: 'Highest-ranked feasible option from the same pipeline.',
  },
] as const

const scenarioLabel = {
  'sustainable-construction': 'Sustainable Construction',
  'sustainable-tourism': 'Sustainable Tourism',
  'shared-resource-development': 'Shared Resource Development',
} as const

function OptionDetails({
  option,
  scenario,
}: {
  option: AlternativeOption
  scenario: SangamScenario
}) {
  const costDifference =
    option.costDifferenceCrore > 0
      ? `+₹${option.costDifferenceCrore} crore`
      : option.costDifferenceCrore < 0
        ? `−₹${Math.abs(option.costDifferenceCrore)} crore`
        : 'No difference'
  const isConstruction = scenario === 'sustainable-construction'
  const ecologyLabel = isConstruction ? 'Ecology score' : 'Environmental impact'
  const ecologyValue = isConstruction
    ? option.scores.environmentalCompatibility
    : option.environmentalImpact
  const connectivityLabel =
    scenario === 'sustainable-tourism'
      ? 'Access feasibility'
      : scenario === 'shared-resource-development'
        ? 'Resource accessibility'
        : 'Connectivity score'
  const safetyLabel =
    scenario === 'shared-resource-development' ? 'Community / safety' : 'Safety score'
  return (
    <Card className="alternative-detail-card">
      <div className="alternative-detail-head">
        <div>
          <p className="kicker">Rank {option.rank} · {option.geometryNotice}</p>
          <h3>{option.name}</h3>
          <p>{option.configurationType}</p>
        </div>
        <span className={`risk-band risk-${option.riskBand.toLowerCase()}`}>
          Risk {option.riskBand}
        </span>
      </div>
      <div className="actionable-option-summary">
        <div>
          <span>Action</span>
          <strong>{option.actionTitle}</strong>
        </div>
        <div>
          <span>Simulated location / configuration</span>
          <strong>{option.alternativeLocationLabel}</strong>
          <small>
            {option.originPlace} → {option.destinationPlace} via {option.viaPlace}
          </small>
        </div>
        <div>
          <span>Approx. project length</span>
          <strong>{option.approximateLengthKm} km</strong>
        </div>
        <div>
          <span>Estimated PoC Cost</span>
          <strong>₹{option.estimatedCostCrore} crore</strong>
          <small>{costDifference} vs current plan</small>
        </div>
      </div>
      <p className="alternative-tradeoff">{option.tradeOff}</p>
      <div className="alternative-score-grid">
        <div><span>Risk</span><strong>{option.riskScore}</strong></div>
        <div><span>{ecologyLabel}</span><strong>{ecologyValue}</strong></div>
        <div><span>{connectivityLabel}</span><strong>{scenario === 'sustainable-tourism' ? option.scores.engineeringFeasibility : option.scores.connectivityPreservation}</strong></div>
        <div><span>{safetyLabel}</span><strong>{option.scores.humanSafety}</strong></div>
        <div><span>Cost index</span><strong>{option.costIndex}</strong></div>
        <div><span>Feasibility</span><strong>{option.scores.engineeringFeasibility}</strong></div>
        <div><span>Sustainability</span><strong>{option.scores.sustainability}</strong></div>
        <div className="overall"><span>MCDA overall</span><strong>{option.overallScore}</strong></div>
      </div>
      <div className="alternative-why">
        <span>Why this option?</span>
        <p>{option.whyBetter}</p>
      </div>
      <h4>Simulated engineering check</h4>
      <ul className="reason-list">
        {option.feasibilityNotes.map((note) => <li key={note}>{note}</li>)}
      </ul>
    </Card>
  )
}

export function AlternativeOptionsPage() {
  const { stage3Analysis, alternativeAnalysis } = useSangam()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (!stage3Analysis || !alternativeAnalysis) {
    return (
      <Card>
        <SectionHeader
          kicker="Alternative generation"
          title="Complete the Sangam analysis first"
          description="Alternative configurations require the project profile, risk assessment and priority zones."
        />
      </Card>
    )
  }

  const proposed = alternativeAnalysis.options.find(
    (option) => option.id === alternativeAnalysis.proposedOptionId,
  )!
  const recommended = alternativeAnalysis.options.find(
    (option) => option.id === alternativeAnalysis.recommendedOptionId,
  )!
  const selected =
    alternativeAnalysis.options.find((option) => option.id === selectedId) ??
    recommended

  return (
    <div className="stack alternatives-page">
      <div className="analysis-title-row">
        <SectionHeader
          kicker="Alternative generation"
          title="Alternative Development Options"
          description="Sangam does not only identify development–ecology trade-offs. It explores feasible alternative configurations that can achieve the development objective while improving ecological compatibility, safety and sustainability."
        />
        <span className="simulation-notice">{alternativeAnalysis.dataNotice}</span>
      </div>

      <Card className={`suitability-banner ${alternativeAnalysis.proposedSuitable ? 'is-suitable' : 'needs-review'}`}>
        <span className="suitability-icon" aria-hidden="true">
          {alternativeAnalysis.proposedSuitable ? '✓' : '⚠'}
        </span>
        <div>
          <p className="kicker">Suitability check</p>
          <h3>{alternativeAnalysis.decisionStatement}</h3>
          <p>
            Scenario: {scenarioLabel[alternativeAnalysis.scenario]} · Configuration:
            {' '}{alternativeAnalysis.configurationLabel}
          </p>
        </div>
      </Card>

      <section>
        <SectionHeader
          kicker="PoC Comparative Result"
          title="Current plan vs recommended configuration"
          description={alternativeAnalysis.comparativeStatement}
        />
        <Card className="recommended-option actionable-recommendation-card">
          <ActionableRecommendationFlow
            scenario={alternativeAnalysis.scenario}
            current={proposed}
            recommended={recommended}
          />
        </Card>
        <OptionComparisonGrid analysis={alternativeAnalysis} />
      </section>

      <section>
        <SectionHeader
          kicker="Spatial evaluation"
          title="Proposed and alternative configurations"
          description="Select a configuration on the map or in the ranked table. All geometry is generated locally from the same simulated endpoints and priority-zone context."
        />
        <div className="alternative-map-grid">
          <AlternativeOptionsMap
            stage3={stage3Analysis}
            alternatives={alternativeAnalysis}
            selectedId={selected.id}
            onSelect={(option) => setSelectedId(option.id)}
          />
          <OptionDetails option={selected} scenario={alternativeAnalysis.scenario} />
        </div>
      </section>

      <section className="analysis-section">
        <SectionHeader
          kicker="Shared Sangam MCDA"
          title="Ranked alternative development options"
          description="The proposed plan and every alternative use the same decision formula. Higher component and overall scores are better; risk and the displayed cost estimate are interpreted separately."
        />
        <p className="formula-note">
          Environmental compatibility {SANGAM_MCDA_WEIGHTS.environmentalCompatibility * 100}% +
          Connectivity preservation {SANGAM_MCDA_WEIGHTS.connectivityPreservation * 100}% +
          Human safety {SANGAM_MCDA_WEIGHTS.humanSafety * 100}% +
          Relative cost {SANGAM_MCDA_WEIGHTS.relativeCost * 100}% +
          Engineering feasibility {SANGAM_MCDA_WEIGHTS.engineeringFeasibility * 100}% +
          Sustainability {SANGAM_MCDA_WEIGHTS.sustainability * 100}%.
        </p>
        <div className="zone-table-wrap">
          <table className="zone-table alternative-table">
            <thead>
              <tr>
                <th>Rank / option</th>
                <th>Via</th>
                <th>Length</th>
                <th>Ecology</th>
                <th>Connectivity</th>
                <th>Safety</th>
                <th>Estimated PoC Cost</th>
                <th>Feasibility</th>
                <th>Sustainability</th>
                <th>Risk</th>
                <th>Overall</th>
              </tr>
            </thead>
            <tbody>
              {alternativeAnalysis.options.map((option) => (
                <tr
                  key={option.id}
                  className={`${option.id === selected.id ? 'is-selected' : ''} ${option.id === recommended.id ? 'is-recommended' : ''}`}
                  onClick={() => setSelectedId(option.id)}
                >
                  <td>
                    <button type="button">
                      {option.rank}. {option.name}
                      {option.id === recommended.id ? ' ★' : ''}
                    </button>
                    <small>{option.alternativeLocationLabel}</small>
                  </td>
                  <td>{option.viaPlace}</td>
                  <td>{option.approximateLengthKm} km</td>
                  <td>{option.scores.environmentalCompatibility}</td>
                  <td>{option.scores.connectivityPreservation}</td>
                  <td>{option.scores.humanSafety}</td>
                  <td>₹{option.estimatedCostCrore} cr</td>
                  <td>{option.scores.engineeringFeasibility}</td>
                  <td>{option.scores.sustainability}</td>
                  <td>{option.riskScore}</td>
                  <td><strong>{option.overallScore}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="analysis-section">
        <SectionHeader
          kicker="Data lineage"
          title="How the recommendation is produced"
          description="Inputs, process and outputs remain visible so the comparative result can be traced."
        />
        <StairFlow
          label="How the recommendation is produced"
          dense
          steps={LINEAGE_STEPS.map((step, index) => ({
            id: step.id,
            stage: step.stage,
            title: step.title,
            caption: step.caption,
            tone: index === LINEAGE_STEPS.length - 1 ? ('good' as const) : undefined,
            accent:
              index === 0
                ? ('start' as const)
                : index === LINEAGE_STEPS.length - 1
                  ? ('end' as const)
                  : step.stage === 'Decision'
                    ? ('decision' as const)
                    : ('process' as const),
          }))}
        />
        <div className="io-grid">
          <Card>
            <p className="kicker">Input</p>
            <p>Project Objective + Proposed Plan + Priority Zones + Constraints</p>
          </Card>
          <Card>
            <p className="kicker">Process</p>
            <p>Generate and evaluate alternative development configurations</p>
          </Card>
          <Card>
            <p className="kicker">Output</p>
            <p>Ranked Alternative Development Options</p>
          </Card>
        </div>
      </section>

      <div className="scientific-honesty">
        <strong>Scientific honesty</strong>
        <p>
          These options are not engineering-certified routes, sites or designs.
          Estimated PoC Costs are deterministic simulation values, not quotations or real-world savings.
          Production use requires validated GIS, terrain, land ownership,
          regulations, engineering constraints and field environmental data.
        </p>
      </div>
    </div>
  )
}

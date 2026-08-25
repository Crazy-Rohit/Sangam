import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { SpatialAnalysisMap } from '../../components/map/SpatialAnalysisMap'
import { Card, SectionHeader } from '../../components/ui/Card'
import { useSangam } from '../../context/SangamContext'
import type {
  DevelopmentPressure,
  PriorityZone,
  RiskBand,
  WeightedFactor,
} from '../../types/analysis'

const PRESSURE_OPTIONS: Array<{ value: DevelopmentPressure; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const riskClass = (band: RiskBand) => `risk-band risk-${band.toLowerCase()}`

function ScoreCard({
  label,
  value,
  suffix = '/100',
  hint,
}: {
  label: string
  value: number | string
  suffix?: string
  hint?: string
}) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>
        {value}
        {suffix}
      </strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  )
}

function FactorBreakdown({ factors }: { factors: WeightedFactor[] }) {
  return (
    <div className="factor-table">
      <div className="factor-head">
        <span>Factor</span>
        <span>Score</span>
        <span>Weight</span>
        <span>Contribution</span>
      </div>
      {factors.map((factor) => (
        <div className="factor-row" key={factor.key}>
          <div>
            <strong>{factor.label}</strong>
            <small>{factor.rationale}</small>
          </div>
          <span>{factor.score}</span>
          <span>{Math.round(factor.weight * 100)}%</span>
          <span>{factor.contribution}</span>
        </div>
      ))}
    </div>
  )
}

function ZoneDetails({ zone }: { zone: PriorityZone }) {
  return (
    <Card className="zone-detail">
      <div className="zone-detail-head">
        <div>
          <p className="kicker">Selected priority zone</p>
          <h3>{zone.label}</h3>
        </div>
        <span className={riskClass(zone.band)}>{zone.band}</span>
      </div>
      <div className="zone-detail-score">
        <strong>{zone.priorityScore}</strong>
        <span>Priority score / 100</span>
      </div>
      <dl className="zone-mini-grid">
        <div><dt>Environmental</dt><dd>{zone.environmentalSensitivity}</dd></div>
        <div><dt>Connectivity</dt><dd>{zone.connectivityImportance}</dd></div>
        <div><dt>Human activity</dt><dd>{zone.humanActivity}</dd></div>
        <div><dt>Infrastructure</dt><dd>{zone.infrastructurePressure}</dd></div>
      </dl>
      <h4>Why is this a priority?</h4>
      <ul className="reason-list">
        {zone.reasons.map((reason) => <li key={reason}>{reason}</li>)}
      </ul>
      <p className="zone-next">Recommended for further engineering assessment in the next stage.</p>
    </Card>
  )
}

export function Stage3AnalysisPage() {
  const {
    stage3Analysis,
    developmentPressure,
    setDevelopmentPressure,
  } = useSangam()
  const initialZoneId = useMemo(() => {
    if (!stage3Analysis) return null
    return [...stage3Analysis.priorityZones].sort((a, b) => b.priorityScore - a.priorityScore)[0]?.id ?? null
  }, [stage3Analysis])
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(initialZoneId)

  if (!stage3Analysis) {
    return (
      <Card>
        <SectionHeader
          kicker="Stage 3"
          title="Spatial analysis is not available yet"
          description="Upload a project plan and complete the simulated analysis workflow first."
        />
      </Card>
    )
  }

  const selectedZone =
    stage3Analysis.priorityZones.find((zone) => zone.id === selectedZoneId) ??
    stage3Analysis.priorityZones[0]
  const {
    profile,
    spatialContext,
    environmentalAssessment,
    connectivityAssessment,
    riskAssessment,
    priorityZones,
  } = stage3Analysis
  const chartData = riskAssessment.categories.map((category) => ({
    name: category.label.replace(' risk', ''),
    score: category.score,
  }))

  return (
    <div className="stack stage3-page">
      <div className="analysis-title-row">
        <SectionHeader
          kicker="Sections B–D · Stage 3"
          title="Spatial, environmental, connectivity & risk analysis"
          description="A deterministic simulation pipeline linking the uploaded project profile to spatial layers, calculated scores and priority zones."
        />
        <span className="simulation-notice">{stage3Analysis.dataNotice}</span>
      </div>

      <div className="source-strip">
        <div>
          <span>Profile source</span>
          <strong>{profile.source}</strong>
        </div>
        <span className="source-arrow">→</span>
        <div>
          <span>Spatial layers</span>
          <strong>PoC Simulation Dataset</strong>
        </div>
        <span className="source-arrow">→</span>
        <div>
          <span>Outputs</span>
          <strong>Calculated, not random</strong>
        </div>
      </div>

      <Card className="scenario-control">
        <div>
          <p className="kicker">Project scenario</p>
          <h3>Development pressure</h3>
          <p>Change the assumed pressure to recalculate disruption, risk and priority zones.</p>
        </div>
        <div className="scenario-buttons" role="group" aria-label="Development pressure">
          {PRESSURE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={developmentPressure === option.value ? 'is-active' : ''}
              onClick={() => setDevelopmentPressure(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      <section>
        <SectionHeader
          kicker="Project spatial context"
          title={spatialContext.corridorName}
          description="Uploaded project attributes establish scale; local deterministic geometry supplies the demonstration GIS layers."
        />
        <div className="metrics-grid metrics-six">
          <ScoreCard label="Project length" value={spatialContext.projectLengthKm} suffix=" km" />
          <ScoreCard label="Project area" value={spatialContext.projectAreaSqKm} suffix=" km²" />
          <ScoreCard label="Environmental sensitivity" value={environmentalAssessment.score} />
          <ScoreCard label="Infrastructure pressure" value={spatialContext.developmentPressure} />
          <ScoreCard label="Connectivity importance" value={connectivityAssessment.importanceScore} />
          <ScoreCard label="Overall Sangam risk" value={riskAssessment.overallScore} hint={riskAssessment.band} />
        </div>
        <div className="context-meta">
          <span><b>Project:</b> {profile.projectName}</span>
          <span><b>Location:</b> {spatialContext.projectLocation}</span>
          <span><b>Type:</b> {spatialContext.projectType}</span>
        </div>
      </section>

      <section>
        <SectionHeader
          kicker="GIS workspace"
          title="Spatial layers & priority interventions"
          description="Use the layer control to inspect the route, environmental context, connectivity, pressure, hotspots and calculated priority zones."
        />
        <div className="map-detail-grid">
          <SpatialAnalysisMap
            analysis={stage3Analysis}
            selectedZoneId={selectedZone.id}
            onSelectZone={(zone) => setSelectedZoneId(zone.id)}
          />
          <ZoneDetails zone={selectedZone} />
        </div>
      </section>

      <section className="analysis-section">
        <SectionHeader
          letter="B"
          kicker="Environmental assessment"
          title="Why is this corridor sensitive?"
          description="Weighted environmental factors are retained so every score can be explained."
        />
        <div className="assessment-grid">
          <ScoreCard label="Environmental sensitivity score" value={environmentalAssessment.score} />
          <Card>
            <p className="formula-note">
              Formula: Habitat 30% + Environmental proximity 20% + Water 10% +
              Land use 15% + Human activity 10% + Infrastructure pressure 15%.
            </p>
            <ul className="reason-list">
              {environmentalAssessment.explanation.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </Card>
        </div>
        <FactorBreakdown factors={environmentalAssessment.factors} />
      </section>

      <section className="analysis-section">
        <SectionHeader
          letter="C"
          kicker="Connectivity analysis"
          title="Where might development interrupt ecological linkage?"
          description="Connectivity importance and disruption are calculated separately, so ecological value is not confused with project pressure."
        />
        <div className="metrics-grid">
          <ScoreCard label="Connectivity importance" value={connectivityAssessment.importanceScore} />
          <ScoreCard label="Connectivity disruption risk" value={connectivityAssessment.disruptionRisk} />
          <ScoreCard label="Development pressure" value={connectivityAssessment.developmentPressure} />
        </div>
        <p className="formula-note">
          Importance = Habitat connectivity 40% + Patch proximity 30% + Corridor continuity 30%.
          Disruption = Importance × combined development/intersection pressure ÷ 100.
        </p>
        <FactorBreakdown factors={connectivityAssessment.factors} />
      </section>

      <section className="analysis-section">
        <SectionHeader
          letter="D"
          kicker="Risk analysis"
          title="Overall Sangam risk"
          description="Environmental, connectivity, human-safety and development-impact risks are combined using explicit weights."
        />
        <div className="risk-layout">
          <Card className="overall-risk-card">
            <span className={riskClass(riskAssessment.band)}>{riskAssessment.band}</span>
            <strong>{riskAssessment.overallScore}</strong>
            <span>Overall risk / 100</span>
            <p>Environmental 30% + Connectivity 30% + Human safety 20% + Development impact 20%</p>
          </Card>
          <Card className="risk-chart-card">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d3e7e6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#184858" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <FactorBreakdown factors={riskAssessment.categories} />
      </section>

      <section className="analysis-section">
        <SectionHeader
          kicker="Priority zones"
          title="Calculated intervention priorities"
          description="Priority = Overall risk 55% + Environmental sensitivity 20% + Connectivity importance 15% + Infrastructure pressure 10%."
        />
        <div className="zone-table-wrap">
          <table className="zone-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Ecology</th>
                <th>Connectivity</th>
                <th>Human</th>
                <th>Infrastructure</th>
                <th>Risk</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {priorityZones.map((zone) => (
                <tr
                  key={zone.id}
                  className={zone.id === selectedZone.id ? 'is-selected' : ''}
                  onClick={() => setSelectedZoneId(zone.id)}
                >
                  <td><button type="button">{zone.label}</button></td>
                  <td>{zone.environmentalSensitivity}</td>
                  <td>{zone.connectivityImportance}</td>
                  <td>{zone.humanActivity}</td>
                  <td>{zone.infrastructurePressure}</td>
                  <td>{zone.overallRisk}</td>
                  <td><span className={riskClass(zone.band)}>{zone.band} · {zone.priorityScore}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

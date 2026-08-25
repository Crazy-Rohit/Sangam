import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, SectionHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { DecisionFlow } from '../../components/dashboard/DecisionFlow'
import { ActionableRecommendationFlow } from '../../components/dashboard/ActionableRecommendationFlow'
import { OptionComparisonGrid } from '../../components/dashboard/OptionComparisonGrid'
import { useSangam } from '../../context/SangamContext'
import {
  buildComparisonRows,
  buildPlainEnglishSummary,
  buildRecommendationReason,
  buildTradeOffChartData,
  buildWhyBullets,
  findProposed,
  findRecommended,
  primaryRiskDriver,
  signed,
  topPriorityZones,
} from '../../lib/overviewDecision'

const CHART_COLORS = {
  Current: '#184858',
  'Alt A': '#287848',
  'Alt B': '#1b5f7f',
  'Alt C': '#c45c2c',
} as const

export function OverviewPage() {
  const { projectProfile, stage3Analysis, alternativeAnalysis } = useSangam()

  const current = alternativeAnalysis ? findProposed(alternativeAnalysis) : undefined
  const recommended = alternativeAnalysis ? findRecommended(alternativeAnalysis) : undefined
  const sameAsCurrent = Boolean(current && recommended && current.id === recommended.id)
  const rows = current && recommended ? buildComparisonRows(current, recommended) : []
  const whyBullets = current && recommended ? buildWhyBullets(current, recommended) : []
  const chartData = alternativeAnalysis ? buildTradeOffChartData(alternativeAnalysis) : []
  const priorityZones = stage3Analysis
    ? topPriorityZones(stage3Analysis.priorityZones, 3)
    : []
  const overallRow = rows.find((row) => row.id === 'overall')
  const overallDiff = overallRow?.difference ?? 0

  const reason =
    current && recommended && alternativeAnalysis
      ? buildRecommendationReason(current, recommended, alternativeAnalysis.options)
      : ''

  const plainEnglish =
    current && recommended && projectProfile && stage3Analysis
      ? buildPlainEnglishSummary({
          projectType: projectProfile.projectType,
          location: projectProfile.location,
          developmentObjective: projectProfile.developmentObjective,
          current,
          recommended,
          overallRisk: stage3Analysis.riskAssessment.overallScore,
          overallRiskBand: stage3Analysis.riskAssessment.band,
          priorityZoneCount: stage3Analysis.priorityZones.length,
        })
      : ''

  return (
    <div className="stack overview-exec">
      <SectionHeader
        kicker="Decision summary"
        title="Overview"
        description="Executive view of the existing Sangam evaluation for this Madhya Pradesh PoC. Scores, ranking and zones are the same values used on Analysis and Alternative Options."
      />

      {projectProfile && stage3Analysis ? (
        <Card className="overview-profile">
          <div className="overview-profile-head">
            <p className="kicker">Project summary</p>
            <Badge>Madhya Pradesh · PoC Simulation</Badge>
          </div>
          <div className="overview-stat-grid">
            <div>
              <span>Project type</span>
              <strong>{projectProfile.projectType}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{projectProfile.location}</strong>
            </div>
            <div>
              <span>Project footprint</span>
              <strong>
                {projectProfile.projectLengthKm} km · {projectProfile.projectAreaSqKm} km²
              </strong>
            </div>
            <div>
              <span>Overall Sangam risk</span>
              <strong>
                {stage3Analysis.riskAssessment.overallScore}
                <em className={`risk-band risk-${stage3Analysis.riskAssessment.band.toLowerCase()}`}>
                  {stage3Analysis.riskAssessment.band}
                </em>
              </strong>
            </div>
            <div>
              <span>Priority zones</span>
              <strong>{stage3Analysis.priorityZones.length}</strong>
            </div>
            <div>
              <span>Alternatives evaluated</span>
              <strong>{alternativeAnalysis?.options.length ?? '—'}</strong>
            </div>
          </div>
        </Card>
      ) : null}

      {current && recommended && alternativeAnalysis ? (
        <Card className="overview-hero">
          <div className="overview-hero-kicker">
            <p className="kicker">Sangam recommendation</p>
            <Badge>Existing ranking · PoC Simulation Data</Badge>
          </div>
          <p className="overview-hero-label">Sangam recommends</p>
          <h2>{sameAsCurrent ? 'Retain the current configuration' : recommended.actionTitle}</h2>
          <p className="overview-hero-config">
            <strong>{recommended.alternativeLocationLabel}</strong> · via {recommended.viaPlace} ·{' '}
            {recommended.approximateLengthKm} km · ₹{recommended.estimatedCostCrore} cr
          </p>
          <p className="overview-hero-decision">{alternativeAnalysis.decisionStatement}</p>
          <ActionableRecommendationFlow
            scenario={alternativeAnalysis.scenario}
            current={current}
            recommended={recommended}
            compact
          />
          <div className="overview-hero-metrics">
            <div>
              <span>Current plan</span>
              <strong>{current.originPlace} → {current.destinationPlace}</strong>
            </div>
            <div>
              <span>Overall Sangam risk</span>
              <strong>
                {stage3Analysis?.riskAssessment.overallScore ?? '—'}
                {stage3Analysis ? (
                  <em className={`risk-band risk-${stage3Analysis.riskAssessment.band.toLowerCase()}`}>
                    {stage3Analysis.riskAssessment.band}
                  </em>
                ) : null}
              </strong>
            </div>
            <div>
              <span>Recommended overall score</span>
              <strong>{recommended.overallScore}/100</strong>
            </div>
            <div>
              <span>Difference versus current plan</span>
              <strong className={overallDiff > 0 ? 'is-improved' : overallDiff < 0 ? 'is-worse' : ''}>
                {signed(overallDiff)}
                <small>PoC score difference</small>
              </strong>
            </div>
          </div>
          <p className="overview-why-short">
            <strong>Score-based recommendation summary:</strong> {reason}
          </p>
        </Card>
      ) : (
        <Card>
          <p>Complete project setup and analysis to see the Sangam recommendation.</p>
        </Card>
      )}

      {plainEnglish ? <p className="overview-plain">{plainEnglish}</p> : null}

      {whyBullets.length ? (
        <Card>
          <p className="kicker">Why this option?</p>
          <h3>Why Sangam recommends this option</h3>
          <ul className="overview-bullets">
            {whyBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {current && recommended ? (
        <Card>
          <p className="kicker">Current plan vs recommended</p>
          <h3>{sameAsCurrent ? 'Current plan is the recommended configuration' : 'Score comparison'}</h3>
          <p className="overview-note">
            Values are PoC scores from the existing alternative evaluation. Difference is a PoC score
            difference, not a field-measured impact. Relative change is shown only when the current score is
            non-zero.
          </p>
          <div className="overview-compare-head">
            <span>Metric</span>
            <span>Current plan</span>
            <span>Sangam recommended</span>
            <span>PoC score difference</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.id}
              className={`overview-compare-row ${row.improved ? 'is-better' : ''} ${row.difference === 0 ? 'is-same' : ''}`}
            >
              <div>
                <strong>{row.label}</strong>
                <small>{row.direction === 'lower' ? 'Lower is better' : 'Higher is better'}</small>
              </div>
              <span>{row.id === 'cost' ? `₹${row.current}` : row.current}{row.id === 'length' ? ' km' : ''}</span>
              <span className={row.improved ? 'is-improved' : ''}>
                {row.id === 'cost' ? `₹${row.recommended}` : row.recommended}{row.id === 'length' ? ' km' : ''}
              </span>
              <div className="overview-delta">
                <strong>
                  {row.current} → {row.recommended} → {signed(row.difference)}
                  {row.id === 'length' ? ' km' : row.id === 'cost' ? ' cr' : ''}
                </strong>
                {row.relativeChangePercent === null ? (
                  <small>Relative change not shown (current score is 0)</small>
                ) : (
                  <small>Relative change {signed(row.relativeChangePercent)}%</small>
                )}
              </div>
            </div>
          ))}
        </Card>
      ) : null}

      {alternativeAnalysis ? (
        <Card>
          <p className="kicker">All options at a glance</p>
          <h3>Current plan vs Alternative A, B and C</h3>
          <p className="overview-note">
            Dummy PoC lengths and rupee values sit beside the existing scores so a non-technical reader
            can see place, distance, cost and risk together.
          </p>
          <OptionComparisonGrid analysis={alternativeAnalysis} />
        </Card>
      ) : null}

      {chartData.length ? (
        <Card>
          <p className="kicker">Trade-off analysis</p>
          <h3>Current plan versus Sangam alternatives</h3>
          <p className="overview-note">
            Best option depends on multiple criteria — Sangam identifies the balanced configuration from the
            existing evaluation. Chart values are the same scores already calculated for Alternative Options.
          </p>
          <div className="overview-chart-legend-note">
            <span>Higher is better: Ecology, Connectivity, Safety, Feasibility, Sustainability</span>
            <span>Lower is better: Risk, Simulated length, Estimated PoC Cost</span>
          </div>
          <div className="overview-chart">
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c4dcd7" />
                <XAxis dataKey="criterion" tick={{ fontSize: 12, fill: '#2b4c56' }} />
                <YAxis tick={{ fontSize: 12, fill: '#2b4c56' }} />
                <Tooltip
                  formatter={(value, name, item) => {
                    const direction = (item?.payload as { direction?: string } | undefined)?.direction
                    return [`${value} · ${direction ?? ''}`, name]
                  }}
                />
                <Legend />
                <Bar dataKey="Current" fill={CHART_COLORS.Current} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Alt A" fill={CHART_COLORS['Alt A']} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Alt B" fill={CHART_COLORS['Alt B']} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Alt C" fill={CHART_COLORS['Alt C']} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="later-mod">
            Alt A = Ecology-Optimised · Alt B = Balanced · Alt C = Cost-Optimised · Current = Proposed Plan.
            Cost is the deterministic Estimated PoC Cost in ₹ crore (lower is better), derived from
            the existing cost index—not the inverted MCDA cost score.
          </p>
        </Card>
      ) : null}

      {priorityZones.length ? (
        <Card>
          <p className="kicker">Priority areas</p>
          <h3>Top 3 highest-priority zones</h3>
          <p className="overview-note">
            Taken from the existing risk analysis. Primary driver is the highest of the zone’s existing
            ecology, connectivity, human activity and infrastructure scores.
          </p>
          <div className="overview-zones">
            {priorityZones.map((zone) => (
              <div key={zone.id} className="overview-zone">
                <div className="overview-zone-top">
                  <strong>{zone.label}</strong>
                  <em className={`risk-band risk-${zone.band.toLowerCase()}`}>{zone.band}</em>
                </div>
                <p>
                  Risk: {zone.overallRisk}
                  <span>Priority score: {zone.priorityScore}</span>
                </p>
                <p>Primary driver: {primaryRiskDriver(zone)}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <p className="kicker">Decision flow</p>
        <h3>How this recommendation was produced</h3>
        <DecisionFlow
          profile={projectProfile}
          stage3={stage3Analysis}
          alternatives={alternativeAnalysis}
        />
        <p className="overview-note">
          Recommendation is based on the same Sangam evaluation pipeline. Each stage shows the value it
          actually produced for this project.
        </p>
      </Card>

      <div className="overview-actions">
        <Link className="btn btn-primary" to="/dashboard/analysis">
          View Detailed Analysis
        </Link>
        <Link className="btn btn-secondary" to="/dashboard/engineering">
          Compare Alternatives
        </Link>
      </div>

      <p className="overview-disclaimer">
        PoC Simulation Data — Results demonstrate the Sangam decision workflow and are not field-validated
        engineering recommendations.
      </p>
    </div>
  )
}

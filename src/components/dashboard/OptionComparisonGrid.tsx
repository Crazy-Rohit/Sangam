import type { AlternativeAnalysis, AlternativeOption } from '../../types/alternatives'
import { findProposed, findRecommended, optionByKind, signed } from '../../lib/overviewDecision'

const shortName = (option: AlternativeOption) => {
  if (option.kind === 'proposed') return 'Current plan'
  if (option.kind === 'ecology-optimised') return 'Alternative A'
  if (option.kind === 'balanced') return 'Alternative B'
  return 'Alternative C'
}

export function OptionComparisonGrid({
  analysis,
}: {
  analysis: AlternativeAnalysis
}) {
  const current = findProposed(analysis)
  const recommended = findRecommended(analysis)
  const options = [
    optionByKind(analysis, 'proposed'),
    optionByKind(analysis, 'ecology-optimised'),
    optionByKind(analysis, 'balanced'),
    optionByKind(analysis, 'cost-optimised'),
  ].filter((option): option is AlternativeOption => Boolean(option))

  if (!current || options.length < 4) return null

  const numericRows: Array<{
    label: string
    hint: string
    pick: (option: AlternativeOption) => number
    format: (value: number) => string
    lowerIsBetter?: boolean
  }> = [
    {
      label: 'Simulated length',
      hint: 'km - dummy PoC length',
      pick: (option) => option.approximateLengthKm,
      format: (value) => `${value} km`,
      lowerIsBetter: true,
    },
    {
      label: 'Estimated PoC Cost',
      hint: 'Rs crore - not a quotation',
      pick: (option) => option.estimatedCostCrore,
      format: (value) => `Rs ${value} cr`,
      lowerIsBetter: true,
    },
    {
      label: 'Risk',
      hint: 'Lower is better',
      pick: (option) => option.riskScore,
      format: (value) => String(value),
      lowerIsBetter: true,
    },
    {
      label: 'Ecology',
      hint: 'Higher is better',
      pick: (option) => option.scores.environmentalCompatibility,
      format: (value) => String(value),
    },
    {
      label: 'Connectivity',
      hint: 'Higher is better',
      pick: (option) => option.scores.connectivityPreservation,
      format: (value) => String(value),
    },
    {
      label: 'Safety',
      hint: 'Higher is better',
      pick: (option) => option.scores.humanSafety,
      format: (value) => String(value),
    },
    {
      label: 'Feasibility',
      hint: 'Higher is better',
      pick: (option) => option.scores.engineeringFeasibility,
      format: (value) => String(value),
    },
    {
      label: 'Sustainability',
      hint: 'Higher is better',
      pick: (option) => option.scores.sustainability,
      format: (value) => String(value),
    },
    {
      label: 'Overall score',
      hint: 'Higher is better',
      pick: (option) => option.overallScore,
      format: (value) => String(value),
    },
  ]

  return (
    <div className="zone-table-wrap option-compare-wrap">
      <table className="zone-table option-compare-table">
        <thead>
          <tr>
            <th>PoC comparison</th>
            {options.map((option) => (
              <th
                key={option.id}
                className={option.id === recommended?.id ? 'is-recommended-col' : ''}
              >
                {shortName(option)}
                {option.id === recommended?.id ? ' *' : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Place / configuration</td>
            {options.map((option) => (
              <td key={`${option.id}-place`}>{option.alternativeLocationLabel}</td>
            ))}
          </tr>
          <tr>
            <td>Via</td>
            {options.map((option) => (
              <td key={`${option.id}-via`}>{option.viaPlace}</td>
            ))}
          </tr>
          {numericRows.map((row) => (
            <tr key={row.label}>
              <td>
                {row.label}
                <small className="option-compare-hint">{row.hint}</small>
              </td>
              {options.map((option) => {
                const value = row.pick(option)
                const baseline = row.pick(current)
                const better = row.lowerIsBetter ? value < baseline : value > baseline
                const delta = Math.round((value - baseline + Number.EPSILON) * 10) / 10
                return (
                  <td
                    key={`${option.id}-${row.label}`}
                    className={option.kind !== 'proposed' && better ? 'is-improved-cell' : ''}
                  >
                    <strong>{row.format(value)}</strong>
                    {option.kind !== 'proposed' ? (
                      <small>{signed(delta)} vs current</small>
                    ) : (
                      <small>baseline</small>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="later-mod">
        Length and rupee figures are deterministic PoC dummy values scaled from the project
        profile / PDF budget. They are not surveyed distances or real quotations. MCDA ranking
        still uses the existing scores.
      </p>
    </div>
  )
}

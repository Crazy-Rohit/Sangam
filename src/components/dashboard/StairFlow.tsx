import type { CSSProperties } from 'react'

export type StairFlowTone =
  | 'neutral'
  | 'current'
  | 'risk'
  | 'warn'
  | 'good'
  | 'done'
  | 'active'
  | 'pending'

export type StairFlowAccent = 'start' | 'process' | 'decision' | 'end'

export type StairFlowStep = {
  id: string
  stage?: string
  title: string
  value?: string
  caption?: string
  tone?: StairFlowTone
  accent?: StairFlowAccent
  /** Label drawn on the connector leading into the next step. */
  handoff?: string
}

export function StairFlow({
  steps,
  label,
  dense = false,
}: {
  steps: StairFlowStep[]
  label: string
  dense?: boolean
}) {
  return (
    <ol className={`stair-flow ${dense ? 'is-dense' : ''}`.trim()} aria-label={label}>
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`stair-step tone-${step.tone ?? 'neutral'} ${step.accent ? `accent-${step.accent}` : ''}`.trim()}
          style={{ '--i': index } as CSSProperties}
        >
          {index > 0 ? (
            <span className="stair-link" aria-hidden="true">
              {steps[index - 1].handoff ? <em>{steps[index - 1].handoff}</em> : null}
            </span>
          ) : null}
          <article className="stair-card">
            <header>
              <span className="stair-index">{String(index + 1).padStart(2, '0')}</span>
              {step.stage ? <span className="stair-stage">{step.stage}</span> : null}
            </header>
            <h4>{step.title}</h4>
            {step.value ? <strong>{step.value}</strong> : null}
            {step.caption ? <p>{step.caption}</p> : null}
          </article>
        </li>
      ))}
    </ol>
  )
}

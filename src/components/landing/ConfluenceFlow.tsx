import { BrandLogo } from '../brand/BrandLogo'

const INPUTS = [
  { id: 'development', title: 'Development', note: 'Project need & growth' },
  { id: 'ecology', title: 'Ecology', note: 'Habitat & living systems' },
  { id: 'engineering', title: 'Engineering', note: 'Safe, buildable options' },
] as const

export function ConfluenceFlow() {
  return (
    <aside className="confluence-panel" aria-label="Sangam analysis flow">
      <p className="kicker">How Sangam works</p>
      <h2 className="confluence-heading">Three streams, one shared landscape</h2>

      <div className="confluence-inputs">
        {INPUTS.map((item) => (
          <article key={item.id} className={`flow-node node-in node-${item.id}`}>
            <span className="flow-kicker">{item.id}</span>
            <strong>{item.title}</strong>
            <span>{item.note}</span>
          </article>
        ))}
      </div>

      <svg className="join-lines" viewBox="0 0 360 78" preserveAspectRatio="none" aria-hidden="true">
        <path d="M60 4 C60 42, 180 28, 180 76" />
        <path d="M180 4 L180 76" />
        <path d="M300 4 C300 42, 180 28, 180 76" />
      </svg>

      <article className="flow-node node-sangam">
        <BrandLogo size={46} />
        <div className="node-sangam-text">
          <strong>Sangam</strong>
          <span>
            Where the three meet — so people
            <br />
            and wildlife can share the land.
          </span>
        </div>
      </article>

      <div className="flow-step" aria-hidden="true">
        <span className="flow-pipe" />
        <span>Sangam analysis</span>
        <span className="flow-pipe" />
      </div>

      <ul className="analysis-pills">
        <li>Read the project plan</li>
        <li>Weigh ecology &amp; risk</li>
        <li>Compare engineering options</li>
      </ul>

      <div className="flow-step" aria-hidden="true">
        <span className="flow-pipe" />
        <span>Output</span>
        <span className="flow-pipe" />
      </div>

      <article className="flow-node node-output">
        <strong>Sustainable methods</strong>
        <span>
          Practical coexistence measures — so development continues without
          cutting off the habitat around it.
        </span>
      </article>
    </aside>
  )
}

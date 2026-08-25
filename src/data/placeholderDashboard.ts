import type { DashboardSection, NavItem } from '../types'

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', path: '/dashboard/overview' },
  { id: 'input', label: 'Project Input', path: '/dashboard/input' },
  { id: 'analysis', label: 'Analysis', path: '/dashboard/analysis' },
  { id: 'engineering', label: 'Alternative Options', path: '/dashboard/engineering' },
  { id: 'comparison', label: 'Comparison', path: '/dashboard/comparison' },
  { id: 'recommendation', label: 'Recommendation', path: '/dashboard/recommendation' },
]

const sim = (value: string, note?: string): { value: string; note?: string } => ({
  value,
  note,
})

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: 'project-understanding',
    letter: 'A',
    title: 'Project Understanding',
    summary:
      'Structured profile created from available project-plan hints with a clearly labelled simulation fallback.',
    laterModule: 'Full PDF parsing and validated project-information extraction',
    fields: [
      { label: 'Project type', ...sim('Indicative classification pending', 'PoC Simulation Value') },
      { label: 'Location', ...sim('To be extracted from the project plan', 'PoC Simulation Value') },
      { label: 'Project scale', ...sim('Area / length not extracted yet', 'PoC Simulation Value') },
      { label: 'Development requirements', ...sim('Awaiting document intelligence module') },
      { label: 'Timeline & budget', ...sim('Not read from PDF in this version') },
    ],
  },
  {
    id: 'ecological-context',
    letter: 'B',
    title: 'Environmental & Ecological Context',
    summary:
      'Weighted environmental sensitivity assessment linked to local deterministic simulation layers.',
    laterModule: 'Field-validated regional ecological GIS layers',
    fields: [
      { label: 'Regional frame', ...sim('To be read from the project plan', 'PoC Simulation Value') },
      { label: 'Habitat adjacency', ...sim('Not computed', 'PoC Simulation Value') },
      { label: 'Protected-area proximity', ...sim('Awaiting spatial overlay') },
      { label: 'Land-cover context', ...sim('Layer not connected in this PoC') },
    ],
  },
  {
    id: 'connectivity',
    letter: 'C',
    title: 'Connectivity Analysis',
    summary:
      'Calculated habitat connectivity importance and disruption risk along the proposed development.',
    laterModule: 'Validated connectivity modelling and corridor data',
    fields: [
      { label: 'Corridor intersection', ...sim('Not modelled', 'PoC Simulation Value') },
      { label: 'Fragmentation indication', ...sim('Awaiting connectivity module') },
      { label: 'Movement permeability', ...sim('Not computed in this stage') },
    ],
  },
  {
    id: 'risk',
    letter: 'D',
    title: 'Risk Analysis',
    summary:
      'Combined environmental, connectivity, human-safety and development-impact risk model.',
    laterModule: 'Field calibration and validated risk thresholds',
    fields: [
      { label: 'Human–wildlife conflict screen', ...sim('Not scored', 'PoC Simulation Value') },
      { label: 'Collision / barrier risk', ...sim('Awaiting risk module') },
      { label: 'Uncertainty flag', ...sim('High — simulation only') },
    ],
  },
  {
    id: 'engineering',
    letter: 'E',
    title: 'Alternative Development Options',
    summary:
      'Deterministic alternative configurations ranked through shared Sangam MCDA.',
    laterModule: 'Validated engineering design and certification',
    fields: [
      { label: 'Option set', ...sim('Catalogue not generated', 'PoC Simulation Value') },
      { label: 'Crossing / mitigation types', ...sim('Awaiting engineering module') },
      { label: 'Alignment variants', ...sim('Not evaluated in this PoC stage') },
    ],
  },
  {
    id: 'cost-feasibility',
    letter: 'F',
    title: 'Cost & Feasibility',
    summary:
      'Placeholder for cost, constructability, and programme comparison across engineering options.',
    laterModule: 'Cost and feasibility comparison',
    fields: [
      { label: 'Relative cost band', ...sim('Not estimated', 'PoC Simulation Value') },
      { label: 'Constructability', ...sim('Awaiting comparison module') },
      { label: 'Programme implication', ...sim('Not computed in this stage') },
    ],
  },
  {
    id: 'sustainability',
    letter: 'G',
    title: 'Sustainability Assessment',
    summary:
      'Placeholder for a structured sustainability view across ecology, safety, and development need.',
    laterModule: 'Sustainability scoring',
    fields: [
      { label: 'Ecological performance', ...sim('Not scored', 'PoC Simulation Value') },
      { label: 'Development continuity', ...sim('Awaiting sustainability module') },
      { label: 'Coexistence index', ...sim('Simulation placeholder only') },
    ],
  },
  {
    id: 'recommendation',
    letter: 'H',
    title: 'Final Recommendation',
    summary:
      'Placeholder for the Sangam decision output. Multi-criteria comparison is not running in this version.',
    laterModule: 'MCDA and recommendation engine',
    fields: [
      { label: 'Preferred direction', ...sim('Not generated', 'PoC Simulation Value') },
      { label: 'Trade-off summary', ...sim('Awaiting MCDA module') },
      {
        label: 'Decision status',
        ...sim('Workflow complete — analysis modules pending'),
      },
    ],
  },
]

import type { AnalysisStage } from '../types'

export const ANALYSIS_STAGES: AnalysisStage[] = [
  { id: 'read', index: 1, title: 'Reading Project Plan' },
  { id: 'profile', index: 2, title: 'Building Structured Project Profile' },
  { id: 'spatial', index: 3, title: 'Establishing Spatial Context' },
  { id: 'environment', index: 4, title: 'Evaluating Environmental Sensitivity' },
  { id: 'connectivity', index: 5, title: 'Analysing Ecological Connectivity' },
  { id: 'risk', index: 6, title: 'Calculating Combined Risk' },
  { id: 'priority', index: 7, title: 'Ranking Priority Zones' },
  { id: 'alternatives', index: 8, title: 'Generating Alternative Configurations' },
  { id: 'mcda', index: 9, title: 'Evaluating Alternatives with Sangam MCDA' },
  { id: 'dashboard', index: 10, title: 'Preparing Sangam Dashboard' },
]

/** Simulated dwell time per stage (ms). Not real processing. */
export const STAGE_DURATION_MS = 1100

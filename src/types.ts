export const REGION_PENDING = 'To be read from the project plan'

export type SangamUser = {
  name: string
  email: string
  region: string
}

export type AnalysisStatus = 'idle' | 'processing' | 'complete'

export type ProjectFileMeta = {
  name: string
  size: number
  type: string
  uploadedAt: string
  /** Retained in memory for a later PDF-parsing module. */
  file: File
}

export type AnalysisStage = {
  id: string
  index: number
  title: string
}

export type SimulatedField = {
  label: string
  value: string
  note?: string
}

export type DashboardSection = {
  id: string
  letter: string
  title: string
  summary: string
  fields: SimulatedField[]
  laterModule: string
}

export type NavItem = {
  id: string
  label: string
  path: string
}

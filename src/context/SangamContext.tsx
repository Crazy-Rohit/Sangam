import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  REGION_PENDING,
  type AnalysisStatus,
  type ProjectFileMeta,
  type SangamUser,
} from '../types'
import type {
  DevelopmentPressure,
  ProjectProfile,
  Stage3Analysis,
} from '../types/analysis'
import type { AlternativeAnalysis } from '../types/alternatives'
import { createProjectProfile } from '../services/projectProfile'
import { readProjectProfile } from '../services/pdfProfileReader'
import { runStage3Analysis } from '../services/spatialAnalysis'
import { generateAlternativeAnalysis } from '../services/alternativeGeneration'

const USER_KEY = 'sangam-poc-user'

type SangamContextValue = {
  region: string
  user: SangamUser | null
  projectFile: ProjectFileMeta | null
  analysisStatus: AnalysisStatus
  currentStageIndex: number
  projectName: string
  projectProfile: ProjectProfile | null
  profileReadStatus: 'idle' | 'reading' | 'ready' | 'fallback'
  stage3Analysis: Stage3Analysis | null
  alternativeAnalysis: AlternativeAnalysis | null
  developmentPressure: DevelopmentPressure
  setProjectFile: (file: ProjectFileMeta | null) => void
  setDevelopmentPressure: (pressure: DevelopmentPressure) => void
  startAnalysis: () => void
  setCurrentStageIndex: (index: number) => void
  completeAnalysis: () => void
  resetWorkflow: () => void
  signIn: (user: SangamUser) => void
  signOut: () => void
}

const SangamContext = createContext<SangamContextValue | null>(null)

function nameFromFile(file: ProjectFileMeta | null): string {
  if (!file) return 'Untitled Project'
  return file.name.replace(/\.pdf$/i, '') || 'Untitled Project'
}

function readStoredUser(): SangamUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SangamUser
    if (!parsed?.email || !parsed?.name) return null
    return parsed
  } catch {
    return null
  }
}

export function SangamProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SangamUser | null>(() => readStoredUser())
  const [projectFile, setProjectFileState] = useState<ProjectFileMeta | null>(null)
  const [projectProfile, setProjectProfile] = useState<ProjectProfile | null>(null)
  const [profileReadStatus, setProfileReadStatus] = useState<
    'idle' | 'reading' | 'ready' | 'fallback'
  >('idle')
  const [stage3Analysis, setStage3Analysis] = useState<Stage3Analysis | null>(null)
  const [alternativeAnalysis, setAlternativeAnalysis] =
    useState<AlternativeAnalysis | null>(null)
  const [developmentPressure, setPressureState] = useState<DevelopmentPressure>('medium')
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle')
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const profileRequestId = useRef(0)

  const setProjectFile = useCallback((file: ProjectFileMeta | null) => {
    const requestId = ++profileRequestId.current
    setProjectFileState(file)
    const profile = file ? createProjectProfile(file) : null
    setProjectProfile(profile)
    setProfileReadStatus(file ? 'reading' : 'idle')
    setStage3Analysis(null)
    setAlternativeAnalysis(null)
    setAnalysisStatus('idle')
    setCurrentStageIndex(0)
    if (file) {
      void readProjectProfile(file).then((result) => {
        if (profileRequestId.current !== requestId) return
        setProjectProfile(result.profile)
        setProfileReadStatus(result.textRead ? 'ready' : 'fallback')
      })
    }
  }, [])

  const startAnalysis = useCallback(() => {
    if (projectProfile) {
      const stage3 = runStage3Analysis(projectProfile, developmentPressure)
      setStage3Analysis(stage3)
      setAlternativeAnalysis(generateAlternativeAnalysis(stage3))
    }
    setAnalysisStatus('processing')
    setCurrentStageIndex(0)
  }, [developmentPressure, projectProfile])

  const completeAnalysis = useCallback(() => {
    setAnalysisStatus('complete')
  }, [])

  const resetWorkflow = useCallback(() => {
    profileRequestId.current += 1
    setProjectFileState(null)
    setProjectProfile(null)
    setProfileReadStatus('idle')
    setStage3Analysis(null)
    setAlternativeAnalysis(null)
    setPressureState('medium')
    setAnalysisStatus('idle')
    setCurrentStageIndex(0)
  }, [])

  const setDevelopmentPressure = useCallback(
    (pressure: DevelopmentPressure) => {
      setPressureState(pressure)
      if (projectProfile) {
        const stage3 = runStage3Analysis(projectProfile, pressure)
        setStage3Analysis(stage3)
        setAlternativeAnalysis(generateAlternativeAnalysis(stage3))
      }
    },
    [projectProfile],
  )

  const signIn = useCallback((next: SangamUser) => {
    setUser(next)
    localStorage.setItem(USER_KEY, JSON.stringify(next))
  }, [])

  const signOut = useCallback(() => {
    profileRequestId.current += 1
    setUser(null)
    localStorage.removeItem(USER_KEY)
    setProjectFileState(null)
    setProjectProfile(null)
    setProfileReadStatus('idle')
    setStage3Analysis(null)
    setAlternativeAnalysis(null)
    setPressureState('medium')
    setAnalysisStatus('idle')
    setCurrentStageIndex(0)
  }, [])

  const value = useMemo<SangamContextValue>(
    () => ({
      region: user ? 'Madhya Pradesh, India' : REGION_PENDING,
      user,
      projectFile,
      analysisStatus,
      currentStageIndex,
      projectName: projectProfile?.projectName ?? nameFromFile(projectFile),
      projectProfile,
      profileReadStatus,
      stage3Analysis,
      alternativeAnalysis,
      developmentPressure,
      setProjectFile,
      setDevelopmentPressure,
      startAnalysis,
      setCurrentStageIndex,
      completeAnalysis,
      resetWorkflow,
      signIn,
      signOut,
    }),
    [
      user,
      projectFile,
      projectProfile,
      profileReadStatus,
      stage3Analysis,
      alternativeAnalysis,
      developmentPressure,
      analysisStatus,
      currentStageIndex,
      setProjectFile,
      setDevelopmentPressure,
      startAnalysis,
      completeAnalysis,
      resetWorkflow,
      signIn,
      signOut,
    ],
  )

  return <SangamContext.Provider value={value}>{children}</SangamContext.Provider>
}

// The provider and its colocated hook intentionally share this module.
// oxlint-disable-next-line react/only-export-components
export function useSangam() {
  const ctx = useContext(SangamContext)
  if (!ctx) {
    throw new Error('useSangam must be used within SangamProvider')
  }
  return ctx
}

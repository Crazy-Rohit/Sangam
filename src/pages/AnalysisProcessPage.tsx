import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { StairFlow } from '../components/dashboard/StairFlow'
import { ANALYSIS_STAGES, STAGE_DURATION_MS } from '../data/analysisStages'
import { useSangam } from '../context/SangamContext'
import { formatStageIndex } from '../lib/format'

export function AnalysisProcessPage() {
  const navigate = useNavigate()
  const {
    projectFile,
    analysisStatus,
    currentStageIndex,
    setCurrentStageIndex,
    completeAnalysis,
  } = useSangam()

  useEffect(() => {
    if (analysisStatus !== 'processing' || !projectFile) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    function advance(index: number) {
      if (cancelled) return
      setCurrentStageIndex(index)

      if (index >= ANALYSIS_STAGES.length - 1) {
        timer = setTimeout(() => {
          if (cancelled) return
          completeAnalysis()
          navigate('/dashboard/overview')
        }, STAGE_DURATION_MS)
        return
      }

      timer = setTimeout(() => advance(index + 1), STAGE_DURATION_MS)
    }

    advance(0)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [
    analysisStatus,
    projectFile,
    setCurrentStageIndex,
    completeAnalysis,
    navigate,
  ])

  if (!projectFile) {
    return <Navigate to="/setup" replace />
  }

  if (analysisStatus === 'complete') {
    return <Navigate to="/dashboard/overview" replace />
  }

  if (analysisStatus !== 'processing') {
    return <Navigate to="/setup" replace />
  }

  const progress = ((currentStageIndex + 1) / ANALYSIS_STAGES.length) * 100
  const active = ANALYSIS_STAGES[currentStageIndex]

  return (
    <div className="page-process">
      <AppHeader compact />
      <main className="process-main">
        <div className="process-intro">
          <p className="kicker">PoC Simulation</p>
          <h1>Sangam analysis in progress</h1>
          <p className="lede">
            These stages run the deterministic Sangam simulation pipeline,
            including comparative alternative generation.
            Outputs are not field-validated and do not claim live AI, real
            wildlife observations or authoritative GIS analysis.
          </p>
          <p className="process-file">Source document: {projectFile.name}</p>
        </div>

        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="progress-label">
          Stage {formatStageIndex(active.index)} of {formatStageIndex(ANALYSIS_STAGES.length)} ·{' '}
          {active.title}
        </p>

        <StairFlow
          label="Sangam analysis pipeline"
          dense
          steps={ANALYSIS_STAGES.map((stage, index) => {
            const state =
              index < currentStageIndex
                ? 'done'
                : index === currentStageIndex
                  ? 'active'
                  : 'pending'
            return {
              id: stage.id,
              stage:
                state === 'done'
                  ? '✓ Complete'
                  : state === 'active'
                    ? '● Running'
                    : 'Queued',
              title: stage.title,
              caption:
                state === 'done'
                  ? 'Output passed to the next stage'
                  : state === 'active'
                    ? 'Deterministic PoC step in progress'
                    : 'Waiting for the prior stage',
              tone: state,
              accent:
                index === 0
                  ? ('start' as const)
                  : index === ANALYSIS_STAGES.length - 1
                    ? ('end' as const)
                    : ('process' as const),
            }
          })}
        />
      </main>
    </div>
  )
}

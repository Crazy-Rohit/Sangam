import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { Button } from '../components/ui/Button'
import { PdfDropzone } from '../components/upload/PdfDropzone'
import { useSangam } from '../context/SangamContext'

export function ProjectSetupPage() {
  const navigate = useNavigate()
  const {
    projectFile,
    projectProfile,
    profileReadStatus,
    setProjectFile,
    startAnalysis,
  } = useSangam()

  function onStart() {
    if (!projectFile) return
    startAnalysis()
    navigate('/process')
  }

  return (
    <div className="page-setup">
      <AppHeader />
      <main className="setup-main">
        <p className="kicker">01 · Project setup</p>
        <h1>Prepare the analysis</h1>
        <p className="lede narrow">
          Upload the project plan that Sangam will use as the source document
          for this workflow. Location and other project details are expected
          inside that PDF.
        </p>

        <section className="setup-grid">
          <article className="card card-framed">
            <p className="kicker">PoC analysis region</p>
            <h2>Madhya Pradesh, India</h2>
            <p className="section-desc">
              Fixed for Stage 3. If the project plan provides a usable Madhya
              Pradesh location, it is used as the project location; otherwise
              the Madhya Pradesh Demonstration Corridor is used.
            </p>
          </article>

          <article className="card card-framed info-box">
            <p className="kicker">PoC Mode</p>
            <p>
              The uploaded project plan will be used as the input document for
              the Sangam analysis workflow.
            </p>
            <p className="section-desc">
              Available filename/profile hints feed a structured project
              profile. Missing values use a clearly labelled deterministic
              simulation fallback; no field data is claimed.
            </p>
          </article>
        </section>

        <section className="card card-framed upload-panel">
          <p className="kicker">02 · Project plan upload</p>
          <h2>Project Plan PDF</h2>
          <PdfDropzone file={projectFile} onFile={setProjectFile} />
          {projectProfile ? (
            <div className="profile-preview">
              <div>
                <span>Profile status</span>
                <strong>
                  {profileReadStatus === 'reading'
                    ? 'Reading selectable PDF text…'
                    : profileReadStatus === 'ready'
                      ? 'Project Plan PDF'
                      : 'PoC Simulation Fallback'}
                </strong>
              </div>
              <div><span>Project type</span><strong>{projectProfile.projectType}</strong></div>
              <div><span>Location</span><strong>{projectProfile.location}</strong></div>
              <div><span>Footprint</span><strong>{projectProfile.projectLengthKm} km</strong></div>
            </div>
          ) : null}
        </section>

        <div className="setup-cta">
          <Button
            type="button"
            onClick={onStart}
            disabled={!projectFile || profileReadStatus === 'reading'}
          >
            Start Sangam Analysis
          </Button>
          {!projectFile ? (
            <p className="cta-hint">Upload a project plan PDF to continue.</p>
          ) : profileReadStatus === 'reading' ? (
            <p className="cta-hint">Reading project profile locally in your browser…</p>
          ) : (
            <p className="cta-hint">The following steps are a PoC simulation.</p>
          )}
        </div>
      </main>
    </div>
  )
}

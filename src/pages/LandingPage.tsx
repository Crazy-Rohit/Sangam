import { Link, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../components/brand/BrandLogo'
import { ConfluenceFlow } from '../components/landing/ConfluenceFlow'
import { useSangam } from '../context/SangamContext'

export function LandingPage() {
  const navigate = useNavigate()
  const { resetWorkflow, user, signOut } = useSangam()

  function onStart() {
    resetWorkflow()
    navigate(user ? '/setup' : '/signin')
  }

  return (
    <div className="page-landing">
      <header className="app-header landing-header">
        <Link to="/" className="brand-link">
          <BrandLogo size={38} />
          <span className="wordmark">Sangam</span>
        </Link>
        <div className="header-meta">
          {user ? (
            <>
              <span className="region-chip">{user.name}</span>
              <button type="button" className="btn btn-ghost" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/signin" className="btn btn-secondary">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="landing-grid">
        <section className="landing-copy">
          <BrandLogo size={104} className="hero-emblem" />
          <p className="kicker">Coexistence &amp; sustainability</p>
          <h1 className="display">
            <span className="display-fill">Sangam</span>
          </h1>
          <p className="tagline">
            Where Development and Ecology Meet
            <br />
            — By Design, Not By Chance.
          </p>
          <p className="lede">
            Roads, rail and canals keep growing — and so do the forests, herds
            and rivers they cross. Sangam studies a project plan so people and
            animals can share the same landscape safely, and the growth that
            follows stays sustainable for both.
          </p>
          <div className="landing-cta">
            <button type="button" className="btn btn-primary" onClick={onStart}>
              Start
            </button>
            <p className="cta-hint">
              {user ? 'Continue to the project plan upload.' : 'A quick sign in opens the workflow.'}
            </p>
          </div>
          <p className="landing-note">
            Sign in is needed to move past this page. This PoC is fixed to
            Madhya Pradesh; each project's location is read from the uploaded
            plan when available.
          </p>
        </section>

        <ConfluenceFlow />
      </main>
    </div>
  )
}

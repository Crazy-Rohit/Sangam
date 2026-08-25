import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { Button } from '../components/ui/Button'
import { useSangam } from '../context/SangamContext'

type LocationState = { from?: string }

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useSangam()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as LocationState | null)?.from ?? '/setup'

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Please enter your name and email to continue.')
      return
    }
    signIn({ name: name.trim(), email: email.trim(), region: 'Madhya Pradesh, India' })
    navigate(from, { replace: true })
  }

  return (
    <div className="page-setup">
      <AppHeader />
      <main className="setup-main auth-main">
        <p className="kicker">Sign in</p>
        <h1>Continue to your workspace</h1>
        <p className="lede narrow">
          Sign in to open the Sangam workflow. This PoC analysis is fixed to
          Madhya Pradesh; project location is read from the uploaded plan when
          available, otherwise the demonstration corridor is used.
        </p>
        <p className="cta-hint">PoC Simulation — no password, no backend.</p>

        <form className="auth-form card card-framed" onSubmit={onSubmit}>
          <label>
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="setup-cta">
            <Button type="submit">Sign in & Start</Button>
            <p className="cta-hint">Takes you straight to the project plan upload.</p>
          </div>
        </form>
      </main>
    </div>
  )
}

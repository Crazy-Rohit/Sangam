import { Link } from 'react-router-dom'
import { BrandLogo } from '../brand/BrandLogo'
import { useSangam } from '../../context/SangamContext'

type AppHeaderProps = {
  compact?: boolean
}

export function AppHeader({ compact = false }: AppHeaderProps) {
  const { user, signOut } = useSangam()

  return (
    <header className={`app-header ${compact ? 'app-header-compact' : ''}`}>
      <Link to="/" className="brand-link">
        <BrandLogo size={38} />
        <span className="wordmark">Sangam</span>
      </Link>
      <div className="header-meta">
        <span className="badge badge-brass">PoC Simulation</span>
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
  )
}

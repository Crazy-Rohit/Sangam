import { NavLink, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../brand/BrandLogo'
import { NAV_ITEMS } from '../../data/placeholderDashboard'
import { useSangam } from '../../context/SangamContext'

export function Sidebar() {
  const { region, projectName, resetWorkflow, user } = useSangam()
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandLogo size={42} />
        <div>
          <p className="wordmark">Sangam</p>
          <p className="sidebar-region">{user ? region : 'Madhya Pradesh PoC'}</p>
        </div>
      </div>

      <p className="nav-label">Coexistence workspace</p>
      <nav className="side-nav" aria-label="Analysis sections">
        {NAV_ITEMS.map((item, index) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `side-link ${isActive ? 'is-active' : ''}`}
          >
            <span className="side-index">{String(index + 1).padStart(2, '0')}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <p className="sidebar-project">{projectName}</p>
        <p className="kicker">PoC Simulation</p>
        <button
          type="button"
          className="btn btn-ghost sidebar-reset"
          onClick={() => {
            resetWorkflow()
            navigate('/')
          }}
        >
          New analysis
        </button>
      </div>
    </aside>
  )
}

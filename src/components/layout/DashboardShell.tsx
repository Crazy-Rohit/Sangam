import { Navigate, Outlet } from 'react-router-dom'
import { useSangam } from '../../context/SangamContext'
import { Sidebar } from './Sidebar'
import { Badge } from '../ui/Badge'

export function DashboardShell() {
  const { analysisStatus, projectFile, projectName, projectProfile } = useSangam()

  if (analysisStatus === 'processing') {
    return <Navigate to="/process" replace />
  }
  if (analysisStatus !== 'complete' || !projectFile) {
    return <Navigate to="/setup" replace />
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <header className="dash-top">
          <div>
            <p className="kicker">Analysis dashboard</p>
            <h1 className="dash-title">{projectName}</h1>
            <p className="dash-sub">
              Madhya Pradesh, India · Project location: {projectProfile?.location ?? 'Demonstration Corridor'} ·
              Status: Analysis Complete
            </p>
          </div>
          <div className="dash-badges">
            <Badge tone="forest">Analysis Complete</Badge>
            <Badge>PoC Simulation</Badge>
          </div>
        </header>
        <div className="dash-body">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

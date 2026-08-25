import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SangamProvider } from './context/SangamContext'
import { RequireSignIn } from './components/auth/RequireSignIn'
import { DashboardShell } from './components/layout/DashboardShell'
import { LandingPage } from './pages/LandingPage'
import { SignInPage } from './pages/SignInPage'
import { ProjectSetupPage } from './pages/ProjectSetupPage'
import { AnalysisProcessPage } from './pages/AnalysisProcessPage'
import {
  ComparisonPage,
  OverviewPage,
  ProjectInputPage,
  RecommendationPage,
} from './pages/dashboard/DashboardPages'

const Stage3AnalysisPage = lazy(() =>
  import('./pages/dashboard/Stage3AnalysisPage').then((module) => ({
    default: module.Stage3AnalysisPage,
  })),
)

const AlternativeOptionsPage = lazy(() =>
  import('./pages/dashboard/AlternativeOptionsPage').then((module) => ({
    default: module.AlternativeOptionsPage,
  })),
)

export default function App() {
  return (
    <SangamProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route element={<RequireSignIn />}>
            <Route path="/setup" element={<ProjectSetupPage />} />
            <Route path="/process" element={<AnalysisProcessPage />} />
            <Route path="/dashboard" element={<DashboardShell />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="input" element={<ProjectInputPage />} />
              <Route
                path="analysis"
                element={
                  <Suspense fallback={<div className="route-loading">Loading spatial workspace…</div>}>
                    <Stage3AnalysisPage />
                  </Suspense>
                }
              />
              <Route
                path="engineering"
                element={
                  <Suspense fallback={<div className="route-loading">Generating alternatives…</div>}>
                    <AlternativeOptionsPage />
                  </Suspense>
                }
              />
              <Route path="comparison" element={<ComparisonPage />} />
              <Route path="recommendation" element={<RecommendationPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SangamProvider>
  )
}

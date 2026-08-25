import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSangam } from '../../context/SangamContext'

/** Everything past the home page needs a signed-in session. */
export function RequireSignIn() {
  const { user } = useSangam()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />
  }
  return <Outlet />
}

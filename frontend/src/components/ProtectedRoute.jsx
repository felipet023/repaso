import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { isAuthenticated, loadingSession } = useAuth();
  if (loadingSession) return <div className="page-loading">Verificando sesión…</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

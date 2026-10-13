import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Requiere sesión iniciada Y rol administrador.
// El backend verifica el rol de forma independiente: esto es solo UX.
export default function AdminRoute() {
  const { isAuthenticated, isAdmin, loadingSession } = useAuth();
  if (loadingSession) return <div className="page-loading">Verificando sesión…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
